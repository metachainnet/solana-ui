import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import ConnectionProvider from "../context/ConnectionProvider";
import KeypairProvider from "../context/KeypairProvider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <ConnectionProvider>
        <KeypairProvider>
          <Component {...pageProps} />;
        </KeypairProvider>
      </ConnectionProvider>
    </ChakraProvider>
  );
}

export default MyApp;
