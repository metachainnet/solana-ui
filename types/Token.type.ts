import { Account } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

type ActionType = "ADD_TOKEN" | "SET_TOKEN_ACCOUNT" | "SELECT_TOKEN";
type PayloadType = {
  selectedToken?: PublicKey | undefined;
  addToken?: PublicKey | undefined;
  selectedTokenAccount?: Account | undefined;
};

export type TokenDispatchType = (action: TokenActionType) => void;

export type TokenStateType = {
  tokens: PublicKey[];
  selectedToken: {
    mintPubkey: PublicKey | null;
    account: Account | null;
  };
};

export type TokenSerailize = string[];

export type TokenActionType = {
  type: ActionType;
  payload?: PayloadType;
};
