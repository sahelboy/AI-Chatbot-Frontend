// Flow state + step machine for the Padvinder happy flow.
// All conversation state is in-memory only (privacy by design: no localStorage).

import { PILLARS, MIDDELEN, ATTENTION_THRESHOLD } from '../data/leefstijl.js'

// vervolgvragen per pijler (B1 copy, stacked vertically per Carla's feedback).
export const QUESTIONS = {
  bewegen: [
    { id: 'bewegen_plek', type: 'single', label: 'Liever binnen of buiten?', options: ['Binnen', 'Buiten', 'Maakt niet uit'] },
    { id: 'bewegen_samen', type: 'single', label: 'Liever alleen of samen?', options: ['Alleen', 'In een groep', 'Maakt niet uit'] },
    { id: 'bewegen_coaching', type: 'single', label: 'Wil je dat iemand je helpt bij het bewegen?', options: ['Ja', 'Nee'] },
    { id: 'bewegen_beperking', type: 'limits', label: 'Waar moeten we rekening mee houden?', hint: 'Meerdere antwoorden mogelijk.' },
  ],
  voeding: [
    { id: 'voeding_moeilijk', type: 'text', label: 'Zijn er dingen die het moeilijk maken om gezond te eten?' },
    { id: 'voeding_koken', type: 'single', layout: 'col', label: 'Kook je zelf?', options: ['Ja, bijna altijd', 'Soms', 'Bijna nooit of nooit'] },
    { id: 'voeding_dieet', type: 'single', label: 'Volg je een dieet of heb je allergieën?', options: ['Ja', 'Nee'] },
    // Conditional follow-up: only shown when the user answered 'Ja' above.
    { id: 'voeding_dieet_welke', type: 'text', label: 'Welk dieet of welke allergieën? Vertel kort waar we rekening mee houden.', showIf: (a) => a.voeding_dieet === 'Ja' },
  ],
  ontspanning: [
    { id: 'ontspanning_hobby', type: 'text', label: "Welke hobby's heb je?" },
    { id: 'ontspanning_stress', type: 'single', label: 'Merk je dat piekeren of stress een rol speelt?', options: ['Ja', 'Nee', 'Weet ik niet'] },
    { id: 'ontspanning_voorkeur', type: 'single', layout: 'col', label: 'Voorkeur voor rust of juist activiteit?', options: ['Rustige dingen (mediteren, natuur, lezen)', 'Actieve dingen (sport, creatief bezig zijn)', 'Geen voorkeur'] },
  ],
  verbinding: [
    { id: 'verbinding_eenzaam', type: 'single', label: 'Voel je je weleens eenzaam of alleen?', options: ['Ja, regelmatig', 'Soms', 'Nee'] },
    { id: 'verbinding_groep', type: 'single', label: 'Doe je liever iets met een groep, of vind je 1-op-1 contact fijner?', options: ['Groep', '1-op-1', 'Maakt niet uit'] },
  ],
  slaap: [
    { id: 'slaap_moeite', type: 'multi', label: 'Heb je moeite met inslapen, doorslapen, of word je te vroeg wakker?', hint: 'Meerdere antwoorden mogelijk.', options: ['Inslapen', 'Doorslapen', 'Te vroeg wakker'] },
    { id: 'slaap_nacht', type: 'single', label: "Werk je ook 's avonds of 's nachts?", options: ['Ja', 'Nee'] },
  ],
  middelen: [
    { id: 'middelen_welke', type: 'multi', label: 'Welke middelen gebruik je? (meerdere mogelijk)', options: ['Roken', 'Alcohol', 'Drugs', 'Medicijnen'] },
    { id: 'middelen_veranderen', type: 'single', label: 'Zou je hier nu iets aan willen veranderen?', options: ['Ja', 'Nee', 'Weet ik nog niet'] },
  ],
}

const NORMAL_PILLARS = ['bewegen', 'voeding', 'ontspanning', 'verbinding', 'slaap']

export const INITIAL = {
  screen: 'wizard',          // wizard | skipped | matching | results | account | accountForm | done | crisis | lowscore | nomatch | inloop | contact
  prevScreen: null,
  stepId: 'welcome',
  bigText: false,
  entryType: null,           // precies | beetje | nog_niet
  scores: Object.fromEntries(PILLARS.filter((p) => p.key !== 'middelen').map((p) => [p.key, 50])),
  middelen: Object.fromEntries(MIDDELEN.map((m) => [m.naam, 50])),
  chosenPillars: [],
  answers: {},               // questionId -> string | string[]
  directQuery: '',
  topic: null,
  profile: { leeftijd: '', postcode: '', gender: null, rekening: null },
  contact: { email: '', phone: '' },
  selected: [],              // selected activity ids
  matches: [],
  reasoning: [],
  loading: false,
  error: null,
  crisisMessage: null,
  skips: 0,
}

