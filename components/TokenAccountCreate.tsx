import { Button, Stack, useToast } from "@chakra-ui/react";
import React from "react";
import useGetOrCreateTokenAccount from "../hooks/useGetOrCreateTokenAccount";
import ClientOnly from "../utils/ClientOnly";

export default function TokenAccountCreate() {
  const toast = useToast();
  const [tokenAccountData, getOrCreateTokenAccount] =
    useGetOrCreateTokenAccount();

  React.useEffect(() => {
    if (!tokenAccountData) return;
    const { state, error } = tokenAccountData;

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
        break;
      case "error":
        toast({
          title: "Get or Create Token Account",
          description: `Error Occured ~ ${error?.toString()}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        break;
    }
  }, [tokenAccountData, toast, getOrCreateTokenAccount]);

  const onClick = () => {
    getOrCreateTokenAccount();
  };

  return (
    <ClientOnly>
      <Stack direction="row">
        <Button onClick={onClick} colorScheme="blue">
          선택한 토큰 계정 생성
        </Button>
        <span>토큰 계정 주소 - </span>
        <span>
          {tokenAccountData?.account?.address.toBase58() || "만들어 주세요!!"}
        </span>
      </Stack>
    </ClientOnly>
  );
}
