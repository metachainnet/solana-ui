import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import React from "react";
import { useConnectionState } from "../context/ConnectionProvider";
import { useKeypairState } from "../context/KeypairProvider";

export default function useRequestAirdrop() {
  const connection = useConnectionState().connection;
  const keypair = useKeypairState().keypair!;

  return React.useCallback(() => {
    return connection?.requestAirdrop(keypair.publicKey, LAMPORTS_PER_SOL);
  }, [connection, keypair.publicKey]);
}
