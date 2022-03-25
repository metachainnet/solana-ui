import { Cluster, clusterApiUrl, Connection } from "@solana/web3.js";
import React from "react";
import {
  ConnectionActionType,
  ConnectionDispatchType,
  ConnectionStateType,
} from "../types/Connection.type";

const createNewConnection = (cluster: Cluster) =>
  new Connection(clusterApiUrl(cluster));

const connectionReducer = (
  state: ConnectionStateType,
  action: ConnectionActionType
) => {
  switch (action.type) {
    case "CHANGE_CONNECTION":
      return {
        ...state,
        connection: createNewConnection(action.payload),
      };

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};

const ConnectionStateContext = React.createContext<ConnectionStateType>({
  connection: undefined,
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
    connection: createNewConnection("mainnet-beta"),
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
