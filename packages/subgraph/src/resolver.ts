import {
  ABIChanged as ABIChangedEvent,
  AddrChanged as AddrChangedEvent,
  AddressChanged as AddressChangedEvent,
  AuthorisationChanged as AuthorisationChangedEvent,
  ContenthashChanged as ContenthashChangedEvent,
  InterfaceChanged as InterfaceChangedEvent,
  NameChanged as NameChangedEvent,
  PubkeyChanged as PubkeyChangedEvent,
  TextChanged as TextChangedEvent,
  DNSRecordChanged as DNSRecordChangedEvent,
  DNSRecordDeleted as DNSRecordDeletedEvent,
  DNSZoneCleared as DNSZoneClearedEvent,
} from './types/PublicResolver/PublicResolver'

import {
  Account,
  Domain,
  Resolver,
  AddrChanged,
  MulticoinAddrChanged,
  NameChanged,
  AbiChanged,
  PubkeyChanged,
  ContenthashChanged,
  DNSRecordChanged,
  DNSRecordDeleted,
  DNSZoneCleared,
  InterfaceChanged,
  AuthorisationChanged,
  TextChanged,
} from './types/schema'

import { Bytes, BigInt, Address, ethereum } from "@graphprotocol/graph-ts";

import { log } from '@graphprotocol/graph-ts'

export function handleAddrChanged(event: AddrChangedEvent): void {
  let account = new Account(event.params.a.toHexString())
  account.save()

  let resolver = new Resolver(createResolverID(event.params.node, event.address))
  resolver.domain = event.params.node.toHexString()
  resolver.address = event.address
  resolver.addr = event.params.a.toHexString()
  resolver.save()

  let domain = Domain.load(event.params.node.toHexString())
  if(domain && domain.resolver === resolver.id) {
    domain.resolvedAddress = event.params.a.toHexString()
    domain.save()
  }

  let resolverEvent = new AddrChanged(createEventID(event))
  resolverEvent.resolver = resolver.id
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.addr = event.params.a.toHexString()
  resolverEvent.save()
}

export function handleMulticoinAddrChanged(event: AddressChangedEvent): void {
  let resolver = getOrCreateResolver(event.params.node, event.address)

  // Handle cointypes that are outside the range we support
  if(!event.params.coinType.isI32()) {
    return;
  }

  let coinType = event.params.coinType.toI32()
  if(resolver.coinTypes === null) {
    resolver.coinTypes = [coinType];
    resolver.save();
  } else {
    let coinTypes = resolver.coinTypes!
    if(!coinTypes.includes(coinType)) {
      coinTypes.push(coinType)
      resolver.coinTypes = coinTypes
      resolver.save()
    }
  }

  let resolverEvent = new MulticoinAddrChanged(createEventID(event))
  resolverEvent.resolver = resolver.id
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.coinType = BigInt.fromI32(coinType)
  resolverEvent.addr = event.params.newAddress
  resolverEvent.save()
}

export function handleNameChanged(event: NameChangedEvent): void {
  if(event.params.name.indexOf("\u0000") != -1) return;

  let resolverEvent = new NameChanged(createEventID(event))
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.name = event.params.name
  resolverEvent.save()
}

export function handleABIChanged(event: ABIChangedEvent): void {
  let resolverEvent = new AbiChanged(createEventID(event))
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.contentType = event.params.contentType
  resolverEvent.save()
}

export function handlePubkeyChanged(event: PubkeyChangedEvent): void {
  let resolverEvent = new PubkeyChanged(createEventID(event))
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.x = event.params.x
  resolverEvent.y = event.params.y
  resolverEvent.save()
}

export function handleTextChanged(event: TextChangedEvent): void {
  let resolver = getOrCreateResolver(event.params.node, event.address)
  let key = event.params.key;
  if(resolver.texts === null) {
    resolver.texts = [key];
    resolver.save();
  } else {
    let texts = resolver.texts!
    if(!texts.includes(key)) {
      texts.push(key)
      resolver.texts = texts
      resolver.save()
    }
  }

  let resolverEvent = new TextChanged(createEventID(event))
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.key = event.params.key
  resolverEvent.save()
}

export function handleContentHashChanged(event: ContenthashChangedEvent): void {
  let resolver = getOrCreateResolver(event.params.node, event.address)
  resolver.contentHash = event.params.hash
  resolver.save()

  let resolverEvent = new ContenthashChanged(createEventID(event))
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.hash = event.params.hash
  resolverEvent.save()
}

export function handleDNSRecordChanged(event: DNSRecordChangedEvent): void {
  let resolver = getOrCreateResolver(event.params.node, event.address)
  resolver.save()

  let resolverEvent = new DNSRecordChanged(createEventID(event))
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.node = event.params.node
  resolverEvent.name = event.params.name
  resolverEvent.resource = event.params.resource
  resolverEvent.record = event.params.record
  resolverEvent.save()
}

export function handleDNSRecordDeleted(event: DNSRecordDeletedEvent): void {
  let resolver = getOrCreateResolver(event.params.node, event.address)
  resolver.save()

  let resolverEvent = new DNSRecordDeleted(createEventID(event))
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.node = event.params.node
  resolverEvent.name = event.params.name
  resolverEvent.resource = event.params.resource
  resolverEvent.save()
}

export function handleDNSZoneCleared(event: DNSZoneClearedEvent): void {
  let resolver = getOrCreateResolver(event.params.node, event.address)
  resolver.save()

  let resolverEvent = new DNSZoneCleared(createEventID(event))
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.node = event.params.node
  resolverEvent.save()
}

export function handleInterfaceChanged(event: InterfaceChangedEvent): void {
  let resolverEvent = new InterfaceChanged(createEventID(event))
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.interfaceID = event.params.interfaceID
  resolverEvent.implementer = event.params.implementer
  resolverEvent.save()
}

export function handleAuthorisationChanged(event: AuthorisationChangedEvent): void {
  let resolverEvent = new AuthorisationChanged(createEventID(event))
  resolverEvent.blockNumber = event.block.number.toI32()
  resolverEvent.transactionID = event.transaction.hash
  resolverEvent.resolver = createResolverID(event.params.node, event.address)
  resolverEvent.owner = event.params.owner
  resolverEvent.target = event.params.target
  resolverEvent.isAuthorized = event.params.isAuthorised
  resolverEvent.save()
}

function getOrCreateResolver(node: Bytes, address: Address): Resolver {
  let id = createResolverID(node, address)
  let resolver = Resolver.load(id)
  if(resolver === null) {
    resolver = new Resolver(id)
    resolver.domain = node.toHexString()
    resolver.address = address
  }
  return resolver as Resolver
}

function createEventID(event: ethereum.Event): string {
  let id = event.block.number.toString().concat('-').concat(event.logIndex.toString())
  // log("\n\n generat event id - ", id)
  return id;
}

function createResolverID(node: Bytes, resolver: Address): string {
  return resolver.toHexString().concat('-').concat(node.toHexString())
}
