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
  UseToastOptions,
} from "@chakra-ui/react";
import React from "react";
import { useConnectionState } from "../../context/ConnectionProvider";
import { useKeypairState } from "../../context/KeypairProvider";
import { useTokenState } from "../../context/TokenProvider";
import useMintToAddress from "../../hooks/useMintToAddress";

export default function TokenMintBtn() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [address, setAddress] = React.useState("");
  const handleAddressChange = (event: React.SyntheticEvent<HTMLInputElement>) =>
    setAddress(event.currentTarget.value);
  const [amount, setAmount] = React.useState("");
  const handleAmountChange = (value: string) => setAmount(value);

  const { connection } = useConnectionState();
  const { keypair } = useKeypairState();
  const {
    selectedToken: { mintPubkey },
  } = useTokenState();

  const [mintToAddressData, mintToAddress] = useMintToAddress();

  const getToastOption = (
    status: "info" | "success" | "warning" | "error",
    description: string
  ): UseToastOptions => ({
    status,
    description,
    title: "토큰 발행",
    duration: 2500,
  });

  const handleMintToAddress = React.useCallback(async () => {
    if (!connection) {
      toast(getToastOption("warning", "RPC 서버에 연결되지 않았습니다"));
      return;
    }

    if (!keypair) {
      toast(getToastOption("warning", "지갑이 연결되지 않았습니다"));
      return;
    }

    if (!mintPubkey) {
      toast(getToastOption("warning", "토큰이 선택되지 않았습니다"));
      return;
    }

    if (address === "") {
      toast(getToastOption("warning", "보낼 주소가 입력되지 않았습니다"));
      return;
    }

    if (amount === "") {
      toast(getToastOption("warning", "보낼 양이 입력되지 않았습니다"));
      return;
    }

    // TOBO KBT : parseFloat 오류 처리?
    await mintToAddress(address, parseFloat(amount));
    onClose();
  }, [
    connection,
    keypair,
    mintPubkey,
    mintToAddress,
    address,
    amount,
    toast,
    onClose,
  ]);

  React.useEffect(() => {
    if (!mintToAddressData) return;

    const { state, signature, error } = mintToAddressData;
    switch (state) {
      case "start":
        toast(getToastOption("info", "토큰 발행을 시작합니다..."));
        break;
      case "finish":
        toast(
          getToastOption(
            "success",
            `토큰 발행이 완료되었습니다 🚀 ==> signature : ${signature}`
          )
        );
        break;
      case error:
        toast(
          getToastOption(
            "error",
            `오류가 발생했습니다...🥲 ==> ${error.toString()}`
          )
        );
        break;
    }
  }, [mintToAddressData, toast]);

  return (
    <>
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
            <Button variant="ghost" onClick={handleMintToAddress}>
              전송
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
