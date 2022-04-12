import { Keypair } from "@solana/web3.js";

type ActionType = "UPDATE_KEYPAIR" | "GENERATE_KEYPAIR" | "DELETE_KEYPAIR";
type PayloadType = { keypair: Keypair | undefined };

export type KeypairDispatchType = (action: KeypairActionType) => void;

export type KeypairStateType = {
  keypair: Keypair | undefined;
};

export type KeypairSerialize = {
  keypair:
    | {
        publicKey: string | undefined;
        secretKey: number[] | undefined;
      }
    | undefined;
};

export type KeypairActionType = {
  type: ActionType;
  payload?: PayloadType;
};
