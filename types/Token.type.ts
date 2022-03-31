import { PublicKey } from "@solana/web3.js";

type ActionType = "SELECT_TOKEN" | "ADD_TOKEN";
type PayloadType = {
  selectedToken?: PublicKey | undefined;
  addToken?: PublicKey | undefined;
};

export type TokenDispatchType = (action: TokenActionType) => void;

export type TokenStateType = {
  tokens: PublicKey[];
  selectedToken: PublicKey | null;
};

export type TokenSerailize = string[];

export type TokenActionType = {
  type: ActionType;
  payload?: PayloadType;
};
