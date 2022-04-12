import { Button } from "@chakra-ui/react";
import { useKeypairDispatch } from "../context/KeypairProvider";
import ClientOnly from "../utils/ClientOnly";

export default function KeypairGenerateBtn() {
  const keypairDispatch = useKeypairDispatch()!;
  const handleGenerateBtn = () => {
    keypairDispatch({
      type: "GENERATE_KEYPAIR",
    });
  };

  return (
    <ClientOnly>
      <Button onClick={handleGenerateBtn} colorScheme="blue">
        Generate One
      </Button>
    </ClientOnly>
  );
}
