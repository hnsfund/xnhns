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
  const [tldToMigrate, setTLDToMigrate] = useState("mytld");
  const tldOracle = useContractReader(readContracts, "DummyXNHNSOracle", "tldOwners", namehash(tldToMigrate));
  const minDepositAmount = useContractReader(readContracts, "HNSRegistrar", "minTLDDeposit", 10000) || "0.1";
  const [depositAmount, setDepositAmount] = useState(minDepositAmount);
  const [tldStorage, setTldStorage] = useLocalStorage(TLD_STORAGE, {});

  console.log('min deposit', minDepositAmount);
  if(!network) return null;
  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{border:"1px solid #cccccc", padding:16, width:400, margin:"auto",marginTop:64}}>

        <h2>
          You are migrating <i> {tldToMigrate}/ </i> <br />
          to the <i> {network.name} </i> network <br />
          with a deposit of  <i> {depositAmount} ETH </i>
        </h2>
        <h4> It costs a minimum of {minDepositAmount} ETH to deposit on {network.name} </h4>

        <div style={{margin:8}}>
          <Input addonBefore='TLD' placeholder={tldToMigrate}
            onChange={(e) => {setTLDToMigrate(e.target.value)}} />
          
          <Divider/>

          <Input addonBefore='Deposit Amount' placeholder={depositAmount}
            onChange={(e) => {setDepositAmount(e.target.value)}} />
        </div>

        <Divider size='large' />

        <h3>
          Make sure you add these records directly <b> ONCHAIN </b> (not your nameserver)
          to {tldToMigrate}/ and the transactions are mined <b> BEFORE </b> pressing 'Migrate':
        </h3>

        <Divider />

        TXT Record:
        <div>
          <Text copyable={{text: 'xnhns='+address }}>
            xnhns={address}
          </Text>
        </div>

        <Divider />

        NS Record:
        <div>
          <Text copyable={{text: `${network.xnhnsRegistry}._${network.namespace}.` }}>
            {network.xnhnsRegistry}._{network.namespace}.
          </Text>
        </div>

        <Divider />

        {activeNetworkBalance < depositAmount ? (
          <Text>
            Your ETH balance ({activeNetworkBalance}) is below your deposit amount.
            Please make sure you are on the right network
          </Text> 
        ) : (
          <Button onClick={() => {
            const { hash } = tx( writeContracts.HNSRegistrar.verify(
              tldToMigrate,
              { value: parseEther(depositAmount) }
            ))
            // save tld to local storage to use in other pages
            setTldStorage({
              ...tldStorage,
              [tldToMigrate]: {
                network: network.chainId,
                namehash: namehash(tldToMigrate),
                status: 'verifying'
              }
            })
          }}>
            Migrate
          </Button>
        )}
        
      </div>


      <div style={{ width:600, margin: "auto", marginTop:32, paddingBottom:32 }}>
        <h2>Your Migration Transactions:</h2>
        <List
          bordered
          dataSource={[...oracleNewOwnerEvents, ...registrarNewOwnerEvents]}
          renderItem={(item) => {
             // filter events by owner == connected wallet
            if(item[2] === address) {
              return (
                <List.Item key={item.blockNumber+"_"+item.label+"_"+item.owner}>
                  {item[1]}
                  <Address
                    address={item[2]}
                    fontSize={16}
                    /> 
                </List.Item>
              )
            }
          }}
        />
      </div>

    </div>
  );
}
