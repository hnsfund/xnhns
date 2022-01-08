// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class FeesCollected extends ethereum.Event {
  get params(): FeesCollected__Params {
    return new FeesCollected__Params(this);
  }
}

export class FeesCollected__Params {
  _event: FeesCollected;

  constructor(event: FeesCollected) {
    this._event = event;
  }

  get fees(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get owner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class NewOracle extends ethereum.Event {
  get params(): NewOracle__Params {
    return new NewOracle__Params(this);
  }
}

export class NewOracle__Params {
  _event: NewOracle;

  constructor(event: NewOracle) {
    this._event = event;
  }

  get oracle(): Address {
    return this._event.parameters[0].value.toAddress();
  }
}

export class NewOwner extends ethereum.Event {
  get params(): NewOwner__Params {
    return new NewOwner__Params(this);
  }
}

export class NewOwner__Params {
  _event: NewOwner;

  constructor(event: NewOwner) {
    this._event = event;
  }

  get node(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get owner(): Address {
    return this._event.parameters[1].value.toAddress();
  }
}

export class SnitchedOn extends ethereum.Event {
  get params(): SnitchedOn__Params {
    return new SnitchedOn__Params(this);
  }
}

export class SnitchedOn__Params {
  _event: SnitchedOn;

  constructor(event: SnitchedOn) {
    this._event = event;
  }

  get node(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get owner(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get snitch(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get snitchReward(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class SnitchesGotStitches extends ethereum.Event {
  get params(): SnitchesGotStitches__Params {
    return new SnitchesGotStitches__Params(this);
  }
}

export class SnitchesGotStitches__Params {
  _event: SnitchesGotStitches;

  constructor(event: SnitchesGotStitches) {
    this._event = event;
  }

  get node(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get owner(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get snitch(): Address {
    return this._event.parameters[2].value.toAddress();
  }

  get snitchPenalty(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class TLDMigrationRequested extends ethereum.Event {
  get params(): TLDMigrationRequested__Params {
    return new TLDMigrationRequested__Params(this);
  }
}

export class TLDMigrationRequested__Params {
  _event: TLDMigrationRequested;

  constructor(event: TLDMigrationRequested) {
    this._event = event;
  }

  get node(): Bytes {
    return this._event.parameters[0].value.toBytes();
  }

  get owner(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get deposit(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class HNSRegistrar___getSnitchResult {
  value0: Address;
  value1: BigInt;

  constructor(value0: Address, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromAddress(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }
}

export class HNSRegistrar extends ethereum.SmartContract {
  static bind(address: Address): HNSRegistrar {
    return new HNSRegistrar("HNSRegistrar", address);
  }

  NAMESPACE(): string {
    let result = super.call("NAMESPACE", "NAMESPACE():(string)", []);

    return result[0].toString();
  }

  try_NAMESPACE(): ethereum.CallResult<string> {
    let result = super.tryCall("NAMESPACE", "NAMESPACE():(string)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  _getSnitch(node: Bytes): HNSRegistrar___getSnitchResult {
    let result = super.call(
      "_getSnitch",
      "_getSnitch(bytes32):(address,uint256)",
      [ethereum.Value.fromFixedBytes(node)]
    );

    return new HNSRegistrar___getSnitchResult(
      result[0].toAddress(),
      result[1].toBigInt()
    );
  }

  try__getSnitch(
    node: Bytes
  ): ethereum.CallResult<HNSRegistrar___getSnitchResult> {
    let result = super.tryCall(
      "_getSnitch",
      "_getSnitch(bytes32):(address,uint256)",
      [ethereum.Value.fromFixedBytes(node)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new HNSRegistrar___getSnitchResult(
        value[0].toAddress(),
        value[1].toBigInt()
      )
    );
  }

  claimFees(): boolean {
    let result = super.call("claimFees", "claimFees():(bool)", []);

    return result[0].toBoolean();
  }

  try_claimFees(): ethereum.CallResult<boolean> {
    let result = super.tryCall("claimFees", "claimFees():(bool)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  claimSnitchReward(tld: string): boolean {
    let result = super.call(
      "claimSnitchReward",
      "claimSnitchReward(string):(bool)",
      [ethereum.Value.fromString(tld)]
    );

    return result[0].toBoolean();
  }

  try_claimSnitchReward(tld: string): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "claimSnitchReward",
      "claimSnitchReward(string):(bool)",
      [ethereum.Value.fromString(tld)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  ens(): Address {
    let result = super.call("ens", "ens():(address)", []);

    return result[0].toAddress();
  }

  try_ens(): ethereum.CallResult<Address> {
    let result = super.tryCall("ens", "ens():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  getLabel(tld: string): Bytes {
    let result = super.call("getLabel", "getLabel(string):(bytes32)", [
      ethereum.Value.fromString(tld)
    ]);

    return result[0].toBytes();
  }

  try_getLabel(tld: string): ethereum.CallResult<Bytes> {
    let result = super.tryCall("getLabel", "getLabel(string):(bytes32)", [
      ethereum.Value.fromString(tld)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  getNamehash(tld: string): Bytes {
    let result = super.call("getNamehash", "getNamehash(string):(bytes32)", [
      ethereum.Value.fromString(tld)
    ]);

    return result[0].toBytes();
  }

  try_getNamehash(tld: string): ethereum.CallResult<Bytes> {
    let result = super.tryCall("getNamehash", "getNamehash(string):(bytes32)", [
      ethereum.Value.fromString(tld)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  minTLDDeposit(): BigInt {
    let result = super.call("minTLDDeposit", "minTLDDeposit():(uint256)", []);

    return result[0].toBigInt();
  }

  try_minTLDDeposit(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "minTLDDeposit",
      "minTLDDeposit():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  namespace(): string {
    let result = super.call("namespace", "namespace():(string)", []);

    return result[0].toString();
  }

  try_namespace(): ethereum.CallResult<string> {
    let result = super.tryCall("namespace", "namespace():(string)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toString());
  }

  oracle(): Address {
    let result = super.call("oracle", "oracle():(address)", []);

    return result[0].toAddress();
  }

  try_oracle(): ethereum.CallResult<Address> {
    let result = super.tryCall("oracle", "oracle():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }

  register(tld: string): boolean {
    let result = super.call("register", "register(string):(bool)", [
      ethereum.Value.fromString(tld)
    ]);

    return result[0].toBoolean();
  }

  try_register(tld: string): ethereum.CallResult<boolean> {
    let result = super.tryCall("register", "register(string):(bool)", [
      ethereum.Value.fromString(tld)
    ]);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  snitchDeposit(): BigInt {
    let result = super.call("snitchDeposit", "snitchDeposit():(uint256)", []);

    return result[0].toBigInt();
  }

  try_snitchDeposit(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "snitchDeposit",
      "snitchDeposit():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  supportsInterface(interfaceID: Bytes): boolean {
    let result = super.call(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceID)]
    );

    return result[0].toBoolean();
  }

  try_supportsInterface(interfaceID: Bytes): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceID)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  tldDeposits(param0: Bytes): BigInt {
    let result = super.call("tldDeposits", "tldDeposits(bytes32):(uint256)", [
      ethereum.Value.fromFixedBytes(param0)
    ]);

    return result[0].toBigInt();
  }

  try_tldDeposits(param0: Bytes): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "tldDeposits",
      "tldDeposits(bytes32):(uint256)",
      [ethereum.Value.fromFixedBytes(param0)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  totalDeposits(): BigInt {
    let result = super.call("totalDeposits", "totalDeposits():(uint256)", []);

    return result[0].toBigInt();
  }

  try_totalDeposits(): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "totalDeposits",
      "totalDeposits():(uint256)",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  xnhnsOracle(): Address {
    let result = super.call("xnhnsOracle", "xnhnsOracle():(address)", []);

    return result[0].toAddress();
  }

  try_xnhnsOracle(): ethereum.CallResult<Address> {
    let result = super.tryCall("xnhnsOracle", "xnhnsOracle():(address)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toAddress());
  }
}

export class ConstructorCall extends ethereum.Call {
  get inputs(): ConstructorCall__Inputs {
    return new ConstructorCall__Inputs(this);
  }

  get outputs(): ConstructorCall__Outputs {
    return new ConstructorCall__Outputs(this);
  }
}

export class ConstructorCall__Inputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }

  get ens_(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get namespace(): string {
    return this._call.inputValues[1].value.toString();
  }

  get oracle(): Address {
    return this._call.inputValues[2].value.toAddress();
  }
}

export class ConstructorCall__Outputs {
  _call: ConstructorCall;

  constructor(call: ConstructorCall) {
    this._call = call;
  }
}

export class ClaimFeesCall extends ethereum.Call {
  get inputs(): ClaimFeesCall__Inputs {
    return new ClaimFeesCall__Inputs(this);
  }

  get outputs(): ClaimFeesCall__Outputs {
    return new ClaimFeesCall__Outputs(this);
  }
}

export class ClaimFeesCall__Inputs {
  _call: ClaimFeesCall;

  constructor(call: ClaimFeesCall) {
    this._call = call;
  }
}

export class ClaimFeesCall__Outputs {
  _call: ClaimFeesCall;

  constructor(call: ClaimFeesCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class ClaimSnitchRewardCall extends ethereum.Call {
  get inputs(): ClaimSnitchRewardCall__Inputs {
    return new ClaimSnitchRewardCall__Inputs(this);
  }

  get outputs(): ClaimSnitchRewardCall__Outputs {
    return new ClaimSnitchRewardCall__Outputs(this);
  }
}

export class ClaimSnitchRewardCall__Inputs {
  _call: ClaimSnitchRewardCall;

  constructor(call: ClaimSnitchRewardCall) {
    this._call = call;
  }

  get tld(): string {
    return this._call.inputValues[0].value.toString();
  }
}

export class ClaimSnitchRewardCall__Outputs {
  _call: ClaimSnitchRewardCall;

  constructor(call: ClaimSnitchRewardCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class IncreaseDepositCall extends ethereum.Call {
  get inputs(): IncreaseDepositCall__Inputs {
    return new IncreaseDepositCall__Inputs(this);
  }

  get outputs(): IncreaseDepositCall__Outputs {
    return new IncreaseDepositCall__Outputs(this);
  }
}

export class IncreaseDepositCall__Inputs {
  _call: IncreaseDepositCall;

  constructor(call: IncreaseDepositCall) {
    this._call = call;
  }

  get node(): Bytes {
    return this._call.inputValues[0].value.toBytes();
  }

  get amount(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class IncreaseDepositCall__Outputs {
  _call: IncreaseDepositCall;

  constructor(call: IncreaseDepositCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class RegisterCall extends ethereum.Call {
  get inputs(): RegisterCall__Inputs {
    return new RegisterCall__Inputs(this);
  }

  get outputs(): RegisterCall__Outputs {
    return new RegisterCall__Outputs(this);
  }
}

export class RegisterCall__Inputs {
  _call: RegisterCall;

  constructor(call: RegisterCall) {
    this._call = call;
  }

  get tld(): string {
    return this._call.inputValues[0].value.toString();
  }
}

export class RegisterCall__Outputs {
  _call: RegisterCall;

  constructor(call: RegisterCall) {
    this._call = call;
  }

  get value0(): boolean {
    return this._call.outputValues[0].value.toBoolean();
  }
}

export class SnitchCall extends ethereum.Call {
  get inputs(): SnitchCall__Inputs {
    return new SnitchCall__Inputs(this);
  }

  get outputs(): SnitchCall__Outputs {
    return new SnitchCall__Outputs(this);
  }
}

export class SnitchCall__Inputs {
  _call: SnitchCall;

  constructor(call: SnitchCall) {
    this._call = call;
  }

  get tld(): string {
    return this._call.inputValues[0].value.toString();
  }
}

export class SnitchCall__Outputs {
  _call: SnitchCall;

  constructor(call: SnitchCall) {
    this._call = call;
  }

  get requestId(): Bytes {
    return this._call.outputValues[0].value.toBytes();
  }
}

export class UnregisterCall extends ethereum.Call {
  get inputs(): UnregisterCall__Inputs {
    return new UnregisterCall__Inputs(this);
  }

  get outputs(): UnregisterCall__Outputs {
    return new UnregisterCall__Outputs(this);
  }
}

export class UnregisterCall__Inputs {
  _call: UnregisterCall;

  constructor(call: UnregisterCall) {
    this._call = call;
  }

  get tld(): string {
    return this._call.inputValues[0].value.toString();
  }
}

export class UnregisterCall__Outputs {
  _call: UnregisterCall;

  constructor(call: UnregisterCall) {
    this._call = call;
  }
}

export class VerifyCall extends ethereum.Call {
  get inputs(): VerifyCall__Inputs {
    return new VerifyCall__Inputs(this);
  }

  get outputs(): VerifyCall__Outputs {
    return new VerifyCall__Outputs(this);
  }
}

export class VerifyCall__Inputs {
  _call: VerifyCall;

  constructor(call: VerifyCall) {
    this._call = call;
  }

  get tld(): string {
    return this._call.inputValues[0].value.toString();
  }
}

export class VerifyCall__Outputs {
  _call: VerifyCall;

  constructor(call: VerifyCall) {
    this._call = call;
  }

  get requestId(): Bytes {
    return this._call.outputValues[0].value.toBytes();
  }
}
