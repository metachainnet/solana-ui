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
import useTransferToken from "../../hooks/token/useTransferToken";
import { ToastOptionsBulder } from "../../utils/utils";

export default function TokenTransferBtn() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [transferData, transferToken] = useTransferToken();

  const [address, setAddress] = React.useState("");
  const handleAddressChange = (event: any) => setAddress(event.target.value);
  const [amount, setAmount] = React.useState("");
  const handleAmountChange = (value: any) => setAmount(value);

  React.useEffect(() => {
    if (!transferData) return;

    const { state, error, txSignature } = transferData;

    const getToastOption = ToastOptionsBulder({
      title: "토큰 전송",
      duration: 2500,
      isCloseable: true,
    });

    switch (state) {
      case "start":
        toast(getToastOption({ status: "info", description: "전송 시작 🚀" }));
        break;
      case "finish":
        toast(
          getToastOption({
            status: "success",
            description: `발행 성공 ✅ ===> 주소 ${txSignature!} `,
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
  }, [transferData, toast]);

  return (
    <>
      <Button onClick={onOpen}>토큰 전송</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>토큰 전송</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InputGroup>
              <InputLeftAddon>Address</InputLeftAddon>
              <Input value={address} onChange={handleAddressChange} />
            </InputGroup>
            <InputGroup>
              <InputLeftAddon>Amount</InputLeftAddon>
              <NumberInput
                w="100%"
                value={amount}
                onChange={handleAmountChange}
              >
                <NumberInputField />
              </NumberInput>
            </InputGroup>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              닫기
            </Button>
            <Button
              variant="ghost"
              onClick={() => transferToken(address, parseFloat(amount))}
            >
              전송
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
