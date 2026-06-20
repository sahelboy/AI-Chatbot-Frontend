# AI Chatbot Frontend — Padvinder

Frontend van de **Padvinder**-chatbot voor het *Sociaal Knooppunt*, gebouwd als
schoolproject (Fontys IT-groepsproject). Dit is een React + Vite single-page
applicatie die de bezoeker via een vriendelijke wizard door de zes pijlers van
het **Leefstijlroer** leidt en op basis daarvan passende activiteiten en
voorzieningen voorstelt.

> Dit deel van het project — het **ontwerp en de bouw van de frontend** — is mijn
> bijdrage aan het groepsproject. De code is overgenomen uit de gedeelde
> groepsrepo en hier als zelfstandige frontend-repo samengebracht.

## Functionaliteit

- **Wizard-flow** door de zes leefstijlpijlers: Bewegen, Voeding, Ontspanning,
  Verbinding, Slaap en Middelen.
- **Drie startroutes**: zelf een vraag stellen, één pijler kiezen, of de volledige
  leefstijlscan doorlopen.
- **Sliders en vervolgvragen** per pijler om de behoefte van de gebruiker scherp
  te krijgen.
- **Aparte mobiele interface** die onder 600px breedte automatisch wordt
  weergegeven.
- **Toegankelijkheid (a11y)**: voldoet aan WCAG 2.2 AA (kleurcontrast,
  toetsenbordnavigatie, grote-tekst-modus).
- **Privacy by design**: alle gespreksgegevens blijven in het geheugen — er wordt
  niets in `localStorage` of `sessionStorage` opgeslagen.
- **Crisis-herkenning**: bij signalen van crisis toont de app passende hulp in
  plaats van activiteiten.

## Technische stack

- **React 19**
- **Vite 8** (dev-server + build)
- **ESLint** voor linting
- Geen extra UI-frameworks — eigen componenten en CSS (`src/styles/padvinder.css`).

## Projectstructuur

```
src/
├── App.jsx                 # Hoofdcomponent + schermrouting (desktop)
├── main.jsx                # Entry point
├── assets/                 # Logo en Leefstijlroer-pictogrammen
├── components/             # Herbruikbare UI (Slider, vragen, resultaten)
├── data/leefstijl.js       # Pijlers, content en configuratie
├── lib/                    # apiClient, buildQuery, useIsMobile
├── screens/                # Desktopschermen (intro, pijlers, uitkomst, ...)
│   └── mobile/             # Aparte mobiele schermen
├── state/flow.js           # Flow-state en step-machine (useReducer)
└── styles/padvinder.css    # Stijlen
```

## Aan de slag

Vereisten: **Node.js 18+** en **npm**.

```bash
# Dependencies installeren
npm install

# Ontwikkelserver starten (http://localhost:5173)
npm run dev

# Productiebuild maken
npm run build

# Build lokaal bekijken
npm run preview

# Linten
npm run lint
```

## Backend-koppeling

De frontend praat met de **Sociaal Knooppunt**-backend. Tijdens het ontwikkelen
proxyt de Vite-dev-server de API-aanvragen (`/chat`, `/activities`, `/sessions`,
`/users`, `/health`) door naar `http://localhost:8000` — zie `vite.config.js`.
Zorg dat de backend lokaal draait om de volledige flow te testen; zonder backend
werkt de interface wel, maar komen er geen activiteiten terug.

## Toegankelijkheid

De interface is ontworpen voor een brede doelgroep met B1-taalniveau en voldoet
aan **WCAG 2.2 AA**. Er is een knop voor grotere tekst, de volledige flow is met
het toetsenbord te bedienen en het kleurcontrast is daarop afgestemd.

## Licentie

Schoolproject — gemaakt in het kader van een Fontys IT-groepsproject.
