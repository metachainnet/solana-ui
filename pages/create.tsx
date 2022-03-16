import {
  Box,
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCallAsync } from "../src/hooks/useCallAsync";
import {
  DERIVATION_PATH,
  generateMnemonicAndSeed,
  loadMnemonicAndSeed,
  mnemonicAndSeedType,
  normalizeMnemonic,
  storeMnemonicAndSeed,
  useHasLockedMnemonicAndSeed,
} from "../src/utils/wallet-seed";
import styles from "../styles/Home.module.css";

function CreateWalletForm() {
  const [mnemonicAndSeed, setMnemonicAndSeed] = useState<mnemonicAndSeedType>({
    mnemonic: "",
    seed: "",
  });
  useEffect(() => {
    generateMnemonicAndSeed().then(setMnemonicAndSeed);
  }, []);
  const [savedWords, setSavedWords] = useState(false);
  const callAsync = useCallAsync();

  function submit(password: string) {
    const { mnemonic, seed } = mnemonicAndSeed;
    callAsync(
      storeMnemonicAndSeed(
        mnemonic,
        seed,
        password,
        DERIVATION_PATH.bip44Change
      ),
      {
        progressMessage: "Creating wallet...",
        successMessage: "Wallet created",
      }
    );
  }
  if (!savedWords) {
    return (
      <SeedWordsForm
        mnemonicAndSeed={mnemonicAndSeed}
        goForward={() => setSavedWords(true)}
      />
    );
  }

  return (
    <ChoosePasswordForm
      mnemonicAndSeed={mnemonicAndSeed}
      goBack={() => setSavedWords(false)}
      onSubmit={submit}
    />
  );
}

function SeedWordsForm({
  mnemonicAndSeed,
  goForward,
}: {
  mnemonicAndSeed: mnemonicAndSeedType;
  goForward: Function;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [seedCheck, setSeedCheck] = useState("");

  const downloadMnemonic = (mnemonic: string) => {
    const url = window.URL.createObjectURL(new Blob([mnemonic]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "sollet.bak");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <>
      <Box>
        <Box>
          <Text variant="h5">Create New Wallet</Text>
          <Text>Create a new wallet to hold Solana and SPL tokens.</Text>
          <Text>
            Please write down the following twenty four words and keep them in a
            safe place:
          </Text>
          {mnemonicAndSeed ? (
            <Input
              variant="outlined"
              value={mnemonicAndSeed.mnemonic}
              onFocus={(e) => e.currentTarget.select()}
              readOnly
            />
          ) : (
            <Spinner />
          )}
          <Text>
            Your private keys are only stored on your current computer or
            device. You will need these words to restore your wallet if your
            browser&apos;s storage is cleared or your device is damaged or lost.
          </Text>
          <Text>
            By default, sollet will use{" "}
            <code>m/44&apos;/501&apos;/0&apos;/0&apos;</code> as the derivation
            path for the main wallet. To use an alternative path, try restoring
            an existing wallet.
          </Text>
          <Checkbox
            checked={confirmed}
            disabled={!mnemonicAndSeed}
            onChange={(e) => setConfirmed(e.target.checked)}
          >
            I have saved these words in a safe place
          </Checkbox>

          <Text>
            <Button
              variant="contained"
              color="primary"
              style={{ marginTop: 20 }}
              onClick={() => {
                downloadMnemonic(mnemonicAndSeed?.mnemonic);
                setDownloaded(true);
              }}
            >
              Download Backup Mnemonic File (Required)
            </Button>
          </Text>
        </Box>
        <Box style={{ justifyContent: "flex-end" }}>
          <Button
            color="primary"
            disabled={!confirmed || !downloaded}
            onClick={() => setShowDialog(true)}
          >
            Continue
          </Button>
        </Box>
      </Box>
      <Modal isOpen={showDialog} onClose={() => setShowDialog(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Mnemonic</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              Please re-enter your seed phrase to confirm that you have saved
              it.
            </div>
            <Text>Please type your seed phrase to confirm</Text>
            <Input
              variant="outlined"
              margin="normal"
              value={seedCheck}
              onChange={(e) => setSeedCheck(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => setShowDialog(false)}>Close</Button>
            <Button
              type="submit"
              color="secondary"
              disabled={
                normalizeMnemonic(seedCheck) !== mnemonicAndSeed?.mnemonic
              }
              onClick={() => goForward()}
            >
              Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function ChoosePasswordForm({
  mnemonicAndSeed,
  goBack,
  onSubmit,
}: {
  mnemonicAndSeed: mnemonicAndSeedType;
  goBack: Function;
  onSubmit: Function;
}) {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");

  return (
    <Box>
      <Box>
        <Text variant="h5">Choose a Password (Optional)</Text>
        <Text>Optionally pick a password to protect your wallet.</Text>
        <Input
          variant="outlined"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          variant="outlined"
          type="password"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
        />
        <Text>
          If you forget your password you will need to restore your wallet using
          your seed words.
        </Text>
      </Box>
      <Box style={{ justifyContent: "space-between" }}>
        <Button onClick={() => goBack()}>Back</Button>
        <Button
          color="primary"
          disabled={password !== passwordConfirm}
          onClick={() => onSubmit(password)}
        >
          Create Wallet
        </Button>
      </Box>
    </Box>
  );
}

function LoginForm() {
  const [password, setPassword] = useState("");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const callAsync = useCallAsync();

  const submit = () => {
    callAsync(loadMnemonicAndSeed(password, stayLoggedIn), {
      progressMessage: "Unlocking wallet...",
      successMessage: "Wallet unlocked",
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
}

const CreateWallet: NextPage = () => {
  const [restore, setRestore] = useState(false);
  const [hasLockedMnemonicAndSeed, loading] = useHasLockedMnemonicAndSeed();

  if (loading) {
    return null;
  }
  return (
    <div className={styles.container}>
      <>
        {hasLockedMnemonicAndSeed ? <LoginForm /> : <CreateWalletForm />}
        <br />
      </>
    </div>
  );
};

export default CreateWallet;
