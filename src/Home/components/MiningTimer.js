import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { useEffect, useState } from "react";
import { deployTime } from "../../config";

import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";

const CardWrapper = styled("div")(({ theme }) => ({
  maxWidth: 400,
  margin: "20px auto 24px auto",
  padding: "29px",
  background: theme.palette.primary.main,
  borderRadius: "5px",
  boxShadow: "rgba(0, 0, 0, 0.35) 0px 5px 15px",
  color: theme.typography.allVariants.color,
}));


export default function MiningTimer() {
  const [countup, setCountup] = useState({
    alive: true,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    const intervalID = setInterval(() => {
      try {
        const data_ = getCountdown(deployTime);

        setCountup({
          alive: data_.total > 0,
          days: data_.days,
          hours: data_.hours,
          minutes: data_.minutes,
          seconds: data_.seconds,
        })
      } catch (err) {
        console.log(err);
      }
    }, 1000);
    return () => {
      clearInterval(intervalID)
    }
  }, [])

  const getCountdown = (deadline) => {
    const now = Date.now() / 1000;
    const total = deadline - now;
    const seconds = Math.floor((total) % 60);
    const minutes = Math.floor((total / 60) % 60);
    const hours = Math.floor((total / (60 * 60)) % 24);
    const days = Math.floor(total / (60 * 60 * 24));

    return {
        total,
        days,
        hours,
        minutes,
        seconds
    };
}

  const getMiningTitle = () => {
    const now = Date.now() / 1000;
    if ( now < deployTime) {
      return "MINING STARTS IN: ";
    } else {
      return "RUNNING TIME: ";
    }
  }

  function padLeadingZeros(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  return (
    <div>
      <div className="launchtime">
        <Typography variant="body5" sx={{ fontSize:'30px'}}>
          {getMiningTitle()}
        </Typography>
        <Typography variant="body5" sx={{ fontSize:'25px', color:'white'}}>
          {countup.days}D : {countup.hours}H : {countup.minutes}M : {countup.seconds}S
        </Typography>
      </div>
    </div>
  );
}
