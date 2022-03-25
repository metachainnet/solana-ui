import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import styles from "../styles/Home.module.css";
import { Button, Radio, RadioGroup, Stack } from "@chakra-ui/react";
import React from "react";
import {
  useConnectionDispatch,
  useConnectionState,
} from "../context/ConnectionProvider";
import {
  useKeypairDispatch,
  useKeypairState,
} from "../context/KeypairProvider";

function ClusterSelect(props: any) {
  const { value, setValue } = props;
  return (
    <RadioGroup onChange={setValue} value={value}>
      <Stack direction="row">
        <Radio value="1">Mainnet</Radio>
        <Radio value="2">Testnet</Radio>
        <Radio value="3">Devnet</Radio>
      </Stack>
    </RadioGroup>
  );
}

const Home: NextPage = () => {
  const [value, setValue] = React.useState("1");
  const { connection } = useConnectionState();
  const connectionDispatch = useConnectionDispatch()!;
  const keypair = useKeypairState()?.keypair;
  const keypairDispatch = useKeypairDispatch()!;

  React.useEffect(() => {
    if (value === "1") {
      connectionDispatch({
        type: "CHANGE_CONNECTION",
        payload: "mainnet-beta",
      });
    } else if (value === "2") {
      connectionDispatch({
        type: "CHANGE_CONNECTION",
        payload: "testnet",
      });
    } else {
      connectionDispatch({
        type: "CHANGE_CONNECTION",
        payload: "devnet",
      });
    }
  }, [connectionDispatch, value]);

  const handleGenerateBtn = () => {
    keypairDispatch({
      type: "GENERATE_KEYPAIR",
    });
  };

  const handleDeleteBtn = () => {
    keypairDispatch({
      type: "DELETE_KEYPAIR",
    });
  };

  return (
    <div suppressHydrationWarning={true} className={styles.container}>
      <ClusterSelect value={value} setValue={setValue} />
      {!!keypair ? (
        <div>
          <div>{keypair.publicKey.toBase58()}</div>
          <Button onClick={handleDeleteBtn} colorScheme="red">
            Delete
          </Button>
        </div>
      ) : (
        <Button onClick={handleGenerateBtn} colorScheme="blue">
          Generate One
        </Button>
      )}
    </div>
  );
};

export default Home;
