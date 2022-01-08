// Import types and APIs from graph-ts
import {
  BigInt,
  crypto,
  ens,
  log,
} from '@graphprotocol/graph-ts'

import {
  createEventID, getDomain, concat, ROOT_NODE, EMPTY_ADDRESS
} from './utils'

// Import event types from the registry contract ABI
import {
  NewOwner as NewOwnerEvent,
  Transfer as TransferEvent,
  NewResolver as NewResolverEvent,
  NewTTL as NewTTLEvent
} from './types/ENSRegistry/EnsRegistry'

// Import entity types generated from the GraphQL schema
import { Account, Domain, Resolver, NewOwner, Transfer, NewResolver, NewTTL } from './types/schema'

function makeSubnode(event:NewOwnerEvent): string {
  return crypto.keccak256(concat(event.params.node, event.params.label)).toHexString()
}

// Handler for NewOwner events
function _handleNewOwner(event: NewOwnerEvent): void {
  let account = new Account(event.params.owner.toHexString())
  account.save()

  let subnode =  makeSubnode(event)
  let domain = getDomain(subnode, event.block.timestamp);
  if(domain === null) {
    domain = new Domain(subnode)
    domain.createdAt = event.block.timestamp
  }

  if(domain.name === null) {
    log.warning('ENS _handleNewOwner: domain.name is null.', [])
    // Get label and node names
    let label = ens.nameByHash(event.params.label.toHexString())
    if (label !== null) {
      domain.labelName = label
      log.warning('ENS _handleNewOwner: setting labelName to ' + label, [])
    }

    if(label === null) {
      label = '[' + event.params.label.toHexString().slice(2) + ']'
      log.warning('ENS _handleNewOwner: calculating label: ' + label, [])
    }
    if(event.params.node.toHexString() === ROOT_NODE) {
      domain.name = label
    } else {
      let parent = Domain.load(event.params.node.toHexString())!
      let parentName = parent.name
      if (label && parentName) {
        domain.name = label + '.' + parentName
      }
    }
  }
  // log.warning('ENS _handleNewOwner: setting domain.name based on label to: ' + domain.name, [])

  domain.owner = account.id
  domain.parent = event.params.node.toHexString()
  domain.labelhash = event.params.label
  domain.save()

  let domainEvent = new NewOwner(createEventID(event))
  domainEvent.blockNumber = event.block.number.toI32()
  domainEvent.transactionID = event.transaction.hash
  domainEvent.parentDomain = event.params.node.toHexString()
  domainEvent.domain = domain.id
  domainEvent.owner = account.id
  domainEvent.save()
}

// Handler for Transfer events
export function handleTransfer(event: TransferEvent): void {
  let node = event.params.node.toHexString()
  // log.warning('ENS handleTransfer: node: ' + node, [])
  let account = new Account(event.params.owner.toHexString())
  account.save()

  // Update the domain owner
  let domain = getDomain(node)!
  domain.owner = account.id
  // log.warning('ENS handleTransfer: domain id: ' + domain.id, [])
  domain.save()

  let domainEvent = new Transfer(createEventID(event))
  domainEvent.blockNumber = event.block.number.toI32()
  domainEvent.transactionID = event.transaction.hash
  domainEvent.domain = node
  domainEvent.owner = account.id
  domainEvent.save()
}

// Handler for NewResolver events
export function handleNewResolver(event: NewResolverEvent): void {
  let id = event.params.resolver.toHexString().concat('-').concat(event.params.node.toHexString())

  let node = event.params.node.toHexString()
  let domain = getDomain(node)!
  domain.resolver = id

  let resolver = Resolver.load(id)
  if(resolver === null) {
    resolver = new Resolver(id)
    resolver.domain = event.params.node.toHexString()
    resolver.address = event.params.resolver
    resolver.save()
  } else {
    domain.resolvedAddress = resolver.addr
  }

  domain.save()

  let domainEvent = new NewResolver(createEventID(event))
  domainEvent.blockNumber = event.block.number.toI32()
  domainEvent.transactionID = event.transaction.hash
  domainEvent.domain = node
  domainEvent.resolver = id
  domainEvent.save()
}

// Handler for NewTTL events
export function handleNewTTL(event: NewTTLEvent): void {
  let node = event.params.node.toHexString()
  let domain = getDomain(node)!
  domain.ttl = event.params.ttl
  domain.save()

  let domainEvent = new NewTTL(createEventID(event))
  domainEvent.blockNumber = event.block.number.toI32()
  domainEvent.transactionID = event.transaction.hash
  domainEvent.domain = node
  domainEvent.ttl = event.params.ttl
  domainEvent.save()
}

export function handleNewOwner(event: NewOwnerEvent): void {
  _handleNewOwner(event)
}
