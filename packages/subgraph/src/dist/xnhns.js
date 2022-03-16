"use strict";
exports.__esModule = true;
exports.handleNFTLDTransfer = exports.handleSnitchesGotStiches = exports.handleSnitchedOn = exports.handleTLDRegistered = exports.handleOracleUpdateReceived = exports.handleMigrationRequest = void 0;
// Import types and APIs from graph-ts
var graph_ts_1 = require("@graphprotocol/graph-ts");
var utils_1 = require("./utils");
// Import entity types generated from the GraphQL schema
var schema_1 = require("./types/schema");
// Event handlers in chronological order to when events *should* be called
// When TLD deposit is created and oracle request sent
function handleMigrationRequest(event) {
    var account = new schema_1.Account(event.params.owner.toHexString());
    account.save();
    var tld = event.params.node.toHexString();
    var domain = new schema_1.Domain(tld);
    var deposit = new schema_1.Deposit(utils_1.createEventID(event));
    deposit.amount = event.params.deposit;
    deposit.token = graph_ts_1.Address.fromString(utils_1.EMPTY_ADDRESS);
    deposit.save();
    domain.registrar = event.address;
    domain.owner = account.id;
    domain.deposit = deposit.id;
    if (!domain) {
        domain.labelName = tld;
        domain.parent = utils_1.ROOT_NODE;
        domain.name = tld;
        domain.labelhash = event.params.node; // need to generate label hash from tld string
    }
}
exports.handleMigrationRequest = handleMigrationRequest;
// When oracle response is submitted
function handleOracleUpdateReceived(event) {
    var account = new schema_1.Account(event.params.owner.toHexString());
    account.save();
    var tld = event.params.node.toHexString();
    var domain = new schema_1.Domain(tld);
    domain.owner = account.id;
    var newOwnerEvent = new schema_1.NewOwner(utils_1.createEventID(event));
    domain.save();
    var domainEvent = new schema_1.OracleUpdateReceived(utils_1.createEventID(event));
    domainEvent.oracle = event.address;
    domainEvent.blockNumber = event.block.number.toI32();
    domainEvent.transactionID = event.transaction.hash;
    domainEvent.domain = domain.id;
    domainEvent.owner = account.id;
    domainEvent.save();
}
exports.handleOracleUpdateReceived = handleOracleUpdateReceived;
// When NFTLD is minted after oracle validates owner
function handleTLDRegistered(event) {
    var account = new schema_1.Account(event.params.owner.toHexString());
    account.save();
    var node = event.params.node.toHexString();
    var domain = new schema_1.Domain(node);
    if (!domain && !domain.name) {
        domain.labelName = node;
        domain.parent = utils_1.ROOT_NODE;
        domain.name = node;
        domain.labelhash = event.params.node; // need to generate label hash from tld string
    }
    if (!domain.registrar) {
        domain.registrar = event.address;
    }
    // // domain logged in migration request but not created/registered yet
    if (!domain.createdAt) {
        domain.createdAt = event.block.timestamp;
    }
    domain.owner = account.id; // set new owner
    domain.save();
    var domainEvent = new schema_1.NewOwner(utils_1.createEventID(event));
    domainEvent.blockNumber = event.block.number.toI32();
    domainEvent.transactionID = event.transaction.hash;
    domainEvent.owner = account.id;
    domainEvent.parentDomain = utils_1.ROOT_NODE;
    domainEvent.domain = domain.id;
    domainEvent.save();
}
exports.handleTLDRegistered = handleTLDRegistered;
// After snitch when NFTLD is caught double spending
function handleSnitchedOn(event) {
    var account = new schema_1.Account(event.params.snitch.toHexString());
    account.save();
    var domain = new schema_1.Domain(event.params.node.toHexString());
    var domainEvent = new schema_1.SnitchedOn(utils_1.createEventID(event));
    domainEvent.blockNumber = event.block.number.toI32();
    domainEvent.transactionID = event.transaction.hash;
    domainEvent.domain = domain.id; // assume node exists bc smart contract wouldnt work otherwise 
    domainEvent.snitch = account.id;
    domainEvent.owner = domain.owner;
    domainEvent.snitchReward = event.params.snitchReward;
    domainEvent.save();
    var nullAcct = new schema_1.Account(utils_1.EMPTY_ADDRESS);
    nullAcct.save();
    // remove owner/registrar because tld no longer in XNHNS system on this namespace
    domain.owner = nullAcct.id;
    domain.registrar = graph_ts_1.Address.fromString(utils_1.EMPTY_ADDRESS);
    domain.save();
}
exports.handleSnitchedOn = handleSnitchedOn;
// After snitch when NFTLD is properly setup
function handleSnitchesGotStiches(event) {
    var account = new schema_1.Account(event.params.snitch.toHexString());
    account.save();
    var node = event.params.node.toHexString();
    var domain = new schema_1.Domain(node);
    domain.save();
    var domainEvent = new schema_1.SnitchesGotStitches(utils_1.createEventID(event));
    // let domainEvent = createDomainEvent(SnitchesGotStitches, event)
    domainEvent.blockNumber = event.block.number.toI32();
    domainEvent.transactionID = event.transaction.hash;
    domainEvent.domain = domain.id; // assume tld exists bc smart contract wouldnt work otherwise 
    domainEvent.snitch = account.id;
    domainEvent.snitchPenalty = event.params.snitchPenalty;
    domainEvent.save();
}
exports.handleSnitchesGotStiches = handleSnitchesGotStiches;
function handleNFTLDTransfer(event) {
    var prevOwner = new schema_1.Account(event.params.from.toHexString());
    var newOwner = new schema_1.Account(event.params.to.toHexString());
    prevOwner.save();
    newOwner.save();
    var domain = new schema_1.Domain(event.params.tokenId.toHexString());
    domain.owner = newOwner.id;
    domain.save();
    var domainEvent = new schema_1.Transfer(utils_1.createEventID(event));
    // let domainEvent = createDomainEvent(SnitchesGotStitches, event)
    domainEvent.blockNumber = event.block.number.toI32();
    domainEvent.transactionID = event.transaction.hash;
    domainEvent.domain = domain.id; // assume tld exists bc smart contract wouldnt work otherwise 
    domainEvent.owner = newOwner.id;
    domainEvent.save();
}
exports.handleNFTLDTransfer = handleNFTLDTransfer;
