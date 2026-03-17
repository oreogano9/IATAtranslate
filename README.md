# IATA Translator

A bold, responsive IATA airport code translator with optional camera OCR scanning.

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Notes

- The camera scan uses a Gemini endpoint. Provide your API key at runtime in `src/App.jsx` where `apiKey` is defined.
- The airport database is generated from the provided PDF and lives in `src/data/airports.json`.
- The app now includes an Italian toggle and stores localized fields (`city_it`, `country_it`) in the dataset.
