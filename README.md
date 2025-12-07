# FantasyMCP

An application to analyze and build lineups on **LaLiga FANTASY** based on historical performance and Market Analysis.

Work-in-progress...

## Structure

```
.
├── README.md
├── package.json
├── pnpm-lock.yaml
├── src
│   ├── application
│   │   ├── services
│   │   │   ├── fantasyEvent.ts
│   │   │   ├── marketDetails.ts
│   │   │   └── playerDetails.ts
│   │   └── utils
│   │       └── parsers.ts
│   ├── domain
│   │   ├── config
│   │   │   ├── constants.ts
│   │   │   ├── interfaces.ts
│   │   │   └── types.ts
│   │   └── errors
│   │       ├── appError.ts
│   │       ├── httpError.ts
│   │       └── scrapingError.ts
│   ├── infrastructure
│   │   ├── dispatcher.ts
│   │   ├── infoFetcher.ts
│   │   └── marketFetcher.ts
│   └── main.ts
└── tsconfig.json
```