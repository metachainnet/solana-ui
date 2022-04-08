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
  const getToastOption = ToastOptionsBulder({
    title: "토큰 소각",
    duration: 2500,
  });

  const [amount, setAmount] = React.useState("");
  const handleAmountChange = (value: string) => setAmount(value);

  const { connection } = useConnectionState();
  const { keypair } = useKeypairState();
  const {
    selectedToken: { mintPubkey, account },
  } = useTokenState();

  const [burnTokenData, burnToken] = useBurnToken();

  /**
   * 기능을 사용하기 위해서 필수적인 상태값 체크
   */
  const handleReady = React.useCallback(() => {
    if (!connection) {
      toast(
        getToastOption({
          status: "warning",
          description: "RPC 서버에 연결되지 않았습니다",
        })
      );
      return false;
    }

    if (!keypair) {
      toast(
        getToastOption({
          status: "warning",
          description: "지갑이 연결되지 않았습니다",
        })
      );
      return false;
    }

    if (!mintPubkey) {
      toast(
        getToastOption({
          status: "warning",
          description: "토큰이 선택되지 않았습니다",
        })
      );
      return false;
    }

    if (!account) {
      toast(
        getToastOption({
          status: "warning",
          description: "토큰 계정을 생성하거나 불러오세요",
        })
      );
      return false;
    }

    return true;
  }, [connection, keypair, mintPubkey, account, toast, getToastOption]);

  const onModalOpen = () => {
    if (handleReady()) {
      onOpen();
    }
  };

  const handleMintToAddress = React.useCallback(async () => {
    if (!handleReady()) return;

    if (amount === "") {
      toast(
        getToastOption({
          status: "warning",
          description: "보낼 양이 입력되지 않았습니다",
        })
      );
      return;
    }

    // TOBO KBT : parseFloat 오류 처리?
    await burnToken(parseFloat(amount));
    onClose();
  }, [handleReady, burnToken, onClose, amount, toast, getToastOption]);

  React.useEffect(() => {
    if (!burnTokenData) return;

    const { state, signature, error } = burnTokenData;
    switch (state) {
      case "start":
        toast(
          getToastOption({
            status: "info",
            description: "토큰 소각을 시작합니다...",
          })
        );
        break;
      case "finish":
        toast(
          getToastOption({
            status: "success",
            description: `토큰 소각이 완료되었습니다 ♻️ ==> signature : ${signature}`,
          })
        );
        break;
      case error:
        toast(
          getToastOption({
            status: "error",
            description: `오류가 발생했습니다...🥲 ==> ${error.toString()}`,
          })
        );
        break;
    }
  }, [burnTokenData, toast, getToastOption]);

  return (
    <>
      <Button onClick={onModalOpen} colorScheme="red">
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
            <Button variant="ghost" onClick={handleMintToAddress}>
              소각
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
