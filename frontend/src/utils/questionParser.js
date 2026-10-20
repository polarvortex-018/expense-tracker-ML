const normalize = (text) => String(text || '')
  .replace(/(\d)\.(?=\d)/g, '$1decimalpoint')
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
  if (/\bhow many (?:times?|transactions?|expenses?|payments?)\b|\b(?:number|count) of (?:times?|transactions?|expenses?|payments?)\b/.test(value)
    && /\b(spent?|spendings?|expense|purchase|paid?|payment|transaction)\b/.test(value)) return 'finance'
  const asksForData = /\b(give me|show|list|get|pull up)\b/.test(value) && /\b(data|transactions?|records?|expenses?|spending)\b/.test(value)
  if (/\b(spent|spend|expenses?|spending|cost|income|salary|earned|earn|made|make|received|receive|got|sent|send|transferred|transfer|compare|comparison|versus|vs|average|avg|frequent|frequency|often|recurring|repeat|regular|changed|change|trend|trends|budget|target|merchant|most|least|highest|lowest|top|biggest|smallest|ranking)\b/.test(value) || /^how much(?: did i| have i| on| for)?\b/.test(value) || asksForData) return 'finance'
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

const unsupportedFinanceShape = /\b(?:where|which|rank|ranking)\b|\b(?:most|least|highest|lowest|top|biggest|smallest)\b|\b(?:more|less)\s+than\b/

function analyticsIntent(value) {
  if (/\b(recurring|repeat(?:ing)?|regular(?:ly)?)\b/.test(value)) return { intent: 'recurring', groupBy: 'description' }
  if (/\bhow many (?:times?|transactions?|expenses?|payments?)\b|\b(?:number|count) of (?:times?|transactions?|expenses?|payments?)\b/.test(value)) {
    return { intent: 'frequency', groupBy: /\b(bucket|savings)\b/.test(value) ? 'bucket' : /\baccount\b/.test(value) ? 'account' : /\b(merchant|description|store|shop)\b/.test(value) ? 'description' : 'category' }
  }
  const asksDailyAllowance = /\b(per day|each day|a day|daily)\b/.test(value)
  const asksForMonthEndAllowance = /\b(till|until|through|by)\b.*\b(end of (?:the |this )?month|month end)\b/.test(value) || /\bfor the rest of (?:this )?month\b/.test(value)
  if ((asksDailyAllowance || asksForMonthEndAllowance) && /\b(budget|spend|spending)\b/.test(value)) return { intent: 'daily_budget', groupBy: 'bucket' }
  if (/\b(last|recent|latest)\b.*\b\d+(?:decimalpoint\d+)?(?:\s\d{3})*\s*(?:k|thousand|lakhs?|lacs?)?\b/.test(value) || /\bwhere did i spend\b.*\b\d+(?:decimalpoint\d+)?(?:\s\d{3})*\s*(?:k|thousand|lakhs?|lacs?)?\b/.test(value)) {
    const amount = value.match(/(\d+(?:decimalpoint\d+)?(?:\s\d{3})*)\s*(k|thousand|lakhs?|lacs?)?\b/)
    if (amount) {
      const multiplier = /^k$/.test(amount[2] || '') ? 1000 : /^(lakh|lakhs|lac|lacs)$/.test(amount[2] || '') ? 100000 : /^(thousand)$/.test(amount[2] || '') ? 1000 : 1
      return { intent: 'recent_amount', amount: Number(amount[1].replace(/[\s,]/g, '').replace('decimalpoint', '.')) * multiplier }
    }
  }
  if (/\b(budget|target)\b/.test(value) && /\b(left|remaining|remain|have)\b/.test(value)) return { intent: 'target_remaining', groupBy: 'bucket' }
  if (/\b(average|avg)\b/.test(value)) return { intent: 'average', groupBy: /\bweek(?:ly)?\b/.test(value) ? 'week' : 'month' }
  if (/\b(frequent|frequency|often|recurring)\b/.test(value)) return { intent: 'frequency', groupBy: /\b(merchant|description|store|shop)\b/.test(value) ? 'description' : 'category' }
  if (/\b(changed|change|trend|trends|versus|vs|compare|comparison)\b/.test(value)) return { intent: 'trend', groupBy: 'period' }
  if (/\b(most|least|highest|lowest|top|biggest|smallest|where|which)\b/.test(value)) {
    const groupBy = /\b(month|monthly)\b/.test(value) ? 'month'
      : /\b(week|weekly)\b/.test(value) ? 'week'
        : /\b(day|daily|date)\b/.test(value) ? 'day'
          : /\b(account)\b/.test(value) ? 'account'
            : /\b(bucket|savings)\b/.test(value) ? 'bucket'
              : /\b(merchant|description|store|shop|place)\b/.test(value) ? 'description'
                : /\b(category|categories)\b/.test(value) ? 'category' : 'category'
    const ordinal = value.match(/\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|\d+(?:st|nd|rd|th))\b/)
    const ordinalWords = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10 }
    const rankPosition = ordinal ? ordinalWords[ordinal[1]] || Number.parseInt(ordinal[1], 10) : 1
    return { intent: 'rank', groupBy, direction: /\b(least|lowest|smallest)\b/.test(value) ? 'asc' : 'desc', rankPosition }
  }
  if (/\bby (?:category|categories|account|bucket|merchant|description|day|week|month)\b/.test(value)) {
    const groupBy = /\bmonth\b/.test(value) ? 'month' : /\bweek\b/.test(value) ? 'week' : /\bday\b/.test(value) ? 'day'
      : /\baccount\b/.test(value) ? 'account' : /\bbucket\b/.test(value) ? 'bucket'
        : /\b(merchant|description)\b/.test(value) ? 'description' : 'category'
    return { intent: 'breakdown', groupBy }
  }
  return { intent: 'total', groupBy: null }
}

