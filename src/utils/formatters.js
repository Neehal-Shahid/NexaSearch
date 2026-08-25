/**
 * Formatting utilities for display purposes.
 */

// Extract a clean domain from a URL
export function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// Format a timestamp into a relative or absolute date string
export function formatDate(dateString) {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    
    // If it's an invalid date (e.g. "2 hours ago" from SerpApi), just return the original string
    if (isNaN(date.getTime())) {
      return dateString;
    }

    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateString;
  }
}

// Format a timestamp for history display
export function formatHistoryDate(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diffDays = Math.floor((now - date) / 86400000);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// Truncate text with ellipsis
export function truncateText(text, maxLength = 160) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}

// Format video duration (e.g. "5:30" from seconds or a string)
export function formatDuration(duration) {
  if (!duration) return '';
  if (typeof duration === 'string') return duration;

  const mins = Math.floor(duration / 60);
  const secs = duration % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
