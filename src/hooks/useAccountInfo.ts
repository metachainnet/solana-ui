import { AccountInfo, PublicKey } from "@solana/web3.js";
import { useEffect } from "react";
import { useConnection } from "../context/ConnectionContext";
import { useAsyncData } from "../utils/fetch-loop";
import useRefEqual from "./useRefRequal";

export default function useAccountInfo(publicKey: PublicKey) {
  const connection = useConnection();
  const [accountInfo, loaded] = useAsyncData(
    async () => connection.getAccountInfo(publicKey),
    publicKey.toBase58() // cache key
  );

  useEffect(() => {
    let previousInfo: AccountInfo<Buffer> | null = null;
    const id = connection.onAccountChange(publicKey, (info) => {
      if (
        !previousInfo ||
        !previousInfo.data.equals(info.data) ||
        previousInfo.lamports !== info.lamports
      ) {
        previousInfo = info;
      }
    });
    return () => {
      connection.removeAccountChangeListener(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connection, publicKey.toBase58()]);

  return [
    useRefEqual(
      accountInfo!,
      (oldInfo: AccountInfo<Buffer>, newInfo: AccountInfo<Buffer>) =>
        !!oldInfo &&
        !!newInfo &&
        oldInfo.data.equals(newInfo.data) &&
        oldInfo.lamports === newInfo.lamports
    ),
    loaded,
  ];
}