function parsedItems(residual, categories) {
  const term = residual.replace(/\b(my|the|a|an|all|total)\b/g, '').trim()
  if (!term) return []

  const categoryTerms = categories
    .map((category) => ({ category, name: normalize(category.name) }))
    .filter((entry) => entry.name)
    .sort((left, right) => right.name.length - left.name.length)
  const protectedCategories = new Map()
  let protectedResidual = term
  for (const { category, name } of categoryTerms) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
    const pattern = new RegExp(`(^|\\s)${escaped}(?=\\s|$)`, 'g')
    protectedResidual = protectedResidual.replace(pattern, (match, prefix) => {
      const marker = `categorymarker${protectedCategories.size}token`
      protectedCategories.set(marker, category)
      return `${prefix}${marker}`
    })
  }

  return protectedResidual.split(/\band\b|\bwith\b|,/).map((part) => part.trim()).filter(Boolean).map((part) => {
    if (protectedCategories.has(part)) {
      const category = protectedCategories.get(part)
      return { kind: 'category', id: String(category.id), name: category.name }
    }
    const item = part.replace(/\b(my|the|a|an|all|total)\b/g, '').trim()
    const match = categories.find((category) => normalize(category.name) === item)
    return match ? { kind: 'category', id: String(match.id), name: match.name } : { kind: 'description', text: item }
  }).filter((item) => item.kind === 'category' || item.text)
}

function editDistance(left, right) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)
  for (let row = 1; row <= left.length; row += 1) {
    let diagonal = previous[0]
    previous[0] = row
    for (let column = 1; column <= right.length; column += 1) {
      const above = previous[column]
      previous[column] = Math.min(previous[column] + 1, previous[column - 1] + 1, diagonal + (left[row - 1] === right[column - 1] ? 0 : 1))
      diagonal = above
    }
  }
  return previous[right.length]
}

