export const formatCurrency = (value = 0) => {
  const n = Number(value) || 0;
  return `\u20B9${n.toLocaleString('en-IN')}`;
};

export const formatDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatShortDate = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
};

export const daysLeftLabel = (days) => {
  if (days == null) return '';
  if (days < 0) return `${Math.abs(days)} days overdue`;
  if (days === 0) return 'Due today';
  return `In ${days} days`;
};

export const toISODate = (date) => {
  const d = date ? new Date(date) : new Date();
  return d.toISOString().split('T')[0];
};

export const vehicleDisplayName = (v) => {
  if (!v) return 'Vehicle';
  const name = `${v.brand || ''} ${v.model || ''}`.trim();
  return name || v.number || 'Vehicle';
};
