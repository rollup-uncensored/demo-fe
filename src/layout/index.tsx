import React, { PropsWithChildren, useState, useEffect } from "react";
//React Redux
import { useDispatch } from "react-redux";
import {
  setAccountAddress,
  setAccountEnsName,
  setAccountBalance,
  setAccountProvider,
  setAccountSigner,
  disconnectAccount,
} from "@/redux/reducers/account";
//Wagmi
import { useAccount, usePublicClient } from "wagmi";
import { fetchBalance, fetchEnsName } from "@wagmi/core";
//Hooks
import { useEthersSigner } from "@/hooks/useWagmi";
//Importing Components
import Navbar from "./navbar";
import Footer from "./footer";

export default function Layout({ children }: PropsWithChildren) {
  const dispatch = useDispatch();
  const [isMounted, setIsMounted] = useState(false);

  //Account Address
  const { address } = useAccount();
  //Signer
  const signer = useEthersSigner();
  //Provider
  const publicClient = usePublicClient();

  //Disconnect Account
  useAccount({
    onDisconnect: () => {
      dispatch(disconnectAccount());
    },
  });

  useEffect(() => {
    //Account Balance ETH
    address &&
      fetchBalance({
        address: address,
      })
        .then((balance) => dispatch(setAccountBalance(balance)))
        .catch((e) => console.error("Error fetching balance", e));
    //Account Ens Name
    address && publicClient.chain.id === 1
      ? fetchEnsName({
          address: address,
        }).then((ensName) => dispatch(setAccountEnsName(ensName)))
      : dispatch(setAccountEnsName(null));

    address && dispatch(setAccountAddress(address));
    publicClient && dispatch(setAccountProvider(publicClient.chains?.[0]));
    signer && dispatch(setAccountSigner(signer));
  }, [dispatch, address, publicClient, signer]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="wrapper">
      <Navbar />
      <main className="main">{children}</main>
      <Footer />
    </div>
  );
}
