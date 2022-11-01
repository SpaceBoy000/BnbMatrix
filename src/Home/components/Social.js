import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TwitterIcon from '@mui/icons-material/Twitter';
import TelegramIcon from '@mui/icons-material/Telegram';
import ESIcon from "../assets/ESIcon.png";
import auditLogo from "../assets/audit.png";
import { config } from "../../config";
import { FaEthereum } from 'react-icons/fa';
import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";

const CardWrapper = styled("div")(({ theme }) => ({
  maxWidth: 400,
  // width: '70%',
  // margin: "0 auto",
  transition: "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms",
  overflow: "hidden",
  boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
  borderRadius: "5px",
  // background: theme.palette.primary.main,
  marginBottom: 24,
  [theme.breakpoints.down("md")]: {
    width: '100%',
  }
}));

const SocialText = styled('span')(({ theme }) => ({
  color: 'black',// theme.typography.allVariants.color,
  marginTop: '3px',
  marginLeft: '5px',
}));


export default function Social() {
  const { t, i18n } = useTranslation();

  return (
    <CardWrapper>
        <Box paddingTop={2} sx={{ display: 'flex', justifyContent: 'space-around'}}>
          <a href="https://t.me/SolMatrix" target="_blank" style={{color: 'inherit', }}>
            {/* <i class='fa fa-telegram' style={{ fontSize: '26px'}}></i> */}
            <TelegramIcon style={{fontSize: '30px'}}/>
          </a>
          <a href="https://twitter.com/TheSolMatrix" target="_blank" style={{color: 'inherit', textDecoration: 'inherit', display: 'flex', alignItems: 'center'}}>
            <i className='fa fa-twitter' style={{fontSize: '26px'}}></i>
          </a>
          {/* <a href="https://discord.gg/SolMatrix" target="_blank" style={{color: 'inherit', textDecoration: 'inherit', display: 'flex', alignItems: 'center'}}>
            <i className ='fab fa-discord' style={{fontSize: '26px'}}></i>
          </a> */}
        </Box>
    </CardWrapper>
  );
}
