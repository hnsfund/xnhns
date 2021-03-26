/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Typography, Table,  Button, List, Divider, Input } from "antd";
import { namehash, labelhash } from "@ensdomains/ensjs";
import { parseEther, formatEther } from "@ethersproject/units";
import { Address } from "../components";
import { useContractReader, useLocalStorage } from '../hooks';
import { TLD_STORAGE, NETWORK } from '../constants';
const { Text } = Typography;

export default function Manage({
  registrarNewOwnerEvents,
  oracleNewOwnerEvents,
  address,
  activeNetworkBalance,
  tx,
  readContracts,
  writeContracts,
  network,
}) {
  const [tldStorage, setTldStorage] = useLocalStorage(TLD_STORAGE, {});
  console.log('oracleNewOwnerEvents', oracleNewOwnerEvents);
  if(!network) return null;
  const getLatestEventForTLD = (tld, contractEvents) => {
    const label = labelhash(tld);
    const eventsOrderedByBlock = contractEvents
      .filter((event) => event.label === label && event.owner === address) // get events for this user and tld
      .sort((a, b) => a.blockNumber < b.blockNumber) // find latest update
    return eventsOrderedByBlock[0]
  }
  
  // TODO pull t lds from events instead of storage
  const tlds = Object.entries(tldStorage).map(([tld, { network, status }]) => {
    const verificationEvent = getLatestEventForTLD(tld, oracleNewOwnerEvents);
    const registrationEvent = getLatestEventForTLD(tld, registrarNewOwnerEvents);
    const validRegistration = verificationEvent && registrationEvent &&
      verificationEvent.owner === address; // make sure tld owner hasnt been updated since registration event
    
    console.log('render tld', tld, validRegistration, verificationEvent, registrationEvent);
    const updatedStatus =  validRegistration ? 'minted' : verificationEvent ? 'verified' : status;
    if(status !== updatedStatus) {
      setTldStorage({
        ...tldStorage,
        [tld]: {
          ...tldStorage[tld],
          status: updatedStatus,
        }
      })
    }
    const net = NETWORK(network);
    return {
      tld,
      network: net ? net.name : 'Unkown Network',
      status: updatedStatus,
      nftld: updatedStatus,
    }
  })

  console.log('tlds', tlds);
  
  const columns = [
    {
      title: 'TLD',
      dataIndex: 'tld',
      key: 'tld',
      fixed: 'left',
    },
    {
      title: 'Network',
      dataIndex: 'network',
      key: 'network',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'NFTLD',
      dataIndex: 'nftld',
      key: 'nftld',
      render: (status, { tld }) => {
        console.log('mint NFT column', status, tld);
        switch(status) {
          case 'verifying':
            return <h5> Awaiting Verification...</h5>;
          case 'verified':
            return (
              <Button onClick={() => { writeContracts.HNSRegistrar.register(tld) }}>
                Mint NFTLD
              </Button>
            );
          case 'minted':
            return (
              <Link to=''>
                <Button>
                  View NFTLD
                </Button>
              </Link>
            );


        }
      }
    },
  ];
  
  return (
    <div>
      <Table dataSource={tlds} columns={columns} />;
    </div>
  )

}
