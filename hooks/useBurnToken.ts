import { burn } from "@solana/spl-token";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import React, { useState } from "react";
import { useConnectionState } from "../context/ConnectionProvider";
import { useKeypairState } from "../context/KeypairProvider";
import { useTokenState } from "../context/TokenProvider";

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
        console.warn(`Error with mindToAddress : connection is not found`);
        setState({ state: "error" });
        return;
      }
      if (!keypair) {
        console.warn(`Error with mindToAddress : keypair is not found`);
        return;
      }
      if (!mintPubkey) {
        console.warn(`Error with mindToAddress : mintPubkey is not found`);
        return;
      }
      if (!account) {
        console.warn(`Error with mindToAddress : account is not found`);
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
      } catch (e: any) {
        console.error(`Error Occured with burnToken : ${e.toString()}`);
        setState({ state: "error", error: e });
      }
    },
    [connection, keypair, mintPubkey, account]
  );

  return [state, burnToken];
}
