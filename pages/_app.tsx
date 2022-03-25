import "../styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import ConnectionProvider from "../context/ConnectionProvider";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <ConnectionProvider>
        <Component {...pageProps} />;
      </ConnectionProvider>
    </ChakraProvider>
  );
}

export default MyApp;
