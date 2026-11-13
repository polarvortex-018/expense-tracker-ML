export function isInternalAllocation(transaction) {
  const description = String(transaction?.description || '').trim().toLowerCase()
  return description.startsWith('salary allocation') || description.startsWith('reallocated to ')
}

export function isSalaryAllocation(transaction) {
  const type = transaction?.transaction_type
  const description = String(transaction?.description || '').trim().toLowerCase()
  return (type === 'transfer' || type === 'income') && description.startsWith('salary allocation')
}
