const CLAUDE_PROXY = '/claude-api'
const MODEL = 'claude-opus-4-6'

function getApiKey() {
  return localStorage.getItem('claudeApiKey') || ''
}

function buildHeaders(apiKey) {
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
  }
}

export async function generateSchedule(kidInfoText, kidProfile) {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('No Claude API key set. Go to Settings to add your key.')

  const profileContext = kidProfile
    ? `Kid's name: ${kidProfile.name}, Age: ${kidProfile.age}, Grade: ${kidProfile.grade}.
Activities: ${(kidProfile.activities || []).join(', ')}.
Habits: Wake at ${kidProfile.wakeTime || '7am'}, homework time: ${kidProfile.homeworkTime || 'after school'}, bed at ${kidProfile.bedTime || '9pm'}.
Special notes: ${kidProfile.adhdNotes || 'Has ADHD - needs short tasks, clear instructions, frequent breaks.'}`
    : 'Kid has ADHD - needs short tasks with clear instructions and frequent breaks.'

  const system = `You are a compassionate assistant helping parents of children with ADHD manage homework and daily tasks.
Create a structured weekly schedule based on the kid's information. Tasks must be short, specific, and achievable.
ADHD-friendly guidelines: break big tasks into 15-20 min chunks, include movement breaks, vary subjects, be specific about what to do.

Return ONLY valid JSON (no markdown, no explanation) in this exact format:
{
  "weekdayTasks": [
    {
      "text": "specific task description (keep under 8 words)",
      "subject": "math",
      "scheduledTime": "15:30",
      "timeEstimate": 20,
      "priority": "high",
      "notes": "one ADHD tip"
    }
  ],
  "weekendTasks": [
    {
      "text": "specific task description",
      "subject": "reading",
      "scheduledTime": "10:00",
      "timeEstimate": 15,
      "priority": "medium",
      "notes": "one ADHD tip"
    }
  ]
}

Subjects must be one of: math, reading, science, writing, art, music, exercise, other
Priority must be one of: high, medium, low
Include 4-6 weekday tasks and 2-4 weekend tasks.`

  const userMessage = `${profileContext}\n\nAdditional schedule/calendar info:\n${kidInfoText}`

  const response = await fetch(`${CLAUDE_PROXY}/v1/messages`, {
    method: 'POST',
    headers: buildHeaders(apiKey),
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  const text = data.content[0].text.trim()

  try {
    return JSON.parse(text)
  } catch {
    // Try to extract JSON from the response if it has surrounding text
    const match = text.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Could not parse AI response as JSON')
  }
}

export async function analyzeScreenshot(imageBase64, mimeType = 'image/jpeg') {
  const apiKey = getApiKey()
  if (!apiKey) throw new Error('No Claude API key set. Go to Settings to add your key.')

  const system = `Extract all schedule, homework, activity, and calendar information visible in this image.
Return a clear, structured text summary that a parent could use to create a homework schedule.
Include: subjects mentioned, due dates, activities, times if visible, any special events.`

  const response = await fetch(`${CLAUDE_PROXY}/v1/messages`, {
    method: 'POST',
    headers: buildHeaders(apiKey),
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: imageBase64 },
            },
            {
              type: 'text',
              text: "Please extract the schedule and homework information from this image.",
            },
          ],
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  return data.content[0].text
}
