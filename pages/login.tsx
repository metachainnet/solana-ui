import { Box, Button, Checkbox, Input, Text } from "@chakra-ui/react";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { useCallAsync } from "../src/hooks/useCallAsync";
import { loadMnemonicAndSeed } from "../src/utils/wallet-seed";

const LoginPage: NextPage = () => {
  const [password, setPassword] = useState("");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const callAsync = useCallAsync();
  const router = useRouter();

  const submit = () => {
    callAsync(loadMnemonicAndSeed(password, stayLoggedIn), {
      progressMessage: "Unlocking wallet...",
      successMessage: "Wallet unlocked",

      onSuccess: () => {
        router.push("/wallet");
      },
    });
  };
  const submitOnEnter = (e: any) => {
    if (e.code === "Enter" || e.code === "NumpadEnter") {
      e.preventDefault();
      e.stopPropagation();
      submit();
    }
  };
  const setPasswordOnChange = (e: any) => setPassword(e.target.value);
  const toggleStayLoggedIn = (e: any) => setStayLoggedIn(e.target.checked);

  return (
    <Box>
      <Box>
        <Text variant="h5">Unlock Wallet</Text>
        <Input
          variant="outlined"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPasswordOnChange}
          onKeyDown={submitOnEnter}
        />
        <Checkbox checked={stayLoggedIn} onChange={toggleStayLoggedIn}>
          Keep wallet unlocked
        </Checkbox>
      </Box>
      <Box style={{ justifyContent: "flex-end" }}>
        <Button color="primary" onClick={submit}>
          Unlock
        </Button>
      </Box>
    </Box>
  );
};
export default LoginPage;
