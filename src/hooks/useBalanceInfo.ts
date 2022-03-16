import { PublicKey } from "@solana/web3.js";
import useAccountInfo from "./useAccountInfo";

export interface Balance {
  amount: number;
  decimals: number;
  mint: any;
  owner: PublicKey;
  tokenName: string;
  tokenSymbol: string;
  valid: boolean;
}

export default function useBalanceInfo(publicKey: PublicKey): Balance {
  let [accountInfo, accountInfoLoaded] = useAccountInfo(publicKey);
  // todo token

  return {
    amount: accountInfo?.lamports ?? 0,
    decimals: 9,
    mint: null,
    owner: publicKey,
    tokenName: "SOL",
    tokenSymbol: "SOL",
    valid: true,
  };
}
