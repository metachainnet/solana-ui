import { PublicKey } from "@solana/web3.js";

export function abbreviateAddress(address: PublicKey) {
  const base58 = address.toBase58();
  return `${base58.slice(0, 4)}…${base58.slice(base58.length - 4)}`;
}
