set shell := ["pwsh", "-c"]

default:
  echo default

alias i := install
alias r := run
alias b := build
alias c := clean
alias d := deploy

install:
  pnpm install

run:
  pnpm run dev

audit:
  pnpm audit

audit-prod:
  pnpm audit --prod

lint:
  pnpm lint

build:
  pnpm run build

verify:
  pnpm audit
  pnpm lint
  pnpm build

deploy-preview:
  vercel deploy --yes

deploy:
  vercel deploy --prod --yes

deploy-prod: deploy

cf-build-d1:
  pnpm cf:build:d1

cf-migrate-d1:
  pnpm cf:migrate:d1

cf-secret-d1:
  pnpm cf:secret:d1

cf-deploy-d1:
  pnpm cf:build:d1
  pnpm cf:migrate:d1
  pnpm cf:deploy:d1
  pnpm cf:secret:d1

clean:
  $artifactPaths = @("node_modules", ".next", ".open-next", "dist"); foreach ($artifactPath in $artifactPaths) { if (Test-Path -LiteralPath $artifactPath) { Remove-Item -LiteralPath $artifactPath -Recurse -Force } }
