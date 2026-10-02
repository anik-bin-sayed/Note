const PBKDF2_ITERATIONS = 600_000;
const VERIFIER_TEXT = "notes-vault-check-v1";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

let activeKey = null;

const bytesToBase64 = (bytes) => {
  let binary = "";

  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
  }

  return btoa(binary);
};

const base64ToBytes = (value) => {
  const binary = atob(value);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
};

const requireCrypto = () => {
  if (!globalThis.crypto?.subtle || !globalThis.crypto?.getRandomValues) {
    throw new Error("This browser does not support secure note encryption.");
  }
};

const deriveKey = async (pin, salt, iterations) => {
  requireCrypto();

  const material = await globalThis.crypto.subtle.importKey(
    "raw",
    encoder.encode(pin.normalize("NFKC")),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return globalThis.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations,
      hash: "SHA-256",
    },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

const encryptText = async (key, value) => {
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await globalThis.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(value),
  );

  return {
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
    iv: bytesToBase64(iv),
  };
};

const decryptText = async (key, encrypted) => {
  const cleartext = await globalThis.crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToBytes(encrypted.iv) },
    key,
    base64ToBytes(encrypted.ciphertext),
  );

  return decoder.decode(cleartext);
};

export const createVault = async (pin) => {
  requireCrypto();

  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(pin, salt, PBKDF2_ITERATIONS);
  const verifier = await encryptText(key, VERIFIER_TEXT);

  return {
    key,
    metadata: {
      salt: bytesToBase64(salt),
      iterations: PBKDF2_ITERATIONS,
      verifier,
    },
  };
};

export const unlockVault = async (pin, metadata) => {
  const key = await deriveKey(
    pin,
    base64ToBytes(metadata.salt),
    metadata.iterations,
  );

  try {
    const verifier = await decryptText(key, metadata.verifier);

    if (verifier !== VERIFIER_TEXT) {
      throw new Error("Invalid vault verifier.");
    }
  } catch {
    throw new Error("Incorrect PIN or passphrase.");
  }

  return key;
};

export const setVaultKey = (key) => {
  activeKey = key;
};

export const clearVaultKey = () => {
  activeKey = null;
};

export const encryptNote = async (note) => {
  if (!activeKey) {
    throw new Error("Unlock the note vault before continuing.");
  }

  const payload = JSON.stringify({
    version: 1,
    title: note.title,
    text: note.text,
  });

  return encryptText(activeKey, payload);
};

export const decryptNote = async (entry) => {
  if (!activeKey) {
    throw new Error("Unlock the note vault before continuing.");
  }

  const payload = JSON.parse(await decryptText(activeKey, entry));

  if (
    payload.version !== 1 ||
    typeof payload.title !== "string" ||
    typeof payload.text !== "string"
  ) {
    throw new Error("This note uses an unsupported encrypted format.");
  }

  return { title: payload.title, text: payload.text };
};