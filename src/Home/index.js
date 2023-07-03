import { styled } from "@mui/system";
import { Typography } from "@mui/material";
import Slider from '@mui/material/Slider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { MuiThemeProvider } from 'material-ui';
import LinearProgress from "@mui/material/LinearProgress";
import { useLocation } from "react-router-dom";
import Divider from "@mui/material/Divider";
import { Toast } from "../utils";
import { useEffect, useState } from "react";
import Matrix from "../components/Matrix";
import Web3 from "web3";
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import { useWallet } from "@solana/wallet-adapter-react";
// import { deposit, compound, toUiSolAmount, unstake } from "../contracts/instructions";
import { useContractContext } from "../providers/ContractProvider";
import { useAuthContext } from "../providers/AuthProvider";
// import * as Constants from '../contracts/constants';
// import { showToast } from "../contracts/utils";
import MiningTimer from "./components/MiningTimer.js";
import { extractEventHandlers } from "@mui/base";
import { NoBackpackSharp } from "@mui/icons-material";
import telegramIcon from "../assets/telegram.png";

const muiTheme = getMuiTheme({
    Slider: {
        trackColor: "yellow",
        selectionColor: "green"
    }
});

const Wrapper = styled("div")(({ theme }) => ({
    // height: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '2rem',
    [theme.breakpoints.down("sm")]: {
        maxWidth: "100%",
    },
}));

export const copyfunc = async (text) => {
    try {
        const toCopy = text;
        await navigator.clipboard.writeText(toCopy);
        Toast.fire({
            icon: 'success',
            title: "Copied to clipboard!"
        });
    }
    catch (err) {
        console.error('Failed to copy: ', err);
    }
}

const shorten = (str) => {
    return str.slice(0, 6) + "..." + str.slice(38);
}

