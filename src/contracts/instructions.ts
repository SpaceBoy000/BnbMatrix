import {
  PublicKey,
  Keypair,
  clusterApiUrl,
  Cluster,
  Connection,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  Transaction,
  LAMPORTS_PER_SOL,
  TransactionSignature
} from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { Solminer, IDL } from "./solminer-idl";
import * as Constants from "./constants";
import BN from "bn.js";
import BigNumber from 'bignumber.js';

import { WalletContextState } from "@solana/wallet-adapter-react";
import { WalletSignMessageError } from "@solana/wallet-adapter-base";
import { showToast, miniAddress } from "./utils";
import { toast } from "react-toastify";
import NodeWallet from "@project-serum/anchor/dist/cjs/nodewallet";


const conn = new Connection("https://api.metaplex.solana.com", "confirmed");
// const conn = new Connection(clusterApiUrl("devnet"), "confirmed");

export const getProgram = (wallet: any) => {
  let provider = new anchor.AnchorProvider(
    conn,
    wallet,
    anchor.AnchorProvider.defaultOptions()
  );
  const program = new anchor.Program(IDL, Constants.PROGRAM_ID, provider);
  return program;
};
export const initializeProgram = async ( admin: any) => {
  
  if (!admin || !admin.publicKey) return null;

  let settingsKey = await getSettingsKey();

  const poolKey = await getPoolKey();
  const blacklistKey = await getBlacklistKey();
  const tx = new Transaction();
  const program = getProgram(admin);
  tx.add(await program.methods
    .initialize()
    .accounts({
      admin: admin.publicKey,
      settings: settingsKey,
      pool: poolKey,
      devWallet: admin.publicKey,
      marketingWallet: admin.publicKey,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    })
    .instruction());
  tx.add(await program.methods
    .initBlacklist()
    .accounts({
      admin: admin.publicKey,
      settings: settingsKey,
      blacklist: blacklistKey,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    }).instruction()
  );

  const res = await send(conn, admin, tx);
  console.log("initialized txHash =", res);
  return res;
};

export const addBlacklist = async ( admin: any, blackAddress: string) => {  

  if (!admin || !admin.publicKey) return null;
  const blacklistKey = await getBlacklistKey();
  let settingsKey = await getSettingsKey();
  const tx = new Transaction();
  const program = getProgram(admin);
  tx.add(await program.methods
    .addBlacklist(
      new PublicKey(blackAddress)
    )
    .accounts({
      admin: admin.publicKey,
      settings: settingsKey,
      blacklist: blacklistKey
    })
    .instruction());
  const res = await send(conn, admin, tx);
  console.log("addBlacklist txHash =", res);
  return res;
};

export const removeFromBlacklist = async ( admin: any, blackAddress: string) => {
  if (!admin || !admin.publicKey) return null;
  const blacklistKey = await getBlacklistKey();
  let settingsKey = await getSettingsKey();
  const tx = new Transaction();
  const program = getProgram(admin);
  tx.add(await program.methods
    .removeFromBlacklist(
      new PublicKey(blackAddress)
    )
    .accounts({
      admin: admin.publicKey,
      settings: settingsKey,
      blacklist: blacklistKey
    })
    .instruction());
  const res = await send(conn, admin, tx);
  console.log("removeFromBlacklist txHash =", res);
  return res;
};

export const setPoolPrize = async ( 
  admin: any, 
  mins: number,
  ratio: number,
) => {
  if (!admin || !admin.publicKey) return null;
  const settings = await getSettings();
  const tx = new Transaction();
  const program = getProgram(admin);
  tx.add(await program.methods
    .setPoolPrize(
      new BN(mins),
      new BN(ratio * 100),
    )
    .accounts({
      admin: admin.publicKey,
      settings: settings.publicKey
    })
    .instruction());
  const res = await send(conn, admin, tx);
  console.log("setPoolPrize txHash =", res);
  return res;
};

export const startMiner = async ( 
  admin: any, 
) => {
  if (!admin || !admin.publicKey) return null;
  const settings = await getSettings();
  const tx = new Transaction();
  const program = getProgram(admin);
  tx.add(await program.methods
    .startMiner()
    .accounts({
      admin: admin.publicKey,
      settings: settings.publicKey
    })
    .instruction());
  const res = await send(conn, admin, tx);
  console.log("startMiner txHash =", res);
  return res;
};

