import {
  Box,
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
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import React from "react";
import { useConnectionState } from "../../context/ConnectionProvider";
import { useKeypairState } from "../../context/KeypairProvider";
import { useTokenState } from "../../context/TokenProvider";

export default function TokenTransferBtn() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const { connection } = useConnectionState();
  const { keypair } = useKeypairState();
  const {
    selectedToken: { mintPubkey, account },
  } = useTokenState();

  const [address, setAddress] = React.useState("");
  const handleAddressChange = (event: any) => setAddress(event.target.value);
  const [amount, setAmount] = React.useState("");
  const handleAmountChange = (value: any) => setAmount(value);

  const handleTransfer = async () => {
    if (!connection) {
      toast({
        status: "warning",
        title: "Token transfer",
        description: "RPC 서버에 연결되지 않았습니다",
        duration: 2500,
      });
      return;
    }

    if (!keypair) {
      toast({
        status: "warning",
        title: "Token transfer",
        description: "지갑이 연결되지 않았습니다",
        duration: 2500,
      });
      return;
    }

    if (!mintPubkey) {
      toast({
        status: "warning",
        title: "Token transfer",
        description: "토큰이 선택되지 않았습니다",
        duration: 2500,
      });
      return;
    }

    if (!account) {
      toast({
        status: "warning",
        title: "Token transfer",
        description: "토큰 계정 정보가 없습니다",
        duration: 2500,
      });
      return;
    }

    if (address === "") {
      toast({
        status: "warning",
        title: "Token transfer",
        description: "보낼 주소가 입력되지 않았습니다",
        duration: 2500,
      });
      return;
    }

    if (amount === "") {
      toast({
        status: "warning",
        title: "Token transfer",
        description: "보낼 양이 입력되지 않았습니다",
        duration: 2500,
      });
    }

    try {
      const toPubkey = new PublicKey(address);

      const toAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        keypair,
        mintPubkey,
        toPubkey
      );
      transfer(
        connection,
        keypair,
        account?.address,
        toAccount.address,
        keypair,
        parseFloat(amount) * LAMPORTS_PER_SOL
      );
    } catch (e) {
      toast({
        status: "error",
        title: "Token transfer",
        description: `전송중 오류가 발생했습니다 : ${e}`,
        duration: 2500,
      });
    }
  };

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
            <Button variant="ghost" onClick={handleTransfer}>
              전송
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
