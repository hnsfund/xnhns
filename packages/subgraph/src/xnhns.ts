// Import types and APIs from graph-ts
import {
  BigInt,
  Address,
  crypto,
  ens,
  log,
} from '@graphprotocol/graph-ts'

import {
  createEventID, ROOT_NODE, EMPTY_ADDRESS,
} from './utils'

// Import event types from the registry contract ABI
import {
  NewOwner as NewOwnerEvent
} from './types/ENSRegistry/EnsRegistry'

import {
  Transfer as NewTransferEvent
} from './types/Root/Root'

import {
  SnitchedOn as NewSnitchedOnEvent,
  SnitchesGotStitches as NewSnitchesGotStichesEvent,
  TLDMigrationRequested as NewMigrationRequestedEvent,
  SnitchesGotStitches as NewOracleUpdateReceivedEvent,
} from './types/HNSRegistrar/HNSRegistrar'

// Import entity types generated from the GraphQL schema
import {
  Account, Domain, NewOwner, Transfer, Deposit,
  SnitchedOn, SnitchesGotStitches, OracleUpdateReceived
} from './types/schema'

// Event handlers in chronological order to when events *should* be called

// When TLD deposit is created and oracle request sent
export function handleMigrationRequest(event: NewMigrationRequestedEvent): void {
  let account = new Account(event.params.owner.toHexString())
  account.save()
  let tld = event.params.node.toHexString()
  let domain = new Domain(tld)
  let deposit = new Deposit(createEventID(event))
  deposit.amount = event.params.deposit;
  deposit.token = Address.fromString(EMPTY_ADDRESS)
  deposit.save()

  domain.registrar = event.address
  domain.owner = account.id

  domain.deposit = deposit.id

  if(!domain) {
    domain.labelName = tld
    domain.parent = ROOT_NODE
    domain.name = tld
    domain.labelhash = event.params.node // need to generate label hash from tld string
  }
}

// When oracle response is submitted
export function handleOracleUpdateReceived(event: NewOracleUpdateReceivedEvent): void {
  let account = new Account(event.params.owner.toHexString())
  account.save()

  let tld = event.params.node.toHexString()
  let domain = new Domain(tld)
  domain.owner = account.id
  let newOwnerEvent = new NewOwner(createEventID(event))
  domain.save()

  let domainEvent = new OracleUpdateReceived(createEventID(event))
  domainEvent.oracle = event.address
  domainEvent.blockNumber = event.block.number.toI32()
  domainEvent.transactionID = event.transaction.hash
  domainEvent.domain = domain.id
  domainEvent.owner = account.id
  domainEvent.save()
}


// When NFTLD is minted after oracle validates owner
export function handleTLDRegistered(event: NewOwnerEvent): void {
  let account = new Account(event.params.owner.toHexString())
  account.save()

  let node = event.params.node.toHexString()
  let domain = new Domain(node)
  if(!domain && !domain.name) {
    domain.labelName = node
    domain.parent = ROOT_NODE
    domain.name = node
    domain.labelhash = event.params.node // need to generate label hash from tld string
  }

  if(!domain.registrar) {
    domain.registrar = event.address
  }

  // // domain logged in migration request but not created/registered yet
  if(!domain.createdAt) {
    domain.createdAt = event.block.timestamp
  }
  
  domain.owner = account.id // set new owner
  domain.save()

  let domainEvent = new NewOwner(createEventID(event))
  domainEvent.blockNumber = event.block.number.toI32()
  domainEvent.transactionID = event.transaction.hash
  domainEvent.owner = account.id
  domainEvent.parentDomain = ROOT_NODE
  domainEvent.domain = domain.id
  domainEvent.save()
}

// After snitch when NFTLD is caught double spending
export function handleSnitchedOn(event: NewSnitchedOnEvent): void {
  let account = new Account(event.params.snitch.toHexString())
  account.save()

  let domain = new Domain(event.params.node.toHexString())
  let domainEvent = new SnitchedOn(createEventID(event))
  domainEvent.blockNumber = event.block.number.toI32()
  domainEvent.transactionID = event.transaction.hash
  domainEvent.domain = domain.id // assume node exists bc smart contract wouldnt work otherwise 
  domainEvent.snitch = account.id
  domainEvent.owner = domain.owner
  domainEvent.snitchReward = event.params.snitchReward
  domainEvent.save()

  let nullAcct = new Account(EMPTY_ADDRESS)
  nullAcct.save()

  // remove owner/registrar because tld no longer in XNHNS system on this namespace
  domain.owner = nullAcct.id
  domain.registrar = Address.fromString(EMPTY_ADDRESS)
  domain.save()
}

// After snitch when NFTLD is properly setup
export function handleSnitchesGotStiches(event: NewSnitchesGotStichesEvent): void {
  let account = new Account(event.params.snitch.toHexString())
  account.save()

  let node = event.params.node.toHexString()
  let domain = new Domain(node)
  domain.save()
  
  let domainEvent = new SnitchesGotStitches(createEventID(event))
  // let domainEvent = createDomainEvent(SnitchesGotStitches, event)
  domainEvent.blockNumber = event.block.number.toI32()
  domainEvent.transactionID = event.transaction.hash
  domainEvent.domain = domain.id // assume tld exists bc smart contract wouldnt work otherwise 
  domainEvent.snitch = account.id
  domainEvent.snitchPenalty = event.params.snitchPenalty
  domainEvent.save()
}

export function handleNFTLDTransfer(event: NewTransferEvent): void {
  let prevOwner = new Account(event.params.from.toHexString())
  let newOwner = new Account(event.params.to.toHexString())
  prevOwner.save()
  newOwner.save()

  let domain = new Domain(event.params.tokenId.toHexString())
  domain.owner = newOwner.id
  domain.save()
  
  let domainEvent = new Transfer(createEventID(event))
  // let domainEvent = createDomainEvent(SnitchesGotStitches, event)
  domainEvent.blockNumber = event.block.number.toI32()
  domainEvent.transactionID = event.transaction.hash
  domainEvent.domain = domain.id // assume tld exists bc smart contract wouldnt work otherwise 
  domainEvent.owner = newOwner.id
  domainEvent.save()
}
