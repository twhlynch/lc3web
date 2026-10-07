# lc3web

This is a fork of the web-based LC-3 simulator built by @wchargin with opinionated improvements to assist with the RMIT Programming Studio course.

## structure

| package | name       | description                          |
| ------- | ---------- | ------------------------------------ |
| `sim/`  | `@lc3/sim` | Core simulator logic                 |
| `web/`  | `@lc3/web` | The web simulator                    |
| `cli/`  | `@lc3/cli` | Command line assembler and simulator |
| `bot/`  | `@lc3/bot` | Workers Discord bot                  |

## dev

```sh
pnpm install

pnpm dev          # run the web sim
pnpm build        # build all packages
pnpm check        # typecheck
pnpm lint         # lint
pnpm format       # format
pnpm bot:types    # regenerate the bot's worker types
pnpm bot:register # register discord application commands
pnpm bot:dev      # run the bot locally
pnpm bot:deploy   # deploy the bot to cloudflare
pnpm cli          # run the cli tool
```

Run `pnpm bot:types` after changing the Worker configuration to refresh
`bot/worker-configuration.d.ts`.
