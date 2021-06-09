/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Typography, Table,  Button, List, Divider, Input } from "antd";
import { Address, Contract,  AppWrapper } from "../components";
const { Text } = Typography;

export default function Home({
  userProvider,
  localProvider,
  address,
  blockExplorer,
  oracleContract,
}) {
  return (
    <AppWrapper>
      <div className='content-wrapper'>
        <h2>
          Cross-Network Handshake (XNHNS) is the best way to easily move your TLD on any smart contract platform
        </h2>
        <p>
          XNHNS accomplishes two goals for Handshake TLD owners -
          managing DNS records for trustless registrars/SLDs and imutable/uncesnorable DNS records (resolver bridge)
          and tokenizing TLDs as NFTs any another chain (asset bridge).
        </p>
        <Button
          href='https://titansofdata.substack.com/p/what-is-cross-network-handshake-xnhns'
          target="_blank"
        >
          Learn More
        </Button>

        <Divider/>

        <h2>
          Benefits of XNHNS
        </h2>
        <ul>
          <li> Maintain control of keys for your TLD on Handshake, Never at risk of losing control.  </li>

          <li> Anonymous, censorship resistant, and no middlemen </li>

          <li> Use Handshake domains with other blockchains and applications e.g. DeFi on Ethereum or dVPN on Cosmos </li>

          <li> Just a few clicks to get your NFTLD! You don't need to write any code or deploy any smart contracts.</li>

          <li> No platform lock-in. XNHNS is FOSS - you can run your own XNHNS instance if you want to and deploy to any private or public blockchain</li>

          <li> Manage all DNS records (including SLDs) onchain with full transparency and programmability </li>

          <li> Preserve your identity across all blockchains </li>
        </ul>
        

        <Divider/>

          <h2>
            Things to know before you use XNHNS
          </h2>
          <ul>
           
            <li>
              <a href="https://github.com/hnsfund/xnhns#xnhns-deposits" target="_blank">
                How do deposits work?
              </a>
            </li>
            <li>
              <a href="https://github.com/hnsfund/xnhns#types-of-xnhns-registrars" target="_blank">
                XNHNS Registrars
              </a>
            </li>

          </ul>

        <Divider/>

        <h2>
          How to setup a registrar with your NFTLD
        </h2>
        <p>
          It's super easy getting your very own registrar setup using open source ENS contracts for .eth.
          It's basically the exact same configuration as badass.domains.
        </p>
        <Button
          href='https://twitter.com/KibaGateaux'
          target="_blank"
        >
          Request Registrar
        </Button>
        
      </div>
    </AppWrapper>
  )
}
