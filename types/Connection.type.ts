import { Cluster, Connection } from "@solana/web3.js";

type Action = "CHANGE_CONNECTION" | "";
type Payload = Cluster;

export type ConnectionDispatchType = (action: ConnectionActionType) => void;

export type ConnectionStateType = {
  connection: Connection | undefined;
};

export type ConnectionActionType = {
  type: Action;
  payload: Payload;
};
