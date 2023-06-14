import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { styled } from "@mui/system";

import { useAuthContext } from "../../providers/AuthProvider";
// import DropdownLanguage from "./DropdownLanguage";
import { useTranslation } from "react-i18next";

const ConnectButton = styled('button')(({ theme }) => ({
  "&:disabled": { background: 'rgba(0, 0, 0, 0.12)', color: 'rgb(150, 150, 150) !important' },
  // borderRadius: "1.25rem",
  border: 'none',
  borderRadius: '0.5rem',
  paddingLeft: "1rem",
  paddingRight: "1rem",
  paddingTop: "0.25rem",
  paddingBottom: "0.25rem",
  fontSize: "16px",
  fontFamily: 'mediumPolice',
  lineHeight: "1.5rem",
  letterSpacing: "0.05em",
  background: "linear-gradient(90deg, #004AAD 0%, #5DE0E6 100%)",
  maxHeight: "40px",
  marginTop: "auto",
  marginBottom: "auto",
  minWidth: '135px',
  color:"white",
  [theme.breakpoints.down("md")]: {
    
  },
}));

const SmallScreenConnectButton = styled(Button)(({ theme }) => ({
  display: "none",
  marginTop: -24,
  marginBottom: 48,
  width: "95%",
  marginLeft: "auto",
  marginRight: "auto",
  borderRadius: 5,
  background: "linear-gradient(90deg, #004AAD 0%, #5DE0E6 100%)",
  boxShadow: "rgb(0 0 0 / 59%) 6px 6px 20px 6px",
  color: "white",
  [theme.breakpoints.down("md")]: {
    display: "block",
  },
}));

export function shorten(str) {
  if (str.length < 10) return str;
  return `${str.slice(0, 5)}..${str.slice(str.length - 3)}`;
}

export default function Connect({ responsive = true }) {
  const { address, loading, connect, disconnect } = useAuthContext();
  const { t, i18n } = useTranslation();

  return responsive ? (
    <>
      <ConnectButton
        color="secondary"
        variant="contained"
        disabled={loading}
        onClick={() => (address ? disconnect() : connect())}
      >
        {address ? shorten(address) : t("Connect")}
      </ConnectButton>
    </>
  ) : (
    <>
      <SmallScreenConnectButton
        color="secondary"
        variant="contained"
        disabled={loading}
        onClick={() => (address ? disconnect() : connect())}
      >
        {address ? t("Disconnect") : t("Connect")}
      </SmallScreenConnectButton>
    </>
  );
}
