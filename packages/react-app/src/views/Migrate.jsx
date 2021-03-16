/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState } from "react";
import { Button, List, Divider, Input, Card, DatePicker, Slider, Switch, Progress, Spin } from "antd";
import { SyncOutlined } from '@ant-design/icons';
import { Address, Balance } from "../components";
import { parseEther, formatEther } from "@ethersproject/units";
import { Typography } from "antd";
const { Text } = Typography;


export default function Migrate({
  tldOracle, tldDeposits, setNewOwnerEvents, address, mainnetProvider, userProvider, localProvider,
  yourLocalBalance, tx, readContracts, writeContracts, network
}) {

  const [tldToMigrate, setTLDToMigrate] = useState("mytld");
  const [depositAmount, setDepositAmount] = useState("0.1");
  console.log('netowkr', writeContracts);
  
  if(!network) return null;

  return (
    <div>
      {/*
        ⚙️ Here is an example UI that displays and sets the purpose in your smart contract:
      */}
      <div style={{border:"1px solid #cccccc", padding:16, width:400, margin:"auto",marginTop:64}}>

        <h2>
          You are migrating <i> {tldToMigrate}/ </i> <br />
          to the <i> {network && network.name} </i> network <br />
          with a deposit of  <i> {depositAmount} ETH </i>
        </h2>
        <h4> It costs a minimum of 0.1 Ether to deposit on {network.name} </h4>

        <div style={{margin:8}}>
          <Input addonBefore='TLD' placeholder={tldToMigrate}
            onChange={(e) => {setTLDToMigrate(e.target.value)}} />
          
          <Divider/>

          <Input addonBefore='Deposit Amount' placeholder={depositAmount}
            onChange={(e) => {setDepositAmount(e.target.value)}} />
        </div>

        <Divider size='large' />

        <h3> Make sure you add these records directly on Handshake (not your nameserver) to {tldToMigrate}/ <b> before </b> pressing 'Migrate': </h3>

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

        <Button onClick={() => {
          console.log("tldToMigrate",tldToMigrate)
          /* look how you call setPurpose on your contract: */
          tx( writeContracts.HNSRegistrar.verify(tldToMigrate) )
        }}>
          Migrate
        </Button>
        
      </div>

      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      */}
      <div style={{ width:600, margin: "auto", marginTop:32, paddingBottom:32 }}>
        <h2>Your Migration Transactions:</h2>
        <List
          bordered
          dataSource={setNewOwnerEvents}
          renderItem={(item) => {
             // filter events by owner == connected wallet
            if(item[2] === address) {
              return (
                <List.Item key={item.blockNumber+"_"+item.sender+"_"+item.purpose}>
                  <Address
                      address={item[2]}
                      ensProvider={mainnetProvider}
                      fontSize={16}
                    /> 
                  {item[1]}
                </List.Item>
              )
            }
          }}
        />
      </div>

    </div>
  );
}
