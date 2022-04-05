import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import ConnectionProvider from "../context/ConnectionProvider";
import KeypairProvider from "../context/KeypairProvider";
import TokenProvider from "../context/TokenProvider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <ConnectionProvider>
        <KeypairProvider>
          <TokenProvider>
            <Component {...pageProps} />
          </TokenProvider>
        </KeypairProvider>
      </ConnectionProvider>
    </ChakraProvider>
  );
}

export default MyApp;
