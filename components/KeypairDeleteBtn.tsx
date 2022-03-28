import { Button } from "@chakra-ui/react";
import {
  useKeypairDispatch,
  useKeypairState,
} from "../context/KeypairProvider";
import ClientOnly from "../utils/ClientOnly";

export default function KeypairDeleteBtn() {
  const keypairDispatch = useKeypairDispatch()!;
  const keypair = useKeypairState()?.keypair;

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
          <Button onClick={handleDeleteBtn} colorScheme="red">
            Delete
          </Button>
        </>
      )}
    </ClientOnly>
  );
}
