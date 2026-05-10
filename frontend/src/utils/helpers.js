export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, minimumFractionDigits: 0,
  }).format(amount);
};

export const getDaysUntil = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
};

export const getTripDuration = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e - s) / (1000 * 60 * 60 * 24));
};

export const travelStyles = [
  { value: 'budget', label: 'Budget', icon: '💰', color: '#4ECDC4' },
  { value: 'luxury', label: 'Luxury', icon: '✨', color: '#FFB347' },
  { value: 'adventure', label: 'Adventure', icon: '🏔️', color: '#FF6B6B' },
  { value: 'cultural', label: 'Cultural', icon: '🏛️', color: '#6C63FF' },
  { value: 'relaxation', label: 'Relaxation', icon: '🌴', color: '#2ED573' },
  { value: 'backpacking', label: 'Backpacking', icon: '🎒', color: '#FF4757' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦', color: '#1E90FF' },
  { value: 'romantic', label: 'Romantic', icon: '💕', color: '#FF69B4' },
];

export const activityCategories = [
  { value: 'adventure', label: 'Adventure', icon: '🧗' },
  { value: 'sightseeing', label: 'Sightseeing', icon: '🏛️' },
  { value: 'food', label: 'Food & Dining', icon: '🍽️' },
  { value: 'nightlife', label: 'Nightlife', icon: '🌙' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️' },
  { value: 'culture', label: 'Culture', icon: '🎭' },
  { value: 'nature', label: 'Nature', icon: '🌿' },
  { value: 'wellness', label: 'Wellness', icon: '🧘' },
];

export const packingCategories = [
  { value: 'clothes', label: 'Clothes', icon: '👕' },
  { value: 'documents', label: 'Documents', icon: '📄' },
  { value: 'electronics', label: 'Electronics', icon: '💻' },
  { value: 'toiletries', label: 'Toiletries', icon: '🧴' },
  { value: 'medicine', label: 'Medicine', icon: '💊' },
  { value: 'accessories', label: 'Accessories', icon: '🎒' },
  { value: 'other', label: 'Other', icon: '📦' },
];
