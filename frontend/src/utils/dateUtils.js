/**
 * Date utility functions for IST (Indian Standard Time) timezone
 * IST is UTC+5:30
 */

/**
 * Format a date string to IST timezone with custom format
 * @param {string|Date} dateString - ISO date string or Date object
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string in IST
 */
export const formatToIST = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  const defaultOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    ...options
  };
  
  return new Intl.DateTimeFormat('en-IN', defaultOptions).format(date);
};

/**
 * Format date and time separately for better display
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {object} Object with date and time strings
 */
export const formatDateTimeIST = (dateString) => {
  if (!dateString) return { date: '', time: '' };
  
  const date = new Date(dateString);
  
  const dateStr = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
  
  const timeStr = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
  
  return { date: dateStr, time: timeStr };
};

/**
 * Format date only (no time) in IST
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDateIST = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

/**
 * Format time only in IST
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted time string
 */
export const formatTimeIST = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date);
};

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Relative time string
 */
export const getRelativeTimeIST = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  
  // Convert both to IST for accurate comparison
  const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  const diffMs = istDate - istNow;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (Math.abs(diffMins) < 1) return 'just now';
  if (Math.abs(diffMins) < 60) {
    return diffMins > 0 ? `in ${diffMins} minute${diffMins !== 1 ? 's' : ''}` : `${Math.abs(diffMins)} minute${Math.abs(diffMins) !== 1 ? 's' : ''} ago`;
  }
  if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `in ${diffHours} hour${diffHours !== 1 ? 's' : ''}` : `${Math.abs(diffHours)} hour${Math.abs(diffHours) !== 1 ? 's' : ''} ago`;
  }
  if (Math.abs(diffDays) < 7) {
    return diffDays > 0 ? `in ${diffDays} day${diffDays !== 1 ? 's' : ''}` : `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
  }
  
  return formatToIST(dateString);
};

/**
 * Check if a date is overdue (in IST timezone)
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {boolean} True if date is in the past
 */
export const isOverdueIST = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  const now = new Date();
  
  // Convert both to IST for accurate comparison
  const istDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const istNow = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  
  return istDate < istNow;
};
