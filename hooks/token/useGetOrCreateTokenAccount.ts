import { Account, getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import React from "react";
import { useConnectionState } from "../../context/ConnectionProvider";
import { useKeypairState } from "../../context/KeypairProvider";
import { useTokenState } from "../../context/TokenProvider";

interface CreateTokenAccountData {
  account?: Account;
  state: "ready" | "start" | "finish" | "error";
  error?: any;
}

export default function useGetOrCreateTokenAccount(): [
  CreateTokenAccountData | null,
  Function
] {
  const { connection } = useConnectionState();
  const { keypair } = useKeypairState();
  const {
    selectedToken: { mintPubkey },
  } = useTokenState();
  const [data, setData] = React.useState<CreateTokenAccountData | null>(null);

  const createTokenAccount = React.useCallback(async () => {
    if (!connection) {
      setData({ state: "error", error: "Connection is not found" });
      return;
    }

    if (!keypair) {
      setData({ state: "error", error: "Account is not found" });
      return;
    }

    if (!mintPubkey) {
      setData({ state: "error", error: "Token is not selected" });
      return;
    }

    setData({ state: "start" });
    try {
      const account = await getOrCreateAssociatedTokenAccount(
        connection,
        keypair,
        mintPubkey,
        keypair.publicKey
      );
      setData({ state: "finish", account });
    } catch (e) {
      setData({ state: "error" });
    }
  }, [connection, keypair, mintPubkey]);

  React.useEffect(() => {
    // if Mint Pubkey changed, reset the state
    setData({ state: "ready" });
  }, [mintPubkey]);

  return [data, createTokenAccount];
}
