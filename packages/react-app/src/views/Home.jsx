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

      <Contract
        name="Root"
        signer={userProvider.getSigner()}
        provider={localProvider}
        address={address}
        blockExplorer={blockExplorer}
      />

      <Contract
        name="HNSRegistrar"
        signer={userProvider.getSigner()}
        provider={localProvider}
        address={address}
        blockExplorer={blockExplorer}
      />

      <Contract
        name={oracleContract}
        signer={userProvider.getSigner()}
        provider={localProvider}
        address={address}
        blockExplorer={blockExplorer}
      />

    </AppWrapper>
  )
}
