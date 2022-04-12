import {
  Button,
  Input,
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
import useMintToAddress from "../../hooks/token/useMintToAddress";
import ClientOnly from "../../utils/ClientOnly";
import { ToastOptionsBulder } from "../../utils/utils";

export default function TokenMintBtn() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [address, setAddress] = React.useState("");
  const handleAddressChange = (event: React.SyntheticEvent<HTMLInputElement>) =>
    setAddress(event.currentTarget.value);
  const [amount, setAmount] = React.useState("");
  const handleAmountChange = (value: string) => setAmount(value);

  const [mintToAddressData, mintToAddress] = useMintToAddress();

  React.useEffect(() => {
    if (!mintToAddressData) return;

    const { state, signature, error } = mintToAddressData;
    const getToastOption = ToastOptionsBulder({
      title: "토큰 발행",
      duration: 2500,
      isCloseable: true,
    });

    switch (state) {
      case "start":
        toast(
          getToastOption({ status: "info", description: "토큰 발행 시작 🚀" })
        );
        break;
      case "finish":
        toast(
          getToastOption({
            status: "success",
            description: `토큰 발행이 완료되었습니다 ✅ ==> signature : ${signature}`,
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
  }, [mintToAddressData, toast]);

  return (
    <ClientOnly>
      <Button onClick={onOpen} colorScheme="green">
        토큰 발행
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>토큰 발행</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InputGroup>
              <InputLeftAddon>Address</InputLeftAddon>
              <Input value={address} onChange={handleAddressChange} />
            </InputGroup>
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
              onClick={() => mintToAddress(address, parseFloat(amount))}
            >
              전송
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ClientOnly>
  );
}
