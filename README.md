# FantasyMCP

An application to analyze and build lineups on **LaLiga FANTASY** based on historical performance and Market Analysis.

## Requirements

* [Node.js](https://nodejs.org/es) (ESM project; "type": "module")
* `bun` (scripts are executed with bun)

## Install

```sh
bun install
```

## CLI Commands

### 1) **Interactive setup** (user context snapshot)

This command prompts you in the console for:

* available balance
* your squad players
* available market players
* opponents info

Then it prints a single JSON snapshot.

```sh
bun setup
```

#### Output example (shape):

```sh
{
  "balance": { "...": "..." },
  "squad": [ { "...": "..." } ],
  "market": [ { "...": "..." } ],
  "opponents": [ { "...": "..." } ]
}
```

### 2) Scrape & parse a player snapshot

This command fetches **HTML** for a given player slug (default: `pedri`) and prints:

* **fantasy events** (parsed table rows)
* **player details**
* **market details**

#### Run with default slug:

```sh
bun scrap
```

Run with a specific slug:

```sh
bun scrap bellingham
```

What it does (high level):

* **HTTP**: downloads the player page HTML
* **Extractors**: parse sections into structured models
* **Use case**: FetchPlayerSnapshotUseCase orchestrates the full flow
* **CLI**: prints parsed JSON to stdout

### Features

#### Player snapshot (E2E)

The scrap CLI entrypoint executes an end-to-end use case that returns:

* **`fantasyEvents`**: parsed rows from the fantasy events table
* **`playerDetails`**: normalized player info (position, availability, etc.)
* **`marketDetails`**: current value + recent value changes (when present)

### Notes

- The project is configured with TypeScript module: "nodenext" and runs as ESM.
- The scrap command accepts the player slug as the first CLI argument and falls back to "pedri" if not provided.

### Project structure

```sh
┣ 📂application
┃ ┣ 📂fantasy
┃ ┃ ┣ 📂e2e
┃ ┃ ┃ ┗ 📜fetchPlayerSnapshot.ts
┃ ┃ ┣ 📂parsers
┃ ┃ ┃ ┣ 📜fantasyEventParser.ts
┃ ┃ ┃ ┣ 📜marketDetailsParser.ts
┃ ┃ ┃ ┗ 📜playerDetailsParser.ts
┃ ┃ ┗ 📂userContext
┃ ┃   ┗ 📜getUserContext.ts
┃ ┣ 📂llm
┃ ┃ ┣ 📂ports
┃ ┃ ┃ ┗ 📜llmPorts.ts
┃ ┃ ┗ 📂types
┃ ┃   ┗ 📜schema.ts
┃ ┣ 📂parsers
┃ ┃ ┗ 📜fantasyEventParser.ts
┃ ┗ 📂utils
┃   ┗ 📜helpers.ts
┣ 📂domain
┃ ┣ 📂config
┃ ┃ ┣ 📜constants.ts
┃ ┃ ┣ 📜interfaces.ts
┃ ┃ ┗ 📜types.ts
┃ ┣ 📂errors
┃ ┃ ┣ 📜appError.ts
┃ ┃ ┣ 📜httpError.ts
┃ ┃ ┗ 📜scrapingError.ts
┃ ┗ 📂fantasy
┃   ┣ 📜models.ts
┃   ┣ 📜ports.ts
┃   ┗ 📜types.ts
┣ 📂infrastructure
┃ ┣ 📂fantasy
┃ ┃ ┣ 📂extractors
┃ ┃ ┃ ┣ 📜fantasyEventsExtractor.ts
┃ ┃ ┃ ┣ 📜marketDetailsExtractor.ts
┃ ┃ ┃ ┗ 📜playerDetailsExtractor.ts
┃ ┃ ┣ 📂userContext
┃ ┃ ┃ ┗ 📜userInformation.ts
┃ ┃ ┗ 📜pageGateway.ts
┃ ┣ 📂http
┃ ┃ ┗ 📜axiosHtmlClient.ts
┃ ┣ 📂llm
┃ ┃ ┣ 📂base
┃ ┃ ┃ ┗ 📜baseLlm.ts
┃ ┃ ┣ 📂openai
┃ ┃ ┃ ┗ 📜openaiModel.ts
┃ ┃ ┗ 📂utils
┃ ┃   ┗ 📜schemaAdapter.ts
┃ ┗ 📂mcp
┗ 📂interfaces
  ┗ 📂cli
    ┣ 📜main.ts
    ┗ 📜setup.ts

```