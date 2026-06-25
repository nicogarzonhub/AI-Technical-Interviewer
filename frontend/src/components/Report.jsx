import { useEffect, useState } from 'react'
import { getReport, deleteSession } from '../services/api'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, PolarRadiusAxis
} from 'recharts'
import './Report.css'

const CATEGORY_LABELS = {
  technical_concepts: 'Technical Concepts',
  problem_solving: 'Problem Solving',
  communication: 'Communication',
  depth_of_knowledge: 'Depth of Knowledge',
  best_practices: 'Best Practices'
}

const RECOMMENDATION_CONFIG = {
  Hire: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)', emoji: '✓' },
  Consider: { color: '#eab308', bg: 'rgba(234,179,8,0.1)', border: 'rgba(234,179,8,0.3)', emoji: '~' },
  Pass: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', emoji: '✗' }
}

export default function Report({ sessionId, config, onRestart }) {
  const [report, setReport] = useState(() => {
    const saved = localStorage.getItem(`report_${sessionId}`)
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(!report)

  useEffect(() => {
    async function load() {
      if (report) return // Already loaded from cache
      try {
        const data = await getReport(sessionId)
        setReport(data)
        localStorage.setItem(`report_${sessionId}`, JSON.stringify(data))
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
    }
    load()
  }, [sessionId])

  if (loading) {
    return (
      <div className="report-loading">
        <div className="loading-ring" />
        <p>Generating your evaluation report...</p>
        <span>Analyzing your responses across all categories</span>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="report-loading">
        <p>Failed to load report.</p>
        <button className="restart-btn" onClick={onRestart}>Try again</button>
      </div>
    )
  }

  const radarData = Object.entries(report.categories || {}).map(([key, val]) => ({
    category: CATEGORY_LABELS[key] || key,
    score: val.score
  }))

  const rec = RECOMMENDATION_CONFIG[report.recommendation] || RECOMMENDATION_CONFIG['Pass']
  const scoreColor = report.overall_score >= 75 ? '#22c55e' : report.overall_score >= 50 ? '#eab308' : '#ef4444'

  return (
    <div className="report">
      <div className="report-inner">
        <div className="report-top">
          <div className="report-badge">INTERVIEW COMPLETE</div>
          <h1 className="report-title">Your Evaluation Report</h1>
          <p className="report-config">{config.level} {config.role} · {config.stack}</p>
        </div>

        <div className="report-grid">
          {/* Score + Recommendation */}
          <div className="report-card score-card">
            <div className="overall-score" style={{ '--score-color': scoreColor }}>
              <svg className="score-ring" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle
                  cx="60" cy="60" r="52" fill="none"
                  stroke={scoreColor} strokeWidth="8"
                  strokeDasharray={`${(report.overall_score / 100) * 327} 327`}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="score-number">
                <span style={{ color: scoreColor }}>{report.overall_score}</span>
                <small>/100</small>
              </div>
            </div>

            <div
              className="recommendation-badge"
              style={{ color: rec.color, background: rec.bg, borderColor: rec.border }}
            >
              <span className="rec-icon">{rec.emoji}</span>
              <span>{report.recommendation}</span>
            </div>
            <p className="report-summary">{report.summary}</p>
          </div>

          {/* Radar Chart */}
          <div className="report-card radar-card">
            <h3 className="card-title">Skills Breakdown</h3>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid stroke="rgba(255,255,255,0.07)" />
                <PolarAngleAxis
                  dataKey="category"
                  tick={{ fill: '#888899', fontSize: 11, fontFamily: 'Inter' }}
                />
                <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#6c63ff"
                  fill="#6c63ff"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category breakdown */}
        <div className="report-card">
          <h3 className="card-title">Category Scores</h3>
          <div className="categories">
            {Object.entries(report.categories || {}).map(([key, val]) => {
              const barColor = val.score >= 75 ? '#22c55e' : val.score >= 50 ? '#eab308' : '#ef4444'
              return (
                <div key={key} className="category-row">
                  <div className="category-header">
                    <span className="category-name">{CATEGORY_LABELS[key] || key}</span>
                    <span className="category-score" style={{ color: barColor }}>{val.score}</span>
                  </div>
                  <div className="category-bar">
                    <div className="category-fill" style={{ width: `${val.score}%`, background: barColor }} />
                  </div>
                  <p className="category-feedback">{val.feedback}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Strengths + Areas */}
        <div className="report-two-col">
          <div className="report-card">
            <h3 className="card-title">Strengths</h3>
            <ul className="feedback-list feedback-strengths">
              {(report.strengths || []).map((s, i) => (
                <li key={i}><span>✓</span>{s}</li>
              ))}
            </ul>
          </div>
          <div className="report-card">
            <h3 className="card-title">Areas to Improve</h3>
            <ul className="feedback-list feedback-improve">
              {(report.areas_to_improve || []).map((a, i) => (
                <li key={i}><span>→</span>{a}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Standout moment */}
        {report.standout_moment && (
          <div className="report-card standout-card">
            <h3 className="card-title">Standout Moment</h3>
            <p className="standout-text">"{report.standout_moment}"</p>
          </div>
        )}

        <div className="report-actions">
          <button className="restart-btn" onClick={onRestart}>
            Start New Interview
          </button>
        </div>
      </div>
    </div>
  )
}
