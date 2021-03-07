// Import types and APIs from graph-ts
import {
  ByteArray,
  crypto,
  ens
} from '@graphprotocol/graph-ts'

import {
  getDomain, createEventID, ROOT_NODE, EMPTY_ADDRESS,
  uint256ToByteArray, byteArrayFromHex, concat
} from './utils'

// Import event types from the registry contract ABI
import {
  NameRegistered as NameRegisteredEvent,
  NameRenewed as NameRenewedEvent,
  Transfer as TransferEvent,
} from './types/BaseRegistrar/BaseRegistrar'

import {
  NameRegistered as ControllerNameRegisteredEvent,
  NameRenewed as ControllerNameRenewedEvent
} from './types/RegistrarController/RegistrarController'

// Import entity types generated from the GraphQL schema
import { Account, Domain, Registration, NameRegistered, NameRenewed, NameTransferred } from './types/schema'

// namehash('badass')
var rootNode:ByteArray = byteArrayFromHex("b44c89215555ccdf0769c791a87ef752af07fc4be5a7855f589edff68ea561c7")

export function handleNameRegistered(event: NameRegisteredEvent): void {
  let account = new Account(event.params.owner.toHex())
  account.save()

  let label = uint256ToByteArray(event.params.id)
  let registration = new Registration(label.toHex())
  let node = crypto.keccak256(concat(rootNode, label)).toHex()
  let domain = getDomain(node, event.block.timestamp)
  registration.domain = domain.id
  registration.registrationDate = event.block.timestamp
  registration.expiryDate = event.params.expires
  registration.registrant = account.id

  let labelName = ens.nameByHash(label.toHexString())
  if (labelName != null) {
    registration.labelName = labelName
  }
  registration.save()

  let registrationEvent = new NameRegistered(createEventID(event))
  registrationEvent.registration = registration.id
  registrationEvent.blockNumber = event.block.number.toI32()
  registrationEvent.transactionID = event.transaction.hash
  registrationEvent.registrant = account.id
  registrationEvent.expiryDate = event.params.expires
  registrationEvent.save()
}

export function handleNameRegisteredByController(event: ControllerNameRegisteredEvent): void {
  // let domain = new Domain(crypto.keccak256(concat(rootNode, event.params.label)).toHex())
  let domain = new Domain(crypto.keccak256(concat(rootNode, event.params.label)).toHex())
  if(domain.labelName !== event.params.name) {
    domain.labelName = event.params.name
    domain.name = event.params.name + '.badass'
    domain.owner = event.params.owner.toHex()
    domain.createdAt = event.block.timestamp
    domain.save()
  }

  let registration = Registration.load(event.params.label.toHex());
  if(registration == null) return
  registration.labelName = event.params.name
  registration.cost = event.params.cost
  registration.save()
}

export function handleNameRenewedByController(event: ControllerNameRenewedEvent): void {
  let domain = new Domain(crypto.keccak256(concat(rootNode, event.params.label)).toHex())
  if(domain.labelName !== event.params.name) {
    domain.labelName = event.params.name
    domain.name = event.params.name + '.badass'
    domain.save()
  }

  let registration = Registration.load(event.params.label.toHex());
  if(registration == null) return
  registration.labelName = event.params.name
  registration.cost = event.params.cost
  registration.save()
}

export function handleNameRenewed(event: NameRenewedEvent): void {
  let label = uint256ToByteArray(event.params.id)
  let registration = new Registration(label.toHex())
  registration.expiryDate = event.params.expires
  registration.save()

  let registrationEvent = new NameRenewed(createEventID(event))
  registrationEvent.registration = registration.id
  registrationEvent.blockNumber = event.block.number.toI32()
  registrationEvent.transactionID = event.transaction.hash
  registrationEvent.expiryDate = event.params.expires
  registrationEvent.save()
}

export function handleNameTransferred(event: TransferEvent): void {
  let account = new Account(event.params.to.toHex())
  account.save()

  let label = uint256ToByteArray(event.params.tokenId)
  let registration = Registration.load(label.toHex())
  if(registration == null) return;

  registration.registrant = account.id
  registration.save()

  let transferEvent = new NameTransferred(createEventID(event))
  transferEvent.registration = label.toHex()
  transferEvent.blockNumber = event.block.number.toI32()
  transferEvent.transactionID = event.transaction.hash
  transferEvent.newOwner = account.id
  transferEvent.save()
}
