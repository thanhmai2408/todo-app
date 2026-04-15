import { supabase } from './supabase'

// ── Field mapping ────────────────────────────────────────────
// DB uses snake_case; app uses camelCase.

function toApp(row) {
  return {
    id:            row.id,
    text:          row.text,
    subject:       row.subject,
    scheduledTime: row.scheduled_time  ?? '',
    timeEstimate:  row.time_estimate   ?? null,
    priority:      row.priority,
    date:          row.date,
    completed:     row.completed,
    momHelped:     row.mom_helped,
    aiGenerated:   row.ai_generated,
    notes:         row.notes           ?? '',
    dayType:       row.day_type        ?? '',
  }
}

function toDB(data) {
  const row = {}
  if (data.text          !== undefined) row.text           = data.text
  if (data.subject       !== undefined) row.subject        = data.subject
  if (data.scheduledTime !== undefined) row.scheduled_time = data.scheduledTime || null
  if (data.timeEstimate  !== undefined) row.time_estimate  = data.timeEstimate  || null
  if (data.priority      !== undefined) row.priority       = data.priority
  if (data.date          !== undefined) row.date           = data.date
  if (data.completed     !== undefined) row.completed      = data.completed
  if (data.momHelped     !== undefined) row.mom_helped     = data.momHelped
  if (data.aiGenerated   !== undefined) row.ai_generated   = data.aiGenerated
  if (data.notes         !== undefined) row.notes          = data.notes
  if (data.dayType       !== undefined) row.day_type       = data.dayType
  return row
}

// ── CRUD ─────────────────────────────────────────────────────

export async function fetchTodos() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data.map(toApp)
}

export async function createTodo(todo) {
  const { data, error } = await supabase
    .from('todos')
    .insert(toDB(todo))
    .select()
    .single()
  if (error) throw error
  return toApp(data)
}

export async function createTodos(todos) {
  const { data, error } = await supabase
    .from('todos')
    .insert(todos.map(toDB))
    .select()
  if (error) throw error
  return data.map(toApp)
}

export async function updateTodo(id, changes) {
  const { data, error } = await supabase
    .from('todos')
    .update(toDB(changes))
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return toApp(data)
}

export async function deleteTodo(id) {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
  if (error) throw error
}
