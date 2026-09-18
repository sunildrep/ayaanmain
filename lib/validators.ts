// Central validators — single source for phone/email/amount/status
export const isEmail = (v: string): boolean => {
  const s = String(v || "").trim();
  if (s.length === 0 || s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
};

export const isPhone = (v: string): boolean => /^[0-9]{10}$/.test(String(v || "").trim());

export const isPositiveInt = (v: any): boolean => {
  const n = Number(v);
  return Number.isFinite(n) && Number.isInteger(n) && n > 0 && n <= 1e8;
};

export const isNonNegativeInt = (v: any): boolean => {
  const n = Number(v);
  return Number.isFinite(n) && Number.isInteger(n) && n >= 0 && n <= 1e8;
};

export const sanitizeText = (v: string, maxLen = 1000): string => {
  return String(v || "").trim().slice(0, maxLen).replace(/[<>]/g, "");
};

export const ALLOWED_LEAD_STATUS = ["new", "contacted", "qualified", "converted", "closed", "archived"] as const;
export const ALLOWED_EXPENSE_STATUS = ["pending", "approved", "rejected", "paid"] as const;
export const ALLOWED_PAYMENT_METHODS = ["cash", "upi", "bank", "razorpay"] as const;

export function isAllowedLeadStatus(v: string): boolean {
  return (ALLOWED_LEAD_STATUS as readonly string[]).includes(String(v || "").trim());
}
