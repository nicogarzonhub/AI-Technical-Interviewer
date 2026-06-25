import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import Setup from './components/Setup'
import Interview from './components/Interview'
import Report from './components/Report'
import { startInterview } from './services/api'

const SCREENS = { SETUP: 'setup', INTERVIEW: 'interview', REPORT: 'report' }

export default function App() {
  const [screen, setScreen] = useState(() => localStorage.getItem('interviewScreen') || SCREENS.SETUP)
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('interviewSessionId') || null)
  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('interviewConfig')
    return saved ? JSON.parse(saved) : null
  })
  const [firstMessage, setFirstMessage] = useState(() => {
    const saved = localStorage.getItem('interviewFirstMessage')
    return saved ? JSON.parse(saved) : null
  })
  const [questionData, setQuestionData] = useState(() => {
    const saved = localStorage.getItem('interviewQuestionData')
    return saved ? JSON.parse(saved) : { current: 1, total: 6 }
  })

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('interviewScreen', screen)
    if (sessionId) localStorage.setItem('interviewSessionId', sessionId)
    if (config) localStorage.setItem('interviewConfig', JSON.stringify(config))
    if (firstMessage) localStorage.setItem('interviewFirstMessage', JSON.stringify(firstMessage))
    localStorage.setItem('interviewQuestionData', JSON.stringify(questionData))
  }, [screen, sessionId, config, firstMessage, questionData])

  async function handleStart({ role, level, stack, language }) {
    const id = uuidv4()
    const data = await startInterview({ session_id: id, role, level, stack, language })
    setSessionId(id)
    setConfig({ role, level, stack, language })
    setFirstMessage({ reply: data.reply, options: data.options || [] })
    setQuestionData({ current: data.question_number, total: data.total_questions })
    setScreen(SCREENS.INTERVIEW)
  }

  function handleFinish() {
    setScreen(SCREENS.REPORT)
  }

  function handleRestart() {
    setSessionId(null)
    setConfig(null)
    setFirstMessage(null)
    setQuestionData({ current: 1, total: 6 })
    setScreen(SCREENS.SETUP)
    localStorage.clear()
  }

  return (
    <div className="app">
      {screen === SCREENS.SETUP && (
        <Setup onStart={handleStart} />
      )}
      {screen === SCREENS.INTERVIEW && (
        <Interview
          sessionId={sessionId}
          initialMessage={firstMessage}
          config={config}
          questionNumber={questionData.current}
          totalQuestions={questionData.total}
          onFinish={handleFinish}
          onRestart={handleRestart}
        />
      )}
      {screen === SCREENS.REPORT && (
        <Report
          sessionId={sessionId}
          config={config}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}
