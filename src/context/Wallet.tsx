import { Connection } from "@solana/web3.js";
import React, { useContext, useEffect, useState } from "react";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { useUnlockedMnemonicAndSeed } from "../utils/wallet-seed";
import { useConnection } from "./Connection";

const DEFAULT_WALLET_SELECTOR = {
  walletIndex: 0,
  importedPubkey: undefined,
  ledger: false,
};

export class Wallet {
  connection: Connection;
  type: any;
  constructor(_connection: Connection, _type: any, args: any) {
    this.connection = _connection;
    this.type = _type;
    this.provider = WalletProviderFactory.getProvider(type, args);
  }

  static create = async (connection, type, args) => {
    const instance = new Wallet(connection, type, args);
    await instance.provider.init();
    return instance;
  };

  get publicKey() {
    return this.provider.publicKey;
  }

  get allowsExport() {
    return this.type === "local";
  }

  getTokenAccountInfo = async () => {
    let accounts = await getOwnedTokenAccounts(this.connection, this.publicKey);
    return accounts
      .map(({ publicKey, accountInfo }) => {
        setInitialAccountInfo(this.connection, publicKey, accountInfo);
        return { publicKey, parsed: parseTokenAccountData(accountInfo.data) };
      })
      .sort((account1, account2) =>
        account1.parsed.mint
          .toBase58()
          .localeCompare(account2.parsed.mint.toBase58())
      );
  };

  createTokenAccount = async (tokenAddress) => {
    return await createAndInitializeTokenAccount({
      connection: this.connection,
      payer: this,
      mintPublicKey: tokenAddress,
      newAccount: new Account(),
    });
  };

  createAssociatedTokenAccount = async (splTokenMintAddress) => {
    return await createAssociatedTokenAccount({
      connection: this.connection,
      wallet: this,
      splTokenMintAddress,
    });
  };

  tokenAccountCost = async () => {
    return this.connection.getMinimumBalanceForRentExemption(
      ACCOUNT_LAYOUT.span
    );
  };

  transferToken = async (
    source,
    destination,
    amount,
    mint,
    decimals,
    memo = null,
    overrideDestinationCheck = false
  ) => {
    if (source.equals(this.publicKey)) {
      if (memo) {
        throw new Error("Memo not implemented");
      }
      return this.transferSol(destination, amount);
    }
    return await transferTokens({
      connection: this.connection,
      owner: this,
      sourcePublicKey: source,
      destinationPublicKey: destination,
      amount,
      memo,
      mint,
      decimals,
      overrideDestinationCheck,
    });
  };

  transferSol = async (destination, amount) => {
    return nativeTransfer(this.connection, this, destination, amount);
  };

  closeTokenAccount = async (publicKey, skipPreflight = false) => {
    return await closeTokenAccount({
      connection: this.connection,
      owner: this,
      sourcePublicKey: publicKey,
      skipPreflight,
    });
  };

  signTransaction = async (transaction) => {
    return this.provider.signTransaction(transaction);
  };

  createSignature = async (message) => {
    return this.provider.createSignature(message);
  };
}
interface IWalletContext {
  wallet: any;
  seed?: string;
  mnemonic?: string;
  importsEncryptionKey?: Buffer;
  walletSelector?: Function;
  setWalletSelector?: Function;
  privateKeyImports?: object;
  setPrivateKeyImports?: Function;
  accounts?: any[];
  derivedAccounts?: any[];
  addAccount?: Function;
  setAccountName?: Function;
  derivationPath?: string;
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
  const [wallet, setWallet] = useState();

  // `privateKeyImports` are accounts imported *in addition* to HD wallets
  const [privateKeyImports, setPrivateKeyImports] = useLocalStorageState(
    "walletPrivateKeyImports",
    {}
  );
  // `walletSelector` identifies which wallet to use.
  let [walletSelector, setWalletSelector] = useLocalStorageState(
    "walletSelector",
    DEFAULT_WALLET_SELECTOR
  );
  const [_hardwareWalletAccount, setHardwareWalletAccount] = useState(null);

  // `walletCount` is the number of HD wallets.
  const [walletCount, setWalletCount] = useLocalStorageState("walletCount", 1);

  if (walletSelector.ledger && !_hardwareWalletAccount) {
    walletSelector = DEFAULT_WALLET_SELECTOR;
    setWalletSelector(DEFAULT_WALLET_SELECTOR);
  }

