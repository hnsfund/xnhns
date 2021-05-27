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
          managing DNS records on another chain (resolver bridge) and
          tokenizing TLDs as assets on another chain (asset bridge).
        </p>
        <Button
          href='https://titansofdata.substack.com/p/what-is-cross-network-handshake-xnhns'
          target="_blank"
        >
          Learn More
        </Button>
      </div>
    </AppWrapper>
  )
}
