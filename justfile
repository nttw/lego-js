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
  vercel pull --yes --environment=preview
  vercel build
  vercel deploy --prebuilt --yes --archive=tgz --no-wait

deploy:
  vercel pull --yes --environment=production
  vercel build --prod
  vercel deploy --prebuilt --prod --yes --archive=tgz --no-wait

deploy-prod: deploy

clean:
  rm node_modules/*, .next/* -Recurse -Force
