import { Keypair, Transaction } from "@solana/web3.js";
import base58 from "bs58";
import nacl from "tweetnacl";
import { getUnlockedMnemonicAndSeed } from "../lib/wallet-seed";
import { getAccountFromSeed, WalletArgs } from "./Wallet";

export default class LocalStorageWalletProvider {
  account: Keypair;

  constructor(args: WalletArgs) {
    this.account = args.account;
  }

  init = async () => {
    const { seed } = await getUnlockedMnemonicAndSeed();
    const addressList = async (walletCount: number) => {
      const seedBuffer = Buffer.from(seed, "hex");
      return [...Array(walletCount).keys()].map((walletIndex: number) => {
        let address = getAccountFromSeed(seedBuffer, walletIndex).publicKey;
        let name = localStorage.getItem(`name${walletIndex}`);
        return { index: walletIndex, address, name };
      });
    };
    return this;
  };

  signTransaction = async (transaction: Transaction) => {
    transaction.partialSign(this.account);
    return transaction;
  };

  createSignature = (message: Uint8Array) => {
    return base58.encode(nacl.sign.detached(message, this.account.secretKey));
  };
}