// Ordered list of wizard steps, derived from entryType + scores.
export function buildSteps(s) {
  const steps = [
    { id: 'welcome', kind: 'welcome' },
    { id: 'consent', kind: 'consent' },
    { id: 'entry', kind: 'entry' },
  ]
  if (s.entryType === 'precies') {
    steps.push({ id: 'direct', kind: 'directQuery' })
    steps.push({ id: 'profile', kind: 'profile' })
  } else if (s.entryType === 'beetje') {
    steps.push({ id: 'pillarChoice', kind: 'pillarChoice' })
    s.chosenPillars.forEach((key) => {
      if (key === 'middelen') steps.push({ id: 'vragen_middelen', kind: 'vragen', pillar: 'middelen' })
      else steps.push({ id: `vragen_${key}`, kind: 'vragen', pillar: key })
    })
    steps.push({ id: 'profile', kind: 'profile' })
  } else if (s.entryType === 'nog_niet') {
    NORMAL_PILLARS.forEach((key) => {
      steps.push({ id: `slider_${key}`, kind: 'slider', pillar: key })
      const low = (s.scores[key] ?? 50) < ATTENTION_THRESHOLD
      if (low) steps.push({ id: `vragen_${key}`, kind: 'vragen', pillar: key })
    })
    steps.push({ id: 'middelen', kind: 'middelen' })
    steps.push({ id: 'summary', kind: 'summary' })
    steps.push({ id: 'topic', kind: 'topic' })
    steps.push({ id: 'profile', kind: 'profile' })
  }
  return steps
}

export const allScoresLow = (s) =>
  NORMAL_PILLARS.every((k) => (s.scores[k] ?? 50) <= ATTENTION_THRESHOLD) &&
  Math.min(...MIDDELEN.map((m) => s.middelen[m.naam] ?? 50)) <= ATTENTION_THRESHOLD

function stepIndex(s) {
  const steps = buildSteps(s)
  return [steps, steps.findIndex((st) => st.id === s.stepId)]
}

export function reducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_TEXT':
      return { ...state, bigText: !state.bigText }

    case 'RESET':
      return { ...INITIAL, bigText: state.bigText }

    case 'SET_ENTRY':
      return { ...state, entryType: action.value }

    case 'GOTO_STEP':
      return { ...state, screen: 'wizard', stepId: action.stepId }

    case 'SET_SCORE':
      return { ...state, scores: { ...state.scores, [action.pillar]: action.value } }

    case 'SET_MIDDEL':
      return { ...state, middelen: { ...state.middelen, [action.naam]: action.value } }

    case 'TOGGLE_PILLAR': {
      const has = state.chosenPillars.includes(action.key)
      let next
      if (has) next = state.chosenPillars.filter((k) => k !== action.key)
      else if (state.chosenPillars.length >= 2) next = [...state.chosenPillars.slice(1), action.key]
      else next = [...state.chosenPillars, action.key]
      return { ...state, chosenPillars: next }
    }

    case 'SET_ANSWER':
      return { ...state, answers: { ...state.answers, [action.id]: action.value } }

    case 'TOGGLE_ANSWER': {
      const cur = Array.isArray(state.answers[action.id]) ? state.answers[action.id] : []
      const next = cur.includes(action.value) ? cur.filter((v) => v !== action.value) : [...cur, action.value]
      return { ...state, answers: { ...state.answers, [action.id]: next } }
    }

    case 'SET_DIRECT':
      return { ...state, directQuery: action.value }

    case 'SET_TOPIC':
      return { ...state, topic: action.value }

    case 'SET_PROFILE':
      return { ...state, profile: { ...state.profile, [action.field]: action.value } }

    case 'SET_CONTACT':
      return { ...state, contact: { ...state.contact, [action.field]: action.value } }

    case 'TOGGLE_SELECT': {
      const has = state.selected.includes(action.id)
      return { ...state, selected: has ? state.selected.filter((i) => i !== action.id) : [...state.selected, action.id] }
    }

    case 'GOTO':
      return { ...state, prevScreen: state.screen, screen: action.screen }

    case 'BACK_SCREEN':
      return { ...state, screen: state.prevScreen || 'results' }

    case 'NEXT': {
      const [steps, i] = stepIndex(state)
      if (i < 0) return state
      // leaving the summary with all-low scores -> huisarts advice (route 4)
      if (state.stepId === 'summary' && state.entryType === 'nog_niet' && allScoresLow(state)) {
        return { ...state, screen: 'lowscore' }
      }
      if (i >= steps.length - 1) return { ...state, screen: 'matching' }
      return { ...state, stepId: steps[i + 1].id }
    }

    case 'BACK': {
      const [steps, i] = stepIndex(state)
      if (i <= 0) return state
      return { ...state, stepId: steps[i - 1].id }
    }

    case 'SKIP': {
      // Show a confirmation interstitial first. We keep stepId on the skipped
      // question so 'Toch beantwoorden' can return to it; CONFIRM_SKIP does
      // the actual advance.
      const [, i] = stepIndex(state)
      if (i < 0) return state
      return { ...state, screen: 'skipped' }
    }

    case 'CONFIRM_SKIP': {
      const [steps, i] = stepIndex(state)
      if (i < 0) return { ...state, screen: 'wizard' }
      if (i >= steps.length - 1) return { ...state, skips: state.skips + 1, screen: 'matching' }
      return { ...state, skips: state.skips + 1, screen: 'wizard', stepId: steps[i + 1].id }
    }

    case 'MATCH_START':
      // Re-running matching invalidates any prior selection: the new result set
      // may not contain the same activities, so a stale id must not linger (it
      // would satisfy the no-selection guard and create a contact request for an
      // activity the user can no longer see). Clear it as matching begins.
      return { ...state, loading: true, error: null, selected: [] }

    case 'MATCH_DONE':
      return { ...state, loading: false, matches: action.matches, reasoning: action.reasoning,
        screen: action.matches.length ? 'results' : 'nomatch' }

    case 'MATCH_CRISIS':
      return { ...state, loading: false, crisisMessage: action.message || null, screen: 'crisis' }

    case 'MATCH_ERROR':
      return { ...state, loading: false, error: action.error || 'Er ging iets mis', screen: 'nomatch' }

    default:
      return state
  }
}