export default function Home() {
    const { web3, contract, wrongNetwork, getBnbBalance, fromWei, toWei } = useContractContext();
    const { address, chainId } = useAuthContext();

    const [totalProfit, setTotalProfit] = useState(0);
    const [stakedAmount, setStakedAmount] = useState(10);
    const [weeklyProfit, setWeeklyProfit] = useState(7);
    const [period, setPeriod] = useState(0);
    const [cycleNo, setCycleNo] = useState(1);
    const [weeklyDepositsHistory, setWeeklyDepositHistory] = useState([]);
    
    const calculate = (v) => {
        // setSliderValue(v);
        console.log("staked amount: ", stakedAmount);
        console.log("calculate: ", v);
        setPeriod(v);
        setTotalProfit((stakedAmount * (1 + weeklyProfit / 100) ** v - stakedAmount).toFixed(2));
    }

    let isMobile = window.matchMedia("only screen and (max-width: 900px)").matches;

    function useQuery() {
        return new URLSearchParams(useLocation().search);
    }
    const query = useQuery();
    const getRef = () => {
        const ref = Web3.utils.isAddress(query.get("ref"))
            ? query.get("ref")
            : '0x0000000000000000000000000000000000000000'
        return ref;
    };

    // const [countdown, setCountdown] = useState({
    //     alive: true,
    //     days: 0,
    //     hours: 0,
    //     minutes: 0,
    //     seconds: 0
    // })

    // const getCountdown = (deadline) => {
    //     const now = Date.now() / 1000;
    //     const total = deadline - now;
    //     const seconds = Math.floor((total) % 60);
    //     const minutes = Math.floor((total / 60) % 60);
    //     const hours = Math.floor((total / (60 * 60)) % 24);
    //     const days = Math.floor(total / (60 * 60 * 24));

    //     return {
    //         total,
    //         days,
    //         hours,
    //         minutes,
    //         seconds
    //     };
    // }


    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         try {
    //             const data = getCountdown(1667145600) // 04:00 PM 30th Oct UTC
    //             setCountdown({
    //                 alive: data.total > 0,
    //                 days: data.days,
    //                 hours: data.hours,
    //                 minutes: data.minutes,
    //                 seconds: data.seconds
    //             })
    //         } catch (err) {
    //             console.log(err);
    //         }
    //     }, 1000);

    //     return () => clearInterval(interval);
    // }, [])


    useEffect(() => {
        const fetchContractInfo = async () => {
            if (!contract) return;
            console.log("NavBar: ", contract);
            try {
                const cycleNo = await contract.methods.getCycleCounter().call();
                setCycleNo(parseInt(cycleNo) + 1);
                console.log("cycleNo: ", cycleNo);
                
                let [depositHistory/*, topDeposits*/] = await Promise.all([
                    contract.methods.getWeeklyDepositHistory(cycleNo)
                        .call()
                        .catch((err) => {
                            console.log(err);
                            return 0;
                        }),
                    // contract.methods.getTopDepositHistory()
                    //     .call()
                    //     .catch((err) => {
                    //         console.log(err);
                    //         return 0;
                    //     }),
                ]);
                console.log("depositHistory: ", depositHistory[0].amount);
                let sortedHistory;

                if (depositHistory.length > 0) {
                    depositHistory = depositHistory.slice().sort(function(x, y) {return y.amount - x.amount});
                    depositHistory.length = Math.min(depositHistory.length, 6);
                }
                
                setWeeklyDepositHistory(depositHistory);
                console.log("After sorting depositHistory: ", depositHistory);
                // let rTop = [];
                // for (let i = topDeposits.length - 1; i >= 0; i--) {
                //     rTop.push(topDeposits[i]);
                // }
                
                // console.log("topDeposits: ", topDeposits);
                // setTopDeposits(rTop);
                
            } catch (err) {
                console.log(err);
            }
        }
        fetchContractInfo();
    }, [contract]);

    const isStarted = () => {
        return true;
    }

    let element = document.getElementById('description');
    element.content = 'Enter The Matrix...';

    return (
        <>
            {/* <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    /> */}
            <Wrapper>
                {/* <MiningTimer/> */}
                {/* <div className='contractInfo'>
                    {
                        contractInfos.map((item, index) => {
                            return (
                                <div className="contractInfoItem" key={index}>
                                    <span className="rr">{item.label}</span>
                                    <span className='tt font-bold pt-2'>{item.value + " " + item.unit} </span>
                                </div>
                            );
                        })
                    }
                </div> */}
                {/* <div style={{ flex: '1' }} /> */}

                <div className='flex flex-col md:flex-row gap-4'>
                    <div className='tradeCard'>
                        <span className='tt text-xl pb-2'>Trading Revenue</span>
                        <span className='nn text-sm'>Trading Bots</span>
                        <div className="flex gap-6">
                            <div className='tt'>+1234 USDC</div>
                            <div className='tt !text-[#11af6d]'>10.00%</div>
                        </div>
                        <span className='nn text-sm'>Trading Bots</span>
                        <div className="flex gap-6">
                            <div className='tt'>-1234 USDC</div>
                            <div className='tt !text-[#ff3131]'>10.00%</div>
                        </div>
                    </div>
                    <div className='tradeCard'>
                        <div className='tt text-xl pb-2'>Track Our Trades</div>
                        <div className="flex gap-2 items-center">
                            <div>Our trading strategies allow USDC Matrix to generate external revenue.<br/> Join the Telegram Channel.</div>
                            <a href="https://t.me/" target="_blank" alt="telegram link" className="w-[150px] hover:-translate-y-0.5"><img src={telegramIcon} width="64px" height="64px" alt="telegramIcon"/></a>
                        </div>
                    </div>
                </div>
                
                <div className='flex flex-col md:flex-row gap-4 my-2'>
                    <div className='tradeCard gap-2'>
                        <span className='tt text-xl pb-2'>Calculator</span>
                        <div className="flex gap-4">
                            <div className="gap-6 w-full">
                                <div className='nn text-sm pb-2'>Staked Amount</div>
                                <div className='tt bg-white text-black rounded-lg px-2 py-1'>
                                <input
                                    placeholder="10 USDC"
                                    // type='number'
                                    value={stakedAmount}
                                    onChange={(e) => { setStakedAmount(e.target.value) }}
                                    className='nn outline-none w-full'
                                />
                                </div>
                            </div>
                            
                            <div className="gap-6 w-full">
                                <div className='nn text-sm pb-2'>Weekly %</div>
                                <div className='tt bg-white text-black rounded-lg px-2 py-1'>
                                    <input
                                        defaultValue={7}
                                        placeholder="7%"
                                        // type='number'
                                        value={weeklyProfit}
                                        onChange={(e) => { setWeeklyProfit(e.target.value) }}
                                        className='nn outline-none w-full'
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="text-center items-center self-center w-2/3">
                            <div className='nn text-sm pt-3'>Period: {period} weeks</div>
                            <div className="text-center">
                                <MuiThemeProvider muiTheme={muiTheme}>
                                <Slider
                                    defaultValue={0}
                                    aria-label="Default"
                                    valueLabelDisplay="auto"
                                    className="m-w-[200px] !text-[#4e6cf2]"
                                    onChange={(_, v) => calculate(v)} />
                                </MuiThemeProvider>
                            </div>
                        </div>
                        <div className="flex flex-row gap-4 py-2 justify-center">
                            <div className="gap-6">
                                <div className='nn text-sm'>Total Profit</div>
                                <div className='tt'>{totalProfit} USDC</div>
                            </div>
                            
                            <div className="gap-6">
                                <div className='nn text-sm'>Weekly Profit</div>
                                <div className='tt'>{weeklyProfit} %</div>
                            </div>
                        </div>
                    </div>
                    <div className='tradeCard blueCover2 text-left max-h-[280px] overflow-y-hidden'>
                        <div className='tt text-xl pb-3 text-left'>Top Weekly Deposits</div>
                        <div className="flex items-center justify-left pb-2 gap-2">
                            <div className="nn text-sm min-w-[10%]"></div>
                            <div className="nn text-sm min-w-[35%]">Amount</div>
                            <div className="nn text-sm">Address</div>
                        </div>
                        {weeklyDepositsHistory && weeklyDepositsHistory.map((item, index) => {
                            if (parseFloat(item.amount) > 0) {
                                return (
                                    <div className="flex items-center justify-left pb-1 gap-2" key={index}>
                                        <div className="min-w-[10%]">#{index+1}</div>
                                        <div className="min-w-[35%]">{fromWei(item.amount)} USDC</div>
                                        <div className="break-words cursor-pointer" onClick={() => copyfunc(item.depositor)}>{shorten(item.depositor)}</div>
                                    </div>
                                );
                            }
                        })}
                    </div>
                </div>

                {/* <div className='tradeCard blueCover2'>
                    <div className='tt text-xl pb-2'>{`Weekly Deposits (${cycleNo}Cycle)`}</div>
                    <div className="flex gap-2 items-center justify-left">
                        <div className="nn text-sm min-w-[20%]">Amount</div>
                        <div className="nn text-sm min-w-[40%]">Address</div>
                    </div>
                    {weeklyDepositsHistory && weeklyDepositsHistory.map((item, index) => {
                        return (
                            <div className="flex gap-2 items-center justify-left py-1" key={index}>
                                <div className="min-w-[20%]">{fromWei(item.amount)} USDC</div>
                                <div className="min-w-[40%] break-words">{item.depositor}</div>
                            </div>
                        );
                    })}
                </div> */}

                {/*<div>
                        {loading && <LinearProgress color="secondary"/>}
                </div>*/}
            </Wrapper>
        </>
    );
}
