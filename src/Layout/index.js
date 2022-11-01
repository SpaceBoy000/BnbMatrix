import { styled } from "@mui/system";
import "./style.css"

import Header from '../Home/components/Header'
import Connect from "../Home/components/Connect";
import { useSSR } from "react-i18next";
import { useState } from "react";

import logoImg from "../assets/logo.png";

const Wrapper = styled("div")(({ theme }) => ({
    padding: '40px 40px 20px 40px',
    fontFamily:'monospace',
    display:'flex',
    flexDirection:'column',
    height: '100vh',
    [theme.breakpoints.down("md")]: {
    },
}));

const NavBar = styled("div")(({ theme }) => ({
    display:'flex',
    justifyContent:'space-between', 
    alignItems:'center', 
    marginBottom:'20px',
    [theme.breakpoints.down("md")]: {
        display: 'unset',
    },
}));

const ButtonRow = styled("div")(({ theme }) => ({
    [theme.breakpoints.down("md")]: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
}));

const Layout = (props) => {
    const [onMenu, setOnMenu] = useState(false);
    console.log('onMenu: ', onMenu);

    return (
        <Wrapper>
            <NavBar>
                <div className="title">
                    <img src={logoImg} width='200px'/>
                </div>
                <ButtonRow>
                    <button className="myButton menuBtn" onClick={() => {setOnMenu(!onMenu)}}>Menu</button>
                    <div className="connectBtn">
                        <Connect/>
                    </div>
                </ButtonRow>
            </NavBar>
            <div style={{display:'flex', flex: '1'}}>
                <div className='menu'>
                    <Header onMenu={onMenu} setOnMenu={setOnMenu}/>
                </div>
                <div className="main_content">
                    { props.children }
                </div>
            </div>
        </Wrapper>
    )
  }
  export default Layout