function correctEntityTypos(residual, categories, accounts, buckets) {
  const entities = [
    ...accounts.map((item) => ({ kind: 'account', name: normalize(item.name) })),
    ...buckets.map((item) => ({ kind: 'bucket', name: normalize(item.name) })),
    ...categories.map((item) => ({ kind: 'category', name: normalize(item.name) }))
  ].filter((item) => item.name)
  const tokens = [...residual.matchAll(/\S+/g)].map((match) => ({ text: match[0], start: match.index, end: match.index + match[0].length }))
  const ignored = new Set(['on', 'in', 'from', 'using', 'via', 'into', 'toward', 'towards', 'for', 'during', 'between', 'and', 'with', 'the', 'my', 'a', 'an'])
  const matches = new Map()

  for (const entity of entities) {
    const nameParts = entity.name.split(' ')
    for (let start = 0; start + nameParts.length <= tokens.length; start += 1) {
      const phrase = tokens.slice(start, start + nameParts.length)
      if (phrase.some((token) => ignored.has(token.text))) continue
      const typed = phrase.map((token) => token.text).join(' ')
      if (typed === entity.name) continue
      if (nameParts.length === 1 ? typed.length < 5 : typed.replace(/\s/g, '').length < 8) continue
      const compactTyped = typed.replace(/\s/g, '')
      const compactName = entity.name.replace(/\s/g, '')
      const mismatches = [...compactTyped].map((character, index) => character === compactName[index] ? -1 : index).filter((index) => index >= 0)
      const transposed = compactTyped.length === compactName.length && mismatches.length === 2 && mismatches[1] === mismatches[0] + 1
        && compactTyped[mismatches[0]] === compactName[mismatches[1]] && compactTyped[mismatches[1]] === compactName[mismatches[0]]
      const distance = transposed ? 1 : editDistance(compactTyped, compactName)
      const maxDistance = entity.name.replace(/\s/g, '').length >= 10 ? 2 : 1
      if (distance < 1 || distance > maxDistance || distance / entity.name.replace(/\s/g, '').length > 0.22) continue
      const key = `${phrase[0].start}:${phrase.at(-1).end}`
      const options = matches.get(key) || { start: phrase[0].start, end: phrase.at(-1).end, typed, candidates: [] }
      const candidate = options.candidates.find((item) => item.name === entity.name && item.kind === entity.kind)
      const score = distance / entity.name.replace(/\s/g, '').length
      if (!candidate || score < candidate.score) {
        if (candidate) Object.assign(candidate, { distance, score })
        else options.candidates.push({ ...entity, distance, score })
      }
      matches.set(key, options)
    }
  }

  const replacements = []
  for (const match of [...matches.values()].sort((a, b) => a.start - b.start || a.end - b.end)) {
    if (replacements.some((item) => item.start < match.end && item.end > match.start)) continue
    const bestScore = Math.min(...match.candidates.map((candidate) => candidate.score))
    const best = match.candidates.filter((candidate) => candidate.score - bestScore <= 0.06)
    const distinctNames = [...new Set(best.map((candidate) => candidate.name))]
    if (distinctNames.length > 1) {
      const options = [...new Map(best.map((candidate) => [`${candidate.kind}:${candidate.name}`, candidate])).values()]
      const labels = options.map((candidate) => `${candidate.name} (${candidate.kind})`)
      return { error: `“${match.typed}” could mean ${labels.slice(0, 3).join(' or ')}. Please use the full name, and say “on” for a category, “in” for a bucket, or “from” for an account.` }
    }
    replacements.push({ start: match.start, end: match.end, name: distinctNames[0] })
  }

  let corrected = residual
  for (const replacement of replacements.reverse()) corrected = `${corrected.slice(0, replacement.start)}${replacement.name}${corrected.slice(replacement.end)}`
  return { residual: corrected }
}

