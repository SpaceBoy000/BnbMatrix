import Typography from "@mui/material/Typography";
import { styled } from "@mui/system";
import Connect from "./Connect";
import { useTranslation } from "react-i18next";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi"
import Social from "./Social";

import { useContractContext } from "../../providers/ContractProvider";
import { config } from "../../config";

const Wrapper = styled("div")(({ theme }) => ({
  color: 'white',
  height: '100%',
  display:'flex',
  flexDirection: 'column',

  [theme.breakpoints.down("md")]: {
    h5: {
      fontSize: 20,
      margin: 0,
    },
  },
}));

const Item = styled('div')(({ theme }) => ({
  textAlign: 'left !important',
  color: 'white !important',
  padding: '20px 0',
  fontSize: '25px',
  fontFamily: 'mediumPolice',
}));


export default function Header({onMenu, setOnMenu}) {

  const PROGRAM_ID = '';
  // const wallet = useWallet();
  const {
    settingsData,
  } = useContractContext();

  const [url, setUrl] = useState('');
  const location = useLocation();

  return (
    <Wrapper>
      { onMenu === true ? (
        <div>
          <div className="mobile_head">
            <div className="mobile_herader_content">
              {/* <div style={{alignSelf:"center", marginBottom:"30px"}}>
                <img src="./favicon.png" alt="[SolMatrix]" width="60px"/>
              </div> */}
              <div className="mobile_four_btn">
                <div onClick= {() => {
                  setOnMenu(false)
                }}>
                  <Link
                    to="/dashboard"
                    className="tab"
                    style={{
                      color: location.pathname.includes('dashboard') ? '#3574b9' : 'white',
                      textDecoration: 'none',
                    }}
                  >
                    Dashboard
                  </Link>
                </div>
                <div onClick={() => {
                  setOnMenu(false)
                }}>
                  <Link
                    to="/matrices"
                    className="tab"
                    style={{
                      color: location.pathname.includes('matrices') ? '#3574b9' : 'white',
                      textDecoration: 'none',
                    }}
                  >
                    Matrices
                  </Link>
                </div>
                {/* <div onClick={() => {
                    setOnMenu(false)
                  }}>
                    <Link
                      to="/nft"
                      className="tab"
                      style={{
                        color: location.pathname.includes('nft') ? '#3574b9' : 'white',
                        textDecoration: 'none',
                      }}
                    >
                      NFT
                    </Link>
                  </div> */}
                {
                  // wallet && wallet?.publicKey && wallet?.publicKey.toBase58() === 
                  // settingsData?.account.admin.toBase58()?
                  // <div onClick={() => {
                  //   setOnMenu(false)
                  // }}>
                  //   <Link
                  //     to="/admin"
                  //     className="tab"
                  //     style={{
                  //       color: location.pathname.includes('admin') ? '#3574b9' : 'white',
                  //       textDecoration: 'none',
                  //     }}
                  //   >
                  //     Admin
                  //   </Link>
                  // </div>
                  // : <></>
                }
                

                <Divider />
                <div onClick={() => {
                  setOnMenu(false)
                }}>
                  <a href={config.scanLink} target="_blank" className="tab">
                    Contract
                  </a>
                </div>
                <div onClick={() => {
                  setOnMenu(false)
                }}>
                  <a href="/" target="_blank" className="tab">
                    Docs
                  </a>
                </div>
                <div onClick={() => {
                  setOnMenu(false)
                }}>
                  <a href="/" target="_blank" className="tab">
                    Audit
                  </a>
                </div>
                <div onClick={() => {
                  setOnMenu(false)
                }}>
                  <a href="/" target="_blank" className="tab">
                    KYC
                  </a>
                </div>
              </div>
              <div style={{flex:1}}></div>
              {/* <Social/> */}
            </div>
            <div
              className="empty_mobile"
              onClick={() => {
                setOnMenu(false)
              }}
            ></div>
          </div>
        </div>
      )
      : null }
   
      <div className="header_menu">
        <Item>
          <Link
            to="/dashboard"
            className='tab'
            style={{color: location.pathname.includes('dashboard') ? '#3574b9' : 'white'}}
          >
              Dashboard
          </Link>
        </Item>
        <Item>
          <Link
            to="matrices"
            className='tab'
            style={{color: location.pathname.includes('matrices') ? '#3574b9' : 'white'}}
          >
              Matrices
          </Link>
        </Item>
        {/* <Item>
          <Link
            to="/nft"
            className='tab'
            style={{color: location.pathname.includes('nft') ? '#3574b9' : 'white'}}
          >
              NFT
          </Link>
        </Item> */}
        {
          // wallet && wallet?.publicKey && wallet?.publicKey.toBase58() === 
          // settingsData?.account.admin.toBase58()?
            // <Item>
            //   <Link
            //     to="/admin"
            //     className='tab'
            //     style={{color: location.pathname.includes('admin') ? '#3574b9' : 'white'}}
            //   >
            //       Admin
            //   </Link>
            // </Item>
          // : <></>
        }
        <Divider />
        <Item>
          <a href={config.scanLink} target="_blank" className="tab">
            Contract
          </a>
        </Item>
        <Item>
          <a href="/" target="_blank" className="tab">
            Docs
          </a>
        </Item>
        <Item>
            <a href="/" target="_blank" className="tab">
              Audit
            </a>
        </Item>
        <Item>
            <a href="/" target="_blank" className="tab">
              KYC
            </a>
        </Item>
      </div>
      <div style={{flex: 1}}/>
      {/* <Social/> */}
    </Wrapper>
  );
}
