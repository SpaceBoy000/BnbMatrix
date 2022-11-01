import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { styled } from "@mui/system";

// import DropdownLanguage from "./DropdownLanguage";
import { useTranslation } from "react-i18next";

import {
  WalletDialogProvider as MaterialUIWalletDialogProvider,
  WalletMultiButton as MaterialUIWalletMultiButton,
  WalletConnectButton
} from '@solana/wallet-adapter-material-ui';
import { NonceAccount } from "@solana/web3.js";


const WalletButton = styled("div")(() => ({
  display: 'flex',
  flexDirection: 'row-reverse',
}))

export function shorten(str) {
  if (str.length < 10) return str;
  return `${str.slice(0, 4)}...${str.slice(str.length - 4)}`;
}

export default function Connect({ responsive = true }) {
  //const { address, loading, connect, disconnect } = useAuthContext();
  const { t, i18n } = useTranslation();
  let isMobile = window.matchMedia("only screen and (max-width: 900px)").matches;

  return (<MaterialUIWalletDialogProvider>
        <WalletButton>
          <MaterialUIWalletMultiButton variant="text" style={{
            // border: "1px solid black",
            fontSize: isMobile ? '15px' : '20px',
            background: "#14F195",
            color: "white",
            marginBottom: '0px',
            fontFamily:'lightPolice',
            padding: '3px 7px',
            textTransform:'capitalize'
          }}/>
        </WalletButton>
      </MaterialUIWalletDialogProvider>);
    
}
