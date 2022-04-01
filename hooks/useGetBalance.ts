import React from "react";
import { useConnectionState } from "../context/ConnectionProvider";
import { useKeypairState } from "../context/KeypairProvider";

export default function useGetBalance(): [number | null, Function] {
  const connection = useConnectionState().connection;
  const keypair = useKeypairState().keypair!;
  const [balance, setBalance] = React.useState(0);

  const fetchBalance = React.useCallback(() => {
    connection?.getBalance(keypair.publicKey).then((b) => {
      setBalance(b);
    });
  }, [connection, keypair.publicKey]);

  React.useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  if (keypair && connection) {
    return [balance, fetchBalance];
  }
  return [null, () => {}];
}
