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

clean:
  rm node_modules/*, .next/* -Recurse -Force
