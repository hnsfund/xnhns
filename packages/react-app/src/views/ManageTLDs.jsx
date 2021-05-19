/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Typography, Table,  Button, Spin, List, Divider, Input } from "antd";
import { namehash } from "@ensdomains/ensjs";
import { parseEther, formatEther } from "@ethersproject/units";
import { Address, AppWrapper } from "../components";
import { useContractReader, useLocalStorage } from '../hooks';
import { TLD_STORAGE, NETWORK } from '../constants';
import { ZhihuOutlined } from "@ant-design/icons";
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
  if(!network) return null;

  const updateTld = (tld = '', update = {}) => {
    setTldStorage({...tldStorage, [tld]: { ...(tldStorage[tld] || {}), ...update }});
  }

  const getLatestEventForTLD = (tld, contractEvents) => {
    const node = namehash(tld);
    const eventsOrderedByBlock = contractEvents
      .filter((event) => event.node === node && event.owner === address) // get events for this user and tld
      .sort((a, b) => a.blockNumber < b.blockNumber) // find latest update
    return eventsOrderedByBlock[0]
  }
  
  // TODO pull tlds from events instead of storage
  const tlds = Object.entries(tldStorage).map(([ tld, { network, status } ]) => {
    const net = NETWORK(network);
    const verificationEvent = getLatestEventForTLD(tld, oracleNewOwnerEvents);
    const registrationEvent = getLatestEventForTLD(tld, registrarNewOwnerEvents);
    const validRegistration = verificationEvent && registrationEvent &&
      verificationEvent.owner === address; // make sure tld owner hasnt been updated since registration event
    
    // console.log('render tld', tld, validRegistration, verificationEvent, registrationEvent);
    const updatedStatus =  validRegistration ? 'minted' : verificationEvent ? 'verified' : status;
    if(status !== updatedStatus) {
      updateTld(tld, { status: updatedStatus });
    }
    return {
      tld,
      network: net ? net.name : 'Unkown Network',
      status: updatedStatus,
      nftld: updatedStatus,
    }
  })
  
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
        switch(status) {
          case 'verifying':
            return <h5> Awaiting Verification...</h5>;
          case 'verified':
            return (
              <Button onClick={() => {
                // update status to show loading while tx mines
                console.log('minting tld', tld)
                updateTld(tld, { status: 'minting' })
                writeContracts.HNSRegistrar.register(namehash(tld))
                  .catch(() => {
                    // mint tx failed, revert to verified status
                    updateTld(tld, { status: 'verified' });
                  })
              }}>
                Mint NFTLD
              </Button>
            );
          case 'minting':
            console.log('set tld mint loader', tld)
            return <Spin  size="small" />
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
    <AppWrapper>
      <Table dataSource={tlds} columns={columns} />;
    </AppWrapper>
  )

}
