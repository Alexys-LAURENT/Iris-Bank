/**
 * Generates a valid French IBAN (FR76 + bank code + account number + check digits)
 * Format: FR76 XXXXX XXXXX XXXXXXXXXXX XX
 */
export function generateIBAN(): string {
  // French IBAN: FR + 2 check digits + 23 BBAN digits
  // BBAN = 5 bank code + 5 branch code + 11 account number + 2 key
  const bankCode = "30004"; // BNP Paribas (fictif)
  const branchCode = String(Math.floor(10000 + Math.random() * 90000));
  const accountNumber = String(Math.floor(10000000000 + Math.random() * 90000000000));
  const key = computeRIBKey(bankCode, branchCode, accountNumber);
  const bban = `${bankCode}${branchCode}${accountNumber}${key}`;

  // Compute IBAN check digits
  const rearranged = `${bban}FR00`;
  const numericStr = rearranged
    .split("")
    .map((c) => (isNaN(Number(c)) ? String(c.charCodeAt(0) - 55) : c))
    .join("");
  const checkDigits = 98 - mod97(numericStr);
  const checkStr = String(checkDigits).padStart(2, "0");

  const iban = `FR${checkStr}${bban}`;

  // Format: FR76 XXXX XXXX XXXX XXXX XXXX XXX
  return iban.replace(/(.{4})/g, "$1 ").trim();
}

function computeRIBKey(bankCode: string, branchCode: string, accountNumber: string): string {
  const numericAccount = accountNumber
    .split("")
    .map((c) => {
      const map: Record<string, string> = {
        A: "1", B: "2", C: "3", D: "4", E: "5", F: "6", G: "7", H: "8", I: "9",
        J: "1", K: "2", L: "3", M: "4", N: "5", O: "6", P: "7", Q: "8", R: "9",
        S: "2", T: "3", U: "4", V: "5", W: "6", X: "7", Y: "8", Z: "9",
      };
      return map[c.toUpperCase()] ?? c;
    })
    .join("");

  const key = 97 - (Number(bankCode + branchCode + numericAccount + "00") % 97);
  return String(key).padStart(2, "0");
}

function mod97(numericStr: string): number {
  let remainder = 0;
  for (const char of numericStr) {
    remainder = (remainder * 10 + parseInt(char)) % 97;
  }
  return remainder;
}

export function formatIBAN(iban: string): string {
  const clean = iban.replace(/\s/g, "");
  return clean.replace(/(.{4})/g, "$1 ").trim();
}
