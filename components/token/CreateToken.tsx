import { Button, useToast } from "@chakra-ui/react";
import React from "react";
import useCreateToken from "../../hooks/token/useCreateToken";
import ClientOnly from "../../utils/ClientOnly";
import { ToastOptionsBulder } from "../../utils/utils";

export default function CreateToken() {
  const toast = useToast();
  const [mintData, mintToken] = useCreateToken();

  React.useEffect(() => {
    if (!mintData) return;
    const { state, error, mintPubkey } = mintData;

    const getToastOption = ToastOptionsBulder({
      title: "토큰 생성",
      duration: 2500,
      isCloseable: true,
    });

    switch (state) {
      case "start":
        toast(
          getToastOption({ status: "info", description: "토큰 생성 시작 🚀" })
        );
        break;
      case "finish":
        toast(
          getToastOption({
            status: "success",
            description: `토큰 생성 성공 ✅ ===> 서명: ${mintPubkey!.toBase58()} `,
          })
        );
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
  }, [mintData, toast]);

  return (
    <ClientOnly>
      <Button onClick={() => mintToken()} colorScheme="blue">
        새로운 토큰 생성
      </Button>
    </ClientOnly>
  );
}
