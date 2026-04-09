import { useState } from 'react'

export default function SettingsView({ kidProfile, onSaveProfile, apiKey, onSaveApiKey }) {
  const [key, setKey]         = useState(apiKey || '')
  const [showKey, setShowKey] = useState(false)
  const [profile, setProfile] = useState({
    name: '', age: '', grade: '', school: '',
    wakeTime: '07:00', homeworkTime: '15:30', bedTime: '21:00',
    activities: '', adhdNotes: '',
    ...kidProfile,
  })
  const [saved, setSaved] = useState(false)

  function set(k, v) { setProfile(p => ({ ...p, [k]: v })) }

  function handleSave(e) {
    e.preventDefault()
    onSaveApiKey(key.trim())
    onSaveProfile(profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '40px 48px' }}>
      <div className="mb-5">
        <h1 className="title is-4 mb-1">Settings</h1>
        <p className="subtitle is-6 mt-0">Configure your kid's profile and AI connection.</p>
      </div>

      <form onSubmit={handleSave}>

        {/* ── API Key ── */}
        <div className="card mb-5">
          <div className="card-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span className="material-icons has-text-primary" style={{ fontSize: 22 }}>key</span>
              <p className="title is-6 mb-0">Claude API Key</p>
            </div>
            <p className="help mb-4">
              Required for AI schedule generation and screenshot reading. Get yours at console.anthropic.com.
            </p>

            <div className="field has-addons">
              <div className="control is-expanded">
                <input
                  type={showKey ? 'text' : 'password'}
                  className="input"
                  style={{ fontFamily: 'monospace' }}
                  placeholder="sk-ant-..."
                  value={key}
                  onChange={e => setKey(e.target.value)}
                />
              </div>
              <div className="control">
                <button type="button" className="button" onClick={() => setShowKey(v => !v)}>
                  <span className="icon">
                    <span className="material-icons" style={{ fontSize: 20 }}>{showKey ? 'visibility_off' : 'visibility'}</span>
                  </span>
                </button>
              </div>
            </div>

            {key && (
              <p className="help" style={{ color: '#257942', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="material-icons" style={{ fontSize: 14 }}>check_circle</span>
                Key set
              </p>
            )}
          </div>
        </div>

        {/* ── Kid Profile ── */}
        <div className="card mb-5">
          <div className="card-content">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <span className="material-icons has-text-primary" style={{ fontSize: 22 }}>person</span>
              <p className="title is-6 mb-0">Kid's Profile</p>
            </div>

            {/* Basic info */}
            <div className="columns">
              <div className="column is-5">
                <div className="field">
                  <label className="label is-small">Name</label>
                  <div className="control">
                    <input className="input" placeholder="e.g. Emma" value={profile.name} onChange={e => set('name', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="column is-2">
                <div className="field">
                  <label className="label is-small">Age</label>
                  <div className="control">
                    <input type="number" className="input" placeholder="e.g. 9" value={profile.age} onChange={e => set('age', e.target.value)} min="4" max="18" />
                  </div>
                </div>
              </div>
              <div className="column is-2">
                <div className="field">
                  <label className="label is-small">Grade</label>
                  <div className="control">
                    <input className="input" placeholder="e.g. 3rd" value={profile.grade} onChange={e => set('grade', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="column">
                <div className="field">
                  <label className="label is-small">School</label>
                  <div className="control">
                    <input className="input" placeholder="School name" value={profile.school} onChange={e => set('school', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #ededed', margin: '8px 0 20px' }} />

            {/* Daily routine */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
              <span className="material-icons has-text-grey" style={{ fontSize: 16 }}>schedule</span>
              <span className="is-size-7 has-text-weight-semibold has-text-grey-dark" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Daily Routine</span>
            </div>
            <div className="columns">
              <div className="column">
                <div className="field">
                  <label className="label is-small">Wake up</label>
                  <div className="control">
                    <input type="time" className="input" value={profile.wakeTime} onChange={e => set('wakeTime', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="column">
                <div className="field">
                  <label className="label is-small">Homework time</label>
                  <div className="control">
                    <input type="time" className="input" value={profile.homeworkTime} onChange={e => set('homeworkTime', e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="column">
                <div className="field">
                  <label className="label is-small">Bedtime</label>
                  <div className="control">
                    <input type="time" className="input" value={profile.bedTime} onChange={e => set('bedTime', e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #ededed', margin: '8px 0 20px' }} />

            {/* Activities & notes */}
            <div className="columns">
              <div className="column">
                <div className="field">
                  <label className="label is-small">Activities & Interests</label>
                  <div className="control">
                    <textarea
                      className="textarea"
                      style={{ height: 100 }}
                      placeholder="e.g. Soccer Tue/Thu 4–5pm, Piano Saturday 10am, loves Lego…"
                      value={profile.activities}
                      onChange={e => set('activities', e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="column">
                <div className="field">
                  <label className="label is-small">ADHD Notes & Tips</label>
                  <div className="control">
                    <textarea
                      className="textarea"
                      style={{ height: 100 }}
                      placeholder="e.g. Gets distracted after 15 min, needs movement breaks, works better with music…"
                      value={profile.adhdNotes}
                      onChange={e => set('adhdNotes', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="level">
          <div className="level-left">
            <p className="help">Stored locally in your browser</p>
          </div>
          <div className="level-right">
            <button
              type="submit"
              className={`button is-primary ${saved ? 'is-success' : ''}`}
              style={{ minWidth: 140 }}
            >
              <span className="icon">
                <span className="material-icons" style={{ fontSize: 18 }}>{saved ? 'check' : 'save'}</span>
              </span>
              <span>{saved ? 'Saved!' : 'Save Settings'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
