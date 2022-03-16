import { pbkdf2, randomBytes } from "crypto";
import { secretbox } from "tweetnacl";
import bs58 from "bs58";
import { BIP32Factory } from "bip32";
import * as ecc from "tiny-secp256k1";
import EventEmitter from "events";
import { useEffect, useState } from "react";

export type mnemonicAndSeedType = {
  mnemonic: string;
  seed: string;
};

export type unlockedmnemonicAndSeedType = {
  mnemonic?: string | null;
  seed?: string | null;
  importsEncryptionKey?: string | null;
  derivationPath?: string | null;
};

export const DERIVATION_PATH = {
  deprecated: undefined,
  bip44: "bip44",
  bip44Change: "bip44Change",
  bip44Root: "bip44Root", // Ledger only.
};

const EMPTY_MNEMONIC: unlockedmnemonicAndSeedType = {
  mnemonic: null,
  seed: null,
  importsEncryptionKey: null,
  derivationPath: null,
};

async function getExtensionUnlockedMnemonic() {
  // if (!isExtension) {
  //   return null;
  // }

  // return new Promise((resolve) => {
  //   chrome.runtime.sendMessage(
  //     {
  //       channel: "sollet_extension_mnemonic_channel",
  //       method: "get",
  //     },
  //     resolve
  //   );
  // });
  return null;
}
export const walletSeedChanged = new EventEmitter();

export function normalizeMnemonic(mnemonic: string) {
  return mnemonic.trim().split(/\s+/g).join(" ");
}

export function useHasLockedMnemonicAndSeed() {
  const [unlockedMnemonic, loading] = useUnlockedMnemonicAndSeed();

  return [
    !unlockedMnemonic.seed && typeof window !== "undefined"
      ? !!localStorage?.getItem("locked")
      : false,
    loading,
  ];
}

export function useUnlockedMnemonicAndSeed(): [
  unlockedmnemonicAndSeedType,
  boolean
] {
  const [currentUnlockedMnemonic, setCurrentUnlockedMnemonic] =
    useState<unlockedmnemonicAndSeedType>({});

  useEffect(() => {
    walletSeedChanged.addListener("change", setCurrentUnlockedMnemonic);
    unlockedMnemonicAndSeed.then(setCurrentUnlockedMnemonic);
    return () => {
      walletSeedChanged.removeListener("change", setCurrentUnlockedMnemonic);
    };
  }, []);

  return !currentUnlockedMnemonic
    ? [EMPTY_MNEMONIC, true]
    : [currentUnlockedMnemonic, false];
}

let unlockedMnemonicAndSeed = (async () => {
  if (typeof window !== "undefined") {
    const unlockedExpiration = localStorage.getItem("unlockedExpiration");
    // Left here to clean up stored mnemonics from previous method
    if (unlockedExpiration && Number(unlockedExpiration) < Date.now()) {
      localStorage.removeItem("unlocked");
      localStorage.removeItem("unlockedExpiration");
    }
    const stored = JSON.parse(
      (await getExtensionUnlockedMnemonic()) ||
        sessionStorage.getItem("unlocked") ||
        localStorage.getItem("unlocked") ||
        "null"
    );
    if (stored === null) {
      return EMPTY_MNEMONIC;
    }
    return {
      importsEncryptionKey: deriveImportsEncryptionKey(stored.seed),
      ...stored,
    };
  }
})();

export async function generateMnemonicAndSeed(): Promise<mnemonicAndSeedType> {
  const bip39 = await import("bip39");
  const mnemonic = bip39.generateMnemonic(256);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return { mnemonic, seed: Buffer.from(seed).toString("hex") };
}

export async function storeMnemonicAndSeed(
  mnemonic: string,
  seed: string,
  password: string,
  derivationPath: string
) {
  const plaintext = JSON.stringify({ mnemonic, seed, derivationPath });
  if (password) {
    const salt = randomBytes(16);
    const kdf = "pbkdf2";
    const iterations = 100000;
    const digest = "sha256";
    const key = await deriveEncryptionKey(password, salt, iterations, digest);
    const nonce = randomBytes(secretbox.nonceLength);
    const encrypted = secretbox(Buffer.from(plaintext), nonce, key);
    localStorage.setItem(
      "locked",
      JSON.stringify({
        encrypted: bs58.encode(encrypted),
        nonce: bs58.encode(nonce),
        kdf,
        salt: bs58.encode(salt),
        iterations,
        digest,
      })
    );
    localStorage.removeItem("unlocked");
  } else {
    localStorage.setItem("unlocked", plaintext);
    localStorage.removeItem("locked");
  }
  sessionStorage.removeItem("unlocked");
  // if (isExtension) {
  //   chrome.runtime.sendMessage({
  //     channel: "sollet_extension_mnemonic_channel",
  //     method: "set",
  //     data: "",
  //   });
  // }
  const importsEncryptionKey = deriveImportsEncryptionKey(seed);
  setUnlockedMnemonicAndSeed(
    mnemonic,
    seed,
    importsEncryptionKey,
    derivationPath
  );
}
async function deriveEncryptionKey(
  password: string,
  salt: Buffer | Uint8Array,
  iterations: number,
  digest: string
): Promise<Uint8Array> {
  return new Promise((resolve, reject) =>
    pbkdf2(
      password,
      salt,
      iterations,
      secretbox.keyLength,
      digest,
      (err, key) => (err ? reject(err) : resolve(key))
    )
  );
}
// Returns the 32 byte key used to encrypt imported private keys.
function deriveImportsEncryptionKey(seed: string) {
  // SLIP16 derivation path.
  const bip32 = BIP32Factory(ecc);
  return bip32.fromSeed(Buffer.from(seed, "hex")).derivePath("m/10016'/0")
    .privateKey;
}

function setUnlockedMnemonicAndSeed(
  mnemonic: string,
  seed: string,
  importsEncryptionKey: Buffer | undefined,
  derivationPath: string
) {
  const data = {
    mnemonic,
    seed,
    importsEncryptionKey,
    derivationPath,
  };
  unlockedMnemonicAndSeed = Promise.resolve(data);
  walletSeedChanged.emit("change", data);
}

export async function loadMnemonicAndSeed(
  password: string,
  stayLoggedIn: boolean
) {
  const {
    encrypted: encodedEncrypted,
    nonce: encodedNonce,
    salt: encodedSalt,
    iterations,
    digest,
  } = JSON.parse(localStorage.getItem("locked") || "{}");
  const encrypted = bs58.decode(encodedEncrypted);
  const nonce = bs58.decode(encodedNonce);
  const salt = bs58.decode(encodedSalt);
  const key = await deriveEncryptionKey(password, salt, iterations, digest);
  const plaintext = secretbox.open(encrypted, nonce, key);
  if (!plaintext) {
    throw new Error("Incorrect password");
  }
  const decodedPlaintext = Buffer.from(plaintext).toString();
  const { mnemonic, seed, derivationPath } = JSON.parse(decodedPlaintext);
  if (stayLoggedIn) {
    // if (isExtension) {
    //   chrome.runtime.sendMessage({
    //     channel: "sollet_extension_mnemonic_channel",
    //     method: "set",
    //     data: decodedPlaintext,
    //   });
    // } else {
    //   sessionStorage.setItem("unlocked", decodedPlaintext);
    // }
    sessionStorage.setItem("unlocked", decodedPlaintext);
  }
  const importsEncryptionKey = deriveImportsEncryptionKey(seed);
  setUnlockedMnemonicAndSeed(
    mnemonic,
    seed,
    importsEncryptionKey,
    derivationPath
  );
  return { mnemonic, seed, derivationPath };
}
