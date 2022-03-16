"use strict";
exports.__esModule = true;
exports.handleAuthorisationChanged = exports.handleInterfaceChanged = exports.handleContentHashChanged = exports.handleTextChanged = exports.handlePubkeyChanged = exports.handleABIChanged = exports.handleNameChanged = exports.handleMulticoinAddrChanged = exports.handleAddrChanged = void 0;
var schema_1 = require("./types/schema");
function handleAddrChanged(event) {
    var account = new schema_1.Account(event.params.a.toHexString());
    account.save();
    var resolver = new schema_1.Resolver(createResolverID(event.params.node, event.address));
    resolver.domain = event.params.node.toHexString();
    resolver.address = event.address;
    resolver.addr = event.params.a.toHexString();
    resolver.save();
    var domain = schema_1.Domain.load(event.params.node.toHexString());
    if (domain.resolver == resolver.id) {
        domain.resolvedAddress = event.params.a.toHexString();
        domain.save();
    }
    var resolverEvent = new schema_1.AddrChanged(createEventID(event));
    resolverEvent.resolver = resolver.id;
    resolverEvent.blockNumber = event.block.number.toI32();
    resolverEvent.transactionID = event.transaction.hash;
    resolverEvent.addr = event.params.a.toHexString();
    resolverEvent.save();
}
exports.handleAddrChanged = handleAddrChanged;
function handleMulticoinAddrChanged(event) {
    var resolver = getOrCreateResolver(event.params.node, event.address);
    // Handle cointypes that are outside the range we support
    if (!event.params.coinType.isI32()) {
        return;
    }
    var coinType = event.params.coinType.toI32();
    if (resolver.coinTypes == null) {
        resolver.coinTypes = [coinType];
        resolver.save();
    }
    else if (!resolver.coinTypes.includes(coinType)) {
        var coinTypes = resolver.coinTypes;
        coinTypes.push(coinType);
        resolver.coinTypes = coinTypes;
        resolver.save();
    }
    var resolverEvent = new schema_1.MulticoinAddrChanged(createEventID(event));
    resolverEvent.resolver = resolver.id;
    resolverEvent.blockNumber = event.block.number.toI32();
    resolverEvent.transactionID = event.transaction.hash;
    resolverEvent.coinType = coinType;
    resolverEvent.addr = event.params.newAddress;
    resolverEvent.save();
}
exports.handleMulticoinAddrChanged = handleMulticoinAddrChanged;
function handleNameChanged(event) {
    if (event.params.name.indexOf("\u0000") != -1)
        return;
    var resolverEvent = new schema_1.NameChanged(createEventID(event));
    resolverEvent.resolver = createResolverID(event.params.node, event.address);
    resolverEvent.blockNumber = event.block.number.toI32();
    resolverEvent.transactionID = event.transaction.hash;
    resolverEvent.name = event.params.name;
    resolverEvent.save();
}
exports.handleNameChanged = handleNameChanged;
function handleABIChanged(event) {
    var resolverEvent = new schema_1.AbiChanged(createEventID(event));
    resolverEvent.resolver = createResolverID(event.params.node, event.address);
    resolverEvent.blockNumber = event.block.number.toI32();
    resolverEvent.transactionID = event.transaction.hash;
    resolverEvent.contentType = event.params.contentType;
    resolverEvent.save();
}
exports.handleABIChanged = handleABIChanged;
function handlePubkeyChanged(event) {
    var resolverEvent = new schema_1.PubkeyChanged(createEventID(event));
    resolverEvent.resolver = createResolverID(event.params.node, event.address);
    resolverEvent.blockNumber = event.block.number.toI32();
    resolverEvent.transactionID = event.transaction.hash;
    resolverEvent.x = event.params.x;
    resolverEvent.y = event.params.y;
    resolverEvent.save();
}
exports.handlePubkeyChanged = handlePubkeyChanged;
function handleTextChanged(event) {
    var resolver = getOrCreateResolver(event.params.node, event.address);
    var key = event.params.key;
    if (resolver.texts == null) {
        resolver.texts = [key];
        resolver.save();
    }
    else if (!resolver.texts.includes(key)) {
        var texts = resolver.texts;
        texts.push(key);
        resolver.texts = texts;
        resolver.save();
    }
    var resolverEvent = new schema_1.TextChanged(createEventID(event));
    resolverEvent.resolver = createResolverID(event.params.node, event.address);
    resolverEvent.blockNumber = event.block.number.toI32();
    resolverEvent.transactionID = event.transaction.hash;
    resolverEvent.key = event.params.key;
    resolverEvent.save();
}
exports.handleTextChanged = handleTextChanged;
function handleContentHashChanged(event) {
    var resolver = getOrCreateResolver(event.params.node, event.address);
    resolver.contentHash = event.params.hash;
    resolver.save();
    var resolverEvent = new schema_1.ContenthashChanged(createEventID(event));
    resolverEvent.resolver = createResolverID(event.params.node, event.address);
    resolverEvent.blockNumber = event.block.number.toI32();
    resolverEvent.transactionID = event.transaction.hash;
    resolverEvent.hash = event.params.hash;
    resolverEvent.save();
}
exports.handleContentHashChanged = handleContentHashChanged;
function handleInterfaceChanged(event) {
    var resolverEvent = new schema_1.InterfaceChanged(createEventID(event));
    resolverEvent.resolver = createResolverID(event.params.node, event.address);
    resolverEvent.blockNumber = event.block.number.toI32();
    resolverEvent.transactionID = event.transaction.hash;
    resolverEvent.interfaceID = event.params.interfaceID;
    resolverEvent.implementer = event.params.implementer;
    resolverEvent.save();
}
exports.handleInterfaceChanged = handleInterfaceChanged;
function handleAuthorisationChanged(event) {
    var resolverEvent = new schema_1.AuthorisationChanged(createEventID(event));
    resolverEvent.blockNumber = event.block.number.toI32();
    resolverEvent.transactionID = event.transaction.hash;
    resolverEvent.resolver = createResolverID(event.params.node, event.address);
    resolverEvent.owner = event.params.owner;
    resolverEvent.target = event.params.target;
    resolverEvent.isAuthorized = event.params.isAuthorised;
    resolverEvent.save();
}
exports.handleAuthorisationChanged = handleAuthorisationChanged;
function getOrCreateResolver(node, address) {
    var id = createResolverID(node, address);
    var resolver = schema_1.Resolver.load(id);
    if (resolver === null) {
        resolver = new schema_1.Resolver(id);
        resolver.domain = node.toHexString();
        resolver.address = address;
    }
    return resolver;
}
function createEventID(event) {
    var id = event.block.number.toString().concat('-').concat(event.logIndex.toString());
    // log("\n\n generat event id - ", id)
    return id;
}
function createResolverID(node, resolver) {
    return resolver.toHexString().concat('-').concat(node.toHexString());
}
