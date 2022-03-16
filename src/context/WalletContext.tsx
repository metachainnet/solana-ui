import { PublicKey } from "@solana/web3.js";
import React, { useContext, useEffect, useMemo, useState } from "react";
import useListener from "../hooks/useListener";
import useLocalStorageState from "../hooks/useLocalStorageState";
import { useConnection } from "./ConnectionContext";
import {
  useUnlockedMnemonicAndSeed,
  walletSeedChanged,
} from "../lib/wallet-seed";
import Wallet, { getAccountFromSeed } from "../model/Wallet";

class Account {
  selector: WalletSelector;
  isSelected: boolean;
  address: PublicKey;
  // todo name

  constructor(
    selector: WalletSelector,
    isSelected: boolean,
    address: PublicKey
  ) {
    this.selector = selector;
    this.isSelected = isSelected;
    this.address = address;
  }
}

class WalletSelector {
  walletIndex: number;
  importedPubkey?: string;
  ledger?: boolean;

  constructor(
    walletIndex: number,
    importedPubkey: string | undefined,
    ledger: boolean | undefined
  ) {
    this.walletIndex = walletIndex;
    this.importedPubkey = importedPubkey;
    this.ledger = ledger;
  }

  static DEFAULT: WalletSelector = new WalletSelector(0, undefined, undefined);
}

const WalletContext = React.createContext(null);

export function useWallet() {
  return useContext(WalletContext).wallet;
}

export function WalletProvider({ children }) {
  useListener(walletSeedChanged, "change");

  const [{ mnemonic, seed, importsEncrpytionKey, derivationPath }] =
    useUnlockedMnemonicAndSeed();
  const connection = useConnection();
  const [wallet, setWallet] = useState<Wallet | null>(null);

  console.log(mnemonic, seed, importsEncrpytionKey, derivationPath);

  // todo privateKeyImports

  const [walletSelector, setWalletSelector] =
    useLocalStorageState<WalletSelector>(
      "walletSelector",
      WalletSelector.DEFAULT
    );

  const [walletCount, setWalletCount] = useLocalStorageState<number>(
    "walletCount",
    1
  );

  useEffect(() => {
    (async () => {
      console.log(seed, walletSelector);
      if (!seed) {
        return null;
      }

      let wallet: Wallet | null = null;

      if (walletSelector.ledger) {
        try {
          const onDisconnect = () => {
            setWalletSelector(WalletSelector.DEFAULT);
          };

          const args = {
            onDisconnect,
            derivationPath: walletSelector.derivationPath,
            account: walletSelector.account,
            change: walletSelector.change,
          };
          wallet = await Wallet.create(connection, "ledger", args);
        } catch (e) {
          console.log(`received error using ledger wallet: ${e}`);
          let message = "Received error unlocking ledger";
          if (e.statusCode) {
            message += `: ${e.statusCode}`;
          }
          setWalletSelector(WalletSelector.DEFAULT);
          return;
        }
      }

      if (!wallet) {
        const account =
          walletSelector.walletIndex !== undefined
            ? getAccountFromSeed(
                Buffer.from(seed, "hex"),
                walletSelector.walletIndex,
                derivationPath
              )
            : null;
        // todo private key imports

        wallet = await Wallet.create(connection, "local", { account });
      }
      setWallet(wallet);
    })();
  }, [connection, seed, walletSelector, setWalletSelector, derivationPath]);

  const [accounts, derivedAccounts]: [Account[], Account[]] = useMemo(() => {
    if (!seed) {
      return [[], []];
    }

    const seedBuffer = Buffer.from(seed, "hex");
    const derivedAccounts = [...Array(walletCount).keys()].map((idx) => {
      let address = getAccountFromSeed(
        seedBuffer,
        idx,
        derivationPath
      ).publicKey;

      // todo account name

      return new Account(
        new WalletSelector(idx, undefined, false),
        walletSelector.walletIndex === idx,
        address
      );
    });

    // todo kbt : imported accounts
    return [derivedAccounts, derivedAccounts];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, walletCount, walletSelector]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        seed,
        mnemonic,
        importsEncrpytionKey,
        walletSelector,
        accounts,
        setWalletSelector,
        derivationPath,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export default function useWalletSelector() {
  const {
    accounts,
    dereivedAccounts,
    setWalletSelector,
    // addAccount,
    // setAccountName,
    // hardwareWalletAccount,
    // setHardwareWalletAccount,
  } = useContext(WalletContext);

  return {
    accounts,
    dereivedAccounts,
    setWalletSelector,
    // addAccount,
    // setAccountName,
    // hardwareWalletAccount,
    // setHardwareWalletAccount
  };
}
