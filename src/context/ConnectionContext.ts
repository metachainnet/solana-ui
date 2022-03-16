import { clusterApiUrl, Connection } from "@solana/web3.js";
import React, { useContext } from "react";

const ConnectionContext = React.createContext<{
  endpoint: string;
  setEndpoint: (url: String) => void;
  connection: Connection;
} | null>(null);

export function useConnection(): Connection {
  // const context = useContext(ConnectionContext);
  // if (!context) {
  //   throw new Error(`Missing connection context`);
  // }
  // return context.connection;
  return new Connection(clusterApiUrl("devnet"), "confirmed");
}
