// Import types and APIs from graph-ts
import {
  BigInt,
  ByteArray,
  ethereum,
} from '@graphprotocol/graph-ts'
// Import entity types generated from the GraphQL schema
import { Domain } from './types/schema'

export function createEventID(event: ethereum.Event): string {
  return event.block.number.toString().concat('-').concat(event.logIndex.toString())
}

export const ROOT_NODE = '0x0000000000000000000000000000000000000000000000000000000000000000'
export const EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000'

// Helper for concatenating two byte arrays
export function concat(a: ByteArray, b: ByteArray): ByteArray {
  let out = new Uint8Array(a.length + b.length)
  for (let i = 0; i < a.length; i++) {
    out[i] = a[i]
  }
  for (let j = 0; j < b.length; j++) {
    out[a.length + j] = b[j]
  }
  return out as ByteArray
}

export function byteArrayFromHex(s: string): ByteArray {
  if(s.length % 2 !== 0) {
    throw new TypeError("Hex string must have an even number of characters")
  }
  let out = new Uint8Array(s.length / 2)
  for(var i = 0; i < s.length; i += 2) {
    out[i / 2] = parseInt(s.substring(i, i + 2), 16) as u32
  }
  return out as ByteArray;
}

export function uint256ToByteArray(i: BigInt): ByteArray {
  let hex = i.toHex().slice(2).padStart(64, '0')
  return byteArrayFromHex(hex)
}

const BIG_INT_ZERO = BigInt.fromI32(0)

function createDomain(node: string, timestamp: BigInt): Domain {
  let domain = new Domain(node)
  if(node == ROOT_NODE) {
    domain = new Domain(node)
    domain.owner = EMPTY_ADDRESS
    domain.createdAt = timestamp
    domain.save()
  }
  return domain
}

export function getDomain(node: string, timestamp: BigInt = BIG_INT_ZERO): Domain|null {
  let domain = Domain.load(node)
  if(domain == null && node == ROOT_NODE) {
    return createDomain(node, timestamp)
  }
  return domain
}

