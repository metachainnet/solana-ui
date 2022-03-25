import { Keypair } from "@solana/web3.js";
import React from "react";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import {
  KeypairActionType,
  KeypairDispatchType,
  KeypairSerialize,
  KeypairStateType,
} from "../types/Keypair.type";

const KeypairStateContext = React.createContext<KeypairStateType>({
  keypair: undefined,
});
const KeypairDispatchContext = React.createContext<
  KeypairDispatchType | undefined
>(undefined);

const keypairReducer = (state: KeypairStateType, action: KeypairActionType) => {
  switch (action.type) {
    case "UPDATE_KEYPAIR":
      return { ...state, ...action.payload };
    case "GENERATE_KEYPAIR":
      const keypair = Keypair.generate();
      return { ...state, keypair };
    case "DELETE_KEYPAIR":
      return {
        ...state,
        keypair: undefined,
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

export default function KeypairProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [localStorageKeypair, setLocalStorageKeypair] =
    useLocalStorageState<KeypairSerialize>("encrypted", {
      keypair: {
        publicKey: undefined,
        secretKey: undefined,
      },
    });
  const [state, dispatch] = React.useReducer(
    keypairReducer,
    !!localStorageKeypair?.keypair?.secretKey?.length
      ? {
          keypair: Keypair.fromSecretKey(
            Uint8Array.from(localStorageKeypair.keypair.secretKey)
          ),
        }
      : {
          keypair: undefined,
        }
  );

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (
        state.keypair?.publicKey.toBase58() !==
        localStorageKeypair.keypair?.publicKey
      ) {
        setLocalStorageKeypair({
          keypair: {
            publicKey: state.keypair?.publicKey.toBase58(),
            secretKey: Array.from(state.keypair?.secretKey || []),
          },
        });
      }
    }
  }, [
    localStorageKeypair?.keypair,
    setLocalStorageKeypair,
    state.keypair?.publicKey,
    state.keypair?.secretKey,
  ]);
  return (
    <KeypairStateContext.Provider value={state}>
      <KeypairDispatchContext.Provider value={dispatch}>
        {children}
      </KeypairDispatchContext.Provider>
    </KeypairStateContext.Provider>
  );
}

export const useKeypairState = () => React.useContext(KeypairStateContext);
export const useKeypairDispatch = () =>
  React.useContext(KeypairDispatchContext);
