"use strict";
exports.__esModule = true;
exports.getDomain = exports.uint256ToByteArray = exports.byteArrayFromHex = exports.concat = exports.EMPTY_ADDRESS = exports.ROOT_NODE = exports.createEventID = void 0;
// Import types and APIs from graph-ts
var graph_ts_1 = require("@graphprotocol/graph-ts");
// Import entity types generated from the GraphQL schema
var schema_1 = require("./types/schema");
function createEventID(event) {
    return event.block.number.toString().concat('-').concat(event.logIndex.toString());
}
exports.createEventID = createEventID;
exports.ROOT_NODE = '0x0000000000000000000000000000000000000000000000000000000000000000';
exports.EMPTY_ADDRESS = '0x0000000000000000000000000000000000000000';
// Helper for concatenating two byte arrays
function concat(a, b) {
    var out = new Uint8Array(a.length + b.length);
    for (var i = 0; i < a.length; i++) {
        out[i] = a[i];
    }
    for (var j = 0; j < b.length; j++) {
        out[a.length + j] = b[j];
    }
    return out;
}
exports.concat = concat;
function byteArrayFromHex(s) {
    if (s.length % 2 !== 0) {
        throw new TypeError("Hex string must have an even number of characters");
    }
    var out = new Uint8Array(s.length / 2);
    for (var i = 0; i < s.length; i += 2) {
        out[i / 2] = parseInt(s.substring(i, i + 2), 16);
    }
    return out;
}
exports.byteArrayFromHex = byteArrayFromHex;
function uint256ToByteArray(i) {
    var hex = i.toHex().slice(2).padStart(64, '0');
    return byteArrayFromHex(hex);
}
exports.uint256ToByteArray = uint256ToByteArray;
var BIG_INT_ZERO = graph_ts_1.BigInt.fromI32(0);
function createDomain(node, timestamp) {
    var domain = new schema_1.Domain(node);
    if (node == exports.ROOT_NODE) {
        domain = new schema_1.Domain(node);
        domain.owner = exports.EMPTY_ADDRESS;
        domain.createdAt = timestamp;
        domain.save();
    }
    return domain;
}
function getDomain(node, timestamp) {
    if (timestamp === void 0) { timestamp = BIG_INT_ZERO; }
    var domain = schema_1.Domain.load(node);
    if (domain == null && node == exports.ROOT_NODE) {
        return createDomain(node, timestamp);
    }
    return domain;
}
exports.getDomain = getDomain;
