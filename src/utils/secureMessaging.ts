// Utilidades para cifrado/descifrado simétrico AES-GCM por conversación.
// Se apoya en un secreto precompartido VITE_E2E_PSK y en el conversationId
// para derivar una clave distinta por conversación.

const encoder = new TextEncoder();
const decoder = new TextDecoder();
const PSK = import.meta.env.VITE_E2E_PSK || '';

type EncryptedPayload = {
  v: 1;
  alg: 'AES-GCM';
  iv: string; // base64
  ciphertext: string; // base64
};

const toBase64 = (buffer: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)));

const fromBase64 = (str: string) =>
  Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

const deriveConversationKey = async (conversationId: string) => {
  if (!PSK) {
    return null; // Sin PSK no aplicamos cifrado
  }

  const material = encoder.encode(`${PSK}:${conversationId}`);
  const hash = await crypto.subtle.digest('SHA-256', material);
  return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt']);
};

export const encryptForConversation = async (
  plaintext: string,
  conversationId: string
): Promise<EncryptedPayload | null> => {
  const key = await deriveConversationKey(conversationId);
  if (!key) return null;

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = encoder.encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);

  return {
    v: 1,
    alg: 'AES-GCM',
    iv: toBase64(iv.buffer),
    ciphertext: toBase64(cipherBuffer)
  };
};

export const decryptForConversation = async (
  encrypted: EncryptedPayload | string,
  conversationId: string
): Promise<string | null> => {
  const payload: EncryptedPayload =
    typeof encrypted === 'string' ? (JSON.parse(encrypted) as EncryptedPayload) : encrypted;

  if (!payload || payload.alg !== 'AES-GCM' || payload.v !== 1) return null;
  const key = await deriveConversationKey(conversationId);
  if (!key) return null;

  const iv = fromBase64(payload.iv);
  const cipher = fromBase64(payload.ciphertext);
  const plainBuffer = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return decoder.decode(plainBuffer);
};

export const tryDecryptContent = async (
  rawContent: string,
  conversationId: string
): Promise<string | null> => {
  try {
    const parsed = JSON.parse(rawContent);
    if (parsed && parsed.ciphertext && parsed.iv) {
      return await decryptForConversation(parsed, conversationId);
    }
    return null;
  } catch {
    return null;
  }
};
