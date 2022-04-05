import { Cluster } from "@solana/web3.js";

export type Metachainnet = "metachainnet";

enum ClusterEnum {
  mainnet = "mainnet-beta",
  testnet = "testnet",
  devnet = "devnet",
  metachainnet = "metachainnet",
}

type ClusterOption = {
  cluster: Cluster | Metachainnet;
  displayName: string;
};

export const DEFAULT_CLUSTER: Cluster | Metachainnet = ClusterEnum.metachainnet;

export const ClusterOptions: ClusterOption[] = [
  {
    cluster: ClusterEnum.metachainnet,
    displayName: "Metaverse2Chain",
  },
  {
    cluster: ClusterEnum.mainnet,
    displayName: "Solana - Mainnet",
  },
  {
    cluster: ClusterEnum.devnet,
    displayName: "Solana - Devnet",
  },
  {
    cluster: ClusterEnum.testnet,
    displayName: "Solana - Testnet",
  },
];
