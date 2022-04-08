import { Button, Stack, useToast } from "@chakra-ui/react";
import React from "react";
import { useTokenDispatch } from "../../context/TokenProvider";
import useGetOrCreateTokenAccount from "../../hooks/useGetOrCreateTokenAccount";
import ClientOnly from "../../utils/ClientOnly";

export default function CreateTokenAccount() {
  const toast = useToast();
  const tokenDispatch = useTokenDispatch()!;
  const [tokenAccountData, getOrCreateTokenAccount] =
    useGetOrCreateTokenAccount();

  React.useEffect(() => {
    if (!tokenAccountData) return;
    const { account, state, error } = tokenAccountData;

    switch (state) {
      case "start":
        toast({
          title: "Get or Create Token Account",
          description: "Starting...",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        break;
      case "finish":
        toast({
          title: "Get or Create Token Account",
          description: "Finish...",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        tokenDispatch({
          type: "SET_TOKEN_ACCOUNT",
          payload: {
            selectedTokenAccount: account,
          },
        });
        break;
      case "error":
        toast({
          title: "Get or Create Token Account",
          description: `오류 발생 ===> ${error?.toString()}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        break;
    }
  }, [tokenAccountData, toast, getOrCreateTokenAccount, tokenDispatch]);

  return (
    <ClientOnly>
      <Stack direction="row">
        <Button onClick={() => getOrCreateTokenAccount()} colorScheme="blue">
          선택한 토큰 계정 생성 또는 찾기
        </Button>
      </Stack>
    </ClientOnly>
  );
}
