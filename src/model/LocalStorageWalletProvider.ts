import { Account } from "@solana/web3.js";
import { BIP32Factory } from "bip32";
import { derivePath } from "ed25519-hd-key";
import * as ecc from "tiny-secp256k1";
import nacl from "tweetnacl";
import { getUnlockedMnemonicAndSeed } from "../utils/wallet-seed";

export const DERIVATION_PATH = {
  deprecated: undefined,
  bip44: "bip44",
  bip44Change: "bip44Change",
  bip44Root: "bip44Root", // Ledger only.
};

export function getAccountFromSeed(
  seed: Buffer,
  walletIndex: number,
  dPath: string | undefined | null = undefined,
  accountIndex = 0
) {
  const derivedSeed = deriveSeed(seed, walletIndex, dPath, accountIndex);
  return new Account(
    nacl.sign.keyPair.fromSeed(derivedSeed as Buffer).secretKey
  );
}

function deriveSeed(
  seed: string | Buffer,
  walletIndex: number,
  derivationPath: string | null | undefined,
  accountIndex: number
) {
  switch (derivationPath) {
    case DERIVATION_PATH.deprecated:
      const path = `m/501'/${walletIndex}'/0/${accountIndex}`;
      return BIP32Factory(ecc)
        .fromSeed(seed as Buffer)
        .derivePath(path).privateKey;
    case DERIVATION_PATH.bip44:
      const path44 = `m/44'/501'/${walletIndex}'`;
      return derivePath(path44, seed as string).key;
    case DERIVATION_PATH.bip44Change:
      const path44Change = `m/44'/501'/${walletIndex}'/0'`;
      return derivePath(path44Change, seed as string).key;
    default:
      throw new Error(`invalid derivation path: ${derivationPath}`);
  }
}

export class LocalStorageWalletProvider {
  publicKey: any;
  listAddresses: any;
  account: any;
  constructor(args: any) {
    this.account = args.account;
    this.publicKey = this.account.publicKey;
  }

  init = async () => {
    const { seed } = await getUnlockedMnemonicAndSeed();
    this.listAddresses = async (walletCount: number) => {
      const seedBuffer = Buffer.from(seed, "hex");
      return [...Array(walletCount).keys()].map((walletIndex) => {
        let address = getAccountFromSeed(seedBuffer, walletIndex).publicKey;
        let name = localStorage.getItem(`name${walletIndex}`);
        return { index: walletIndex, address, name };
      });
    };
    return this;
  };

  //   signTransaction = async (transaction) => {
  //     transaction.partialSign(this.account);
  //     return transaction;
  //   };

  //   createSignature = (message) => {
  //     return bs58.encode(nacl.sign.detached(message, this.account.secretKey));
  //   };
}
