import { PublicKey } from "@solana/web3.js";
import { useWallet } from "../context/WalletContext";
import useRefEqual from "./useRefRequal";

export default function useWalletPublicKeys(): [
  publicKeys: PublicKey[],
  loaded: false
] {
  const wallet = useWallet();

  // todo kbt token 계정 연동
  let publicKeys = wallet ? [wallet.publicKey] : [];

  // Prevent users from re-rendering unless the list of public keys actually changes
  publicKeys = useRefEqual(
    publicKeys,
    (oldKeys: PublicKey[], newKeys: PublicKey[]) =>
      oldKeys.length === newKeys.length &&
      oldKeys.every((key, i) => key.equals(newKeys[i]))
  );

  return [publicKeys, false];
}
