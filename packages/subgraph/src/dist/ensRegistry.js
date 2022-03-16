"use strict";
exports.__esModule = true;
exports.handleNewOwner = exports.handleNewTTL = exports.handleNewResolver = exports.handleTransfer = void 0;
// Import types and APIs from graph-ts
var graph_ts_1 = require("@graphprotocol/graph-ts");
var utils_1 = require("./utils");
// Import entity types generated from the GraphQL schema
var schema_1 = require("./types/schema");
// Handler for NewOwner events
function _handleNewOwner(event) {
    var account = new schema_1.Account(event.params.owner.toHexString());
    account.save();
    var subnode = graph_ts_1.crypto.keccak256(utils_1.concat(event.params.node, event.params.label)).toHexString();
    var domain = utils_1.getDomain(subnode, event.block.timestamp);
    if (domain == null) {
        domain = new schema_1.Domain(subnode);
        domain.createdAt = event.block.timestamp;
    }
    if (domain.name == null) {
        // Get label and node names
        var label = graph_ts_1.ens.nameByHash(event.params.label.toHexString());
        if (label != null) {
            domain.labelName = label;
        }
        if (label == null) {
            label = '[' + event.params.label.toHexString().slice(2) + ']';
        }
        if (event.params.node.toHexString() == utils_1.ROOT_NODE) {
            domain.name = label;
        }
        else {
            var parent = schema_1.Domain.load(event.params.node.toHexString());
            domain.name = label + '.' + parent.name;
        }
    }
    domain.owner = account.id;
    domain.parent = event.params.node.toHexString();
    domain.labelhash = event.params.label;
    domain.save();
    var domainEvent = new schema_1.NewOwner(utils_1.createEventID(event));
    domainEvent.blockNumber = event.block.number.toI32();
    domainEvent.transactionID = event.transaction.hash;
    domainEvent.parentDomain = event.params.node.toHexString();
    domainEvent.domain = domain.id;
    domainEvent.owner = account.id;
    domainEvent.save();
}
// Handler for Transfer events
function handleTransfer(event) {
    var node = event.params.node.toHexString();
    var account = new schema_1.Account(event.params.owner.toHexString());
    account.save();
    // Update the domain owner
    var domain = utils_1.getDomain(node);
    domain.owner = account.id;
    domain.save();
    var domainEvent = new schema_1.Transfer(utils_1.createEventID(event));
    domainEvent.blockNumber = event.block.number.toI32();
    domainEvent.transactionID = event.transaction.hash;
    domainEvent.domain = node;
    domainEvent.owner = account.id;
    domainEvent.save();
}
exports.handleTransfer = handleTransfer;
// Handler for NewResolver events
function handleNewResolver(event) {
    var id = event.params.resolver.toHexString().concat('-').concat(event.params.node.toHexString());
    var node = event.params.node.toHexString();
    var domain = utils_1.getDomain(node);
    domain.resolver = id;
    var resolver = schema_1.Resolver.load(id);
    if (resolver == null) {
        resolver = new schema_1.Resolver(id);
        resolver.domain = event.params.node.toHexString();
        resolver.address = event.params.resolver;
        resolver.save();
    }
    else {
        domain.resolvedAddress = resolver.addr;
    }
    domain.save();
    var domainEvent = new schema_1.NewResolver(utils_1.createEventID(event));
    domainEvent.blockNumber = event.block.number.toI32();
    domainEvent.transactionID = event.transaction.hash;
    domainEvent.domain = node;
    domainEvent.resolver = id;
    domainEvent.save();
}
exports.handleNewResolver = handleNewResolver;
// Handler for NewTTL events
function handleNewTTL(event) {
    var node = event.params.node.toHexString();
    var domain = utils_1.getDomain(node);
    domain.ttl = event.params.ttl;
    domain.save();
    var domainEvent = new schema_1.NewTTL(utils_1.createEventID(event));
    domainEvent.blockNumber = event.block.number.toI32();
    domainEvent.transactionID = event.transaction.hash;
    domainEvent.domain = node;
    domainEvent.ttl = event.params.ttl;
    domainEvent.save();
}
exports.handleNewTTL = handleNewTTL;
function handleNewOwner(event) {
    _handleNewOwner(event);
}
exports.handleNewOwner = handleNewOwner;
