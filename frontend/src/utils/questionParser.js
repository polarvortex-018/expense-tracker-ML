const normalize = (text) => String(text || '')
  .toLowerCase()
  .replace(/\bi['’]ve\b/g, 'i have')
  .replace(/\bi['’]m\b/g, 'i am')
  .replace(/\bi['’]d\b/g, 'i had')
  .replace(/\bi['’]ll\b/g, 'i will')
  .replace(/\bcan['’]t\b/g, 'cannot')
  .replace(/\bdon['’]t\b/g, 'do not')
  .replace(/[^a-z0-9/:-]+/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

export function classifyQuestion(text) {
  const value = normalize(text)
  if (!value) return 'unknown'
  if (/\bhow do i\b|\bhow can i\b|\bwhere do i\b|\bhow to\b/.test(value)) return 'help'
  if (/\b(spent|spend|expenses?|spending|cost)\b/.test(value) || /^how much(?: did i| have i| on| for)?\b/.test(value)) return 'finance'
  return 'unknown'
}

const localDate = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const shiftDays = (date, amount) => { const result = new Date(date.getFullYear(), date.getMonth(), date.getDate()); result.setDate(result.getDate() + amount); return result }
const monday = (date) => { const result = shiftDays(date, -(date.getDay() + 6) % 7); return result }
const validDate = (year, month, day) => {
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : null
}
const parseDate = (value) => {
  let match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (match) return validDate(+match[1], +match[2], +match[3])
  match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  return match ? validDate(+match[3], +match[2], +match[1]) : null
}

function dateRange(value, now) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let match = value.match(/\bpast (\d+) days?\b/)
  if (match) {
    const n = Number(match[1])
    if (n < 1) return { error: 'Please specify at least one day.' }
    return { startDate: localDate(shiftDays(today, 1 - n)), endDate: localDate(today), label: `past ${n} ${n === 1 ? 'day' : 'days'}`, phrase: match[0] }
  }
  if (/\blast week\b/.test(value)) {
    const start = shiftDays(monday(today), -7)
    return { startDate: localDate(start), endDate: localDate(shiftDays(start, 6)), label: 'last week', phrase: 'last week' }
  }
  if (/\bthis week\b/.test(value)) return { startDate: localDate(monday(today)), endDate: localDate(today), label: 'this week', phrase: 'this week' }
  if (/\blast month\b/.test(value)) {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1)
    return { startDate: localDate(start), endDate: localDate(new Date(today.getFullYear(), today.getMonth(), 0)), label: 'last month', phrase: 'last month' }
  }
  if (/\bthis month\b/.test(value)) return { startDate: localDate(new Date(today.getFullYear(), today.getMonth(), 1)), endDate: localDate(today), label: 'this month', phrase: 'this month' }

  const dateToken = '(\\d{4}-\\d{2}-\\d{2}|\\d{2}\\/\\d{2}\\/\\d{4})'
  const between = new RegExp(`\\bbetween ${dateToken} and ${dateToken}\\b`).exec(value)
  const explicit = between || new RegExp(`(?:\\bfrom )?${dateToken}(?: (?:to|through|until|-) ${dateToken})?`).exec(value)
  if (!explicit) return null
  const start = parseDate(explicit[1]); const end = explicit[2] ? parseDate(explicit[2]) : start
  if (!start || !end) return { error: 'That date is invalid. Please use YYYY-MM-DD or DD/MM/YYYY.' }
  if (end < start) return { error: 'The end date comes before the start date. Please clarify the date range.' }
  return { startDate: localDate(start), endDate: localDate(end), label: explicit[2] ? `${localDate(start)} to ${localDate(end)}` : localDate(start), phrase: explicit[0] }
}

export function parseFinanceQuestion(text, categories = [], now = new Date()) {
  const value = normalize(text)
  if (!value) return { status: 'clarify', message: 'Please enter an expense question.' }
  if (!/\b(spent|spend|expenses?|spending|cost)\b/.test(value) && !/^how much(?: did i| have i| on| for)?\b/.test(value)) return { status: 'unsupported', message: 'I can answer questions about expense totals. Try asking how much you spent.' }

  const range = dateRange(value, now)
  if (range?.error) return { status: 'clarify', message: range.error }
  let residual = value
    .replace(/\bhow much\b|\bhave i\b|\bhave\b|\bhad\b|\bwould\b|\bwill\b|\bdid i\b|\bi\b|\bspent\b|\bspend\b|\bexpenses?\b|\bspending\b|\bcost\b|\bshow\b|\btell\b|\bwhat\b|\bme\b|\bby category\b/g, ' ')
  if (range) residual = residual.replace(range.phrase, ' ')
  residual = residual.replace(/\b(on|for|during|between|from|to|through|until|in)\b/g, ' ')
  const pieces = residual.split(/\band\b|\bwith\b|,/).map((part) => part.trim()).filter(Boolean)
  const items = []
  for (const piece of pieces) {
    const term = piece.replace(/\b(my|the|a|an|all|total)\b/g, '').trim()
    if (!term) continue
    const category = categories.find((item) => normalize(item.name) === term)
    items.push(category ? { kind: 'category', id: String(category.id), name: category.name } : { kind: 'description', text: term })
  }
  return { status: 'ok', spec: { intent: 'expense_total', startDate: range?.startDate ?? null, endDate: range?.endDate ?? null, dateLabel: range?.label ?? 'all time', items } }
}
