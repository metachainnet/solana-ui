import { PublicKey } from "@solana/web3.js";
import React, { useEffect, useMemo, useState } from "react";
import { useConnection } from "../context/ConnectionContext";
import { useWallet } from "../context/WalletContext";
import useBalanceInfo, { Balance } from "../hooks/useBalanceInfo";
import { useCallAsync } from "../hooks/useCallAsync";
import useWalletPublicKeys from "../hooks/useWalletPublicKeys";
import { abbreviateAddress } from "../lib/utils";
import TokenIcon from "./TokenIcon";

export default function BalancesList() {
  const wallet = useWallet();
  const [publicKeys, loaded] = useWalletPublicKeys();

  if (!wallet) {
    return <p>Loading...</p>;
  }

  return (
    <>
      {publicKeys.map((pk) => (
        <BalanceListItem key={pk.toString()} publicKey={pk} />
      ))}
    </>
  );
}

const BalanceListItem = ({ publicKey }: { publicKey: PublicKey }) => {
  const wallet = useWallet();
  const balanceInfo = useBalanceInfo(publicKey);
  const connection = useConnection();
  const callAsync = useCallAsync();

  // Valid states:
  //  * undefined => loading.
  //  * null => not found.
  //  * else => price is loaded.
  const [price, setPrice] = useState<number | null>(null);

  useEffect(() => {
    if (balanceInfo) {
      if (balanceInfo.tokenSymbol) {
        const coin = balanceInfo.tokenSymbol.toUpperCase();
        // Don't fetch USD stable coins. Mark to 1 USD.
        if (coin === "USDT" || coin === "USDC") {
          setPrice(1);
        } else {
          setPrice(null);
        }
        // todo kbt serum market
      } else {
        setPrice(null);
      }
    }
  }, [price, balanceInfo, connection]);

  if (!balanceInfo) {
    return <p>Loading...</p>;
  }

  let { amount, decimals, mint, tokenName, tokenSymbol } = balanceInfo;
  tokenName = tokenName ?? abbreviateAddress(mint);

  // todo : Fetch and cache the associated token address

  const subtitle = <p>{publicKey.toBase58()}</p>;

  return (
    <>
      <TokenIcon mint={mint} tokenName={tokenName} url={undefined} size={28} />
      <div style={{ display: "flex", flex: 1 }}>
        <p>
          {tokenName}, {amount}, {decimals}, {tokenSymbol}
        </p>
        {subtitle}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          {price}
        </div>
      </div>
    </>
  );
};