function extractDimensionFilters(residual, categories, accounts, buckets) {
  const normalizeName = (value) => normalize(value).replace(/\s+/g, ' ')
  const entities = [
    ...accounts.map((item) => ({ kind: 'account', id: String(item.id), name: normalizeName(item.name) })),
    ...buckets.map((item) => ({ kind: 'bucket', id: String(item.id), name: normalizeName(item.name) })),
    ...categories.map((item) => ({ kind: 'category', id: String(item.id), name: normalizeName(item.name) }))
  ].filter((item) => item.name).sort((a, b) => b.name.length - a.name.length)
  const mentions = []
  for (const entity of entities) {
    const escaped = entity.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
    const pattern = new RegExp(`(^|\\s)${escaped}(?=\\s|$)`, 'g')
    for (const match of residual.matchAll(pattern)) {
      const start = match.index + match[1].length
      const end = start + entity.name.length
      const prefix = residual.slice(0, start).trim().split(/\s+/).at(-1)
      const suffix = residual.slice(end).trim().split(/\s+/)[0]
      const nameConflictsAcrossKinds = entities.some((other) => other.name === entity.name && other.kind !== entity.kind)
      const bucketIsInQualifiedList = entity.kind === 'bucket' && /\b(?:in|into|to|from|using|via)\b[^,]*\band\s*$/.test(residual.slice(0, start))
      if (entity.kind === 'bucket' && !['in', 'into', 'to', 'from', 'toward', 'towards', 'using', 'via', 'of'].includes(prefix) && !['bucket', 'savings'].includes(suffix) && !bucketIsInQualifiedList && !nameConflictsAcrossKinds) continue
      if (entity.kind === 'account' && !['from', 'using', 'via'].includes(prefix) && suffix !== 'account' && !nameConflictsAcrossKinds) continue
      if (mentions.some((mention) => mention.start <= start && mention.end >= end && mention.entity.name.length > entity.name.length)) continue
      mentions.push({ entity, start, end })
    }
  }

  const accountIds = new Set()
  const bucketIds = new Set()
  const remove = []
  const byPosition = new Map()
  for (const mention of mentions) {
    const key = `${mention.start}:${mention.end}`
    const matches = byPosition.get(key) || []
    matches.push(mention)
    byPosition.set(key, matches)
  }

  for (const matches of byPosition.values()) {
    const kinds = new Set(matches.map(({ entity }) => entity.kind))
    if (kinds.has('account') && kinds.has('bucket') || kinds.has('category') && (kinds.has('account') || kinds.has('bucket'))) {
      const start = matches[0].start
      const prefix = residual.slice(0, start).trim().split(/\s+/).at(-1)
      const suffix = residual.slice(matches[0].end).trim().split(/\s+/)[0]
      const preferredKind = suffix === 'category' ? 'category' : suffix === 'account' ? 'account' : ['bucket', 'savings'].includes(suffix) ? 'bucket'
        : ['from', 'using', 'via'].includes(prefix) ? 'account'
        : ['in', 'into', 'to', 'toward', 'towards', 'of'].includes(prefix) ? 'bucket'
          : prefix === 'in' ? 'bucket' : prefix === 'on' ? 'category' : null
      if (!preferredKind || !kinds.has(preferredKind)) {
        const name = matches[0].entity.name
        return { error: `“${name}” could mean a category, account, or savings bucket. Please say “on ${name}” for a category, “from ${name}” for an account, or “in ${name}” for a bucket.` }
      }
      if (preferredKind === 'category') continue
      const selected = matches.find(({ entity }) => entity.kind === preferredKind)
      if (preferredKind === 'account') accountIds.add(selected.entity.id)
      else bucketIds.add(selected.entity.id)
      remove.push([selected.start, selected.end])
      continue
    }

    for (const { entity, start, end } of matches) {
      if (entity.kind === 'account') { accountIds.add(entity.id); remove.push([start, end]) }
      if (entity.kind === 'bucket') { bucketIds.add(entity.id); remove.push([start, end]) }
    }
  }

  const chars = [...residual]
  for (const [start, end] of remove) for (let index = start; index < end; index += 1) chars[index] = ' '
  return { accountIds: [...accountIds], bucketIds: [...bucketIds], residual: chars.join('').replace(/\s+/g, ' ').trim() }
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

  const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']
  const monthPattern = new RegExp(`\\b(${monthNames.join('|')})\\b(?:\\s+(\\d{4}))?`, 'gi')
  const monthMatches = [...value.matchAll(monthPattern)]
  if (monthMatches.length) {
    const ranges = monthMatches.map((entry) => {
      const month = monthNames.indexOf(entry[1].toLowerCase())
      const year = entry[2] ? Number(entry[2]) : now.getFullYear() - (month > now.getMonth() ? 1 : 0)
      return {
        startDate: localDate(new Date(year, month, 1)),
        endDate: localDate(new Date(year, month + 1, 0)),
        label: `${entry[1][0].toUpperCase()}${entry[1].slice(1)} ${year}`
      }
    }).filter((range, index, all) => all.findIndex((candidate) => candidate.startDate === range.startDate) === index)
    const first = monthMatches[0]
    const last = monthMatches[monthMatches.length - 1]
    return {
      ranges,
      label: ranges.map((range) => range.label).join(' and '),
      phrase: value.slice(first.index, last.index + last[0].length)
    }
  }

  const dateToken = '(\\d{4}-\\d{2}-\\d{2}|\\d{2}\\/\\d{2}\\/\\d{4})'
  const between = new RegExp(`\\bbetween ${dateToken} and ${dateToken}\\b`).exec(value)
  const explicit = between || new RegExp(`(?:\\bfrom )?${dateToken}(?: (?:to|through|until|-) ${dateToken})?`).exec(value)
  if (!explicit) return null
  const start = parseDate(explicit[1]); const end = explicit[2] ? parseDate(explicit[2]) : start
  if (!start || !end) return { error: 'That date is invalid. Please use YYYY-MM-DD or DD/MM/YYYY.' }
  if (end < start) return { error: 'The end date comes before the start date. Please clarify the date range.' }
  return { startDate: localDate(start), endDate: localDate(end), label: explicit[2] ? `${localDate(start)} to ${localDate(end)}` : localDate(start), phrase: explicit[0] }
}

