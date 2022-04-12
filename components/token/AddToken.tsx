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
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React from "react";
import { useTokenDispatch } from "../../context/TokenProvider";
import useMintInfo from "../../hooks/token/useMintInfo";
import ClientOnly from "../../utils/ClientOnly";
import { ToastOptionsBulder } from "../../utils/utils";

export default function AddTokenBtn() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const [mintInfoData, getMintInfo] = useMintInfo();
  const tokenDispatch = useTokenDispatch()!;

  const [address, setAddress] = React.useState("");
  const handleAddressChange = (event: any) => setAddress(event.target.value);

  React.useEffect(() => {
    if (!mintInfoData) return;

    const { state, error, mintInfo } = mintInfoData;
    const getToastOption = ToastOptionsBulder({
      title: "토큰 추가",
      duration: 2500,
      isCloseable: true,
    });

    switch (state) {
      case "start":
        toast(
          getToastOption({ status: "info", description: "토큰 추가 시작 🚀" })
        );
        break;
      case "finish":
        toast(
          getToastOption({
            status: "success",
            description: `토큰 추가 성공 ✅`,
          })
        );
        onClose();
        tokenDispatch({
          type: "ADD_TOKEN",
          payload: { addToken: mintInfo!.address },
        });
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
  }, [mintInfoData, toast, onClose, tokenDispatch]);

  return (
    <ClientOnly>
      <Button onClick={onOpen}>토큰 추가</Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>토큰 추가</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InputGroup>
              <InputLeftAddon>Address</InputLeftAddon>
              <Input value={address} onChange={handleAddressChange} />
            </InputGroup>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              닫기
            </Button>
            <Button variant="ghost" onClick={() => getMintInfo(address)}>
              추가
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ClientOnly>
  );
}
