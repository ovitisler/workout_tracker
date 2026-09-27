// Parses a comma-separated list of emails (like the ADMIN_EMAILS environment
// variable) into lowercase addresses.
export function parseEmailList(value: string | undefined) {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

// A loose check: something@something.something, no spaces.
export function isValidEmail(email: string) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
