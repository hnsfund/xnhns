// Import types and APIs from graph-ts
import {
  Address,
  ethereum,
} from '@graphprotocol/graph-ts'

import {
  createEventID, ROOT_NODE, EMPTY_ADDRESS, getTxnInputDataToDecode
} from './utils'

import {
  TLDUnregistered as TLDUnregisteredEvent,
  Transfer as NewTransferEvent
} from './types/Root/Root'

import {
  TLDMigrationRequested as NewMigrationRequestedEvent,
  NewOwner as NewOwnerRegistrarEvent,
  SnitchedOn as NewSnitchedOnEvent,
  SnitchesGotStitches as NewSnitchesGotStichesEvent,
  SnitchesGotStitches as NewOracleUpdateReceivedEvent,
} from './types/HNSRegistrar/HNSRegistrar'

// Import entity types generated from the GraphQL schema
import {
  Account, Domain, NewOwner, Transfer, Deposit,
  SnitchedOn, SnitchesGotStitches, OracleUpdateReceived
} from './types/schema'


// Event handlers in chronological order to when events *should* be called


/**
 * From HNSRegistrar.verify()
 * When TLD deposit is created and oracle request sent
 * @param event {node, owner, deposit}
 */
export function handleMigrationRequest(event: NewMigrationRequestedEvent): void {
  // Create an account
  let account = new Account(event.params.owner.toHexString())
  account.save()
  
  let node = event.params.node
  let decodedInputTuple = ethereum.decode('(string)', getTxnInputDataToDecode(event))!.toTuple()
  let tld = decodedInputTuple[0].toString()

  // Create a domain
  let domain = new Domain(node.toHexString())
  domain.registrar = event.address
  domain.owner = account.id // will be set again by oracle handler (handleOracleUpdateReceived)
  domain.createdAt = event.block.timestamp
  domain.name = tld
  domain.labelName = tld
  domain.labelhash = node
  domain.parent = ROOT_NODE
  domain.save()

  // Create a deposit
  let deposit = new Deposit(createEventID(event))
  deposit.amount = event.params.deposit;
  deposit.token = Address.fromString(EMPTY_ADDRESS)
  deposit.blockNumber = event.block.number.toI32()
  deposit.domain = domain.id
  deposit.transactionID = event.transaction.hash
  deposit.save()
}


/**
 * From TrustedXNHNSOracle.requestTLDUpdate()
 * When oracle sets new owner and response is submitted
 * @param event {node, owner}
 */
export function handleOracleUpdateReceived(event: NewOracleUpdateReceivedEvent): void {
  // Create an account
  let account = new Account(event.params.owner.toHexString())
  account.save()

  let node = event.params.node

  // Set owner for domain
  let domain = new Domain(node.toHexString())
  domain.owner = account.id
  domain.save()

  // Create OracleUpdateReceived domain event
  let domainEvent = new OracleUpdateReceived(createEventID(event))
  domainEvent.oracle = event.address
  domainEvent.blockNumber = event.block.number.toI32()
  domainEvent.transactionID = event.transaction.hash
  domainEvent.domain = domain.id
  domainEvent.owner = account.id
  domainEvent.save()
}


/**
 * From HNSRegistrar.register()
 * When NFTLD is minted after oracle validates owner
 * @param event {node, owner}
 */
export function handleNewOwnerRegistrar(event: NewOwnerRegistrarEvent): void {
  // Create an account
  let account = new Account(event.params.owner.toHexString())
  account.save()

  let node = event.params.node

  // Update domain
  let domain = new Domain(node.toHexString())
  domain.owner = account.id                     // set new owner
  domain.registeredAt = event.block.timestamp   // domain created in MigrationRequest registeredAt not set yet
  domain.save()

  // Create NewOwner domain event
  let domainEvent = new NewOwner(createEventID(event))
  domainEvent.blockNumber = event.block.number.toI32()
  domainEvent.transactionID = event.transaction.hash
  domainEvent.owner = account.id
  domainEvent.parentDomain = ROOT_NODE
  domainEvent.domain = domain.id
  domainEvent.save()
}


/**
 * From Root.unregister()
 * When NFTLD is unregistered and burned
 * @param event {id, owner}
 */
export function handleTLDUnregistered(event: TLDUnregisteredEvent): void {
  // Create a null account
  let nullAcct = new Account(EMPTY_ADDRESS)
  nullAcct.save()

  let tokenId = event.params.id

  // Update domain
  let domain = new Domain(tokenId.toHexString())
  domain.owner = nullAcct.id
  domain.registrar = Address.fromString(EMPTY_ADDRESS)
  domain.registeredAt = null
  domain.save()

  // Create NewOwner domain event
  let domainEvent = new Transfer(createEventID(event))
  domainEvent.blockNumber = event.block.number.toI32()
  domainEvent.transactionID = event.transaction.hash
  domainEvent.domain = domain.id
  domainEvent.owner = nullAcct.id
  domainEvent.save()
}

// After snitch when NFTLD is caught double spending
export function handleSnitchedOn(event: NewSnitchedOnEvent): void {
  let account = new Account(event.params.snitch.toHexString())
  account.save()

  let domain = new Domain(event.params.node.toHexString())
  if(!domain.createdAt) {
    domain.createdAt = event.block.timestamp
  }
  domain.save()
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
  if(!domain.createdAt) {
    domain.createdAt = event.block.timestamp
  }
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


/**
 * From Root
 * When NFTLD is transferred
 * @param event {from, to, tokenId}
 */
export function handleNFTLDTransfer(event: NewTransferEvent): void {
  // Create accounts
  let prevOwner = new Account(event.params.from.toHexString())
  let newOwner = new Account(event.params.to.toHexString())
  prevOwner.save()
  newOwner.save()

  // Update domain owner
  let domain = new Domain(event.params.tokenId.toHexString())
  domain.owner = newOwner.id
  domain.createdAt = event.block.timestamp
  domain.save()

  // Create Transfer domain event
  let domainEvent = new Transfer(createEventID(event))
  domainEvent.blockNumber = event.block.number.toI32()
  domainEvent.transactionID = event.transaction.hash
  domainEvent.domain = domain.id
  domainEvent.owner = newOwner.id
  domainEvent.save()
}
