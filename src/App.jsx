import { useReducer, useEffect } from 'react'
import { reducer, INITIAL, buildSteps } from './state/flow.js'
import { streamChat } from './lib/apiClient.js'
import { buildUserMessage, buildScores, buildFilters, buildReasoning } from './lib/buildQuery.js'
import { useIsMobile } from './lib/useIsMobile.js'
import { MobileScreen } from './screens/mobile/index.jsx'
import { WelcomeScreen, ConsentScreen, EntryScreen } from './screens/intro.jsx'
import { SliderScreen, MiddelenScreen, VragenScreen, PillarChoiceScreen, DirectQueryScreen } from './screens/pillars.jsx'
import { SummaryScreen, TopicScreen, ProfileScreen } from './screens/wrapup.jsx'
import { MatchingScreen, ResultsScreen, AccountScreen, AccountFormScreen, ContactScreen, DoneScreen } from './screens/outcome.jsx'
import { CrisisScreen, LowScoreScreen, NoMatchScreen, InloopScreen, SkippedScreen } from './screens/alt.jsx'

function WizardScreen(props) {
  const { state } = props
  const steps = buildSteps(state)
  const step = steps.find((s) => s.id === state.stepId) || steps[0]
  switch (step.kind) {
    case 'welcome': return <WelcomeScreen {...props} />
    case 'consent': return <ConsentScreen {...props} />
    case 'entry': return <EntryScreen {...props} />
    case 'directQuery': return <DirectQueryScreen {...props} />
    case 'pillarChoice': return <PillarChoiceScreen {...props} />
    case 'slider': return <SliderScreen {...props} pillar={step.pillar} />
    case 'vragen': return <VragenScreen {...props} pillar={step.pillar} />
    case 'middelen': return <MiddelenScreen {...props} />
    case 'summary': return <SummaryScreen {...props} />
    case 'topic': return <TopicScreen {...props} />
    case 'profile': return <ProfileScreen {...props} />
    default: return <WelcomeScreen {...props} />
  }
}

function Screen(props) {
  const { state } = props
  switch (state.screen) {
    case 'wizard': return <WizardScreen {...props} />
    case 'skipped': return <SkippedScreen {...props} />
    case 'matching': return <MatchingScreen {...props} />
    case 'results': return <ResultsScreen {...props} />
    case 'contact': return <ContactScreen {...props} />
    case 'account': return <AccountScreen {...props} />
    case 'accountForm': return <AccountFormScreen {...props} />
    case 'done': return <DoneScreen {...props} />
    case 'crisis': return <CrisisScreen {...props} />
    case 'lowscore': return <LowScoreScreen {...props} />
    case 'nomatch': return <NoMatchScreen {...props} />
    case 'inloop': return <InloopScreen {...props} />
    default: return <WelcomeScreen {...props} />
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL)
  const isMobile = useIsMobile()

  const chrome = {
    bigText: state.bigText,
    onToggleText: () => dispatch({ type: 'TOGGLE_TEXT' }),
    onReset: () => dispatch({ type: 'RESET' }),
  }

  // Run the matching call whenever we enter the matching screen.
  useEffect(() => {
    if (state.screen !== 'matching') return
    let cancelled = false
    const ctrl = new AbortController()
    dispatch({ type: 'MATCH_START' })
    ;(async () => {
      const messages = [{ role: 'user', text: buildUserMessage(state) }]
      let activities = null
      let crisis = null
      try {
        // The server sends crisis OR activities first, then LLM prose we don't
        // display. Resolve as soon as we have what we need and abort the rest.
        await streamChat({
          messages, scores: buildScores(state), filters: buildFilters(state), signal: ctrl.signal,
          callbacks: {
            onActivities: (a) => { activities = a || []; ctrl.abort() },
            onCrisis: (p) => { crisis = p; ctrl.abort() },
          },
        })
      } catch (e) {
        // AbortError after we already captured data is expected, not a failure.
        if (e && e.name !== 'AbortError' && !activities && !crisis && !cancelled) {
          dispatch({ type: 'MATCH_ERROR', error: String(e.message || e) })
          return
        }
      }
      if (cancelled) return
      if (crisis) { dispatch({ type: 'MATCH_CRISIS', message: crisis.content || crisis.crisisMessage || crisis.message }); return }
      if (activities) {
        const matches = activities.slice(0, 3)
        dispatch({ type: 'MATCH_DONE', matches, reasoning: buildReasoning(state, matches) })
      } else {
        dispatch({ type: 'MATCH_ERROR', error: 'Geen antwoord van de server' })
      }
    })()
    return () => { cancelled = true; ctrl.abort() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.screen])

  const View = isMobile ? MobileScreen : Screen
  return (
    <div className={`app-root${state.bigText ? ' big-text' : ''}${isMobile ? ' mobile' : ''}`}>
      <View key={`${state.screen}:${state.stepId || ''}`} state={state} dispatch={dispatch} chrome={chrome} />
    </div>
  )
}
