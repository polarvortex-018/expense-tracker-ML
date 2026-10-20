import { api } from './api.js'
import { classifyQuestion, parseFinanceQuestion } from '../utils/questionParser.js'
import { searchHelp } from '../utils/helpSearch.js'

const round = (value) => Math.round((Number(value) || 0) * 100) / 100
const normalize = (value) => String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const itemId = (item) => item.kind === 'category' ? `category:${item.id}` : `description:${normalize(item.text)}`

function requestedGroups(rows, items) {
  const groups = items.map((item) => ({
    id: itemId(item),
    name: item.kind === 'category' ? item.name : item.text,
    color: item.kind === 'category' ? rows.find((row) => String(row.category_id) === String(item.id))?.category_color || '#9e9cae' : '#9e9cae',
    total: 0,
    count: 0
  }))
  let overlap = false

  for (const row of rows) {
    const description = normalize(row.description)
    const matches = items.filter((item) => item.kind === 'category'
      ? String(row.category_id) === String(item.id)
      : description.includes(normalize(item.text)))
    if (matches.length > 1) overlap = true
    for (const item of matches) {
      const group = groups.find((candidate) => candidate.id === itemId(item))
      group.total += Number(row.amount) || 0
      group.count += 1
    }
  }
  return { groups: overlap ? [] : groups.filter((group) => group.count).map((group) => ({ ...group, total: round(group.total) })), overlap }
}

function aggregate(rows, spec) {
  const uniqueRows = [...new Map(rows.map((row) => [String(row.id), row])).values()]
  const daily = new Map()
  const broadGroups = new Map()
  let total = 0

  for (const row of uniqueRows) {
    const amount = Number(row.amount) || 0
    total += amount
    daily.set(row.date, (daily.get(row.date) || 0) + amount)
    if (!spec.items.length) {
      const id = row.category_id ? String(row.category_id) : 'uncategorized'
      const group = broadGroups.get(id) || { id, name: row.category_name || 'Uncategorized', color: row.category_color || '#9e9cae', total: 0, count: 0 }
      group.total += amount
      group.count += 1
      broadGroups.set(id, group)
    }
  }

  const requested = spec.items.length ? requestedGroups(uniqueRows, spec.items) : { groups: [], overlap: false }
  return {
    total: round(total),
    transactionCount: uniqueRows.length,
    firstDate: uniqueRows[0]?.date || null,
    lastDate: uniqueRows.at(-1)?.date || null,
    activeDayCount: daily.size,
    dailyTotals: [...daily].map(([date, amount]) => ({ date, total: round(amount) })),
    groups: spec.items.length
      ? requested.groups
      : [...broadGroups.values()].map((group) => ({ ...group, total: round(group.total) })),
    groupMode: spec.items.length ? 'requested' : 'category',
    overlap: requested.overlap
  }
}

const unsupported = (question) => ({
  kind: 'unsupported',
  question,
  message: 'I can help with expense totals or Cash Buddy guides. Try “How much did I spend on petrol?” or “How do I create another vault?”'
})

export async function answerQuestion({ question, categories, now = new Date() }) {
  const kind = classifyQuestion(question)
  const help = kind === 'finance' ? null : searchHelp(question)
  if (kind === 'help' || help) {
    if (!help) return unsupported(question)
    return { kind: 'help', question, title: help.title, answer: help.answer, destination: help.destination }
  }
  if (kind !== 'finance') return unsupported(question)

  const parsed = parseFinanceQuestion(question, categories, now)
  if (parsed.status !== 'ok') return { kind: parsed.status, question, message: parsed.message }
  const rows = await api.getExpenseQuestionTransactions(parsed.spec)
  return { kind: 'finance', question, dateLabel: parsed.spec.dateLabel, ...aggregate(rows, parsed.spec) }
}
