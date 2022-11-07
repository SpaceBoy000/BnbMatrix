import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/system";
// import { bn2uiNum, remainDays } from '../contracts/utils';
// import * as Constants from '../contracts/constants';
// import { getTimeToNextCompound } from '../contracts/instructions';
import { useMemo, useEffect, useState } from "react";
import { useContractContext } from "../providers/ContractProvider";

const Wrapper = styled("div")(({ theme }) => ({
  position: "relative",
  // margin:'0px 40px',
  minWidth:'40%', 
  fontSize:'20px',
  fontFamily: 'mediumPolice',
  paddingRight: '20px',
  // borderRight: 'solid 2px #559DC9',
  [theme.breakpoints.down("lg")]: {
    minWidth:'30%',
  },
  [theme.breakpoints.down("sm")]: {
    // borderRight: 'none',
    // borderBottom: 'solid 2px #559DC9',
    paddingRight: '0px !important',
    minWidth:'100px',
    fontSize:'17px',
    paddingBottom: '20px',
    margin: '0px !important',
    minWidth: '0px', 
  },
}));

export default function Matrix({ index, data, actionStep, onClaim, onCompound }) {
  // console.log("Matrix ", index, " : ", data);
  const { fromWei } = useContractContext();
  const [compoundStr, setCompoundStr] = useState("Compound");
  useEffect(() => {
    const interval = setInterval(() => {
      setCompoundStr(getCompoundStr());
    }, 1000);
    return () => clearInterval(interval);
  }, [data, actionStep])

  const getCompoundStr = () => {
    let time = (Number(data.lastAction) + Number(actionStep) + 133) - Date.now() / 1000;
    let h = Math.floor(time / 3600);
    let m = Math.floor((time - 3600 * h) / 60);
    let s = Math.floor(time - 3600 * h - 60 * m);
    const hStr = h.toString().padStart(2, '0');
    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');
    if (time > 0) {
      let str = "";
      if (h > 0) str = `${hStr}:${mStr}:${sStr}`;
      else str = `${mStr}:${sStr}`;
      return str;
    } 
    return "Compound";
  };

  // const getROI = () => {
  //   if (data.account.days.toNumber() === 65) return 200;
  //   // return Number(Math.pow(Constants.ROI / Constants.FEE_DIVIDER, data.account.days) * 95).toFixed(2);
  // };

  return (
    <Wrapper>
      <div className="invest_title">
        Matrix {index + 1}
      </div>
      <div style={{display:'flex', justifyContent:'space-between', margin:'10px 0px'}}>
        <Typography variant='body2'>Amount Invested</Typography>
        <Typography variant='body3'>{ fromWei(data.initAmount) } BNB</Typography>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', margin:'10px 0px'}}>
        <Typography variant='body2'>Active Balance</Typography>
        <Typography variant='body3'>{ fromWei(data.curAmount) } BNB</Typography>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', margin:'10px 0px'}}>
        <Typography variant='body2'>ROI</Typography>
        <Typography variant='body3'>{ data.cmps == 65 ? 200 : (95 * Math.pow(1.0115, data.cmps)).toFixed(2) } %</Typography>
      </div>
      <div style={{display:'flex', justifyContent:'space-around', marginTop: '15px' }}>
        <button className="myButton1 myButton" style={{backgroundColor: 'black'}} onClick = {() => onCompound(index)}>{
          compoundStr
        }</button>
        <button className="myButton1 myButton" style={{backgroundColor: '#14F195'}} onClick = {() => onClaim(index)}>Claim</button>
      </div>
    </Wrapper>
  );
}
