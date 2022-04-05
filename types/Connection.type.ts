import { Cluster, Connection } from "@solana/web3.js";
import { Metachainnet } from "../constants/Cluster.const";

type ActionType = "CHANGE_CONNECTION" | "";
type PayloadType = Cluster | Metachainnet;

export type ConnectionDispatchType = (action: ConnectionActionType) => void;

export type ConnectionStateType = {
  connection: Connection | undefined;
  cluster: Cluster | Metachainnet;
};

export type ConnectionActionType = {
  type: ActionType;
  payload: PayloadType;
};
