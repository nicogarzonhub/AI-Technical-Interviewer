import { useState } from 'react'
import './Setup.css'

const ROLES = ['Frontend Developer', 'Backend Developer', 'Full-Stack Developer', 'DevOps Engineer', 'Data Engineer', 'Mobile Developer']
const LEVELS = ['Junior', 'Mid-level', 'Senior']
const STACKS = ['JavaScript / React', 'Python / Django', 'Node.js / Express', 'TypeScript / Next.js', 'Java / Spring', 'Go', 'PHP / Laravel', 'Ruby on Rails']
const LANGUAGES = ['English', 'Español']

export default function Setup({ onStart }) {
  const [role, setRole] = useState('')
  const [level, setLevel] = useState('')
  const [stack, setStack] = useState('')
  const [language, setLanguage] = useState('English')
  const [loading, setLoading] = useState(false)

  const canStart = role && level && stack && language

  async function handleStart() {
    if (!canStart) return
    setLoading(true)
    try {
      await onStart({ role, level, stack, language })
    } catch (err) {
      console.error(err)
      alert("Error starting interview. Please check the backend connection or API key.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="setup">
      <div className="setup-bg" />
      <div className="setup-card">
        <div className="setup-header">
          <div className="setup-badge">AI INTERVIEWER</div>
          <h1 className="setup-title">Ready for your<br /><span>technical interview?</span></h1>
          <p className="setup-subtitle">Configure your session and the AI will conduct a real technical interview — then evaluate your performance.</p>
        </div>

        <div className="setup-form">
          <div className="form-group">
            <label>Role</label>
            <div className="chip-group">
              {ROLES.map(r => (
                <button
                  key={r}
                  className={`chip ${role === r ? 'chip-active' : ''}`}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Experience level</label>
            <div className="chip-group">
              {LEVELS.map(l => (
                <button
                  key={l}
                  className={`chip ${level === l ? 'chip-active' : ''}`}
                  onClick={() => setLevel(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Tech stack</label>
            <div className="chip-group">
              {STACKS.map(s => (
                <button
                  key={s}
                  className={`chip ${stack === s ? 'chip-active' : ''}`}
                  onClick={() => setStack(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Language / Idioma</label>
            <div className="chip-group">
              {LANGUAGES.map(l => (
                <button
                  key={l}
                  className={`chip ${language === l ? 'chip-active' : ''}`}
                  onClick={() => setLanguage(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          className={`start-btn ${canStart ? 'start-btn-active' : ''}`}
          onClick={handleStart}
          disabled={!canStart || loading}
        >
          {loading ? (
            <span className="btn-loading">
              <span className="spinner" /> Preparing your interview...
            </span>
          ) : (
            'Start Interview →'
          )}
        </button>

        {canStart && !loading && (
          <p className="setup-hint">
            {level} {role} · {stack} · 6 questions
          </p>
        )}
      </div>
    </div>
  )
}
