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
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import React from "react";
import { useConnectionState } from "../../context/ConnectionProvider";
import { useKeypairState } from "../../context/KeypairProvider";
import useGetBalance from "../../hooks/useGetBalance";

export default function TokenTransferBtn() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const { connection } = useConnectionState();
  const { keypair } = useKeypairState();
  const [balance, fetchBalance] = useGetBalance();

  const [address, setAddress] = React.useState("");
  const handleAddressChange = (event: any) => setAddress(event.target.value);
  const [amount, setAmount] = React.useState("");
  const handleAmountChange = (value: any) => setAmount(value);

  const handleTransfer = () => {
    if (!connection || !keypair) {
      return;
    }
    let toPubkey = null;
    try {
      toPubkey = new PublicKey(address);
    } catch (error: any) {
      toast({
        title: error.message,
        status: "error",
      });
    }
    if (toPubkey) {
      let transaction = new Transaction();
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: keypair.publicKey,
          toPubkey,
          lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
        })
      );

      sendAndConfirmTransaction(connection, transaction, [keypair])
        .then((result) => {
          toast({
            title: "Success",
            description: `Signature: ${result}`,
            status: "success",
          });
          fetchBalance();
        })
        .catch((err) => {
          toast({
            title: "Failure",
            description: `Transfer failed.${err.message}`,
            status: "error",
          });
        });

      toast({
        title: "Tranfer started",
        status: "info",
      });
      onClose();
    }
  };
  console.log(balance);
  return (
    <>
      <Box marginY={5}>
        <Button onClick={onOpen}>토큰 전송</Button>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Solana 전송</ModalHeader>
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
