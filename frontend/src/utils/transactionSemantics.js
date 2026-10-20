export function isInternalAllocation(transaction) {
  const description = String(transaction?.description || '').trim().toLowerCase()
  return description.startsWith('salary allocation') || description.startsWith('reallocated to ')
}
