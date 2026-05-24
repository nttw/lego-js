[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location -LiteralPath $repoRoot

Write-Host "This operation modifies Vercel project environment variables."
Write-Host "Read docs/vercel-refesh/README.md before continuing."
Write-Host "It does not rotate Neon credentials, but it can remove Vercel variable entries."
Write-Host ""

$confirmation = Read-Host "Type APPLY to mark the existing dotenvx key Sensitive and remove targeted Neon credential duplicates"
if ($confirmation -cne "APPLY") {
    throw "No changes made."
}

$keyLine = Get-Content -LiteralPath (Join-Path $repoRoot ".env.keys") |
    Where-Object { $_ -match '^\s*DOTENV_PRIVATE_KEY_PROD\s*=' } |
    Select-Object -First 1
if (-not $keyLine) {
    throw "DOTENV_PRIVATE_KEY_PROD was not found in .env.keys."
}
$keyValue = ($keyLine -split "=", 2)[1].Trim().Trim('"')

$auth = Get-Content -LiteralPath (Join-Path $env:APPDATA "com.vercel.cli\Data\auth.json") | ConvertFrom-Json
$project = Get-Content -LiteralPath (Join-Path $repoRoot ".vercel\project.json") | ConvertFrom-Json
$uri = "https://api.vercel.com/v10/projects/$($project.projectId)/env?teamId=$($project.orgId)"
$metadata = @((Invoke-RestMethod -Headers @{ Authorization = "Bearer $($auth.token)" } -Uri $uri -Method Get).envs)

$privateKey = $metadata | Where-Object { $_.key -eq "DOTENV_PRIVATE_KEY_PROD" } | Select-Object -First 1
if (-not $privateKey -or $privateKey.type -ne "sensitive") {
    $keyValue | vercel env update DOTENV_PRIVATE_KEY_PROD production --sensitive --yes
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to update DOTENV_PRIVATE_KEY_PROD."
    }
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
$currentNames = @($metadata | ForEach-Object { $_.key })
foreach ($name in ($targets | Where-Object { $_ -in $currentNames })) {
    vercel env rm $name --yes
    if ($LASTEXITCODE -ne 0) {
        throw "Failed while removing $name."
    }
}

& (Join-Path $PSScriptRoot "verify-vercel-env-warning-cleanup.ps1")
