import {
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Tr,
} from "@chakra-ui/react";
import React from "react";
import { useTokenState } from "../../context/TokenProvider";
import ClientOnly from "../../utils/ClientOnly";
import { displayMetaToken } from "../../utils/utils";

export default function TokenAccountInfo() {
  const {
    selectedToken: { account },
  } = useTokenState();

  if (!account) {
    return null;
  }

  return (
    <ClientOnly>
      <TableContainer>
        <Table>
          <TableCaption>계정 정보</TableCaption>
          <Tbody>
            <Tr>
              <Td>주소</Td>
              <Td>{account.address.toBase58()}</Td>
            </Tr>
            <Tr>
              <Td>토큰 갯수</Td>
              <Td>{displayMetaToken(account.amount)}</Td>
            </Tr>
            <Tr>
              <Td>얼림 상태</Td>
              <Td>{account.isFrozen ? "YES" : "NO"}</Td>
            </Tr>
            <Tr>
              <Td>토큰 주소</Td>
              <Td>{account.mint.toBase58()}</Td>
            </Tr>
            <Tr>
              <Td>Owner 계정</Td>
              <Td>{account.owner.toBase58()}</Td>
            </Tr>
          </Tbody>
        </Table>
      </TableContainer>
    </ClientOnly>
  );
}
