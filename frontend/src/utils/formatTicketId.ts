// MongoDB IDs are 24 characters long, which is too long to show or say out loud.
// The last 6 characters are enough to tell tickets apart on screen.
export function formatTicketId(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`
}
