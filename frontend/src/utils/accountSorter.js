export function getSavedAccountOrder() {
  try {
    const raw = localStorage.getItem('cashbuddy_accounts_order');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveAccountOrder(orderIds) {
  localStorage.setItem('cashbuddy_accounts_order', JSON.stringify(orderIds));
  window.dispatchEvent(new CustomEvent('cashbuddy-settings-updated'));
}

export function sortAccountsByOrder(accounts) {
  if (!Array.isArray(accounts)) return [];
  const orderIds = getSavedAccountOrder();
  if (!orderIds.length) return [...accounts];

  const map = new Map(accounts.map(a => [a.id, a]));
  const sorted = [];

  // Add items in user's custom saved order
  for (const id of orderIds) {
    if (map.has(id)) {
      sorted.push(map.get(id));
      map.delete(id);
    }
  }

  // Append any remaining unranked accounts
  for (const remaining of map.values()) {
    sorted.push(remaining);
  }

  return sorted;
}