export const createUserStateInstruction = async (
  payer: any,
  settingsKey: PublicKey,
  userKey: PublicKey,
  userStateKey: PublicKey
) => {
  const program = getProgram(payer);
  return await program.methods
    .initUserState(userKey)
    .accounts({
      payer: payer.publicKey,
      settings: settingsKey,
      userState: userStateKey,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY,
    })
    .instruction();
};

export const getLastWinner = (settingsData: any) => {
  let winner = "No Winner";
  
  if (settingsData && settingsData?.account?.lastPoolWinner.toBase58() !== PublicKey.default.toBase58()) {
    winner =  settingsData?.account?.lastPoolWinner.toBase58();
  }
  let prize = 'No Prize';
  if (settingsData) {
    let x = settingsData.account.lastPoolReward.toNumber();
    prize = Number(x / 1000_000_000).toFixed(2);
    prize = prize + ' SOL';
  }
  return {winner, prize};
}

export const getLastDepositUser = (settingsData: any) => {
  
  let user = "No Deposit";
  if (settingsData && settingsData?.account.members.toNumber() > 0) {
    user = settingsData?.account?.lastDepositUser.toBase58() ?? "No Deposit";
  }
  return user;
}

export const deposit = async (
  user: any, 
  solAmount: number, 
  refAddress: string,
  checkStarted: () => {}
) => {
  if (!user || !user.publicKey) return null;
  const program = getProgram(user);
  const settings = await getSettings();


  if (!settings) {
    showToast('Program is not initialized. Initializing ...', 5000, 2);
    console.log("not inited");
    try {
      await initializeProgram(user);
      showToast('Program is initialized');
    } catch {
      showToast('Program initializing failed', 2000, 1);
    }
    return null;
  }
  if(!checkStarted()) return null;

  if (solAmount < 1 || solAmount > 1000) {
    showToast('Minimum investment : 1 Sol, Maximum investment : 1,000 Sol', 2000, 1);
    return null;
  }

  let userStateKey = await getUserStateKey(user.publicKey);
  let refUserKey = settings.account.devWallet;
  try {
    refUserKey = new PublicKey(refAddress);
  } catch {
    refUserKey = settings.account.devWallet;
  }

  const tx = new Transaction();
  let userStateData = await program.account.userState.fetchNullable(userStateKey);
  if (!userStateData) {
    tx.add(await createUserStateInstruction(user, settings.publicKey, user.publicKey, userStateKey));
  } else {
    if(userStateData.referrer.toBase58() !== PublicKey.default.toBase58()) {
      refUserKey = userStateData.referrer;
    }
  }

  let refUserStateKey = await getUserStateKey(refUserKey);
  let refUserStateData = await program.account.userState.fetchNullable(refUserStateKey);
  if (!refUserStateData && refUserKey.toBase58() !== user.publicKey.toBase58()) {
    tx.add(await createUserStateInstruction(user, settings.publicKey, refUserKey, refUserStateKey));
  }
  
  let seedKey = Keypair.generate().publicKey;
  let investDataKey = await getInvestDataKey(user.publicKey, seedKey);
  tx.add(await program.methods
    .deposit(
      new BN(solAmount * LAMPORTS_PER_SOL), 
      seedKey,
    )
    .accounts({
      user: user.publicKey,
      settings: settings.publicKey,
      devWallet: settings.account.devWallet,
      pool: settings.account.pool,
      userState: userStateKey,
      investData: investDataKey,
      referrer: refUserKey,
      refUserState: refUserStateKey,
      lastDepositUser: settings.account.lastDepositUser,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    })
    .instruction());
  
  const res = await send(conn, user, tx);
  console.log("deposit txHash =", res);
  return res;
  // return investDataKey;
};

