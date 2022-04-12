import { burn } from "@solana/spl-token";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import React, { useState } from "react";
import { useConnectionState } from "../../context/ConnectionProvider";
import { useKeypairState } from "../../context/KeypairProvider";
import { useTokenState } from "../../context/TokenProvider";

interface BurnTokenData {
  state: "error" | "start" | "finish";
  signature?: string;
  error?: any;
}

/**
 * 해당 계정의 토큰을 소각하는 Hooks
 * @returns
 */
export default function useBurnToken(): [
  state: BurnTokenData | null,
  burnToken: (amount: number) => Promise<void>
] {
  const { connection } = useConnectionState();
  const { keypair } = useKeypairState();
  const {
    selectedToken: { mintPubkey, account },
  } = useTokenState();

  const [state, setState] = useState<BurnTokenData | null>(null);

  const burnToken = React.useCallback(
    async (amount: number) => {
      if (!connection) {
        setState({
          state: "error",
          error: "RPC 서버가 연결되지 않았습니다",
        });
        return;
      }

      if (!keypair) {
        setState({
          state: "error",
          error: "지갑이 연결되지 않았습니다",
        });
        return;
      }

      if (!mintPubkey) {
        setState({
          state: "error",
          error: "토큰이 선택되지 않았습니다",
        });
        return;
      }

      if (!account) {
        setState({
          state: "error",
          error: "토큰 계정이 존재하지 않습니다",
        });
        return;
      }

      try {
        setState({ state: "start" });
        const txSignature = await burn(
          connection,
          keypair,
          account.address,
          mintPubkey,
          keypair,
          amount * LAMPORTS_PER_SOL
        );
        setState({ state: "finish", signature: txSignature });
      } catch (e) {
        setState({ state: "error", error: e });
      }
    },
    [connection, keypair, mintPubkey, account]
  );

  return [state, burnToken];
}
