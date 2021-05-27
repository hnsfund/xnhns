/* eslint-disable jsx-a11y/accessible-emoji */

import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { Typography, Button, List, Divider, Input, Modal } from "antd";
import { namehash } from "@ensdomains/ensjs";
import { formatUnits } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import { Address, PostMigrationModal, AppWrapper } from "../components";
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

  const formatNumber = (n = 0, units = 'ether') => Number(formatUnits(BigNumber.from(n), units));
  // get amount needed to migrate from this networks Registrar contract
  const minDepositAmount = useContractReader(readContracts, 'HNSRegistrar', 'minTLDDeposit');
  const [tldToMigrate, setTLDToMigrate] = useState('');
  const [depositAmount, setDepositAmount] = useState(0.1);
  const [migrateTxStatus, setMigrationtxStatus] = useState(null);
  const [tldStorage, setTldStorage] = useLocalStorage(TLD_STORAGE, {})
  console.log('migrate networ', network);
  if(!network || !network.xnhnsRegistry) {
    return (
      <AppWrapper>
        <h3> XNHNS not supported on this chain yet </h3>
      </AppWrapper>
    );
  }

  console.log('migration data', tldToMigrate, depositAmount, migrateTxStatus);
  return (
    <AppWrapper>
      <div style={{border:"1px solid #cccccc", padding:16, width:400, margin:"auto",marginTop:64}}>

        <h2 style={{textAlign: 'left'}}>
          You are migrating <i> {tldToMigrate}/  </i> <br />
          to <i> {network.name} </i>  <br />
          with a deposit of  <i> {depositAmount} {network.namespace.toUpperCase()}  </i>
        </h2>
        <h4 style={{textAlign: 'left'}}>
          It costs a minimum of {formatNumber(minDepositAmount)} {network.namespace.toUpperCase()} to deposit on {network.name}
        </h4>

        <div style={{marginTop:32, marginBottom: 32}}>
          <Input
            addonBefore='TLD'
            placeholder={tldToMigrate}
            value={tldToMigrate}
            onChange={(e) => {setTLDToMigrate(e.target.value)}}
          />
          
          <Divider/>

          <Input
            addonBefore='Deposit Amount'
            placeholder={depositAmount}
            value={depositAmount}
            type="number"
            onChange={(e) => {setDepositAmount(Number(e.target.value))}}
          />
        </div>

        <Divider size='large' />

        <h3 style={{textAlign: 'left'}}>
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

        {formatNumber(activeNetworkBalance) < depositAmount ? (
          <Text>
            Your balance ({formatNumber(activeNetworkBalance)} {network.namespace.toUpperCase()}) is below your deposit amount.
            Please make sure you are on the right network
          </Text> 
        ) : (
          <Button onClick={() => {
            // TODO Graph query to check that tld is not registered yet
            console.log('migrating domain', depositAmount, depositAmount * 10e17)
            const migrationTLD = tldToMigrate; // save for async call if they start migrating a new tld after submiting
            const migrateTx = tx( writeContracts.HNSRegistrar.verify(
              migrationTLD,
              { value: String(depositAmount * 10e17) } // I swear it really has to be a string to work idk y
            ))
            .then((result) => {
              console.log('migration tx success', result);
              if(!result || result.code) {
                throw result;
              }
              setTldStorage({
                ...tldStorage,
                [migrationTLD]: {
                  namehash: namehash(migrationTLD),
                  status: 'verifying',
                  network: network.chainId
                }
              })
              // update ui
              setMigrationtxStatus('success');
              setDepositAmount(formatNumber(minDepositAmount))
              setTLDToMigrate('')
            })
            .catch((err) => {
              console.log('error  in migration tx', err);
              setMigrationtxStatus(err);
            })
            console.log('tx hash', migrateTx)
            
          }}>
            Migrate
          </Button>
        )}

        {/* move to admin page
        <Button onClick={() => {
           tx( writeContracts.DummyXNHNSOracle.receiveTLDUpdate(
              namehash(tldToMigrate),
              address,
            ))
        }}>
          Confirm TLD
        </Button> */}

        <PostMigrationModal
          txStatus={migrateTxStatus}
          migratedTLD={tldToMigrate}
          networkName={network.name}
          closeModal={() => setMigrationtxStatus(null)}
          setupNextMigration={() => {
            console.log('setup next migration!')
            setMigrationtxStatus(null)
            window.scrollTo({ top: 0, behavior: 'smooth'})
          }}
        />
        
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

    </AppWrapper>
  );
}
