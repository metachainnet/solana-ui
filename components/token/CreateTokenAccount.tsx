import { Button, Stack, useToast } from "@chakra-ui/react";
import React from "react";
import { useTokenDispatch } from "../../context/TokenProvider";
import useGetOrCreateTokenAccount from "../../hooks/token/useGetOrCreateTokenAccount";
import ClientOnly from "../../utils/ClientOnly";
import { ToastOptionsBulder } from "../../utils/utils";

export default function CreateTokenAccount() {
  const toast = useToast();
  const tokenDispatch = useTokenDispatch()!;
  const [tokenAccountData, getOrCreateTokenAccount] =
    useGetOrCreateTokenAccount();

  React.useEffect(() => {
    if (!tokenAccountData) return;
    const { account, state, error } = tokenAccountData;

    const getToastOption = ToastOptionsBulder({
      title: "토큰 계정 생성 또는 찾기",
      duration: 2500,
      isCloseable: true,
    });

    switch (state) {
      case "start":
        toast(
          getToastOption({
            status: "info",
            description: "토큰 계정 발급 시작 🚀",
          })
        );
        break;
      case "finish":
        toast(
          getToastOption({
            status: "success",
            description: `토큰 계정 발급 성공 ✅`,
          })
        );
        tokenDispatch({
          type: "SET_TOKEN_ACCOUNT",
          payload: {
            selectedTokenAccount: account,
          },
        });
        break;
      case "error":
        toast(
          getToastOption({
            status: "error",
            description: `오류 발생 ❌ ===> ${error?.toString()}`,
          })
        );
        break;
    }
  }, [tokenAccountData, toast, getOrCreateTokenAccount, tokenDispatch]);

  return (
    <ClientOnly>
      <Stack direction="row">
        <Button onClick={() => getOrCreateTokenAccount()} colorScheme="blue">
          토큰 계정 생성 또는 찾기
        </Button>
      </Stack>
    </ClientOnly>
  );
}
