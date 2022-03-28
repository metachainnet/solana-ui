import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import React from "react";
import { useConnectionDispatch } from "../context/ConnectionProvider";

export default function ClusterSelect(props: any) {
  const [value, setValue] = React.useState("1");
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
