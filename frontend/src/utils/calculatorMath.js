const roundMoney = (value) => Math.round((value + Number.EPSILON) * 100) / 100

export function evaluateTerms(terms) {
  if (!Array.isArray(terms) || terms.length === 0) throw new Error('Enter an amount first.')

  const values = []
  const operators = []
  for (let index = 0; index < terms.length; index += 1) {
    const raw = String(terms[index]?.value ?? '').trim()
    if (!raw || raw === '-' || !Number.isFinite(Number(raw))) throw new Error('Finish entering the amount.')
    values.push(Number(raw))
    if (index < terms.length - 1) {
      const operator = terms[index]?.operator
      if (!['+', '-', '*', '/'].includes(operator)) throw new Error('Choose an operator between amounts.')
      operators.push(operator)
    }
  }

  const reducedValues = [values[0]]
  const reducedOperators = []
  for (let index = 0; index < operators.length; index += 1) {
    const operator = operators[index]
    const next = values[index + 1]
    if (operator === '*') reducedValues[reducedValues.length - 1] *= next
    else if (operator === '/') {
      if (next === 0) throw new Error('Cannot divide by zero.')
      reducedValues[reducedValues.length - 1] /= next
    } else {
      reducedOperators.push(operator)
      reducedValues.push(next)
    }
  }

  let result = reducedValues[0]
  for (let index = 0; index < reducedOperators.length; index += 1) {
    result = reducedOperators[index] === '+' ? result + reducedValues[index + 1] : result - reducedValues[index + 1]
  }
  if (!Number.isFinite(result)) throw new Error('That calculation is too large to display.')
  return roundMoney(result)
}

export function formatTerms(terms) {
  return (terms || []).map((term) => `${term.value || '0'}${term.operator ? ` ${term.operator === '*' ? '×' : term.operator === '/' ? '÷' : term.operator} ` : ''}`).join('').trim()
}

export function formatCalculatorAmount(value) {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return roundMoney(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
