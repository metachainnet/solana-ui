import { createMint } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import React from "react";
import { useConnectionState } from "../../context/ConnectionProvider";
import { useKeypairState } from "../../context/KeypairProvider";
import { useTokenDispatch } from "../../context/TokenProvider";

interface CreateTokenData {
  mintPubkey?: PublicKey;
  state: "ready" | "start" | "finish" | "error";
  error?: any;
}

/**
 * 새로운 토큰 생성
 * @returns
 */
export default function useCreateToken(): [CreateTokenData | null, Function] {
  const { connection } = useConnectionState();
  const { keypair } = useKeypairState();
  const tokenDispatch = useTokenDispatch()!;

  const [mintData, setMintData] = React.useState<CreateTokenData | null>(null);

  const mintToken = React.useCallback(async () => {
    if (!connection) {
      setMintData({ state: "error", error: "RPC 서버가 연결되지 않았습니다" });
      return;
    }

    if (!keypair) {
      setMintData({ state: "error", error: "지갑이 연결되지 않았습니다" });
      return;
    }

    if (mintData && mintData.state === "start") {
      setMintData({ state: "error", error: "토큰이 생성중입니다" });
      return;
    }

    try {
      setMintData({ state: "start" });
      const mintPubkey = await createMint(
        connection,
        keypair,
        keypair.publicKey, // mint authority
        keypair.publicKey, // freeze authority
        9 // decimal
      );
      tokenDispatch({
        type: "ADD_TOKEN",
        payload: { addToken: mintPubkey },
      });
      setMintData({ state: "finish", mintPubkey });
    } catch (e) {
      setMintData({ state: "error", error: e });
    }
  }, [connection, keypair, mintData, tokenDispatch]);

  return [mintData, mintToken];
}
