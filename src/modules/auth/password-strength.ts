/**
 * Password strength, as a number the meter can draw and a reason the user can
 * act on. Pure and dependency-free.
 *
 * Deliberately not an entropy estimate. Entropy rewards `P@ssw0rd1!` for its
 * variety and misses that it is on every cracking list, so the score here
 * starts from length, which is what actually costs an attacker time, and then
 * subtracts for the shapes that make a long password cheap: one repeated
 * character, a straight run off the keyboard, a common word with digits
 * pinned to the end.
 *
 * It never blocks. The server's own minimum is what gates the form; this only
 * tells the user where they are, and a meter that refuses passwords it merely
 * dislikes teaches people to write them down.
 */

export type Strength = {
  /** 0-4. 0 is unusable, 2 is the floor we would defend, 4 is comfortable. */
  score: 0 | 1 | 2 | 3 | 4;
  /** Which hint to show, or null when there is nothing useful to say. */
  reason: "short" | "repeated" | "sequence" | "common" | "variety" | null;
};

/** Substrings that make any password containing them a bad one. */
const COMMON = [
  "password",
  "contrasena",
  "contraseña",
  "qwerty",
  "asdf",
  "1234",
  "0000",
  "admin",
  "nutrionyx",
  "iloveyou",
  "letmein",
  "welcome",
  "abc123",
];

const SEQUENCES = "abcdefghijklmnopqrstuvwxyz0123456789";

function hasRun(value: string, length: number): boolean {
  const lower = value.toLowerCase();
  for (let i = 0; i + length <= lower.length; i++) {
    const slice = lower.slice(i, i + length);
    if (SEQUENCES.includes(slice)) return true;
    if (SEQUENCES.includes([...slice].reverse().join(""))) return true;
  }
  return false;
}

/**
 * Undo the substitutions people actually make, so `P@ssw0rd` is recognised
 * as `password`. Without this the common-word list catches only the users
 * who did not try, which is the wrong half.
 */
function deleet(value: string): string {
  return value
    .toLowerCase()
    .replace(/[@4]/g, "a")
    .replace(/[3]/g, "e")
    .replace(/[1!|]/g, "i")
    .replace(/[0]/g, "o")
    .replace(/[5$]/g, "s")
    .replace(/[7]/g, "t");
}

function classes(value: string): number {
  return [/[a-z]/, /[A-Z]/, /\d/, /[^a-zA-Z0-9]/].filter((re) =>
    re.test(value),
  ).length;
}

export function passwordStrength(value: string): Strength {
  if (value.length === 0) return { score: 0, reason: null };
  if (value.length < 8) return { score: 0, reason: "short" };

  const plain = deleet(value);
  if (COMMON.some((word) => plain.includes(deleet(word)))) {
    return { score: 0, reason: "common" };
  }
  // One character repeated, or two alternating: "aaaaaaaa", "ababababab".
  if (/^(.{1,2})\1+$/.test(value)) return { score: 0, reason: "repeated" };
  if (hasRun(value, 4)) return { score: 1, reason: "sequence" };

  // Length first: it is the only property that scales the attacker's cost.
  let score = value.length >= 16 ? 3 : value.length >= 12 ? 2 : 1;
  const variety = classes(value);
  if (variety >= 3) score += 1;

  const capped = Math.min(score, 4) as Strength["score"];
  return {
    score: capped,
    reason: capped < 3 ? (variety < 3 ? "variety" : null) : null,
  };
}
