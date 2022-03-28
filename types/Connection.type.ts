import { Cluster, Connection } from "@solana/web3.js";

type ActionType = "CHANGE_CONNECTION" | "";
type PayloadType = Cluster;

export type ConnectionDispatchType = (action: ConnectionActionType) => void;

export type ConnectionStateType = {
  connection: Connection | undefined;
  cluster: Cluster;
};

export type ConnectionActionType = {
  type: ActionType;
  payload: PayloadType;
};
