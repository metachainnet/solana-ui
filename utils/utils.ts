import { UseToastOptions } from "@chakra-ui/react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

export const checkFront = () => typeof window !== "undefined";

export const eqaulsArray = (a: any[], b: any[]): boolean => {
  if (a.length !== b.length) return false;

  // compare shallow
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
};

export const delay = (millSec: number) => {
  return new Promise((resolve) => setTimeout(resolve, millSec));
};

export const displayMetaToken = (amount: bigint) => {
  const unit = LAMPORTS_PER_SOL;
  const change = Number((amount * 100n) / BigInt(unit)) / 100;
  return change.toLocaleString();
};

/**
 * 공통 Toast Option 생성
 * 한 화면에서 공통으로 지정할 Toast title, Toast duration을 지정하고 함수를 실행하면
 * status, description을 지정하여 사용할 수 있는 함수를 반환한다
 *
 * @param param
 * @returns
 */
export const ToastOptionsBulder = ({
  title,
  duration,
  isCloseable,
}: {
  title: string;
  duration: number;
  isCloseable?: boolean;
}) => {
  return function getToastOption({
    status,
    description,
  }: {
    status: "info" | "success" | "warning" | "error";
    description: string;
  }): UseToastOptions {
    return {
      status,
      description,
      title,
      duration,
      isClosable: isCloseable ? true : false,
    };
  };
};
