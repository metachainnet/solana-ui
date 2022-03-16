import Transport from "@ledgerhq/hw-transport";
import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import { Keypair, PublicKey } from "@solana/web3.js";
import { getPublicKey, getSolanaDerivationPath } from "../lib/ledger-core";
import { DERIVATION_PATH } from "../lib/wallet-seed";
import { WalletArgs } from "./Wallet";

let TRANSPORT: Transport | null;

export default class LedgerWalletProvider {
  onDisconnect: () => void;
  derivationPath: string;
  account?: Keypair;
  change?: any;
  solanaDerivatipnPath: Buffer;
  transport?: Transport;
  pubkey?: PublicKey;

  constructor(args?: WalletArgs) {
    this.onDisconnect = args?.onDisconnect || (() => {});
    this.derivationPath = args?.derivationPath || DERIVATION_PATH.bip44Change;
    this.account = args?.account || undefined;
    this.change = args?.change || undefined;
    this.solanaDerivatipnPath = getSolanaDerivationPath(
      this.account,
      this.change,
      this.derivationPath
    );
  }

  init = async () => {
    if (!TRANSPORT) {
      TRANSPORT = await TransportWebHID.create();
    }
    this.transport = TRANSPORT;
    this.pubkey = await getPublicKey(this.transport, this.solanaDerivatipnPath);
    // TODO : read accounts from ledger
    return this;
  };
}