export const unstake = async ( user: any, investDataKey: PublicKey) => {
  if (!user || !user.publicKey) return null;
  const program = getProgram(user);
  const settings = await getSettings();
  if (!settings) throw new Error('Please init program');
  let userStateKey = await getUserStateKey(user.publicKey);
 
  let userStateData = await program.account.userState.fetchNullable(userStateKey);
  if (!userStateData) {
    throw new Error('Please deposit');;
  } 
  
  const userBalance = (await program.provider.connection.getBalance(user.publicKey)).toFixed();
  let blacklistKey = await getBlacklistKey();

  let tx = new Transaction();
  tx.add(await program.methods
    .unstake()
    .accounts({
      user: user.publicKey,
      settings: settings.publicKey,
      blacklist: blacklistKey,
      pool: settings.account.pool,
      investData: investDataKey,
      userState: userStateKey,
      devWallet: settings.account.devWallet,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    })
    .instruction());
  
  const res = await send(conn, user, tx);
  console.log("unstake txHash =", res);
  return res;
};

export const getTimeToNextCompound = (investData: any) => {
  let nowSec = Math.floor(Date.now() / 1000);
  let nextCompoundSec = investData.lastRoiTime.toNumber() + Constants.COMPOUND_LIMIT;
  let time = nextCompoundSec - nowSec;
  
  const s = time % 60;
  const m = Math.floor(time / 60) % 60;
  const h = Math.floor(time / 3600) % 60;

  let notiStr = "";
  if (h > 0) notiStr = (h === 1 ? '1 hour' : `${h} hours`);
  else if (m > 0) notiStr = (m === 1 ? '1 minute' : `${m} minutes`);
  else notiStr = (s === 1 ? '1 second' : `${s} seconds`);
  return { h, m, s, notiStr, time };
};

export const compound = async ( user: any, investDataKey: PublicKey) => {
  if (!user || !user.publicKey) return null;
  const program = getProgram(user);
  const settings = await getSettings();
  if (!settings) throw new Error('Please init program');
  let userStateKey = await getUserStateKey(user.publicKey);
 
  let userStateData = await program.account.userState.fetchNullable(userStateKey);
  if (!userStateData) {
    throw new Error('Please deposit');;
  } 

  let investData = await program.account.investData.fetchNullable(investDataKey);
  if (!investData) {
    throw new Error('Please deposit');;
  }

  let { notiStr, time } = getTimeToNextCompound(investData);
  if (time > 0) {
    // showToast(`You should wait for about ${notiStr} until the next compound`, 2000, 3);
    showToast(`You have to wait until the timer is up to compound again`, 2000, 3);
    return null;
  }

  let tx = new Transaction();
  tx.add(await program.methods
    .compound()
    .accounts({
      user: user.publicKey,
      settings: settings.publicKey,
      pool: settings.account.pool,
      investData: investDataKey,
      marketingWallet: settings.account.marketingWallet,
      systemProgram: SystemProgram.programId,
      rent: SYSVAR_RENT_PUBKEY
    })
    .instruction());
  
  const res = await send(conn, user, tx);
  console.log("compound txHash =", res);
  return res;
};

export const fetchAllData = async (type: string, options?: any) => {
  const program = getProgram(new NodeWallet(Keypair.generate()));
  return await (program as any).account[type].all(options);
};

export const getSettings = async () => {
  try {
    return (await fetchAllData('settings'))[0];
  } catch(e) {
    console.error(e);
    return null;
  }
}
export const getUserState = async (userKey: PublicKey) => {
  try {
    return (await fetchAllData('userState', [{
      memcmp: {
        offset: 8,
        bytes: userKey.toBase58()
      }
    }]))[0];
  } catch {
    return null;
  }
}
export const getUserInvestDataList = async (userKey: PublicKey) => {
  try {
    console.log("getUserInvestDataList");
    return (await fetchAllData('investData', [{
      memcmp: {
        offset: 8,
        bytes: userKey.toBase58()
      }
    }]));
  } catch {
    return [];
  }
}
export const getBlackList = async () => {

  const blacklist = await (await fetchAllData('blacklist'))[0];
  return blacklist?.account.addresses;
}
export const getUserTotalInfo = async (userKey: string | PublicKey) => {
  const key = new PublicKey(userKey);
  const userState = await getUserState(key);
  const matrixList = await getUserInvestDataList(key);
  // console.log("blacklist =", blacklist);
  const blacklist = await getBlackList();
  let result = {
    totalInvest: 0,
    activeBalance: 0,
    referralCount: userState?.account.referredCount.toNumber(),
    referralReward: toUiSolAmount(userState?.account.referralReward ?? '0'),
    bannedStatus: 0,
    compoundTimes: 0,
    referrer: userState?.account.referrer.toBase58(),
  };
  if (blacklist) {
    let x = blacklist.find((acc: PublicKey) => acc.toBase58() === key.toBase58());
    if (x) result.bannedStatus = 1;
  }
  matrixList.forEach((matrix: any) => {
    result.totalInvest += toUiSolAmount(matrix.account.amount);
    result.activeBalance += toUiSolAmount(matrix.account.activeBalance);
    result.compoundTimes += matrix.account.days.toNumber();
  });
  return result;
}

