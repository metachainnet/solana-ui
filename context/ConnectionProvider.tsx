import { Cluster, clusterApiUrl, Connection } from "@solana/web3.js";
import React from "react";
import { DEFAULT_CLUSTER, Metachainnet } from "../constants/Cluster.const";
import {
  ConnectionActionType,
  ConnectionDispatchType,
  ConnectionStateType,
} from "../types/Connection.type";

const createNewConnection = (cluster: Cluster | Metachainnet) =>
  new Connection(getEndpoint(cluster), "recent");

/**
 * 클러스터 타입을 받아 엔드포인트를 반환하는 함수
 * @param cluster : 솔라나 클러스터 or 메타체인넷
 * @returns 엔드포인트 url
 */
const getEndpoint = (cluster: Cluster | Metachainnet) => {
  switch (cluster) {
    case "mainnet-beta":
    case "devnet":
    case "testnet":
      return clusterApiUrl(cluster);
    case "metachainnet":
      return "http://35.78.34.141:8899";
  }
};

const connectionReducer = (
  state: ConnectionStateType,
  action: ConnectionActionType
) => {
  switch (action.type) {
    case "CHANGE_CONNECTION":
      return {
        ...state,
        connection: createNewConnection(action.payload),
        cluster: action.payload,
      };

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const ConnectionStateContext = React.createContext<ConnectionStateType>({
  connection: undefined,
  cluster: DEFAULT_CLUSTER,
});
const ConnectionDispatchContext = React.createContext<
  ConnectionDispatchType | undefined
>(undefined);

export default function ConnectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = React.useReducer(connectionReducer, {
    connection: createNewConnection(DEFAULT_CLUSTER),
    cluster: DEFAULT_CLUSTER,
  });
  return (
    <ConnectionStateContext.Provider value={state}>
      <ConnectionDispatchContext.Provider value={dispatch}>
        {children}
      </ConnectionDispatchContext.Provider>
    </ConnectionStateContext.Provider>
  );
}

export const useConnectionState = () =>
  React.useContext(ConnectionStateContext);
export const useConnectionDispatch = () =>
  React.useContext(ConnectionDispatchContext);
