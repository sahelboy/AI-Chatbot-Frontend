// Leefstijlroer pillars + Padvinder content config.
// Icons are the official Leefstijlroer PNGs supplied by Carla.

import bewegen from '../assets/icons/bewegen.png'
import voeding from '../assets/icons/voeding.png'
import ontspanning from '../assets/icons/ontspanning.png'
import verbinding from '../assets/icons/verbinding.png'
import slaap from '../assets/icons/slaap.png'
import middelen from '../assets/icons/middelen.png'

export const PILLAR_ICONS = { bewegen, voeding, ontspanning, verbinding, slaap, middelen }

// order + display label + slider question/guide (B1 copy, verbatim from design)
export const PILLARS = [
  { key: 'bewegen', label: 'Bewegen',
    question: 'Beweeg je genoeg om je fit te voelen?',
    guide: 'De richtlijn is 30 tot 60 minuten per dag, en voorkom veel stilzitten.' },
  { key: 'voeding', label: 'Voeding',
    question: 'Eet je elke dag gezond, vers en gevarieerd?' },
  { key: 'ontspanning', label: 'Ontspanning',
    question: 'Kun je goed ontspannen en voel je je lekker in je hoofd?' },
  { key: 'verbinding', label: 'Verbinding',
    question: 'Ik krijg energie van mijn werk, hobby of de mensen om me heen.' },
  { key: 'slaap', label: 'Slaap',
    question: 'Slaap je goed?' },
  { key: 'middelen', label: 'Middelen', question: 'Hoe vaak gebruik je deze middelen?' },
]

export const PILLAR_LABEL = Object.fromEntries(PILLARS.map((p) => [p.key, p.label]))

// Middelen: one slider per middel (0 = heel vaak, 100 = nooit). Lowest carries forward.
export const MIDDELEN = [
  { naam: 'Roken', richtlijn: 'Richtlijn: niet roken' },
  { naam: 'Alcohol', richtlijn: 'Richtlijn: 0 glazen, max. 1 per dag' },
  { naam: 'Drugs', richtlijn: 'Richtlijn: geen drugs gebruiken' },
  { naam: 'Medicijnen', richtlijn: 'Richtlijn: alleen zoals voorgeschreven' },
]

// Limitations grouped per Carla's feedback (sight/hearing together, body together, energy).
export const LIMIT_GROUPS = [
  { label: 'Zien, horen of praten', items: ['Slecht zicht of moeite met lezen', 'Slechthorend', 'Moeite met praten of spreek geen Nederlands'] },
  { label: 'Bewegen van je lichaam', items: ['Moeite met lopen en staan', 'Moeite met je armen gebruiken', 'Problemen met je bovenlichaam of een rolstoel'] },
  { label: 'Energie', items: ['Weinig energie door ziekte'] },
]

export const ATTENTION_THRESHOLD = 40 // score < 40 -> aandachtspunt + vervolgvragen

export const scoreColor = (n) => (n < 40 ? '#e2604a' : n < 70 ? '#e8a13d' : '#5a9e2f')

// Placeholder required in every free-text field (keeps answers short / B1).
export const GHOST = 'Probeer kort, in maximaal een paar zinnen, antwoord te geven.'
export const TEXT_MAXLEN = 240

export const lowestMiddel = (middelen) => {
  const entries = MIDDELEN.map((m) => ({ naam: m.naam, score: middelen[m.naam] ?? 100 }))
  return entries.reduce((a, b) => (b.score < a.score ? b : a))
}
