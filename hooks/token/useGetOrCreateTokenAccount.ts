import { Account, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import React from "react";
import { useConnectionState } from "../../context/ConnectionProvider";
import { useKeypairState } from "../../context/KeypairProvider";
import { useTokenState } from "../../context/TokenProvider";

interface CreateTokenAccountData {
  state: "ready" | "start" | "finish" | "error";
  account?: Account;
  error?: any;
}

export default function useGetOrCreateTokenAccount(): [
  CreateTokenAccountData | null,
  () => void
] {
  const { connection } = useConnectionState();
  const { keypair } = useKeypairState();
  const {
    selectedToken: { mintPubkey },
  } = useTokenState();
  const [data, setData] = React.useState<CreateTokenAccountData | null>(null);

  const createTokenAccount = React.useCallback(async () => {
    if (!connection) {
      setData({
        state: "error",
        error: "RPC 서버가 연결되지 않았습니다",
      });
      return;
    }

    if (!keypair) {
      setData({
        state: "error",
        error: "지갑이 연결되지 않았습니다",
      });
      return;
    }

    if (!mintPubkey) {
      setData({ state: "error", error: "토큰이 선택되지 않았습니다" });
      return;
    }

    try {
      setData({ state: "start" });
      const account = await getOrCreateAssociatedTokenAccount(
        connection,
        keypair,
        mintPubkey,
        keypair.publicKey
      );
      setData({ state: "finish", account });
    } catch (e) {
      setData({ state: "error", error: e });
    }
  }, [connection, keypair, mintPubkey]);

  return [data, createTokenAccount];
}
