const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function startInterview({ session_id, role, level, stack, language }) {
  const res = await fetch(`${BASE_URL}/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, role, level, stack, language })
  })
  if (!res.ok) throw new Error('Failed to start interview')
  return res.json()
}

export async function sendMessage({ session_id, message }) {
  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id, message })
  })
  if (res.status === 404) throw new Error('404_SESSION_NOT_FOUND')
  if (!res.ok) throw new Error('Failed to send message')
  return res.json()
}

export async function getReport(session_id) {
  const res = await fetch(`${BASE_URL}/report/${session_id}`)
  if (!res.ok) throw new Error('Failed to get report')
  return res.json()
}

export async function transcribeAudio(blob) {
  const formData = new FormData()
  formData.append('file', blob, 'audio.webm')
  const res = await fetch(`${BASE_URL}/transcribe`, {
    method: 'POST',
    body: formData
  })
  if (!res.ok) throw new Error('Transcription failed')
  return res.json()
}

export async function deleteSession(session_id) {
  await fetch(`${BASE_URL}/session/${session_id}`, { method: 'DELETE' })
}
