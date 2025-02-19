# Skanowanie bezpieczeństwa

## Cel

Celem jest stworzenie automatycznego procesu skanowania bezpieczeństwa aplikacji, który będzie:
- Uruchamiany co tydzień
- Sprawdzał zależności pod kątem podatności
- Skanował obraz Docker
- Tworzył automatyczne PR-y z aktualizacjami bezpieczeństwa

## Krok 1 - Tworzenie workflow

Utwórz plik `.github/workflows/SecurityScans.yml`:

### 1.1 Konfiguracja wyzwalaczy

```yaml
name: Security Scans

on:
  schedule:
    - cron: '0 0 * * 1'  # Uruchomienie w każdy poniedziałek o północy
  workflow_dispatch:     # Możliwość ręcznego uruchomienia
  pull_request:
    branches: [ main ]
```

### 1.2 Dodaj przegląd zależności

Dependency review to narzędzie, które sprawdza zależności pod kątem podatności.

```yaml
jobs:
  dependency-review:
    name: Dependency Review
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Dependency Review
        uses: actions/dependency-review-action@v3
        with:
          fail-on-severity: high
          base-ref: ${{ github.event.pull_request.base.sha }}
          head-ref: ${{ github.event.pull_request.head.sha }}
```

### 1.4 Dodaj skanowanie NPM

Skanowanie NPM to narzędzie, które sprawdza zależności pod kątem podatności.

```yaml
  npm-audit:
    name: NPM Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm audit
        continue-on-error: true
```

### 1.5 Dodaj skanowanie obrazu Docker

Trivy to narzędzie, które sprawdza obraz Docker pod kątem podatności.

```yaml
  docker-scan:
    name: Docker Image Scan
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build image
        run: docker build -t weather-app .
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: "fs"
          format: table
          scan-ref: .
          severity: HIGH,CRITICAL
          ignore-unfixed: true
          exit-code: 1
```

## Krok 2 - Konfiguracja Dependabot

1. Wybierz "Settings" > "Code security" i wybierz "Dependabot alerts" > "Enable"
1. Przejdź do zakładki "Security" w repozytorium
2. Włącz Dependabot alerts
3. Włącz Dependabot security updates

## Krok 3 - Testowanie

1. Uruchom workflow ręcznie:
   - Przejdź do Actions
   - Wybierz "Security Scans"
   - Kliknij "Run workflow"

2. Sprawdź wyniki w:
   - Zakładce Security > Dependabot
   - Zakładce Pull requests (automatyczne PR-y)
   - Logach workflow w Actions

## Weryfikacja

Upewnij się, że:
- [x] Workflow uruchamia się automatycznie co tydzień
- [x] Dependabot wykrywa podatności
- [x] NPM Audit sprawdza zależności Node.js
- [x] Trivy skanuje obraz Docker
- [x] Tworzone są automatyczne PR-y z poprawkami

> Więcej o bezpieczeństwie w GitHub Actions w [dokumentacji](https://docs.github.com/en/code-security) 