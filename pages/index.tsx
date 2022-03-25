import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { clusterApiUrl, Connection, Keypair } from "@solana/web3.js";
import styles from "../styles/Home.module.css";
import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import React from "react";
import {
  useConnectionDispatch,
  useConnectionState,
} from "../context/ConnectionProvider";

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

  console.log(connection);
  return (
    <div className={styles.container}>
      <ClusterSelect value={value} setValue={setValue} />
    </div>
  );
};

export default Home;
