import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/system";
// import { bn2uiNum, remainDays } from '../contracts/utils';
// import * as Constants from '../contracts/constants';
// import { getTimeToNextCompound } from '../contracts/instructions';
import { useMemo, useEffect, useState } from "react";

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

export default function Matrix({ index, data, onClaim, onCompound }) {
  const [compoundStr, setCompoundStr] = useState("Compound");
  useEffect(() => {
    const interval = setInterval(() => {
      setCompoundStr(getCompoundStr());
    }, 1000);
    return () => clearInterval(interval);
  }, [data])

  const getCompoundStr = () => {
    let {
      h, m, s, notiStr, time
    } =[]; 
    // getTimeToNextCompound(data.account);

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

  const getROI = () => {
    if (data.account.days.toNumber() === 65) return 200;
    // return Number(Math.pow(Constants.ROI / Constants.FEE_DIVIDER, data.account.days) * 95).toFixed(2);
  };

  return (
    <Wrapper>
      <div className="invest_title">
        Matrix {index + 1}
      </div>
      <div style={{display:'flex', justifyContent:'space-between', margin:'10px 0px'}}>
        <div>Amount Invested</div>
        {/* <div className="nn">{ bn2uiNum(data.account.amount) } Sol</div> */}
      </div>
      <div style={{display:'flex', justifyContent:'space-between', margin:'10px 0px'}}>
        <div>Active Balance</div>
        {/* <div className="nn">{ bn2uiNum(data.account.activeBalance)} Sol</div> */}
      </div>
      <div style={{display:'flex', justifyContent:'space-between', margin:'10px 0px'}}>
        <div>ROI</div>
        <div className="nn">{ getROI() } %</div>
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
