import { Button, Stack } from "@chakra-ui/react";
import {
  useKeypairDispatch,
  useKeypairState,
} from "../context/KeypairProvider";
import useGetBalance from "../hooks/useGetBalance";
import useRequestAirdrop from "../hooks/useRequestAirdrop";
import ClientOnly from "../utils/ClientOnly";

export default function KeypairDeleteBtn() {
  const keypairDispatch = useKeypairDispatch()!;
  const keypair = useKeypairState()?.keypair;
  const [balance, fetchBalance] = useGetBalance();

  const requestAirdrop = useRequestAirdrop();

  const handleAirdropBtn = () => {
    if (balance !== null) {
      requestAirdrop()?.then(() => {
        fetchBalance();
      });
    }
  };
  const handleDeleteBtn = () => {
    keypairDispatch({
      type: "DELETE_KEYPAIR",
    });
  };

  return (
    <ClientOnly>
      {keypair && (
        <>
          <div>{keypair.publicKey.toBase58()}</div>
          <div>Balance : {balance}</div>
          <Stack direction={"row"}>
            <Button onClick={handleAirdropBtn} colorScheme="blue">
              AirDrop
            </Button>
            <Button onClick={handleDeleteBtn} colorScheme="red">
              Delete
            </Button>
          </Stack>
        </>
      )}
    </ClientOnly>
  );
}
