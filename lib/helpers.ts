export function formatCurrency(amount: number, currency: string = '$'): string {
  const absAmount = Math.abs(amount);
  if (absAmount >= 1000000) {
    return `${currency}${(amount / 1000000).toFixed(1)}M`;
  }
  if (absAmount >= 10000) {
    return `${currency}${(amount / 1000).toFixed(1)}K`;
  }
  return `${currency}${amount.toFixed(2)}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
  const datePart = dateStr.split('T')[0];

  if (datePart === today) return 'Today';
  if (datePart === yesterday) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export function getMonthName(dateStr: string): string {
  const date = new Date(dateStr + '-01');
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export function getCategoryColor(category: string): string {
  const map: Record<string, string> = {
    'Food': '#FF6B6B',
    'Transport': '#4ECDC4',
    'Shopping': '#45B7D1',
    'Entertainment': '#96CEB4',
    'Health': '#FFEAA7',
    'Housing': '#DDA0DD',
    'Utilities': '#98D8C8',
    'Education': '#F7DC6F',
    'Subscriptions': '#BB8FCE',
    'Other': '#AEB6BF',
  };
  return map[category] || '#AEB6BF';
}

export function getCategoryIcon(category: string): string {
  const map: Record<string, string> = {
    'Food': 'restaurant-outline',
    'Transport': 'car-outline',
    'Shopping': 'bag-outline',
    'Entertainment': 'film-outline',
    'Health': 'heart-outline',
    'Housing': 'home-outline',
    'Utilities': 'flash-outline',
    'Education': 'book-outline',
    'Subscriptions': 'card-outline',
    'Other': 'ellipsis-horizontal-outline',
  };
  return map[category] || 'ellipsis-horizontal-outline';
}

export function detectCardType(number: string): 'visa' | 'mastercard' | 'amex' | 'other' {
  const clean = number.replace(/\s/g, '');
  if (/^4/.test(clean)) return 'visa';
  if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'mastercard';
  if (/^3[47]/.test(clean)) return 'amex';
  return 'other';
}

export function maskCardNumber(number: string): string {
  const clean = number.replace(/\s/g, '');
  if (clean.length < 4) return clean;
  return '•••• ' + clean.slice(-4);
}
