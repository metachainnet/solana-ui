import { Connection, Keypair } from "@solana/web3.js";
import BIP32Factory from "bip32";
import { derivePath } from "ed25519-hd-key";
import * as ecc from "tiny-secp256k1";
import nacl from "tweetnacl";
import { DERIVATION_PATH } from "../lib/wallet-seed";
import LedgerWalletProvider from "./LedgerWalletProvider";
import LocalStorageWalletProvider from "./LocalStorageWalletProvider";
import WalletProviderFactory from "./WalletProviderFactory";

export default class Wallet {
  connection: Connection;
  type: "local" | "ledger";
  provider: LedgerWalletProvider | LocalStorageWalletProvider; // todo : 인터페이스로 추상화 필요

  private constructor(
    connection: Connection,
    type: "local" | "ledger",
    args: WalletArgs
  ) {
    this.connection = connection;
    this.type = type;
    this.provider = WalletProviderFactory.getProvider(type, args);
  }

  static create = async (
    connection: Connection,
    type: "local" | "ledger",
    args: any
  ) => {
    const instance = new Wallet(connection, type, args);
    await instance.provider.init();
    return instance;
  };
}

export interface WalletArgs {
  onDisconnect?: () => void;
  derivationPath: string;
  account: Keypair;
  change: any;
}

export const getAccountFromSeed = (
  seed: Buffer,
  walletIndex: number,
  dPath: any = undefined,
  accountIndex: number = 0
) => {
  const derivedSeed = deriveSeed(seed, walletIndex, dPath, accountIndex);
  const keypair = nacl.sign.keyPair.fromSeed(derivedSeed);
  return Keypair.fromSecretKey(keypair.secretKey);
};

const deriveSeed = (
  seed: Buffer,
  walletIndex: number,
  derivationPath: string,
  accountIndex: number
) => {
  switch (derivationPath) {
    case DERIVATION_PATH.deprecated:
      const path = `m/501/${walletIndex}'/0${accountIndex}`;
      return BIP32Factory(ecc).fromSeed(seed).derivePath(path).privateKey;
    case DERIVATION_PATH.bip44:
      const path44 = `m/44'/501'/${walletIndex}'`;
      return derivePath(path44, seed).key;
    case DERIVATION_PATH.bip44Change:
      const path44Change = `m/44'/501'/${walletIndex}'/0'`;
      return derivePath(path44Change, seed).key;
    default:
      throw new Error(`in valid derivation path: ${derivationPath}`);
  }
};
