# FantasyMCP

An application to analyze and build lineups on **LaLiga FANTASY** based on historical performance and Market Analysis.

## Structure

```bash
.
├── README.md
├── eslint.config.ts
├── package.json
├── pnpm-lock.yaml
├── src
│   ├── application
│   │   ├── fantasy
│   │   │   ├── e2e
│   │   │   │   └── fetchPlayerSnapshot.ts
│   │   │   └── parsers
│   │   │       ├── fantasyEventParser.ts
│   │   │       ├── marketDetailsParser.ts
│   │   │       └── playerDetailsParser.ts
│   │   ├── parsers
│   │   │   └── fantasyEventParser.ts
│   │   └── utils
│   │       └── helpers.ts
│   ├── domain
│   │   ├── config
│   │   │   ├── constants.ts
│   │   │   ├── interfaces.ts
│   │   │   └── types.ts
│   │   ├── errors
│   │   │   ├── appError.ts
│   │   │   ├── httpError.ts
│   │   │   └── scrapingError.ts
│   │   └── fantasy
│   │       ├── models.ts
│   │       ├── ports.ts
│   │       └── types.ts
│   ├── infrastructure
│   │   ├── fantasy
│   │   │   ├── extractors
│   │   │   │   ├── fantasyEventsExtractor.ts
│   │   │   │   ├── marketDetailsExtractor.ts
│   │   │   │   └── playerDetailsExtractor.ts
│   │   │   └── pageGateway.ts
│   │   └── http
│   │       └── axiosHtmlClient.ts
│   └── interfaces
│       └── cli
│           └── main.ts
├── tests
│   ├── application
│   ├── domain
│   └── infrastructure
└── tsconfig.json
```

⸻

## Getting started

### Requirements

* **Node**.js (recommended ≥ 20.x)
* **pnpm￼** (the repo is configured to use pnpm as the package manager)
* **Internet** access (the scraper hits analiticafantasy.com)

### Installation

```bash
pnpm install
```

This will install both runtime dependencies (`axios`, `cheerio`, …) and dev tooling (**TypeScript**, **ESLint**, **Jest**, etc.).

⸻

### Running the scraper (CLI)

The project exposes a simple CLI to fetch all data for a given player (slug) from AnaliticaFantasy.

Script

In package.json there is a scrape script:

```json
"scripts": {
  "scrape": "ts-node src/main.ts"
}
```

Note: Internally, src/main.ts should delegate to the CLI entrypoint under src/interfaces/cli/main.ts, where the dependencies are wired (HTTP client, page gateway, extractors, use case, etc.).

### Basic usage

From the project root:

```bash
# Default player (if no slug is provided, e.g. "pedri")
pnpm scrape
```

To specify a player slug explicitly:

```bash
pnpm scrape pedri
pnpm scrape bellingham
pnpm scrape lewandowski
```

The CLI will:
1.	Build the **URLs** for the player’s info and market pages.
2.	Fetch the raw **HTML** with axios via the AxiosHtmlClient.
3.	Use the `pageGateway` to decide which HTML to load (info / market).
4.	Parse:
  * Fantasy events history (`fantasyEventsParser`),
  * Player details (`playerDetailsParser`),
  * Market details (`marketDetailsParser`), 
  * It uses the extractors under `src/infrastructure/fantasy/extractors`.
5.	Print to stdout a JSON snapshot with:
* `fantasyEvents`
* `playerDetails`
* `marketDetails`

### Example output (truncated):

```sh
Fetching data for player: pedri
Parsed 25 fantasy rows for slug "pedri":
[
  {
    "matchday": 1,
    "score": { "homeTeam": "...", "awayTeam": "...", ... },
    "events": [ ... ],
    "titularity": true,
    "minutesPlayed": 90,
    "laLigaScore": 8,
    "bonusScore": 1.5
  },
  ...
]

Player details:
{
  "name": "Pedri",
  "team": "FC Barcelona",
  "position": "midfielder",
  "isAvailable": true,
  "titularityChance": 0.85,
  "trustability": 0.9,
  "expectedScoreAsStarter": 7.2,
  "expectedScoreAsSubstitute": 4.3
}

Market details:
{
  "allTimeFantasyMarket": { ... },
  "lastFantasyMarketValues": { ... }
}
```


⸻

## Architecture overview

The project follows a layered / hexagonal structure:
* domain/
* config/: global constants, DTO interfaces, and shared types.
* fantasy/:
* models.ts: high-level domain models (e.g. player snapshot).
* ports.ts: interfaces (ports) that the application depends on (e.g. page gateway, extractors).
* types.ts: domain-specific type aliases and enums.
* application/
* fantasy/:
* parsers/: pure parsing logic (fantasyEventParser, playerDetailsParser, marketDetailsParser), responsible only for transforming HTML → domain structures.
* e2e/fetchPlayerSnapshot.ts: end-to-end use case that orchestrates page loading and parsing to build a full player snapshot.
* utils/: helper functions shared across application logic.
* infrastructure/
* http/axiosHtmlClient.ts: concrete HTTP client implementation using axios.
* fantasy/:
* pageGateway.ts: knows how to construct URLs for info / market pages and fetch the corresponding HTML.
* extractors/: implementations that adapt parsed data to domain models (wrapping the parsers).
* interfaces/cli/main.ts
* CLI entrypoint. Parses CLI args (slug), wires dependencies (HTTP client, gateway, extractors, use case), runs the scraper and prints JSON to stdout.

Thanks to this separation, you can:

* Swap the HTTP client or add proxy/headers logic inside infrastructure/http without touching parsing logic.
* Reuse the same use case from other interfaces (e.g. HTTP API, MCP server) without changing the core scraping code.

⸻

## Development

### Type checking

```
pnpm exec tsc --noEmit
```

### Linting

```
pnpm exec eslint .
```

### Tests

A basic test structure is already in place under tests/:

```sh
tests/
  application/
  domain/
  infrastructure/
```

You can run tests (once configured) with:

```sh
pnpm exec jest
```

⸻

## Roadmap

* Improve **test** coverage for parsers and extractors.
* Add richer **CLI** options (e.g. output file, only-market, only-events).
* Expose the player **snapshot** use case as an MCP tool for consumption by LLMs.

⸻

## Contact

* **Linkedin**: [link](https://linkedin.com/in/andres-herencia)
* **Mail:**: [andresherencia2000@gmail.com](mailto:andresherencia2000@gmail.com)