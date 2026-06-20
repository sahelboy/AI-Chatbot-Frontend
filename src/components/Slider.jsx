import { useEffect, useState } from 'react'

const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number.isFinite(n) ? n : 0)))

/* Accessible 0-100 slider: value-in-circle, red->green track.
   Drag + keyboard (arrow up/down) via the native range input;
   typed entry via the number field in the circle (Enter to confirm). */
export default function Slider({
  score, onChange, ariaLabel,
  leftFace = '🙁', rightFace = '🙂',
  leftLabel = 'helemaal niet', rightLabel = 'heel goed',
}) {
  const [text, setText] = useState(String(score))
  const [focus, setFocus] = useState(false)
  useEffect(() => { setText(String(score)) }, [score])

  const commit = () => onChange(clamp(parseInt(text, 10)))

  return (
    <div className={`slider${focus ? ' focus' : ''}`}>
      <div className="track">
        <input
          type="range" min="0" max="100" step="1" value={score}
          aria-label={ariaLabel} aria-valuetext={`${score} van 100`}
          onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
          onChange={(e) => onChange(clamp(+e.target.value))}
        />
        <div className="thumb" style={{ left: `${score}%` }}>
          <input
            className="val" type="number" min="0" max="100" value={text} tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => setText(e.target.value)}
            onBlur={commit}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => { if (e.key === 'Enter') { commit(); e.currentTarget.blur() } }}
          />
        </div>
      </div>
      <div className="ends"><span aria-hidden="true">{leftFace}</span><span aria-hidden="true">{rightFace}</span></div>
      <div className="labels"><span>{leftLabel}</span><span>{rightLabel}</span></div>
    </div>
  )
}
