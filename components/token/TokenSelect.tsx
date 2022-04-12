import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import { PublicKey } from "@solana/web3.js";
import React from "react";
import { useTokenDispatch, useTokenState } from "../../context/TokenProvider";

export default function TokenSelect() {
  const {
    tokens,
    selectedToken: { mintPubkey },
  } = useTokenState();
  const tokenDispatch = useTokenDispatch()!;

  if (tokens.length === 0) {
    return <p>토큰 정보가 없습니다. 토큰을 생성해보세요</p>;
  }

  const handleTokenSelect = (nextValue: string) => {
    const find = tokens
      .map((it: PublicKey, index: number) => ({
        pubkey: it,
        toBase58: it.toBase58(),
        index,
      }))
      .find((it) => it.toBase58 === nextValue);

    if (!find) {
      console.warn(`토큰을 찾을수 없음..`);
      return;
    }

    tokenDispatch({
      type: "SELECT_TOKEN",
      payload: {
        selectedToken: find.pubkey,
      },
    });
  };

  return (
    <RadioGroup
      onChange={(nextValue: string) => {
        handleTokenSelect(nextValue);
      }}
      value={mintPubkey?.toBase58()}
    >
      <Stack direction="column">
        {tokens.map((it: PublicKey) => (
          <Radio key={it.toBase58()} value={it.toBase58()}>
            {it.toBase58()}
          </Radio>
        ))}
      </Stack>
    </RadioGroup>
  );
}