  useEffect(() => {
    (async () => {
      if (!seed) {
        return null;
      }
      let wallet;
      if (walletSelector.ledger) {
        try {
          const onDisconnect = () => {
            setWalletSelector(DEFAULT_WALLET_SELECTOR);
            setHardwareWalletAccount(null);
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
          enqueueSnackbar(message, { variant: "error" });
          setWalletSelector(DEFAULT_WALLET_SELECTOR);
          setHardwareWalletAccount(null);
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
            : new Account(
                (() => {
                  const { nonce, ciphertext } =
                    privateKeyImports[walletSelector.importedPubkey];
                  return nacl.secretbox.open(
                    bs58.decode(ciphertext),
                    bs58.decode(nonce),
                    importsEncryptionKey
                  );
                })()
              );
        wallet = await Wallet.create(connection, "local", { account });
      }
      setWallet(wallet);
    })();
  }, [
    connection,
    seed,
    walletSelector,
    privateKeyImports,
    importsEncryptionKey,
    setWalletSelector,
    enqueueSnackbar,
    derivationPath,
  ]);
  function addAccount({ name, importedAccount, ledger }) {
    if (importedAccount === undefined) {
      name && localStorage.setItem(`name${walletCount}`, name);
      setWalletCount(walletCount + 1);
    } else {
      const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
      const plaintext = importedAccount.secretKey;
      const ciphertext = nacl.secretbox(plaintext, nonce, importsEncryptionKey);
      // `useLocalStorageState` requires a new object.
      let newPrivateKeyImports = { ...privateKeyImports };
      newPrivateKeyImports[importedAccount.publicKey.toString()] = {
        name,
        ciphertext: bs58.encode(ciphertext),
        nonce: bs58.encode(nonce),
      };
      setPrivateKeyImports(newPrivateKeyImports);
    }
  }

  const getWalletNames = () => {
    return JSON.stringify(
      [...Array(walletCount).keys()].map((idx) =>
        localStorage.getItem(`name${idx}`)
      )
    );
  };
  const [walletNames, setWalletNames] = useState(getWalletNames());
  function setAccountName(selector, newName) {
    if (selector.importedPubkey && !selector.ledger) {
      let newPrivateKeyImports = { ...privateKeyImports };
      newPrivateKeyImports[selector.importedPubkey.toString()].name = newName;
      setPrivateKeyImports(newPrivateKeyImports);
    } else {
      localStorage.setItem(`name${selector.walletIndex}`, newName);
      setWalletNames(getWalletNames());
    }
  }

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

    const importedAccounts = Object.keys(privateKeyImports).map((pubkey) => {
      const { name } = privateKeyImports[pubkey];
      return {
        selector: {
          walletIndex: undefined,
          importedPubkey: pubkey,
          ledger: false,
        },
        address: new PublicKey(bs58.decode(pubkey)),
        name: `${name} (imported)`, // TODO: do this in the Component with styling.
        isSelected: walletSelector.importedPubkey === pubkey,
      };
    });

    const accounts = derivedAccounts.concat(importedAccounts);
    return [accounts, derivedAccounts];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed, walletCount, walletSelector, privateKeyImports, walletNames]);

  let hardwareWalletAccount;
  if (_hardwareWalletAccount) {
    hardwareWalletAccount = {
      ..._hardwareWalletAccount,
      selector: {
        walletIndex: undefined,
        ledger: true,
        importedPubkey: _hardwareWalletAccount.publicKey,
        derivationPath: _hardwareWalletAccount.derivationPath,
        account: _hardwareWalletAccount.account,
        change: _hardwareWalletAccount.change,
      },
      address: _hardwareWalletAccount.publicKey,
      isSelected: walletSelector.ledger,
    };
  }

  return (
    <WalletContext.Provider
      value={{
        wallet,
        seed,
        mnemonic,
        importsEncryptionKey,
        walletSelector,
        setWalletSelector,
        privateKeyImports,
        setPrivateKeyImports,
        accounts,
        derivedAccounts,
        addAccount,
        setAccountName,
        derivationPath,
        hardwareWalletAccount,
        setHardwareWalletAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
export function useWallet() {
  return useContext(WalletContext).wallet;
}
