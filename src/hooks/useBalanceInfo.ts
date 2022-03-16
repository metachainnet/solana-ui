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

export default async function useBalanceInfo(
  publicKey: PublicKey
): Promise<Balance> {
  let [accountInfo] = await useAccountInfo(publicKey);
  // todo token

  return {
    amount: accountInfo.lamports ?? 0,
    decimals: 9,
    mint: null,
    owner: publicKey,
    tokenName: "SOL",
    tokenSymbol: "SOL",
    valid: true,
  };
}
