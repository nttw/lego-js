[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location -LiteralPath $repoRoot

function Get-VercelEnvironmentMetadata {
    $authPath = Join-Path $env:APPDATA "com.vercel.cli\Data\auth.json"
    $projectPath = Join-Path $repoRoot ".vercel\project.json"
    if (-not (Test-Path -LiteralPath $authPath) -or -not (Test-Path -LiteralPath $projectPath)) {
        throw "Missing Vercel authentication or project linkage metadata."
    }

    $auth = Get-Content -LiteralPath $authPath | ConvertFrom-Json
    $project = Get-Content -LiteralPath $projectPath | ConvertFrom-Json
    $uri = "https://api.vercel.com/v10/projects/$($project.projectId)/env?teamId=$($project.orgId)"
    $response = Invoke-RestMethod -Headers @{ Authorization = "Bearer $($auth.token)" } -Uri $uri -Method Get
    return @($response.envs | Select-Object key, type, target, createdAt, updatedAt)
}

$dotenvKeyPath = Join-Path $repoRoot ".env.keys"
$cachedVercelEnvPath = Join-Path $repoRoot ".vercel\.env.production.local"
if (-not (Test-Path -LiteralPath $dotenvKeyPath)) {
    throw "Missing local ignored .env.keys file."
}
if (-not (Test-Path -LiteralPath $cachedVercelEnvPath)) {
    throw "Missing local ignored .vercel/.env.production.local file."
}
if (-not (Test-Path -LiteralPath (Join-Path $repoRoot "node_modules\@dotenvx\dotenvx"))) {
    throw "Missing local dotenvx dependency. Run pnpm install before using this script."
}

$keyLine = Get-Content -LiteralPath $dotenvKeyPath |
    Where-Object { $_ -match '^\s*DOTENV_PRIVATE_KEY_PROD\s*=' } |
    Select-Object -First 1
if (-not $keyLine) {
    throw "DOTENV_PRIVATE_KEY_PROD was not found in .env.keys."
}
$keyValue = ($keyLine -split "=", 2)[1].Trim().Trim('"')

$comparisonScript = @'
const fs = require("fs");
const dotenvx = require("@dotenvx/dotenvx");
function parseEnv(path) {
  const values = {};
  for (const line of fs.readFileSync(path, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}
dotenvx.config({ path: [".env.prod"], ignore: ["MISSING_ENV_FILE"], quiet: true });
const cached = parseEnv(".vercel/.env.production.local");
const pgUrl = process.env.PG_DATABASE_URL;
process.stdout.write(JSON.stringify({
  productionPgPresent: Boolean(pgUrl),
  matchesDatabaseUrl: Boolean(pgUrl) && pgUrl === cached.DATABASE_URL,
  matchesPostgresUrl: Boolean(pgUrl) && pgUrl === cached.POSTGRES_URL,
  keyMatchesCache: process.env.DOTENV_PRIVATE_KEY === cached.DOTENV_PRIVATE_KEY_PROD
}));
'@

$previousKey = $env:DOTENV_PRIVATE_KEY
try {
    $env:DOTENV_PRIVATE_KEY = $keyValue
    $comparison = (node -e $comparisonScript) | ConvertFrom-Json
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to decrypt and compare .env.prod."
    }
} finally {
    $env:DOTENV_PRIVATE_KEY = $previousKey
}

$targets = @(
    "DATABASE_URL",
    "DATABASE_URL_UNPOOLED",
    "PGPASSWORD",
    "POSTGRES_PASSWORD",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL",
    "POSTGRES_URL_NON_POOLING",
    "POSTGRES_URL_NO_SSL"
)
$metadata = Get-VercelEnvironmentMetadata
$privateKey = $metadata | Where-Object { $_.key -eq "DOTENV_PRIVATE_KEY_PROD" } | Select-Object -First 1
$presentTargets = @($metadata | Where-Object { $_.key -in $targets } | ForEach-Object { $_.key })

Write-Host "Verified without printing values:"
Write-Host "  - Encrypted production PG_DATABASE_URL matches cached Vercel DATABASE_URL: $($comparison.matchesDatabaseUrl)"
Write-Host "  - Encrypted production PG_DATABASE_URL matches cached Vercel POSTGRES_URL: $($comparison.matchesPostgresUrl)"
Write-Host "  - Local dotenvx production key matches cached Vercel value: $($comparison.keyMatchesCache)"
Write-Host "  - Vercel DOTENV_PRIVATE_KEY_PROD type: $($privateKey.type)"
Write-Host "  - Targeted Neon credential variables currently present: $(if ($presentTargets.Count) { $presentTargets -join ', ' } else { '(none)' })"

if (-not $comparison.productionPgPresent -or -not $comparison.matchesDatabaseUrl -or -not $comparison.matchesPostgresUrl) {
    throw "Local comparison no longer matches the historical basis for this cleanup."
}
if (-not $privateKey -or $privateKey.type -ne "sensitive") {
    throw "DOTENV_PRIVATE_KEY_PROD is not Sensitive according to the Vercel API."
}
if ($presentTargets.Count -gt 0) {
    throw "Targeted Neon credential variables are present in current Vercel configuration."
}
