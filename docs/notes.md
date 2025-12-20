From https://rebrickable.com/api/v3/docs/

There is no Set/Part pricing data available, as that data is owned by external sites such as BrickLink or BrickOwl.

https://brickset.com/article/52666/brickset-web-services

https://www.npmjs.com/package/@brakbricks/brickset-api
(https://www.npmjs.com/package/@brickset-api/types - but above has TS)

```bash
# https://dotenvx.com/docs/quickstart#add-encryption
# https://marketplace.visualstudio.com/items?itemName=dotenv.dotenvx-vscode
pnpm dlx @dotenvx/dotenvx set HELLO "production (encrypted)" -f .env.prod

pnpm dlx vercel@latest login
```

"deploy:pull": "pnpm dlx vercel@latest env pull .env.production",
