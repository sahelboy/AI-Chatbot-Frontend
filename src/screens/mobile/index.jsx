import { buildSteps } from '../../state/flow.js'
import { MWelcomeScreen, MConsentScreen, MEntryScreen } from './intro.jsx'
import { MSliderScreen, MMiddelenScreen, MVragenScreen, MPillarChoiceScreen, MDirectQueryScreen } from './pillars.jsx'
import { MSummaryScreen, MTopicScreen, MProfileScreen } from './wrapup.jsx'
import { MMatchingScreen, MResultsScreen, MAccountScreen, MAccountFormScreen, MContactScreen, MDoneScreen } from './outcome.jsx'
import { MCrisisScreen, MLowScoreScreen, MNoMatchScreen, MInloopScreen, MSkippedScreen } from './alt.jsx'

function MWizard(props) {
  const { state } = props
  const steps = buildSteps(state)
  const step = steps.find((s) => s.id === state.stepId) || steps[0]
  switch (step.kind) {
    case 'welcome': return <MWelcomeScreen {...props} />
    case 'consent': return <MConsentScreen {...props} />
    case 'entry': return <MEntryScreen {...props} />
    case 'directQuery': return <MDirectQueryScreen {...props} />
    case 'pillarChoice': return <MPillarChoiceScreen {...props} />
    case 'slider': return <MSliderScreen {...props} pillar={step.pillar} />
    case 'vragen': return <MVragenScreen {...props} pillar={step.pillar} />
    case 'middelen': return <MMiddelenScreen {...props} />
    case 'summary': return <MSummaryScreen {...props} />
    case 'topic': return <MTopicScreen {...props} />
    case 'profile': return <MProfileScreen {...props} />
    default: return <MWelcomeScreen {...props} />
  }
}

// Mobile screen router — mirrors App.jsx's Screen() against the same reducer
// state, so the shared flow logic and the matching effect in App stay intact.
export function MobileScreen(props) {
  const { state } = props
  switch (state.screen) {
    case 'wizard': return <MWizard {...props} />
    case 'skipped': return <MSkippedScreen {...props} />
    case 'matching': return <MMatchingScreen {...props} />
    case 'results': return <MResultsScreen {...props} />
    case 'contact': return <MContactScreen {...props} />
    case 'account': return <MAccountScreen {...props} />
    case 'accountForm': return <MAccountFormScreen {...props} />
    case 'done': return <MDoneScreen {...props} />
    case 'crisis': return <MCrisisScreen {...props} />
    case 'lowscore': return <MLowScoreScreen {...props} />
    case 'nomatch': return <MNoMatchScreen {...props} />
    case 'inloop': return <MInloopScreen {...props} />
    default: return <MWelcomeScreen {...props} />
  }
}
