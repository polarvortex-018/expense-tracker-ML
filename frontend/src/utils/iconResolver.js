// Central Material Symbols Catalog & Legacy Emoji Resolver for Cash Buddy (100% Offline)

export const ICON_CATALOG = [
  {
    category: 'Finance & Money',
    icons: [
      { id: 'savings', label: 'Savings' },
      { id: 'payments', label: 'Payments' },
      { id: 'account_balance', label: 'Bank' },
      { id: 'credit_card', label: 'Card' },
      { id: 'receipt_long', label: 'Receipt' },
      { id: 'wallet', label: 'Wallet' },
      { id: 'paid', label: 'Paid' },
      { id: 'currency_rupee', label: 'Rupee' },
      { id: 'account_balance_wallet', label: 'Cash Wallet' },
    ]
  },
  {
    category: 'Food & Dining',
    icons: [
      { id: 'restaurant', label: 'Restaurant' },
      { id: 'lunch_dining', label: 'Dining' },
      { id: 'fastfood', label: 'Fastfood' },
      { id: 'local_cafe', label: 'Coffee / Tea' },
      { id: 'local_bar', label: 'Drinks' },
      { id: 'bakery_dining', label: 'Bakery' },
    ]
  },
  {
    category: 'Home & Living',
    icons: [
      { id: 'home', label: 'Home' },
      { id: 'apartment', label: 'Rent / Flat' },
      { id: 'bed', label: 'Furniture' },
      { id: 'chair', label: 'Decor' },
      { id: 'lightbulb', label: 'Electricity' },
      { id: 'cleaning_services', label: 'Maintenance' },
    ]
  },
  {
    category: 'Transport & Travel',
    icons: [
      { id: 'directions_car', label: 'Car / Auto' },
      { id: 'two_wheeler', label: 'Bike / Scooter' },
      { id: 'train', label: 'Train / Metro' },
      { id: 'flight', label: 'Flight' },
      { id: 'local_gas_station', label: 'Fuel' },
      { id: 'directions_bus', label: 'Bus' },
      { id: 'local_taxi', label: 'Cab / Taxi' },
    ]
  },
  {
    category: 'Shopping & Retail',
    icons: [
      { id: 'shopping_bag', label: 'Shopping' },
      { id: 'shopping_cart', label: 'Groceries' },
      { id: 'storefront', label: 'Store' },
      { id: 'checkroom', label: 'Clothing' },
      { id: 'local_mall', label: 'Mall' },
    ]
  },
  {
    category: 'Entertainment & Fun',
    icons: [
      { id: 'movie', label: 'Movies' },
      { id: 'music_note', label: 'Music' },
      { id: 'sports_esports', label: 'Gaming' },
      { id: 'celebration', label: 'Events' },
      { id: 'tv', label: 'TV / OTT' },
      { id: 'subscriptions', label: 'Subscriptions' },
    ]
  },
  {
    category: 'Utilities & Bills',
    icons: [
      { id: 'bolt', label: 'Electricity' },
      { id: 'water_drop', label: 'Water' },
      { id: 'wifi', label: 'Internet / Wi-Fi' },
      { id: 'phone_iphone', label: 'Mobile Bill' },
      { id: 'construction', label: 'Repair' },
      { id: 'description', label: 'Documents' },
    ]
  },
  {
    category: 'Health & Wellness',
    icons: [
      { id: 'medical_services', label: 'Doctor' },
      { id: 'local_pharmacy', label: 'Pharmacy' },
      { id: 'fitness_center', label: 'Gym / Fitness' },
      { id: 'monitor_heart', label: 'Health' },
      { id: 'spa', label: 'Self Care' },
    ]
  },
  {
    category: 'Work & Education',
    icons: [
      { id: 'work', label: 'Salary / Work' },
      { id: 'business_center', label: 'Business' },
      { id: 'school', label: 'Education' },
      { id: 'computer', label: 'Tech / Tools' },
      { id: 'menu_book', label: 'Books' },
    ]
  },
  {
    category: 'Personal & Family',
    icons: [
      { id: 'person', label: 'Personal' },
      { id: 'favorite', label: 'Gifts / Loved Ones' },
      { id: 'pets', label: 'Pets' },
      { id: 'child_care', label: 'Kids / Family' },
      { id: 'card_giftcard', label: 'Gift' },
    ]
  },
  {
    category: 'General & Others',
    icons: [
      { id: 'category', label: 'Category' },
      { id: 'star', label: 'Star' },
      { id: 'bookmark', label: 'Bookmark' },
      { id: 'label', label: 'Tag' },
      { id: 'tune', label: 'Adjustment' },
      { id: 'swap_vert', label: 'Transfer' },
      { id: 'more_horiz', label: 'Other' },
    ]
  }
];

// Map of all valid Material Symbol IDs for fast lookup
const ALL_SYMBOL_IDS = new Set(
  ICON_CATALOG.flatMap(cat => cat.icons.map(i => i.id)).concat([
    'trending_up', 'trending_down', 'arrow_upward', 'arrow_downward', 'tune', 'swap_vert',
    'account_balance', 'account_balance_wallet', 'credit_card', 'savings', 'payments', 'work'
  ])
);

// Map legacy emojis to appropriate Material Symbol identifiers
const EMOJI_TO_SYMBOL_MAP = {
  '🍔': 'lunch_dining',
  '🍕': 'fastfood',
  '☕': 'local_cafe',
  '🏠': 'home',
  '🏢': 'apartment',
  '🚗': 'directions_car',
  '🏍️': 'two_wheeler',
  '🛵': 'two_wheeler',
  '⛽': 'local_gas_station',
  '✈️': 'flight',
  '🛒': 'shopping_cart',
  '🛍️': 'shopping_bag',
  '🎬': 'movie',
  '🎵': 'music_note',
  '🎮': 'sports_esports',
  '⚡': 'bolt',
  '💧': 'water_drop',
  '📶': 'wifi',
  '📱': 'phone_iphone',
  '🏥': 'medical_services',
  '💊': 'local_pharmacy',
  '🏋️': 'fitness_center',
  '💼': 'work',
  '🎓': 'school',
  '💻': 'computer',
  '💳': 'credit_card',
  '🏦': 'account_balance',
  '💰': 'savings',
  '🪣': 'savings',
  '💵': 'payments',
  '🏷️': 'label',
  '📉': 'trending_down',
  '📈': 'trending_up',
  '🔄': 'tune',
  '🎉': 'celebration',
  '🎁': 'card_giftcard',
  '🐾': 'pets',
  '⭐': 'star',
};

/**
 * Resolves any stored icon value (Material Symbol name, legacy emoji, or empty)
 * into a valid Material Symbol identifier.
 */
export function resolveIcon(iconInput, fallback = 'category') {
  if (!iconInput || typeof iconInput !== 'string') return fallback;

  const trimmed = iconInput.trim();
  if (!trimmed) return fallback;

  // 1. Mapped legacy emoji -> Material Symbol ID
  if (EMOJI_TO_SYMBOL_MAP[trimmed]) {
    return EMOJI_TO_SYMBOL_MAP[trimmed];
  }

  // 2. Check if string contains emoji characters
  if (trimmed.match(/\p{Extended_Pictographic}/u)) {
    return fallback;
  }

  // 3. Return valid Material Symbol identifier directly
  return trimmed;
}
