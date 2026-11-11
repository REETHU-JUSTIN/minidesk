// "Alex Morgan" becomes "AM". Each step returns a new value for the next step to use.
export function getInitials(name) {
  return name
    .trim()
    .split(/\s+/) // split on any run of spaces: ["Alex", "Morgan"]
    .slice(0, 2) // keep at most two names
    .map((part) => part.charAt(0).toUpperCase()) // ["A", "M"]
    .join('') // "AM"
}
