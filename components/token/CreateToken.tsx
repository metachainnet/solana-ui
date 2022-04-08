import { Button, useToast } from "@chakra-ui/react";
import React from "react";
import { useTokenDispatch } from "../../context/TokenProvider";
import useMintToken from "../../hooks/useCreateMint";
import ClientOnly from "../../utils/ClientOnly";
import { ToastOptionsBulder } from "../../utils/utils";

export default function CreateToken() {
  const toast = useToast();
  const [mintData, mintToken] = useMintToken();

  const getToastOption = ToastOptionsBulder({
    title: "토큰 민팅",
    duration: 2500,
    isCloseable: true,
  });

  React.useEffect(() => {
    if (!mintData) return;
    const { state, error, mintPubkey } = mintData;

    console.log(state);

    switch (state) {
      case "start":
        toast(getToastOption({ status: "info", description: "발행 시작..." }));
        break;
      case "finish":
        toast(
          getToastOption({
            status: "success",
            description: `발행 성공 ✅ ===> 주소 ${mintPubkey!.toBase58()} `,
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
  }, [mintData, toast, getToastOption]);

  return (
    <ClientOnly>
      <>
        <Button onClick={() => mintToken()} colorScheme="blue">
          새로운 토큰 생성
        </Button>
      </>
    </ClientOnly>
  );
}
