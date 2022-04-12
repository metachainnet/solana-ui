import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import React from "react";
import { useConnectionState } from "../../context/ConnectionProvider";
import { useKeypairState } from "../../context/KeypairProvider";
import { useTokenState } from "../../context/TokenProvider";

interface TransferTokenData {
  state: "ready" | "start" | "finish" | "error";
  txSignature?: string;
  error?: any;
}

/**
 * 토큰 전송
 * @returns
 */
export default function useTransferToken(): [
  TransferTokenData | null,
  (address: string, amount: number) => void
] {
  const { connection } = useConnectionState();
  const { keypair } = useKeypairState();
  const {
    selectedToken: { mintPubkey, account },
  } = useTokenState();

  const [transferData, setTransferData] =
    React.useState<TransferTokenData | null>(null);

  const mintToken = React.useCallback(
    async (address: string, amount: number) => {
      if (!connection) {
        setTransferData({
          state: "error",
          error: "RPC 서버가 연결되지 않았습니다",
        });
        return;
      }

      if (!keypair) {
        setTransferData({
          state: "error",
          error: "지갑이 연결되지 않았습니다",
        });
        return;
      }

      if (!mintPubkey) {
        setTransferData({
          state: "error",
          error: "토큰이 선택되지 않았습니다",
        });
        return;
      }

      if (!account) {
        setTransferData({
          state: "error",
          error: "토큰 계정 정보가 없습니다. 계정을 먼저 생성하거나 가져오세요",
        });
        return;
      }

      if (!address || address === "") {
        setTransferData({
          state: "error",
          error: "보낼 주소가 입력되지 않았습니다",
        });
        return;
      }

      if (!amount || amount === 0) {
        setTransferData({
          state: "error",
          error: "보낼 양이 입력되지 않았습니다",
        });
      }

      if (transferData && transferData.state === "start") {
        setTransferData({
          state: "error",
          error: "전송중입니다... 잠시후 다시 시도하세요",
        });
        return;
      }

      try {
        setTransferData({ state: "start" });
        const toPubkey = new PublicKey(address);
        const toAccount = await getOrCreateAssociatedTokenAccount(
          connection,
          keypair,
          mintPubkey,
          toPubkey
        );
        const txSignature = await transfer(
          connection,
          keypair,
          account.address,
          toAccount.address,
          keypair,
          amount * LAMPORTS_PER_SOL
        );
        setTransferData({ state: "finish", txSignature });
      } catch (e) {
        setTransferData({ state: "error", error: e });
      }
    },
    [connection, keypair, mintPubkey, account, transferData]
  );

  return [transferData, mintToken];
}
