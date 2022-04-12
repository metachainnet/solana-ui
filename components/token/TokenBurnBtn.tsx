import {
  Button,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  NumberInput,
  NumberInputField,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React from "react";
import { useConnectionState } from "../../context/ConnectionProvider";
import { useKeypairState } from "../../context/KeypairProvider";
import { useTokenState } from "../../context/TokenProvider";
import useBurnToken from "../../hooks/token/useBurnToken";
import { ToastOptionsBulder } from "../../utils/utils";

export default function TokenBurnBtn() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [amount, setAmount] = React.useState("");
  const handleAmountChange = (value: string) => setAmount(value);
  const [burnTokenData, burnToken] = useBurnToken();

  React.useEffect(() => {
    if (!burnTokenData) return;

    const { state, signature, error } = burnTokenData;
    const getToastOption = ToastOptionsBulder({
      title: "토큰 소각",
      duration: 2500,
      isCloseable: true,
    });

    switch (state) {
      case "start":
        toast(
          getToastOption({ status: "info", description: "토큰 소각 시작 🚀" })
        );
        break;
      case "finish":
        toast(
          getToastOption({
            status: "success",
            description: `토큰 소각이 완료되었습니다 ✅ ==> signature : ${signature}`,
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
  }, [burnTokenData, toast]);

  return (
    <>
      <Button onClick={onOpen} colorScheme="red">
        토큰 소각
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>토큰 소각</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InputGroup>
              <InputLeftAddon>Amount</InputLeftAddon>
              <NumberInput w="100" value={amount} onChange={handleAmountChange}>
                <NumberInputField />
              </NumberInput>
            </InputGroup>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr="3" onClick={onClose}>
              닫기
            </Button>
            <Button
              variant="ghost"
              onClick={() => burnToken(parseFloat(amount))}
            >
              소각
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
