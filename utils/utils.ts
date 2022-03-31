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