export function parseFinanceQuestion(text, categories = [], now = new Date(), dimensions = {}) {
  const value = normalize(text)
  const analytics = analyticsIntent(value)
  if (!value) return { status: 'clarify', message: 'Please enter an expense question.' }
  const asksForData = /\b(give me|show|list|get|pull up)\b/.test(value) && /\b(data|transactions?|records?|expenses?|spending)\b/.test(value)
  const asksForCount = /\bhow many (?:times?|transactions?|expenses?|payments?)\b|\b(?:number|count) of (?:times?|transactions?|expenses?|payments?)\b/.test(value)
  if (!/\b(spent|spend|spendings?|expenses?|spending|cost|income|salary|earned|earn|made|make|received|receive|got|sent|send|transferred|transfer|deposit|deposited|compare|comparison|versus|vs|average|avg|frequent|frequency|often|recurring|repeat|regular|changed|change|trend|trends|budget|target|merchant|most|least|highest|lowest|top|biggest|smallest|ranking)\b/.test(value) && !/^how much(?: did i| have i| on| for)?\b/.test(value) && !asksForData && !asksForCount) return { status: 'unsupported', message: 'I can answer questions about spending totals, rankings, trends, averages, recurring patterns, and savings targets.' }
  if (unsupportedFinanceShape.test(value) && analytics.intent === 'total') return { status: 'unsupported', message: 'I can answer expense totals, rankings, trends, averages, and frequency questions. Try asking which category cost the most.' }

  const range = dateRange(value, now)
  if (range?.error) return { status: 'clarify', message: range.error }
  const flow = /\b(received|receive|earned|earn|made|make|got|income|salary|deposited|deposit|came in)\b/.test(value)
    ? 'income'
    : /\b(sent|send|paid|pay|transferred|transfer)\b/.test(value) ? 'outgoing' : 'expense'
  let residual = range?.phrase ? value.replace(range.phrase, ' ') : value
  const corrected = correctEntityTypos(residual, categories, dimensions.accounts || [], dimensions.buckets || [])
  if (corrected.error) return { status: 'clarify', message: corrected.error }
  const filters = extractDimensionFilters(corrected.residual, categories, dimensions.accounts || [], dimensions.buckets || [])
  if (filters.error) return { status: 'clarify', message: filters.error }
  residual = filters.residual

  const protectedCategories = new Map()
  for (const category of [...categories].sort((left, right) => normalize(right.name).length - normalize(left.name).length)) {
    const name = normalize(category.name)
    if (!name) continue
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')
    const pattern = new RegExp(`(^|\\s)${escaped}(?=\\s|$)`, 'g')
    residual = residual.replace(pattern, (match, prefix) => {
      const marker = `categoryphrase${protectedCategories.size}token`
      protectedCategories.set(marker, name)
      return `${prefix}${marker}`
    })
  }
  residual = residual
    .replace(/\bhow much\b|\bhow many\b|\bhow\b|\bmany\b|\btimes?\b|\boccasions?\b|\bnumber\b|\bcount\b|\bhas\b|\bi\b|\bmy\b|\bwe\b|\bour\b|\byour\b|\bthe\b|\ba\b|\ban\b|\bthis\b|\bthat\b|\bwas\b|\bwere\b|\bis\b|\bare\b|\bhave\b|\bhad\b|\bwould\b|\bwill\b|\bcould\b|\bshould\b|\bcan\b|\bmight\b|\bbe\b|\bdo\b|\bdid\b|\bdoes\b|\bspent\b|\bspendings?\b|\bspend\b|\bexpenses?\b|\bspending\b|\bcost\b|\bincome\b|\bsalary\b|\bearned\b|\bearn\b|\bmade\b|\bmake\b|\bgot\b|\bget\b|\breceived\b|\breceive\b|\bsent\b|\bsend\b|\bpaid\b|\bpay\b|\btransferred\b|\btransfer\b|\bdeposited\b|\bdeposit\b|\bcame in\b|\bcompare\b|\bcomparison\b|\bversus\b|\bvs\b|\bmoney\b|\bshow\b|\btell\b|\bgive\b|\bdata\b|\binformation\b|\brecords?\b|\btransactions?\b|\bwhat\b|\bme\b|\bby category\b|\bwhich\b|\bmost\b|\bleast\b|\bhighest\b|\blowest\b|\btop\b|\bbiggest\b|\bsmallest\b|\bwhere\b|\baverage\b|\bavg\b|\bfrequent\b|\bfrequency\b|\boften\b|\brecurring\b|\brepeat(?:ing)?\b|\bregular(?:ly)?\b|\bchanged\b|\bchange\b|\btrend\b|\btrends\b|\bmerchant\b|\bdescription\b|\bstore\b|\bshop\b|\bplace\b|\bcategory\b|\bcategories\b|\baccount\b|\bbucket\b|\bby\b|\bper\b|\bleft\b|\bremaining\b|\bremain\b|\blast\b|\brecent\b|\blatest\b|\bof\b|\bat\b|\bin\b|\bon\b|\bfrom\b|\bto\b|\busing\b|\bvia\b|\bfor\b|\bduring\b|\bbetween\b|\bthrough\b|\buntil\b|\btill\b|\bend\b|\brest\b|\bfirst\b|\bsecond\b|\bthird\b|\bfourth\b|\bfifth\b|\bsixth\b|\bseventh\b|\beighth\b|\bninth\b|\btenth\b|\b\d+(?:st|nd|rd|th)\b|\brs\.?\b|\brupees?\b|\binr\b/g, ' ')
  if (['average', 'daily_budget', 'target_remaining'].includes(analytics.intent)) {
    residual = residual.replace(/\b(month|monthly|week|weekly|day|daily|budget|target|left|remaining|remain|till|until|through|end|rest|each|per)\b/g, ' ')
  }
  if (analytics.intent === 'rank' && ['month', 'week', 'day'].includes(analytics.groupBy)) {
    residual = residual.replace(/\bmonths?|monthly|weeks?|weekly|days?|daily|date\b/g, ' ')
  }
  for (const [marker, name] of protectedCategories) residual = residual.replace(new RegExp(`\\b${marker}\\b`, 'g'), name)
  if (analytics.intent === 'recent_amount') residual = residual.replace(/(?:rs\.?|inr|₹)?\s*\d+(?:decimalpoint\d+)?(?:\s\d{3})*\s*(?:k|thousand|lakhs?|lacs?)?/g, ' ')
  residual = residual.replace(/\b(on|into|toward|towards|account|bucket|category)\b/g, ' ').replace(/\s+/g, ' ').trim()
  const items = parsedItems(residual, categories)
  if (analytics.intent === 'frequency') {
    analytics.groupBy = filters.bucketIds.length ? 'bucket'
      : filters.accountIds.length ? 'account'
        : items.some((item) => item.kind === 'description') ? 'description'
          : items.some((item) => item.kind === 'category') ? 'category' : analytics.groupBy
  }
  const dateRanges = range?.ranges || (range?.startDate ? [{ startDate: range.startDate, endDate: range.endDate }] : [])
  if (/\b(compare|comparison|versus|vs)\b/.test(value) && dateRanges.length < 2) return { status: 'clarify', message: 'Please name at least two months or date ranges to compare.' }
  return { status: 'ok', spec: { intent: analytics.intent === 'total' ? `${flow}_total` : analytics.intent, flow, groupBy: analytics.groupBy, direction: analytics.direction || 'desc', rankPosition: analytics.rankPosition || 1, amount: analytics.amount || null, startDate: range?.startDate ?? null, endDate: range?.endDate ?? null, dateRanges, dateLabel: range?.label ?? 'all time', items, accountIds: filters.accountIds, bucketIds: filters.bucketIds } }
}
