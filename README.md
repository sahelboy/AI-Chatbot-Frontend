# AI Chatbot Frontend — Padvinder

Frontend van de **Padvinder**-chatbot voor het *Sociaal Knooppunt*, gebouwd als
schoolproject (Fontys IT-groepsproject). Dit is een React + Vite single-page
applicatie die de bezoeker via een vriendelijke wizard door de zes pijlers van
het **Leefstijlroer** leidt en op basis daarvan passende activiteiten en
voorzieningen voorstelt.

> Dit deel van het project — het **ontwerp en de bouw van de frontend** — is mijn
> bijdrage aan het groepsproject. De code is overgenomen uit de gedeelde
> groepsrepo en hier als zelfstandige frontend-repo samengebracht.

## Videodemo — volledige UX-tour

Een doorlopende opname van de complete frontend: alle drie de startroutes en
álle schermen, opgenomen met de volledige stack lokaal actief (frontend +
FastAPI/ChromaDB/Ollama-backend), zodat ook de echte resultaten kloppen.

https://github.com/user-attachments/assets/edc9d355-71a5-4fd3-aaea-6c16697df386

> Speelt de speler hierboven niet af? Bekijk de video dan via de
> [release](https://github.com/sahelboy/AI-Chatbot-Frontend/releases/download/v1.0-demo/padvinder-ux-tour.mp4)
> of open [`docs/padvinder-ux-tour.mp4`](docs/padvinder-ux-tour.mp4) in de repo.

**Hoofdstukken (±1:40):**

| Tijd | Wat je ziet |
|------|-------------|
| 0:00 | Welkom, privacy & startkeuze → route **"Nee, ik weet het nog niet"** (volledige leefstijlscan): sliders, middelen, samenvatting, onderwerp, profiel, resultaten, activiteit kiezen, contact, account aanmaken, afsluiting |
| 0:28 | **Lage scores**: vervolgvragen, een vraag overslaan, en het huisarts-advies (lage-score-scherm) |
| 0:50 | Route **"Ja, ik weet precies wat ik wil"**: directe vraag → resultaten |
| 1:00 | **Crisisdetectie** en doorverwijzing (112 / 113 / Veilig Thuis) |
| 1:09 | Route **"Ik heb een idee"**: onderwerpen kiezen → vervolgvragen → resultaten |
| 1:22 | **Geen match** → inlooplocatie → contact |

## Schermen

De videodemo hierboven toont de volledige desktop-flow. Hieronder de **mobiele
weergave**: onder 600px breedte schakelt de app automatisch naar een aparte
mobiele interface met volledige-breedte knoppen.

| Welkom (mobiel) | Privacy (mobiel) |
|:---:|:---:|
| ![Mobiel welkomstscherm](docs/screenshots/06-mobiel-welkom.png) | ![Mobiel privacyscherm](docs/screenshots/07-mobiel-vervolg.png) |

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
