import { AccountInfo, PublicKey } from "@solana/web3.js";
import { useEffect } from "react";
import { useConnection } from "../context/ConnectionContext";
import useRefEqual from "./useRefRequal";

export default async function useAccountInfo(publicKey: PublicKey) {
  const connection = useConnection();
  const account = await connection.getAccountInfo(publicKey);

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
      account!,
      (oldInfo: AccountInfo<Buffer>, newInfo: AccountInfo<Buffer>) =>
        !!oldInfo &&
        !!newInfo &&
        oldInfo.data.equals(newInfo.data) &&
        oldInfo.lamports === newInfo.lamports
    ),
  ];
}
