import LedgerWalletProvider from "./LedgerWalletProvider";
import LocalStorageWalletProvider from "./LocalStorageWalletProvider";
import { WalletArgs } from "./Wallet";

export default class WalletProviderFactory {
  static getProvider(type: string, args: WalletArgs) {
    switch (type) {
      case "local":
        return new LocalStorageWalletProvider(args);
      case "ledger":
        return new LedgerWalletProvider(args);
    }

    throw new Error("지원하지 않는 형식입니다 ");
  }
}
