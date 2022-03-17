import React, { useContext, useEffect, useMemo, useState } from "react";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { getAccountFromSeed } from "../model/LocalStorageWalletProvider";
import { Wallet } from "../model/Wallet";
import { useUnlockedMnemonicAndSeed } from "../utils/wallet-seed";
import { useConnection } from "./ConnectionContext";

const DEFAULT_WALLET_SELECTOR = {
  walletIndex: 0,
  importedPubkey: undefined,
  ledger: false,
};
interface IWalletContext {
  wallet: any;
  seed?: any;
  mnemonic?: any;
  importsEncryptionKey?: any;
  walletSelector?: any;
  setWalletSelector?: Function;
  privateKeyImports?: object;
  setPrivateKeyImports?: Function;
  accounts?: any[];
  derivedAccounts?: any[];
  addAccount?: Function;
  setAccountName?: Function;
  derivationPath?: any;
  hardwareWalletAccount?: null;
  setHardwareWalletAccount?: null;
}

const defaultWalletContext = {
  wallet: null,
};

const WalletContext = React.createContext<IWalletContext>(defaultWalletContext);

export const WalletProvider: React.FC<React.ReactNode> = ({ children }) => {
  const [{ mnemonic, seed, importsEncryptionKey, derivationPath }] =
    useUnlockedMnemonicAndSeed();
  const connection = useConnection();
  const [wallet, setWallet] = useState<Wallet>();

  // `walletSelector` identifies which wallet to use.
  let [walletSelector, setWalletSelector] = useLocalStorageState(
    "walletSelector",
    DEFAULT_WALLET_SELECTOR
  );

  // `walletCount` is the number of HD wallets.
  const [walletCount, setWalletCount] = useLocalStorageState("walletCount", 1);

  useEffect(() => {
    (async () => {
      if (!seed) {
        return null;
      }
      let wallet;

      if (!wallet) {
        const account = getAccountFromSeed(
          Buffer.from(seed, "hex"),
          walletSelector.walletIndex,
          derivationPath
        );

        wallet = await Wallet.create(connection, { account });
      }
      setWallet(wallet);
    })();
  }, [connection, derivationPath, seed, walletSelector.walletIndex]);

  // function addAccount({ name, importedAccount, ledger }) {
  //   if (importedAccount === undefined) {
  //     name && localStorage.setItem(`name${walletCount}`, name);
  //     setWalletCount(walletCount + 1);
  //   } else {
  //     const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  //     const plaintext = importedAccount.secretKey;
  //     const ciphertext = nacl.secretbox(plaintext, nonce, importsEncryptionKey);
  //     // `useLocalStorageState` requires a new object.
  //     let newPrivateKeyImports = { ...privateKeyImports };
  //     newPrivateKeyImports[importedAccount.publicKey.toString()] = {
  //       name,
  //       ciphertext: bs58.encode(ciphertext),
  //       nonce: bs58.encode(nonce),
  //     };
  //     setPrivateKeyImports(newPrivateKeyImports);
  //   }
  // }

  // const getWalletNames = () => {
  //   return JSON.stringify(
  //     [...Array(walletCount).keys()].map((idx) =>
  //       localStorage.getItem(`name${idx}`)
  //     )
  //   );
  // };
  // const [walletNames, setWalletNames] = useState(getWalletNames());
  // function setAccountName(selector, newName) {
  //   if (selector.importedPubkey && !selector.ledger) {
  //     let newPrivateKeyImports = { ...privateKeyImports };
  //     newPrivateKeyImports[selector.importedPubkey.toString()].name = newName;
  //     setPrivateKeyImports(newPrivateKeyImports);
  //   } else {
  //     localStorage.setItem(`name${selector.walletIndex}`, newName);
  //     setWalletNames(getWalletNames());
  //   }
  // }

  const [accounts, derivedAccounts] = useMemo(() => {
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
      let name = localStorage.getItem(`name${idx}`);
      return {
        selector: {
          walletIndex: idx,
          importedPubkey: undefined,
          ledger: false,
        },
        isSelected: walletSelector.walletIndex === idx,
        address,
        name: idx === 0 ? "Main account" : name || `Account ${idx}`,
      };
    });

    const accounts = derivedAccounts;
    return [accounts, derivedAccounts];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, walletCount, walletSelector]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        seed,
        mnemonic,
        importsEncryptionKey,
        walletSelector,
        setWalletSelector,
        accounts,
        derivedAccounts,
        derivationPath,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
export function useWallet(): Wallet {
  return useContext(WalletContext).wallet;
}

export function useWalletSelector() {
  const {
    accounts,
    derivedAccounts,
    addAccount,
    setWalletSelector,
    setAccountName,
    hardwareWalletAccount,
    setHardwareWalletAccount,
  } = useContext(WalletContext);

  return {
    accounts,
    derivedAccounts,
    addAccount,
    setAccountName,
    hardwareWalletAccount,
    setHardwareWalletAccount,
  };
}
