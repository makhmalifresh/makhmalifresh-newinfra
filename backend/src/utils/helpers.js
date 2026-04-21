export function normalizePhoneNumber(phone) {
  if (!phone) return "";

  // Remove all non-digit characters
  let cleaned = phone.toString().replace(/\D/g, "");

  // If it begins with 0 and length 11 (0 + 10), drop leading 0 and add 91
  if (cleaned.length === 11 && cleaned.startsWith("0")) {
    cleaned = cleaned.slice(1);
  }

  // If it's 10 digits, assume local Indian mobile -> add '91'
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  }

  // If it's already 12 and starts with 91, keep it
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return cleaned;
  }

  // If it's longer than 12, trim to first 12 digits (best-effort)
  if (cleaned.length > 12 && cleaned.startsWith("91")) {
    return cleaned.slice(0, 12);
  }

  return cleaned;
}

export function generatePorterRequestId(clientOrderId = "") {
  let clean = "";
  if (clientOrderId) {
     clean = clientOrderId.toString().replace(/[^a-zA-Z0-9]/g, ""); // sanitize
  }
  const uuid32 = crypto.randomUUID().replace(/-/g, ""); // 32 chars
  return (clean + uuid32).slice(0, 32); 
}
