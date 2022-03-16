import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import { useConnection } from "../context/ConnectionContext";
import useWalletSelector, { useWallet } from "../context/WalletContext";
import useBalanceInfo, { Balance } from "../hooks/useBalanceInfo";
import useWalletPublicKeys from "../hooks/useWalletPublicKeys";
import { abbreviateAddress } from "../lib/utils";
import TokenIcon from "./TokenIcon";

export default function BalancesList() {
  const wallet = useWallet();
  const [publicKeys, loaded] = useWalletPublicKeys();
  const { accounts } = useWalletSelector();

  return <BalancesList></BalancesList>;
}

const BalanceListItem = async ({ publicKey }: { publicKey: PublicKey }) => {
  const wallet = useWallet();
  const balanceInfo = await useBalanceInfo(publicKey);
  const connection = useConnection();

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
      <ListItem button>
        <ListItemIcon>
          <TokenIcon mint={mint} tokenName={tokenName} url={"test"} size={28} />
        </ListItemIcon>
        <div style={{ display: "flex", flex: 1 }}>
          <ListItemText primary={tokenName} secondary={subtitle} />
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
      </ListItem>
    </>
  );
};