export const getSettingsKey = async () => {
  return (await PublicKey.findProgramAddress([Buffer.from(Constants.SETTINGS_SEED)], new PublicKey(Constants.PROGRAM_ID)))[0];
}

export const getPoolKey = async () => {
  return (await PublicKey.findProgramAddress([Buffer.from(Constants.POOL_SEED)], new PublicKey(Constants.PROGRAM_ID)))[0];
}

export const getBlacklistKey = async () => {
  return (await PublicKey.findProgramAddress([Buffer.from(Constants.BLACKLIST_SEED)], new PublicKey(Constants.PROGRAM_ID)))[0];
}

export const getUserStateKey = async (userKey: PublicKey) => {
  return (await PublicKey.findProgramAddress([Buffer.from(Constants.STATE_SEED), userKey.toBuffer()], new PublicKey(Constants.PROGRAM_ID)))[0];
}

export const getInvestDataKey = async (userKey: PublicKey, seedKey: PublicKey) => {
  return (await PublicKey.findProgramAddress([
    Buffer.from(Constants.DATA_SEED), 
    userKey.toBuffer(),
    seedKey.toBuffer()
  ], new PublicKey(Constants.PROGRAM_ID)))[0];
}

async function send(
  connection: Connection,
  wallet: WalletContextState,
  transaction: Transaction
) {
  
  const txHash = await sendTransaction(connection, wallet, transaction);
  if (txHash != null) {
    let confirming_id = showToast("Confirming Transaction ...", -1, 2);
    let res = await connection.confirmTransaction(txHash, "confirmed");
    console.log(txHash);
    toast.dismiss(confirming_id);
    if (res.value.err) showToast("Transaction Failed", 2000, 1);
    else showToast("Transaction Confirmed", 2000);
  } else {
    //showToast("Transaction Failed", 2000, 1);
  }
  return txHash;
}

export async function sendTransaction(
  connection: Connection,
  wallet: WalletContextState,
  transaction: Transaction
) {
  if (wallet.publicKey === null || wallet.signTransaction === undefined)
    return null;
  try {
    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    transaction.feePayer = wallet.publicKey;
    let signedTransaction;
    try {
      signedTransaction = await wallet.signTransaction(transaction);
    } catch {
      throw new WalletSignMessageError();
    }
    
    const rawTransaction = signedTransaction.serialize();

    //showToast("Sending Transaction ...", 500);
    // notify({
    //   message: "Transaction",
    //   description: "Sending Transaction ...",
    //   duration: 0.5,
    // });

    const txid: TransactionSignature = await connection.sendRawTransaction(
      rawTransaction,
      {
        skipPreflight: true,
        preflightCommitment: "processed",
      }
    );
    return txid;
  } catch (e) {
    console.log("tx e = ", e);
    return null;
  }
}

export const getWalletSolBalance = async (wallet: any): Promise<String> => {
  if (wallet.publicKey === null || wallet.publicKey === undefined) return "0";
  return new BigNumber(await conn.getBalance(wallet.publicKey)).div(
    LAMPORTS_PER_SOL
  ).toString();
};

export const getVaultSolBalance = async (wallet: any): Promise<String> => {
  const vaultKey = await getPoolKey();
  console.log("vault balance =", await conn.getBalance(vaultKey));
  return new BigNumber(await conn.getBalance(vaultKey)).div(
    LAMPORTS_PER_SOL
  ).toString();
};

export const toUiSolAmount = (amount: string | BN) => {
  return new BigNumber(amount.toString()).div(
    LAMPORTS_PER_SOL
  ).toNumber();
}