import React, { useCallback, useMemo } from 'react';
import Box from "@mui/material/Box";
import { BrowserRouter, Route, Routes, Navigate} from "react-router-dom";
import Home from "./Home";
import Layout from "./Layout";
import NFT from "./pages/NFT";
import Pool from "./pages/Pool";
import Admin from "./pages/Admin";
import { Suspense } from "react";
import "./i18n";

import { Wallets } from "./Home/components/Wallets";
import { SnackbarProvider } from 'notistack';
import * as dotenv from 'dotenv';

import {
  WalletDialogProvider as MaterialUIWalletDialogProvider,
  WalletMultiButton as MaterialUIWalletMultiButton
} from '@solana/wallet-adapter-material-ui';
import { ConnectionProvider, useLocalStorage, WalletProvider } from '@solana/wallet-adapter-react';
import {
  getBitpieWallet,
  getCoin98Wallet,
  getLedgerWallet,
  getMathWallet,
  getPhantomWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolongWallet,
  getTorusWallet
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useSnackbar } from 'notistack';
import { ContractProvider } from './providers/ContractProvider';

dotenv.config();

function App() {
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  // clusterApiUrl returns a string.
  // const endpoint = useMemo(() => "http://localhost:8899", []);
  const [autoConnect, setAutoConnect] = useLocalStorage('autoConnect', false);

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolflareWallet(),
      getTorusWallet({
        options: {
          clientId:
            'BOM5Cl7PXgE9Ylq1Z1tqzhpydY0RVr8k90QQ85N7AKI5QGSrr9iDC-3rvmy0K_hF0JfpLMiXoDhta68JwcxS1LQ'
        }
      }),
      getLedgerWallet(),
      getSolongWallet(),
      getMathWallet(),
      getSolletWallet(),
      getCoin98Wallet(),
      getBitpieWallet()
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      
    <WalletProvider wallets={wallets} autoConnect={autoConnect}>
    <ContractProvider>
    <BrowserRouter>
      <Suspense fallback="loading">
        <Box>
          <Layout>
            <Routes>
              <Route exact path="/" element={ <Navigate to="/miner"/> }/>
              <Route exact path="/miner" element={ <Home /> }/>
              <Route exact path="/nft" element={ <NFT /> }/>
              <Route exact path="/pool" element={ <Pool /> }/>
              <Route exact path="/admin" element={ <Admin /> }/>
            </Routes>
          </Layout>
        </Box>
      </Suspense>
    </BrowserRouter >
    </ContractProvider>
    </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
