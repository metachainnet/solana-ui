import { PublicKey } from "@solana/web3.js";
import React from "react";
import { LOCAL_STORAGE_TOKENS } from "../constants/LocalStorage.const";
import { checkFront, eqaulsArray } from "../utils/utils";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import {
  TokenActionType,
  TokenDispatchType,
  TokenSerailize,
  TokenStateType,
} from "../types/Token.type";

// React Context 선언
const TokenStateContext = React.createContext<TokenStateType>({
  tokens: [],
  selectedToken: {
    mintPubkey: null,
    account: null,
  },
});
const TokenDispatchContext = React.createContext<TokenDispatchType | undefined>(
  undefined
);

// 이전 상태와, 액션을 받아
// 새로운 상태를 반환하는 함수
const tokenReducer = (state: TokenStateType, action: TokenActionType) => {
  switch (action.type) {
    case "SELECT_TOKEN":
      if (!action.payload || !action.payload.selectedToken) {
        throw new Error(
          `Illegal Argument : action.payload에 selectedToken이 필요합니다`
        );
      }

      const {
        payload: { selectedToken },
      } = action;
      const newState = {
        ...state,
        selectedToken: {
          mintPubkey: selectedToken,
          account: null,
        },
      };
      return newState;
    case "ADD_TOKEN":
      if (!action.payload || !action.payload.addToken) {
        throw new Error(
          `Illegal Argument : action.payload에 addToken 필요합니다`
        );
      }

      const { tokens } = state;
      const {
        payload: { addToken },
      } = action;
      const newTokens = tokens.concat(addToken);
      return { ...state, tokens: newTokens };

    case "SET_TOKEN_ACCOUNT":
      if (!action.payload || !action.payload.selectedTokenAccount) {
        throw new Error(
          `Illegal Argument : action.payload에 selectedTokenAccount 필요합니다`
        );
      }

      const {
        payload: { selectedTokenAccount },
      } = action;
      return {
        ...state,
        selectedToken: {
          ...state.selectedToken,
          account: selectedTokenAccount,
        },
      };

    default:
      throw new Error(
        `Illegal State : 지원하지 않는 action.type=${action.type}`
      );
  }
};

export default function TokenProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [localStorageToken, setLocalStorageToken] =
    useLocalStorageState<TokenSerailize>(LOCAL_STORAGE_TOKENS, []);

  const [state, dispatch] = React.useReducer(tokenReducer, {
    tokens: localStorageToken?.length
      ? localStorageToken.map((it) => new PublicKey(it))
      : [],
    selectedToken: {
      mintPubkey: null,
      account: null,
    },
  });

  React.useEffect(() => {
    if (checkFront()) {
      // state와 localStorage 데이터가 달라지면 로컬스토리지 업데이트
      const newLocalStorageToken = state.tokens.map((it: PublicKey) =>
        it.toBase58()
      );
      if (!eqaulsArray(localStorageToken, newLocalStorageToken)) {
        setLocalStorageToken(newLocalStorageToken);
      }
    }
  }, [localStorageToken, state.tokens, setLocalStorageToken]);

  return (
    <TokenStateContext.Provider value={state}>
      <TokenDispatchContext.Provider value={dispatch}>
        {children}
      </TokenDispatchContext.Provider>
    </TokenStateContext.Provider>
  );
}

export const useTokenState = () => React.useContext(TokenStateContext);
export const useTokenDispatch = () => React.useContext(TokenDispatchContext);
