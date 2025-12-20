set shell := ["pwsh", "-c"]

default:
  echo default

alias i := install
alias r := run
alias b := build
alias c := clean

install:
  pnpm install

run:
  pnpm run dev

build:
  pnpm run build

deploy:
  pnpm run deploy

clean:
  rm node_modules/*, .next/* -Recurse -Force
