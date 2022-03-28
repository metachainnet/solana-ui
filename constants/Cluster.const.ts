import { Cluster } from "@solana/web3.js";

enum ClusterEnum {
  mainnet = "mainnet-beta",
  testnet = "testnet",
  devnet = "devnet",
}

type ClusterOption = {
  cluster: Cluster;
  displayName: string;
};

export const DEFAULT_CLUSTER: Cluster = ClusterEnum.testnet;

export const ClusterOptions: ClusterOption[] = [
  {
    cluster: ClusterEnum.mainnet,
    displayName: "Mainnet",
  },
  {
    cluster: ClusterEnum.testnet,
    displayName: "Testnet",
  },
  {
    cluster: ClusterEnum.devnet,
    displayName: "Devnet",
  },
];
