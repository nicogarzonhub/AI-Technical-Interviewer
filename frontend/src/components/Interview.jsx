import { useState, useRef, useEffect } from 'react'
import { sendMessage } from '../services/api'
import VoiceInput from './VoiceInput'
import './Interview.css'

export default function Interview({ sessionId, initialMessage, config, questionNumber, totalQuestions, onFinish, onRestart }) {
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(`messages_${sessionId}`)
    if (saved) return JSON.parse(saved)
    return [{ role: 'assistant', content: initialMessage?.reply || initialMessage, options: initialMessage?.options || [] }]
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentQ, setCurrentQ] = useState(questionNumber)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    localStorage.setItem(`messages_${sessionId}`, JSON.stringify(messages))
  }, [messages, sessionId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function submit(text) {
    const userText = text || input.trim()
    if (!userText || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userText }])
    setLoading(true)

    try {
      const data = await sendMessage({ session_id: sessionId, message: userText })
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, options: data.options || [] }])
      setCurrentQ(data.question_number)
      if (data.finished) {
        setTimeout(() => onFinish(), 1800)
      }
    } catch (e) {
      if (e.message.includes('404')) {
        alert("Session expired or backend restarted. Returning to setup.")
        onRestart()
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }])
      }
    }
    setLoading(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const progress = Math.round(((currentQ - 1) / totalQuestions) * 100)

  return (
    <div className="interview">
      <header className="interview-header">
        <div className="header-top">
          <div className="interview-meta">
            <span className="meta-role">{config.role}</span>
            <span className="meta-dot">·</span>
            <span className="meta-level">{config.level}</span>
            <span className="meta-dot">·</span>
            <span className="meta-stack">{config.stack}</span>
            <span className="meta-dot">·</span>
            <span className="meta-stack">{config.language}</span>
          </div>
          <button className="exit-btn" onClick={() => {
            if (window.confirm("Are you sure you want to restart the interview? All progress will be lost.")) {
              onRestart()
            }
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            Restart
          </button>
        </div>
        <div className="progress-wrap">
          <div className="progress-label">
            <span>Question {Math.min(currentQ, totalQuestions)} of {totalQuestions}</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`msg msg-${msg.role}`}>
            <div className="msg-avatar">
              {msg.role === 'assistant' ? 'AI' : 'You'}
            </div>
            <div className="msg-bubble">
              <p>{msg.content}</p>
              {msg.role === 'assistant' && msg.options && msg.options.length > 0 && (
                <div className={`options-container ${i !== messages.length - 1 ? 'options-disabled' : ''}`}>
                  {msg.options.map((opt, idx) => (
                    <button 
                      key={idx} 
                      className={`option-btn ${i !== messages.length - 1 ? 'option-btn-disabled' : ''}`}
                      onClick={() => {
                        if (i === messages.length - 1 && !loading) submit(opt)
                      }}
                      disabled={i !== messages.length - 1 || loading}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="msg msg-assistant">
            <div className="msg-avatar">AI</div>
            <div className="msg-bubble msg-typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="input-area">
        <VoiceInput onTranscript={(t) => submit(t)} disabled={loading} />
        <textarea
          ref={textareaRef}
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your answer or use the mic..."
          rows={1}
          disabled={loading}
        />
        <button
          className={`send-btn ${input.trim() ? 'send-active' : ''}`}
          onClick={() => submit()}
          disabled={!input.trim() || loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
