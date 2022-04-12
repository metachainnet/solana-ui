import {
  getAccount,
  getAssociatedTokenAddress,
  mintTo,
} from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import React, { useState } from "react";
import { useConnectionState } from "../../context/ConnectionProvider";
import { useKeypairState } from "../../context/KeypairProvider";
import { useTokenState } from "../../context/TokenProvider";

interface MintToAddressData {
  state: "error" | "start" | "finish";
  signature?: string;
  error?: any;
}

/**
 * 토큰을 해당 계정에 민팅하는 Hooks
 * @returns
 */
export default function useMintToAddress(): [
  state: MintToAddressData | null,
  mintToAddress: (toAddressStr: string, amount: number) => Promise<void>
] {
  const { connection } = useConnectionState();
  const { keypair } = useKeypairState();
  const {
    selectedToken: { mintPubkey },
  } = useTokenState();

  const [state, setState] = useState<MintToAddressData | null>(null);

  const mintToAddress = React.useCallback(
    async (addressStr: string, amount: number) => {
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

      try {
        setState({ state: "start" });

        const toPubkey = new PublicKey(addressStr);
        const toTokenAddress = await getAssociatedTokenAddress(
          mintPubkey,
          toPubkey
        );
        const toTokenAccount = await getAccount(connection, toTokenAddress);
        const txSignature = await mintTo(
          connection,
          keypair,
          mintPubkey,
          toTokenAccount.address,
          keypair,
          amount * LAMPORTS_PER_SOL
        );
        setState({ state: "finish", signature: txSignature });
      } catch (e) {
        setState({ state: "error", error: e });
      }
    },
    [connection, keypair, mintPubkey]
  );

  return [state, mintToAddress];
}
