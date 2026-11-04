const dateOptions: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}

// "2026-11-01T12:00:00Z" becomes "Nov 1, 2026"
export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-US', dateOptions)
}

// "2026-11-01T09:12:00Z" becomes "Nov 1, 2026, 9:12 AM", shown in the viewer's time zone.
export function formatDateTime(isoDate: string): string {
  // Spread copies the date options into a new object, then adds the time options.
  return new Date(isoDate).toLocaleString('en-US', {
    ...dateOptions,
    hour: 'numeric',
    minute: '2-digit',
  })
}
