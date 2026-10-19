import { ref, computed } from 'vue';
import { api } from '../services/api.js';

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'CNY', symbol: 'CN¥', name: 'Chinese Yuan' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'RUB', symbol: '₽', name: 'Russian Ruble' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'NZD', symbol: 'NZ$', name: 'New Zealand Dollar' },
  { code: 'KWD', symbol: 'KD', name: 'Kuwaiti Dinar' },
  { code: 'QAR', symbol: 'QR', name: 'Qatari Riyal' },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial' },
  { code: 'BHD', symbol: 'BD', name: 'Bahraini Dinar' },
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳', name: 'Bangladeshi Taka' },
  { code: 'LKR', symbol: 'Rs', name: 'Sri Lankan Rupee' },
  { code: 'NPR', symbol: 'Rs', name: 'Nepalese Rupee' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'EGP', symbol: 'E£', name: 'Egyptian Pound' },
  { code: 'TRY', symbol: '₺', name: 'Turkish Lira' }
];

const DEFAULT_CURRENCY = CURRENCIES[0]; // Default: INR

export const currentCurrency = ref(DEFAULT_CURRENCY);

export const currencySymbol = computed(() => {
  if (!currentCurrency.value) return '₹';
  return currentCurrency.value.symbol || currentCurrency.value.code || '₹';
});

export const currencyCode = computed(() => {
  return currentCurrency.value?.code || 'INR';
});

export const loadCurrencyForActiveVault = async (vaultFilename) => {
  // 1. Try reading from SQLite vault_settings table (database-bound per vault)
  try {
    const dbCurr = await api.getVaultCurrency();
    if (dbCurr && dbCurr.code) {
      currentCurrency.value = dbCurr;
      if (vaultFilename) {
        try {
          localStorage.setItem(`cashbuddy_currency_${vaultFilename}`, JSON.stringify(dbCurr));
        } catch (e) {}
      }
      return dbCurr;
    }
  } catch (e) {
    console.warn('Failed to load currency from SQLite vault settings:', e);
  }

  // 2. Fallback to localStorage per-vault key
  if (vaultFilename) {
    try {
      const raw = localStorage.getItem(`cashbuddy_currency_${vaultFilename}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.code) {
          currentCurrency.value = parsed;
          api.setVaultCurrency(parsed).catch(() => {});
          return parsed;
        }
      }
    } catch (e) {}
  }

  // 3. Fallback to global legacy localStorage key
  try {
    const legacy = localStorage.getItem('cashbuddy_currency');
    if (legacy) {
      const parsed = JSON.parse(legacy);
      if (parsed && parsed.code) {
        currentCurrency.value = parsed;
        if (vaultFilename) {
          api.setVaultCurrency(parsed).catch(() => {});
        }
        return parsed;
      }
    }
  } catch (e) {}

  currentCurrency.value = DEFAULT_CURRENCY;
  return DEFAULT_CURRENCY;
};

export const setCurrency = async (curr, vaultFilename) => {
  if (!curr) return;
  let targetObj = null;
  if (typeof curr === 'string') {
    targetObj = CURRENCIES.find(c => c.code === curr.toUpperCase().trim()) || { code: curr.toUpperCase().trim(), symbol: curr.trim(), name: curr.trim() };
  } else if (curr && curr.code) {
    targetObj = curr;
  }
  if (!targetObj || !targetObj.code) return;

  const newCurr = {
    code: String(targetObj.code).toUpperCase().trim(),
    symbol: targetObj.symbol ? String(targetObj.symbol).trim() : String(targetObj.code).toUpperCase().trim(),
    name: targetObj.name ? String(targetObj.name).trim() : String(targetObj.code).toUpperCase().trim()
  };
  currentCurrency.value = newCurr;

  if (vaultFilename) {
    try {
      localStorage.setItem(`cashbuddy_currency_${vaultFilename}`, JSON.stringify(newCurr));
    } catch (e) {}
  }

  try {
    localStorage.setItem('cashbuddy_currency', JSON.stringify(newCurr));
  } catch (e) {}

  try {
    await api.setVaultCurrency(newCurr);
  } catch (e) {
    console.error('Failed to save vault currency to SQLite:', e);
  }
};
