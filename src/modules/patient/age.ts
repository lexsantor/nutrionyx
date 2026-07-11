/**
 * Age in whole years from a birth date. Calendar arithmetic (UTC) rather than
 * a 365.25-day approximation, which is off by one on the exact birthday. Kept
 * in a module (not inline in a server component) so the time read does not trip
 * react-hooks/purity in render; `now` is injectable for testing.
 */
export function ageInYears(birthDate: Date, now: number = Date.now()): number {
  const n = new Date(now);
  let age = n.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDiff = n.getUTCMonth() - birthDate.getUTCMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && n.getUTCDate() < birthDate.getUTCDate())
  ) {
    age--;
  }
  return age;
}
