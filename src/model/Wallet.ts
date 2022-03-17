import { Connection, Keypair } from "@solana/web3.js";
import BIP32Factory from "bip32";
import { derivePath } from "ed25519-hd-key";
import * as ecc from "tiny-secp256k1";
import nacl from "tweetnacl";
import { DERIVATION_PATH } from "../lib/wallet-seed";
import { LocalStorageWalletProvider } from "./LocalStorageWalletProvider";

export class Wallet {
  connection: Connection;
  provider: LocalStorageWalletProvider;

  constructor(_connection: Connection, args: any) {
    this.connection = _connection;
    this.provider = new LocalStorageWalletProvider(args);
  }

  static create = async (connection: Connection, args: any) => {
    const instance = new Wallet(connection, args);
    await instance.provider.init();
    return instance;
  };

  get publicKey() {
    return this.provider.publicKey;
  }

  // getTokenAccountInfo = async () => {
  //   let accounts = await getOwnedTokenAccounts(this.connection, this.publicKey);
  //   return accounts
  //     .map(({ publicKey, accountInfo }) => {
  //       setInitialAccountInfo(this.connection, publicKey, accountInfo);
  //       return { publicKey, parsed: parseTokenAccountData(accountInfo.data) };
  //     })
  //     .sort((account1, account2) =>
  //       account1.parsed.mint
  //         .toBase58()
  //         .localeCompare(account2.parsed.mint.toBase58())
  //     );
  // };

  // createTokenAccount = async (tokenAddress) => {
  //   return await createAndInitializeTokenAccount({
  //     connection: this.connection,
  //     payer: this,
  //     mintPublicKey: tokenAddress,
  //     newAccount: new Account(),
  //   });
  // };

  // createAssociatedTokenAccount = async (splTokenMintAddress) => {
  //   return await createAssociatedTokenAccount({
  //     connection: this.connection,
  //     wallet: this,
  //     splTokenMintAddress,
  //   });
  // };

  // tokenAccountCost = async () => {
  //   return this.connection.getMinimumBalanceForRentExemption(
  //     ACCOUNT_LAYOUT.span
  //   );
  // };

  // transferToken = async (
  //   source,
  //   destination,
  //   amount,
  //   mint,
  //   decimals,
  //   memo = null,
  //   overrideDestinationCheck = false
  // ) => {
  //   if (source.equals(this.publicKey)) {
  //     if (memo) {
  //       throw new Error("Memo not implemented");
  //     }
  //     return this.transferSol(destination, amount);
  //   }
  //   return await transferTokens({
  //     connection: this.connection,
  //     owner: this,
  //     sourcePublicKey: source,
  //     destinationPublicKey: destination,
  //     amount,
  //     memo,
  //     mint,
  //     decimals,
  //     overrideDestinationCheck,
  //   });
  // };

  // transferSol = async (destination, amount) => {
  //   return nativeTransfer(this.connection, this, destination, amount);
  // };

  // closeTokenAccount = async (publicKey, skipPreflight = false) => {
  //   return await closeTokenAccount({
  //     connection: this.connection,
  //     owner: this,
  //     sourcePublicKey: publicKey,
  //     skipPreflight,
  //   });
  // };

  // signTransaction = async (transaction) => {
  //   return this.provider.signTransaction(transaction);
  // };

  // createSignature = async (message) => {
  //   return this.provider.createSignature(message);
  // };
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
