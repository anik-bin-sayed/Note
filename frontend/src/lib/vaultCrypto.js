const PBKDF2_ITERATIONS = 600_000;
const VERIFIER_TEXT = "notes-vault-check-v1";
const encoder = new TextEncoder();
const decoder = new TextDecoder();

let activeKey = null;
let activePrivateKey = null;

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
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"],
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

const unwrapNoteKey = async (entry) =>
  globalThis.crypto.subtle.unwrapKey(
    "raw",
    base64ToBytes(entry.wrapped_key),
    activeKey,
    { name: "AES-GCM", iv: base64ToBytes(entry.key_iv) },
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

export const getNoteKey = (entry) => unwrapNoteKey(entry);

const parseNote = (payload) => {
  const note = JSON.parse(payload);

  if (
    note.version !== 1 ||
    typeof note.title !== "string" ||
    typeof note.text !== "string"
  ) {
    throw new Error("This note uses an unsupported encrypted format.");
  }

  return { title: note.title, text: note.text };
};

export const createVault = async (pin) => {
  requireCrypto();

  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const key = await deriveKey(pin, salt, PBKDF2_ITERATIONS);
  const verifier = await encryptText(key, VERIFIER_TEXT);
  const recipientKeys = await createRecipientKeyPair(key);
  activePrivateKey = recipientKeys.privateKey;

  return {
    key,
    metadata: {
      salt: bytesToBase64(salt),
      iterations: PBKDF2_ITERATIONS,
      verifier,
      public_key: recipientKeys.public_key,
      private_key: recipientKeys.private_key,
    },
  };
};

export const createRecipientKeyPair = async (vaultKey) => {
  const pair = await globalThis.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );
  const privateBytes = new Uint8Array(
    await globalThis.crypto.subtle.exportKey("pkcs8", pair.privateKey),
  );

  return {
    public_key: await globalThis.crypto.subtle.exportKey("jwk", pair.publicKey),
    private_key: await encryptText(vaultKey, bytesToBase64(privateBytes)),
    privateKey: pair.privateKey,
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

  activePrivateKey = null;
  if (metadata.private_key && metadata.public_key) {
    const encodedPrivateKey = await decryptText(key, metadata.private_key);
    activePrivateKey = await globalThis.crypto.subtle.importKey(
      "pkcs8",
      base64ToBytes(encodedPrivateKey),
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["decrypt"],
    );
  }

  return key;
};

export const setVaultKey = (key) => {
  activeKey = key;
};

export const clearVaultKey = () => {
  activeKey = null;
  activePrivateKey = null;
};

export const setVaultPrivateKey = (key) => {
  activePrivateKey = key;
};

export const encodeSharedNoteKey = async (entry) => {
  const key = await getNoteKey(entry);
  const encoded = bytesToBase64(
    new Uint8Array(await globalThis.crypto.subtle.exportKey("raw", key)),
  );

  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

export const importSharedNoteKey = (encoded) => {
  const normalized = encoded.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  return globalThis.crypto.subtle.importKey(
    "raw",
    base64ToBytes(padded),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
};

export const encryptNote = async (note, sharedKey = null) => {
  if (!activeKey) {
    throw new Error("Unlock the note vault before continuing.");
  }

  const noteKey =
    sharedKey ||
    (await globalThis.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"],
    ));
  const payload = JSON.stringify({
    version: 1,
    title: note.title,
    text: note.text,
  });
  const encrypted = await encryptText(noteKey, payload);

  if (sharedKey) return encrypted;

  const keyIv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const wrappedKey = await globalThis.crypto.subtle.wrapKey(
    "raw",
    noteKey,
    activeKey,
    { name: "AES-GCM", iv: keyIv },
  );

  return {
    ...encrypted,
    wrapped_key: bytesToBase64(new Uint8Array(wrappedKey)),
    key_iv: bytesToBase64(keyIv),
  };
};

export const decryptNoteWithKey = async (entry, key) =>
  parseNote(await decryptText(key, entry));

export const decryptNote = async (entry) => {
  if (!activeKey) {
    throw new Error("Unlock the note vault before continuing.");
  }

  let key = activeKey;
  if (entry.recipient_key_ciphertext) {
    key = await getRecipientNoteKey(entry);
  } else if (entry.wrapped_key) {
    key = await unwrapNoteKey(entry);
  }
  return decryptNoteWithKey(entry, key);
};

export const getRecipientNoteKey = async (entry) => {
  if (!activePrivateKey) {
    throw new Error("Unlock your vault to decrypt this invitation.");
  }

  const rawNoteKey = await globalThis.crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    activePrivateKey,
    base64ToBytes(entry.recipient_key_ciphertext),
  );
  return globalThis.crypto.subtle.importKey(
    "raw",
    rawNoteKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );
};

export const encryptNoteKeyForRecipient = async (entry, publicKey) => {
  const noteKey = await getNoteKey(entry);
  const rawNoteKey = await globalThis.crypto.subtle.exportKey("raw", noteKey);
  const recipientKey = await globalThis.crypto.subtle.importKey(
    "jwk",
    publicKey,
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
  const encrypted = await globalThis.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    recipientKey,
    rawNoteKey,
  );

  return bytesToBase64(new Uint8Array(encrypted));
};
