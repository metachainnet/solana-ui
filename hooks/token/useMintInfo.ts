import { getMint, Mint } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import React from "react";
import { useConnectionState } from "../../context/ConnectionProvider";
import { useKeypairState } from "../../context/KeypairProvider";

interface MintInfoData {
  state: "ready" | "start" | "finish" | "error";
  mintInfo?: Mint;
  error?: any;
}

/**
 * 민트된 토큰 정보를 찾는 hooks
 * @returns
 */
export default function useMintInfo(): [
  MintInfoData | null,
  (address: string) => void
] {
  const { connection } = useConnectionState();
  const { keypair } = useKeypairState();

  const [mintInfoData, setMintInfoData] = React.useState<MintInfoData | null>(
    null
  );

  const getMintInfo = React.useCallback(
    async (address: string) => {
      if (!connection) {
        setMintInfoData({
          state: "error",
          error: "RPC 서버가 연결되지 않았습니다",
        });
        return;
      }

      if (!keypair) {
        setMintInfoData({
          state: "error",
          error: "지갑이 연결되지 않았습니다",
        });
        return;
      }

      if (!address || address === "") {
        setMintInfoData({ state: "error", error: "토큰 주소를 입력해주세요" });
      }

      if (mintInfoData && mintInfoData.state === "start") {
        setMintInfoData({ state: "error", error: "토큰 추가중입니다..." });
        return;
      }

      try {
        setMintInfoData({ state: "start" });
        const tokenAddress = new PublicKey(address);
        const mintInfo = await getMint(connection, tokenAddress);
        setMintInfoData({ state: "finish", mintInfo });
      } catch (e) {
        setMintInfoData({ state: "error", error: e });
      }
    },
    [connection, keypair, mintInfoData]
  );

  return [mintInfoData, getMintInfo];
}
