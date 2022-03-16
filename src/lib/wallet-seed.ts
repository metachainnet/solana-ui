import BIP32Factory from "bip32";
import bs58 from "bs58";
import * as ecc from "tiny-secp256k1";
import { pbkdf2 } from "crypto";
import { randomBytes, secretbox } from "tweetnacl";
import EventEmitter from "events";
import { useEffect, useState } from "react";

// ********** DECLARE VARIABLES START ********** //
class Mnemonic {
  mnemonic?: string;
  seed?: string;
  importsEncrpytionKey?: string;
  derivationPath?: string;

  constructor(
    mnemonic?: string,
    seed?: string,
    importsEncryptionKey?: string,
    derivationPath?: string
  ) {
    this.mnemonic = mnemonic;
    this.seed = seed;
    this.importsEncrpytionKey = importsEncryptionKey;
    this.derivationPath = derivationPath;
  }
}

export interface GenerateMnenomicAndSeedParam {
  mnemonic: string;
  seed: string;
}

/**
 * Persisted Mnemonic
 */
interface LockedMnemonic {
  encrypted: string;
  nonce: string;
  salt: string;
  iterations: number;
  digest: string;
}

const bip32 = BIP32Factory(ecc);
export const walletSeedChanged = new EventEmitter();

export const KEY_UNLOCKED = "unlocked";
export const KEY_UNLOCKED_EXPIRATION = "unlockedExpiration";
export const KEY_LOCKED = "locked";

const EMPTY_MNEMONIC = new Mnemonic(undefined, undefined, undefined, undefined);

export const DERIVATION_PATH = {
  deprecated: undefined,
  bip44: "bip44",
  bip44Change: "bip44Change",
  bip44Root: "bip44Root",
};
// ********** DECLARE VARIABLES END ********** //

let unlockedMnemonicAndSeed = (async () => {
  if (typeof localStorage === "undefined") return null;

  const unlockedExpiration = localStorage.getItem(KEY_UNLOCKED_EXPIRATION);

  if (unlockedExpiration && Number(unlockedExpiration) < Date.now()) {
    localStorage.removeItem(KEY_UNLOCKED);
    localStorage.removeItem(KEY_UNLOCKED_EXPIRATION);
  }

  const stored = JSON.parse(
    sessionStorage.getItem(KEY_UNLOCKED) ||
      localStorage.getItem(KEY_UNLOCKED) ||
      "null"
  );

  if (!stored) {
    return EMPTY_MNEMONIC;
  }

  return {
    importsEncryptionKey: deriveImportsEncryptionKey(stored.seed),
    ...stored,
  };
})();

function deriveImportsEncryptionKey(seed: string) {
  return bip32.fromSeed(Buffer.from(seed, "hex")).derivePath("m/10016'/0")
    .privateKey;
}

/**
 * 암호화된 Mnemonic과 Seed가 있는지 확인하는 hooks
 * @returns
 */
export function useHasLockedMnemonicAndSeed() {
  const [unlockedMnemonic, loading] = useUnlockedMnemonicAndSeed();

  let check = !unlockedMnemonic.seed;
  if (typeof localStorage !== "undefined") {
    check = check && !!localStorage.getItem(KEY_LOCKED);
  }

  return [check, loading];
}

/**
 * 암호화가 풀린 Mnemonic과 Seed가 있는지 확인하는 hooks
 * @returns
 */
export function useUnlockedMnemonicAndSeed(): [Mnemonic, boolean] {
  const [currentUnlockedMnemonic, setCurrentUnlockedMnemonic] =
    useState<Mnemonic | null>(null);

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

/**
 * Mnemonic And Seed 생성
 * @returns
 */
export async function generateMnemonicAndSeed(): Promise<GenerateMnenomicAndSeedParam> {
  const bip39 = await import("bip39"); // bip39는 mnemonic code를 설명하는 표준임
  const mnemonic = bip39.generateMnemonic(256);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return { mnemonic, seed: Buffer.from(seed).toString("hex") };
}

/**
 * Mnemonic And Seed을 Local Storage에 저장
 */
export async function storeMnemonicAndSeed(
  mnemonic: string,
  seed: string,
  password: string,
  derivationPath: string
) {
  const plainText = JSON.stringify({
    mnemonic,
    seed,
    derivationPath,
  });

  // 암호화
  if (password) {
    const salt = randomBytes(16);
    const kdf = "pbkdf2";
    const iterations = 100000;
    const digest = "sha256";
    const key = await deriveEncryptionKey(password, salt, iterations, digest);
    const nonce = randomBytes(secretbox.nonceLength);
    const encrypted = secretbox(Buffer.from(plainText), nonce, key);

    localStorage.setItem(
      KEY_LOCKED,
      JSON.stringify({
        encrypted: bs58.encode(encrypted),
        nonce: bs58.encode(nonce),
        kdf,
        salt: bs58.encode(salt),
        iterations,
        digest,
      })
    );

    localStorage.removeItem(KEY_UNLOCKED);
  } else {
    localStorage.setItem(KEY_UNLOCKED, plainText);
    localStorage.removeItem(KEY_LOCKED);
  }
  sessionStorage.removeItem(KEY_UNLOCKED);
}

async function deriveEncryptionKey(
  password,
  salt,
  iterations,
  digest
): Promise<Buffer> {
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

export async function loadMnemonicAndSeed(password: string) {
  const lockedMnemonic = JSON.parse(
    localStorage.getItem(KEY_LOCKED)!
  ) as LockedMnemonic;

  const {
    encrypted: encodedEncrypted,
    nonce: encodedNonce,
    salt: encodedSalt,
    iterations,
    digest,
  } = lockedMnemonic;

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
  const importsEncrpytionKey = deriveImportsEncryptionKey(seed);
  setUnlockedMnemonicAndSeed(
    mnemonic,
    seed,
    importsEncrpytionKey!,
    derivationPath
  );
  return { mnemonic, seed, derivationPath };
}

function setUnlockedMnemonicAndSeed(
  mnemonic: string,
  seed: string,
  importsEncrpytionKey: Buffer,
  derivationPath: string
) {
  const data = {
    mnemonic,
    seed,
    importsEncrpytionKey,
    derivationPath,
  };

  unlockedMnemonicAndSeed = Promise.resolve(data);
  walletSeedChanged.emit("change", data);
}

export function normalizeMnemonic(mnemonic: string) {
  const converted = mnemonic.trim().split(/\s+/g).join(" ");
  return converted;
}
