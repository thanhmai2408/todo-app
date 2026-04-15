import { useState, useRef } from 'react'
import { generateSchedule, analyzeScreenshot } from '../services/claude'

const MODES = [
  { id: 'type',       label: 'Type',       icon: 'keyboard'     },
  { id: 'voice',      label: 'Voice',      icon: 'mic'          },
  { id: 'screenshot', label: 'Screenshot', icon: 'photo_camera' },
]

const SUBJECT_ICONS = {
  math:'calculate', reading:'menu_book', science:'science',
  writing:'edit', art:'palette', music:'music_note',
  exercise:'directions_run', other:'task',
}

export default function ScheduleBuilder({ kidProfile, onAddTasks, hasApiKey }) {
  const [mode, setMode]           = useState('type')
  const [inputText, setInputText] = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [generated, setGenerated] = useState(null)
  const [isListening, setIsListening] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const [analyzingImg, setAnalyzingImg] = useState(false)
  const [dayFilter, setDayFilter] = useState('weekday')
  const [selected, setSelected]   = useState(new Set())

  const recognitionRef = useRef(null)
  const fileRef = useRef(null)

  function startListening() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) { setError('Voice input not supported. Try Chrome.'); return }
    const r = new SR(); r.continuous = true; r.interimResults = true; r.lang = 'en-US'
    let final = inputText
    r.onresult = e => {
      let interim = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) final += e.results[i][0].transcript + ' '
        else interim = e.results[i][0].transcript
      }
      setInputText(final + interim)
    }
    r.onerror = e => { setError(`Voice: ${e.error}`); setIsListening(false) }
    r.onend = () => { setIsListening(false); setInputText(final) }
    r.start(); recognitionRef.current = r; setIsListening(true); setError('')
  }
  function stopListening() { recognitionRef.current?.stop(); setIsListening(false) }

  async function handleImageUpload(e) {
    const file = e.target.files[0]; if (!file) return
    if (!hasApiKey) { setError('Add your Claude API key in Settings first.'); return }
    const reader = new FileReader()
    reader.onload = async ev => {
      const dataUrl = ev.target.result
      setImagePreview(dataUrl)
      setAnalyzingImg(true); setError('')
      try {
        const text = await analyzeScreenshot(dataUrl.split(',')[1], file.type || 'image/jpeg')
        setInputText(p => p ? p + '\n\n' + text : text)
      } catch (err) { setError(err.message) } finally { setAnalyzingImg(false) }
    }
    reader.readAsDataURL(file)
  }

  async function handleGenerate() {
    if (!inputText.trim()) { setError("Describe your kid's schedule first."); return }
    if (!hasApiKey) { setError('Add your Claude API key in Settings first.'); return }
    setLoading(true); setError(''); setGenerated(null)
    try {
      const result = await generateSchedule(inputText, kidProfile)
      setGenerated(result)
      setSelected(new Set([
        ...(result.weekdayTasks || []).map((_, i) => `weekday-${i}`),
        ...(result.weekendTasks || []).map((_, i) => `weekend-${i}`),
      ]))
    } catch (err) { setError(err.message) } finally { setLoading(false) }
  }

  function toggleTask(key) {
    setSelected(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }

  function handleAddSelected() {
    if (!generated) return
    const today = new Date().toISOString().slice(0, 10)
    const tasks = [
      ...(generated.weekdayTasks || []).filter((_, i) => selected.has(`weekday-${i}`))
        .map(t => ({ ...t, dayType: 'weekday', date: today, completed: false, momHelped: false, aiGenerated: true })),
      ...(generated.weekendTasks || []).filter((_, i) => selected.has(`weekend-${i}`))
        .map(t => ({ ...t, dayType: 'weekend', date: today, completed: false, momHelped: false, aiGenerated: true })),
    ]
    onAddTasks(tasks)
    setGenerated(null); setInputText(''); setImagePreview(null); setSelected(new Set())
  }

  const previewTasks = generated ? (dayFilter === 'weekday' ? generated.weekdayTasks : generated.weekendTasks) || [] : []

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 48px' }}>

      {/* Page header */}
      <div className="mb-5">
        <h1 className="title is-4 mb-1">Schedule Builder</h1>
        <p className="subtitle is-6 mt-0">Describe your kid's week — AI creates ADHD-friendly tasks.</p>
      </div>

      {/* Desktop two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: generated ? '1fr 1fr' : '600px', gap: 32, alignItems: 'start', justifyContent: 'center' }}>

        {/* Left: input panel */}
        <div className="card">
          <div className="card-content">
            <p className="title is-6 mb-4">Kid's Schedule Info</p>

            {/* Mode tabs */}
            <div className="tabs mb-3">
              <ul>
                {MODES.map(m => (
                  <li key={m.id} className={mode === m.id ? 'is-active' : ''}>
                    <a onClick={() => setMode(m.id)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="material-icons" style={{ fontSize: 18 }}>{m.icon}</span>
                      {m.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Hint toast */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: '#ede9fe', borderRadius: 8,
              padding: '10px 14px', marginBottom: 16,
            }}>
              <span className="material-icons" style={{ fontSize: 16, color: '#7c3aed', flexShrink: 0 }}>info</span>
              <p style={{ fontSize: 13, color: '#5b21b6', margin: 0 }}>
                Fill in your kid's schedule below, then click <strong>Generate</strong> to create AI-powered tasks.
              </p>
            </div>

            {/* Type */}
            {mode === 'type' && (
              <div className="field">
                <div className="control">
                  <textarea
                    className="textarea"
                    style={{ height: 200 }}
                    placeholder={'Example:\n- School 8am–3pm, Mon–Fri\n- Soccer Tue & Thu 4–5pm\n- Math homework due Friday\n- Reading 20 min every night\n- Loves Lego, hates writing'}
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Voice */}
            {mode === 'voice' && (
              <div>
                <div className="field" style={{ position: 'relative', marginBottom: 12 }}>
                  <div className="control">
                    <textarea
                      className="textarea"
                      style={{ height: 160 }}
                      placeholder="Click 'Start Speaking' and describe your kid's schedule…"
                      value={inputText}
                      onChange={e => setInputText(e.target.value)}
                      readOnly={isListening}
                    />
                  </div>
                  {isListening && (
                    <span
                      className="tag is-danger"
                      style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <span className="material-icons" style={{ fontSize: 12 }}>fiber_manual_record</span>
                      Listening
                    </span>
                  )}
                </div>
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`button is-fullwidth ${isListening ? 'is-danger' : 'is-primary'}`}
                >
                  <span className="icon"><span className="material-icons" style={{ fontSize: 18 }}>{isListening ? 'stop' : 'mic'}</span></span>
                  <span>{isListening ? 'Stop Recording' : 'Start Speaking'}</span>
                </button>
              </div>
            )}

            {/* Screenshot */}
            {mode === 'screenshot' && (
              <div>
                <div
                  onClick={() => fileRef.current?.click()}
                  style={{
                    border: '2px dashed #dbdbdb', borderRadius: 8,
                    padding: 32, textAlign: 'center', cursor: 'pointer', marginBottom: 16,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fafafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {imagePreview ? (
                    <div>
                      <img src={imagePreview} alt="Upload" style={{ maxHeight: 160, borderRadius: 8, objectFit: 'contain', marginBottom: 8 }} />
                      <p className="help">{analyzingImg ? 'Reading image…' : 'Click to replace'}</p>
                    </div>
                  ) : (
                    <>
                      <span className="material-icons has-text-grey-light" style={{ fontSize: 44, display: 'block', marginBottom: 8 }}>photo_camera</span>
                      <p className="has-text-weight-medium mb-1">Upload a schedule photo</p>
                      <p className="help">School sheet, calendar, homework planner…</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                {inputText && (
                  <div className="field">
                    <div className="control">
                      <textarea
                        className="textarea"
                        style={{ height: 100 }}
                        placeholder="Extracted info — edit if needed"
                        value={inputText}
                        onChange={e => setInputText(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="notification is-danger is-light mt-3" style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 16px' }}>
                <span className="material-icons" style={{ fontSize: 16, flexShrink: 0 }}>error_outline</span>
                <p className="is-size-7">{error}</p>
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading || !inputText.trim()}
              className={`button is-primary is-fullwidth mt-4 ${loading ? 'is-loading' : ''}`}
              style={{ height: 44 }}
            >
              {!loading && (
                <>
                  <span className="icon"><span className="material-icons" style={{ fontSize: 18 }}>auto_awesome</span></span>
                  <span>Generate Schedule with AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: AI preview (shown once generated) */}
        {generated && (
          <div className="card">
            <div className="card-content">
              <div className="level mb-4">
                <div className="level-left">
                  <p className="title is-6 mb-0">Generated Tasks</p>
                </div>
                <div className="level-right">
                  <div className="buttons has-addons">
                    {['weekday', 'weekend'].map(d => (
                      <button
                        key={d}
                        onClick={() => setDayFilter(d)}
                        className={`button is-small ${dayFilter === d ? 'is-primary is-selected' : ''}`}
                      >
                        {d === 'weekday' ? 'Weekdays' : 'Weekend'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, maxHeight: 420, overflowY: 'auto' }}>
                {previewTasks.length === 0
                  ? <p className="has-text-grey has-text-centered is-size-7" style={{ padding: '24px 0' }}>No tasks for this day type.</p>
                  : previewTasks.map((task, i) => {
                      const key = `${dayFilter}-${i}`
                      const isSel = selected.has(key)
                      return (
                        <div
                          key={key}
                          onClick={() => toggleTask(key)}
                          className="card"
                          style={{
                            padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'flex-start',
                            outline: isSel ? '2px solid #00d1b2' : 'none',
                            outlineOffset: -1, opacity: isSel ? 1 : 0.5, transition: 'all 0.15s',
                          }}
                        >
                          <div style={{
                            width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                            border: isSel ? 'none' : '2px solid #b5b5b5',
                            background: isSel ? '#00d1b2' : 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            {isSel && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l2.5 2.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3, flexWrap: 'wrap' }}>
                              <span className="material-icons has-text-grey" style={{ fontSize: 14 }}>{SUBJECT_ICONS[task.subject] || 'task'}</span>
                              <span className="tag is-light is-small" style={{ textTransform: 'capitalize' }}>{task.subject}</span>
                              {task.scheduledTime && (
                                <span className="is-size-7 has-text-grey" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <span className="material-icons" style={{ fontSize: 11 }}>schedule</span>{task.scheduledTime}
                                </span>
                              )}
                              {task.timeEstimate && (
                                <span className="is-size-7 has-text-grey" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <span className="material-icons" style={{ fontSize: 11 }}>timer</span>{task.timeEstimate}m
                                </span>
                              )}
                            </div>
                            <p className="is-size-7 has-text-weight-medium mb-0">{task.text}</p>
                            {task.notes && (
                              <p className="is-size-7 has-text-grey mt-1" style={{ fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: 3 }}>
                                <span className="material-icons" style={{ fontSize: 11 }}>lightbulb</span>{task.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })
                }
              </div>

              <div className="level">
                <div className="level-left">
                  <p className="is-size-7 has-text-grey">{selected.size} task{selected.size !== 1 ? 's' : ''} selected</p>
                </div>
                <div className="level-right">
                  <button
                    onClick={handleAddSelected}
                    disabled={selected.size === 0}
                    className="button is-primary"
                  >
                    <span className="icon"><span className="material-icons" style={{ fontSize: 18 }}>add_task</span></span>
                    <span>Add to Today</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
