import { Cluster } from "@solana/web3.js";

export enum ClusterEnum {
  mainnet = "mainnet-beta",
  testnet = "testnet",
  devnet = "devnet",
}

type ClusterOption = {
  [key in Cluster]: Cluster;
};

export const DEFAULT_CLUSTER: Cluster = ClusterEnum.testnet;

// export const ClusterOptions: ClusterOption = {};
