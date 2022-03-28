import { Button, Stack, useToast } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useConnectionState } from "../context/ConnectionProvider";
import { useKeypairState } from "../context/KeypairProvider";
import useMintToken from "../hooks/useMintToken";
import ClientOnly from "../utils/ClientOnly";

export default function TokenCreateComponent() {
  const connection = useConnectionState().connection;
  const keypair = useKeypairState().keypair;
  const [mintData, mintToken] = useMintToken();
  const toast = useToast();

  useEffect(() => {}, [connection, keypair]);

  useEffect(() => {
    if (!mintData) return;
    const { state: mintState } = mintData;

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
        break;
      case "error":
        toast({
          title: "Mint Token",
          description: "Error...",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        break;
    }
  }, [mintData, toast]);

  const onClick = () => {
    mintToken();
  };

  return (
    <ClientOnly>
      {keypair && (
        <>
          <Stack direction="row">
            <Button onClick={onClick} colorScheme="blue">
              Create Fungible Token
            </Button>
            <span>Mint Public Key</span>
            <span>
              {mintData?.mintPubkey
                ? mintData.mintPubkey.toBase58()
                : "Not yet.."}
            </span>
          </Stack>
        </>
      )}
    </ClientOnly>
  );
}
