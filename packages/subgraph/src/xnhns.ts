// Import types and APIs from graph-ts
import {
  BigInt,
  crypto,
  ens,
  log,
} from '@graphprotocol/graph-ts'

import {
  createDomainEvent, getDomain, concat, ROOT_NODE, EMPTY_ADDRESS
} from './utils'

// Import event types from the registry contract ABI
import {
  NewOwner as NewOwnerEvent,
  Transfer as TransferEvent,
  NewResolver as NewResolverEvent,
  NewTTL as NewTTLEvent,
} from './types/ENSRegistry/EnsRegistry'

import {
  SnitchedOn as NewSnitchedOnEvent,
  SnitchesGetStiches as NewSnitchesGetStichesEvent
} from './types/HNSRegistrar/HNSRegistrar'

// Import entity types generated from the GraphQL schema
import { Account, Domain, Resolver, NewOwner } from './types/schema'

// Handler for NewResolver events
export function handleTLDRegistered(event: NewOwnerEvent): void {
  let account = new Account(event.params.owner.toHexString())
  account.save()

  let tld = event.params.label.toHexString()
  let domain = new Domain(tld)
  if(!domain) {
    domain.createdAt = event.block.timestamp
    domain.labelName = tld
    domain.parent = event.params.node.toHexString()
    domain.name = tld
    domain.labelhash = event.params.label
  }
  
  domain.owner = account.id // set new owner
  domain.save()

  let domainEvent = createDomainEvent(NewOwner, event)
  domainEvent.parentDomain = event.params.node.toHexString()
  domainEvent.domain = domain.id
  domainEvent.owner = account.id
  domainEvent.save()
}

export function handleSnitchedOn(event: NewSnitchedOnEvent): void {
  let account = new Account(event.params.snitch.toHexString())
  account.save()

  let tld = event.params.label.toHexString()
  let domain = new Domain(tld)
  
  
  let domainEvent = createDomainEvent(NewSnitchedOnEvent, event)
  domainEvent.domain = domain.id // assume tld exists bc smart contract wouldnt work otherwise 
  domainEvent.snitch = account.id
  domainEvent.absconder = domain.owner
  domainEvent.snitchReward = event.params.snitchReward
  domainEvent.save()

  // remove owner because tld no longer in XNHNS system on this namespace
  domain.owner = EMPTY_ADDRESS
  domain.save()
}


export function handleSnitchesGetStiches(event: NewSnitchesGetStichesEvent): void {
  let account = new Account(event.params.snitch.toHexString())
  account.save()

  let tld = event.params.label.toHexString()
  let domain = new Domain(tld)
  
  
  let domainEvent = createDomainEvent(NewSnitchesGetStichesEvent, event)
  domainEvent.domain = domain.id // assume tld exists bc smart contract wouldnt work otherwise 
  domainEvent.snitch = account.id
  domainEvent.snitchPenalty = event.params.snitchPenalty
  domainEvent.save()
}
