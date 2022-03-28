import { createMint } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import React from "react";
import { useConnectionState } from "../context/ConnectionProvider";
import { useKeypairState } from "../context/KeypairProvider";

interface MintTokenData {
  mintPubkey: PublicKey | null;
  state: "ready" | "start" | "finish" | "error";
}

export default function useMintToken(): [MintTokenData | null, Function] {
  const connection = useConnectionState().connection;
  const keypair = useKeypairState().keypair!;
  const [mintData, setMintData] = React.useState<MintTokenData | null>(null);

  const mintToken = React.useCallback(async () => {
    if (!connection) return;
    if (!keypair) return;

    if (mintData && mintData?.state !== "ready") {
      return;
    }

    setMintData({ mintPubkey: null, state: "start" });
    try {
      const mintPubkey = await createMint(
        connection,
        keypair,
        keypair.publicKey, // mint authority
        keypair.publicKey, // freeze authority
        9 // decimal
      );
      setMintData({ mintPubkey, state: "finish" });
    } catch (e) {
      setMintData({ mintPubkey: null, state: "error" });
    }
  }, [mintData, connection, keypair]);

  if (keypair && connection) {
    return [mintData, mintToken];
  }
  return [null, () => {}];
}
