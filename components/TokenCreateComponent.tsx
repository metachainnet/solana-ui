import { Button, Stack, useToast } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useKeypairState } from "../context/KeypairProvider";
import { useTokenDispatch } from "../context/TokenProvider";
import useMintToken from "../hooks/useMintToken";
import ClientOnly from "../utils/ClientOnly";

export default function TokenCreateComponent() {
  const [mintData, mintToken] = useMintToken();
  const toast = useToast();
  const tokenDispatch = useTokenDispatch();

  useEffect(() => {
    if (!mintData) return;
    const { state: mintState, error: mintError } = mintData;

    switch (mintState) {
      case "start":
        toast({
          title: "Mint Token",
          description: "Starting...",
          status: "info",
          duration: 10000,
          isClosable: true,
        });
        break;
      case "finish":
        toast({
          title: "Mint Token",
          description: "Finish...",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        tokenDispatch!({
          type: "ADD_TOKEN",
          payload: { addToken: mintData.mintPubkey! },
        });
        break;
      case "error":
        toast({
          title: "Mint Token",
          description: `Error Occured ~ ${mintError?.toString()}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        break;
    }
  }, [mintData, toast, tokenDispatch]);

  const onClick = () => {
    mintToken();
  };

  return (
    <ClientOnly>
      <>
        <Stack direction="row">
          <Button onClick={onClick} colorScheme="blue">
            Create Fungible Token
          </Button>
          <span>Mint Public Key : </span>
          <span>
            {mintData?.mintPubkey
              ? mintData.mintPubkey.toBase58()
              : `Not yet..`}
          </span>
        </Stack>
      </>
    </ClientOnly>
  );
}
