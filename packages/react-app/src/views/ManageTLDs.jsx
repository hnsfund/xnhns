/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Typography, Button, List, Divider, Input } from "antd";
import { namehash } from "@ensdomains/ensjs";
import { parseEther, formatEther } from "@ethersproject/units";
import { Address } from "../components";
import { useContractReader, useLocalStorage } from '../hooks';
import { TLD_STORAGE } from '../constants';
const { Text } = Typography;

export default function Migrate({
  registrarNewOwnerEvents,
  oracleNewOwnerEvents,
  address,
  activeNetworkBalance,
  tx,
  readContracts,
  writeContracts,
  network,
}) {

  const tldOracle = useContractReader(readContracts, "DummyXNHNSOracle", "tldOwners", namehash(tldToMigrate));
  const tldDeposit = useContractReader(readContracts, "DummyXNHNSOracle", "tldDeposits", namehash(tldToMigrate));
  const [depositAmount, setDepositAmount] = useState(minDepositAmount);
  const [tldStorage, setTldStorage] = useLocalStorage(TLD_STORAGE, {});

  if(!network) return;
  return

}
