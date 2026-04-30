export const formatPrice = (price: number | string, currency = 'PHP'): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(numPrice);
};

export const formatDate = (
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  });
};

export const formatDateTime = (
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...options,
  });
};

export const formatTime = (
  date: string | Date | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...options,
  });
};

export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;

  return formatDate(d);
};

export const formatNumber = (num: number | string, decimals = 0): string => {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(numValue);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatOrderStatus = (status: string): { label: string; className: string } => {
  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    preparing: { label: 'Preparing', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
    ready: { label: 'Ready', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    served: { label: 'Served', className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200' },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    refunded: { label: 'Refunded', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  };
  return statusMap[status] ?? { label: status, className: 'bg-gray-100 text-gray-800' };
};

export const formatPaymentStatus = (status: string): { label: string; className: string } => {
  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    paid: { label: 'Paid', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    completed: { label: 'Completed', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    failed: { label: 'Failed', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    refunded: { label: 'Refunded', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  };
  return statusMap[status] ?? { label: status, className: 'bg-gray-100 text-gray-800' };
};

export const formatInventoryStatus = (current: number, minimum: number): { label: string; className: string } => {
  if (current <= 0) {
    return { label: 'Out of Stock', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
  }
  if (current <= minimum) {
    return { label: 'Low Stock', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
  }
  return { label: 'In Stock', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
};

export const formatRole = (role: string): string => {
  const roleLabels: Record<string, string> = {
    admin: 'Admin',
    manager: 'Manager',
    staff: 'Staff',
    librarian: 'Librarian',
    student: 'Student',
    parent: 'Parent',
    faculty: 'Faculty',
  };
  return roleLabels[role] ?? role;
};

export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string): string => {
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
};
