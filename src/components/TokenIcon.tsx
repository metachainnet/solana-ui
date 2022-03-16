import Image from "next/image";
import { useState } from "react";

export default function TokenIcon({
  mint,
  url,
  tokenName,
  size = 20,
  ...props
}: {
  mint: string;
  url: string | undefined;
  tokenName: string;
  size: number;
}) {
  const [hasError, setHasError] = useState(false);

  if (!url && mint === null) {
    url =
      "https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/solana/info/logo.png";
  }

  if (hasError || !url) {
    return null;
  }

  return (
    <Image
      src={url}
      title={tokenName}
      alt={tokenName}
      onError={() => setHasError(true)}
      width={size}
      height={size}
      {...props}
    />
  );
}
