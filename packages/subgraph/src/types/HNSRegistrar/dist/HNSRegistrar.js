"use strict";
// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.VerifyCall__Outputs = exports.VerifyCall__Inputs = exports.VerifyCall = exports.UnregisterCall__Outputs = exports.UnregisterCall__Inputs = exports.UnregisterCall = exports.SnitchCall__Outputs = exports.SnitchCall__Inputs = exports.SnitchCall = exports.RegisterCall__Outputs = exports.RegisterCall__Inputs = exports.RegisterCall = exports.IncreaseDepositCall__Outputs = exports.IncreaseDepositCall__Inputs = exports.IncreaseDepositCall = exports.DonateProfitsCall__Outputs = exports.DonateProfitsCall__Inputs = exports.DonateProfitsCall = exports.ClaimSnitchRewardCall__Outputs = exports.ClaimSnitchRewardCall__Inputs = exports.ClaimSnitchRewardCall = exports.ConstructorCall__Outputs = exports.ConstructorCall__Inputs = exports.ConstructorCall = exports.HNSRegistrar = exports.HNSRegistrar___getSnitchResult = exports.TLDMigrationRequested__Params = exports.TLDMigrationRequested = exports.SnitchesGotStitches__Params = exports.SnitchesGotStitches = exports.SnitchedOn__Params = exports.SnitchedOn = exports.NewOwner__Params = exports.NewOwner = exports.NewOracle__Params = exports.NewOracle = void 0;
var graph_ts_1 = require("@graphprotocol/graph-ts");
var NewOracle = /** @class */ (function (_super) {
    __extends(NewOracle, _super);
    function NewOracle() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(NewOracle.prototype, "params", {
        get: function () {
            return new NewOracle__Params(this);
        },
        enumerable: false,
        configurable: true
    });
    return NewOracle;
}(graph_ts_1.ethereum.Event));
exports.NewOracle = NewOracle;
var NewOracle__Params = /** @class */ (function () {
    function NewOracle__Params(event) {
        this._event = event;
    }
    Object.defineProperty(NewOracle__Params.prototype, "oracle", {
        get: function () {
            return this._event.parameters[0].value.toAddress();
        },
        enumerable: false,
        configurable: true
    });
    return NewOracle__Params;
}());
exports.NewOracle__Params = NewOracle__Params;
var NewOwner = /** @class */ (function (_super) {
    __extends(NewOwner, _super);
    function NewOwner() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(NewOwner.prototype, "params", {
        get: function () {
            return new NewOwner__Params(this);
        },
        enumerable: false,
        configurable: true
    });
    return NewOwner;
}(graph_ts_1.ethereum.Event));
exports.NewOwner = NewOwner;
var NewOwner__Params = /** @class */ (function () {
    function NewOwner__Params(event) {
        this._event = event;
    }
    Object.defineProperty(NewOwner__Params.prototype, "node", {
        get: function () {
            return this._event.parameters[0].value.toBytes();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NewOwner__Params.prototype, "owner", {
        get: function () {
            return this._event.parameters[1].value.toAddress();
        },
        enumerable: false,
        configurable: true
    });
    return NewOwner__Params;
}());
exports.NewOwner__Params = NewOwner__Params;
var SnitchedOn = /** @class */ (function (_super) {
    __extends(SnitchedOn, _super);
    function SnitchedOn() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(SnitchedOn.prototype, "params", {
        get: function () {
            return new SnitchedOn__Params(this);
        },
        enumerable: false,
        configurable: true
    });
    return SnitchedOn;
}(graph_ts_1.ethereum.Event));
exports.SnitchedOn = SnitchedOn;
var SnitchedOn__Params = /** @class */ (function () {
    function SnitchedOn__Params(event) {
        this._event = event;
    }
    Object.defineProperty(SnitchedOn__Params.prototype, "node", {
        get: function () {
            return this._event.parameters[0].value.toBytes();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SnitchedOn__Params.prototype, "owner", {
        get: function () {
            return this._event.parameters[1].value.toAddress();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SnitchedOn__Params.prototype, "snitch", {
        get: function () {
            return this._event.parameters[2].value.toAddress();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SnitchedOn__Params.prototype, "snitchReward", {
        get: function () {
            return this._event.parameters[3].value.toBigInt();
        },
        enumerable: false,
        configurable: true
    });
    return SnitchedOn__Params;
}());
exports.SnitchedOn__Params = SnitchedOn__Params;
var SnitchesGotStitches = /** @class */ (function (_super) {
    __extends(SnitchesGotStitches, _super);
    function SnitchesGotStitches() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(SnitchesGotStitches.prototype, "params", {
        get: function () {
            return new SnitchesGotStitches__Params(this);
        },
        enumerable: false,
        configurable: true
    });
    return SnitchesGotStitches;
}(graph_ts_1.ethereum.Event));
exports.SnitchesGotStitches = SnitchesGotStitches;
var SnitchesGotStitches__Params = /** @class */ (function () {
    function SnitchesGotStitches__Params(event) {
        this._event = event;
    }
    Object.defineProperty(SnitchesGotStitches__Params.prototype, "node", {
        get: function () {
            return this._event.parameters[0].value.toBytes();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SnitchesGotStitches__Params.prototype, "owner", {
        get: function () {
            return this._event.parameters[1].value.toAddress();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SnitchesGotStitches__Params.prototype, "snitch", {
        get: function () {
            return this._event.parameters[2].value.toAddress();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SnitchesGotStitches__Params.prototype, "snitchPenalty", {
        get: function () {
            return this._event.parameters[3].value.toBigInt();
        },
        enumerable: false,
        configurable: true
    });
    return SnitchesGotStitches__Params;
}());
exports.SnitchesGotStitches__Params = SnitchesGotStitches__Params;
var TLDMigrationRequested = /** @class */ (function (_super) {
    __extends(TLDMigrationRequested, _super);
    function TLDMigrationRequested() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(TLDMigrationRequested.prototype, "params", {
        get: function () {
            return new TLDMigrationRequested__Params(this);
        },
        enumerable: false,
        configurable: true
    });
    return TLDMigrationRequested;
}(graph_ts_1.ethereum.Event));
exports.TLDMigrationRequested = TLDMigrationRequested;
var TLDMigrationRequested__Params = /** @class */ (function () {
    function TLDMigrationRequested__Params(event) {
        this._event = event;
    }
    Object.defineProperty(TLDMigrationRequested__Params.prototype, "node", {
        get: function () {
            return this._event.parameters[0].value.toBytes();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TLDMigrationRequested__Params.prototype, "owner", {
        get: function () {
            return this._event.parameters[1].value.toAddress();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(TLDMigrationRequested__Params.prototype, "deposit", {
        get: function () {
            return this._event.parameters[2].value.toBigInt();
        },
        enumerable: false,
        configurable: true
    });
    return TLDMigrationRequested__Params;
}());
exports.TLDMigrationRequested__Params = TLDMigrationRequested__Params;
var HNSRegistrar___getSnitchResult = /** @class */ (function () {
    function HNSRegistrar___getSnitchResult(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    }
    HNSRegistrar___getSnitchResult.prototype.toMap = function () {
        var map = new graph_ts_1.TypedMap();
        map.set("value0", graph_ts_1.ethereum.Value.fromAddress(this.value0));
        map.set("value1", graph_ts_1.ethereum.Value.fromUnsignedBigInt(this.value1));
        return map;
    };
    return HNSRegistrar___getSnitchResult;
}());
exports.HNSRegistrar___getSnitchResult = HNSRegistrar___getSnitchResult;
var HNSRegistrar = /** @class */ (function (_super) {
    __extends(HNSRegistrar, _super);
    function HNSRegistrar() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    HNSRegistrar.bind = function (address) {
        return new HNSRegistrar("HNSRegistrar", address);
    };
    HNSRegistrar.prototype.NAMESPACE = function () {
        var result = _super.prototype.call.call(this, "NAMESPACE", "NAMESPACE():(string)", []);
        return result[0].toString();
    };
    HNSRegistrar.prototype.try_NAMESPACE = function () {
        var result = _super.prototype.tryCall.call(this, "NAMESPACE", "NAMESPACE():(string)", []);
        if (result.reverted) {
            return new graph_ts_1.ethereum.CallResult();
        }
        var value = result.value;
        return graph_ts_1.ethereum.CallResult.fromValue(value[0].toString());
    };
    HNSRegistrar.prototype._getNamehash = function (tld) {
        var result = _super.prototype.call.call(this, "_getNamehash", "_getNamehash(string):(bytes32)", [
            graph_ts_1.ethereum.Value.fromString(tld)
        ]);
        return result[0].toBytes();
    };
    HNSRegistrar.prototype.try__getNamehash = function (tld) {
        var result = _super.prototype.tryCall.call(this, "_getNamehash", "_getNamehash(string):(bytes32)", [graph_ts_1.ethereum.Value.fromString(tld)]);
        if (result.reverted) {
            return new graph_ts_1.ethereum.CallResult();
        }
        var value = result.value;
        return graph_ts_1.ethereum.CallResult.fromValue(value[0].toBytes());
    };
    HNSRegistrar.prototype._getSnitch = function (node) {
        var result = _super.prototype.call.call(this, "_getSnitch", "_getSnitch(bytes32):(address,uint256)", [graph_ts_1.ethereum.Value.fromFixedBytes(node)]);
        return new HNSRegistrar___getSnitchResult(result[0].toAddress(), result[1].toBigInt());
    };
    HNSRegistrar.prototype.try__getSnitch = function (node) {
        var result = _super.prototype.tryCall.call(this, "_getSnitch", "_getSnitch(bytes32):(address,uint256)", [graph_ts_1.ethereum.Value.fromFixedBytes(node)]);
        if (result.reverted) {
            return new graph_ts_1.ethereum.CallResult();
        }
        var value = result.value;
        return graph_ts_1.ethereum.CallResult.fromValue(new HNSRegistrar___getSnitchResult(value[0].toAddress(), value[1].toBigInt()));
    };
    HNSRegistrar.prototype.claimSnitchReward = function (node) {
        var result = _super.prototype.call.call(this, "claimSnitchReward", "claimSnitchReward(bytes32):(bool)", [graph_ts_1.ethereum.Value.fromFixedBytes(node)]);
        return result[0].toBoolean();
    };
    HNSRegistrar.prototype.try_claimSnitchReward = function (node) {
        var result = _super.prototype.tryCall.call(this, "claimSnitchReward", "claimSnitchReward(bytes32):(bool)", [graph_ts_1.ethereum.Value.fromFixedBytes(node)]);
        if (result.reverted) {
            return new graph_ts_1.ethereum.CallResult();
        }
        var value = result.value;
        return graph_ts_1.ethereum.CallResult.fromValue(value[0].toBoolean());
    };
    HNSRegistrar.prototype.donateProfits = function () {
        var result = _super.prototype.call.call(this, "donateProfits", "donateProfits():(uint256)", []);
        return result[0].toBigInt();
    };
    HNSRegistrar.prototype.try_donateProfits = function () {
        var result = _super.prototype.tryCall.call(this, "donateProfits", "donateProfits():(uint256)", []);
        if (result.reverted) {
            return new graph_ts_1.ethereum.CallResult();
        }
        var value = result.value;
        return graph_ts_1.ethereum.CallResult.fromValue(value[0].toBigInt());
    };
    HNSRegistrar.prototype.ens = function () {
        var result = _super.prototype.call.call(this, "ens", "ens():(address)", []);
        return result[0].toAddress();
    };
    HNSRegistrar.prototype.try_ens = function () {
        var result = _super.prototype.tryCall.call(this, "ens", "ens():(address)", []);
        if (result.reverted) {
            return new graph_ts_1.ethereum.CallResult();
        }
        var value = result.value;
        return graph_ts_1.ethereum.CallResult.fromValue(value[0].toAddress());
    };
    HNSRegistrar.prototype.minTLDDeposit = function () {
        var result = _super.prototype.call.call(this, "minTLDDeposit", "minTLDDeposit():(uint256)", []);
        return result[0].toBigInt();
    };
    HNSRegistrar.prototype.try_minTLDDeposit = function () {
        var result = _super.prototype.tryCall.call(this, "minTLDDeposit", "minTLDDeposit():(uint256)", []);
        if (result.reverted) {
            return new graph_ts_1.ethereum.CallResult();
        }
        var value = result.value;
        return graph_ts_1.ethereum.CallResult.fromValue(value[0].toBigInt());
    };
    HNSRegistrar.prototype.namespace = function () {
        var result = _super.prototype.call.call(this, "namespace", "namespace():(string)", []);
        return result[0].toString();
    };
    HNSRegistrar.prototype.try_namespace = function () {
        var result = _super.prototype.tryCall.call(this, "namespace", "namespace():(string)", []);
        if (result.reverted) {
            return new graph_ts_1.ethereum.CallResult();
        }
        var value = result.value;
        return graph_ts_1.ethereum.CallResult.fromValue(value[0].toString());
    };
    HNSRegistrar.prototype.oracle = function () {
        var result = _super.prototype.call.call(this, "oracle", "oracle():(address)", []);
        return result[0].toAddress();
    };
    HNSRegistrar.prototype.try_oracle = function () {
        var result = _super.prototype.tryCall.call(this, "oracle", "oracle():(address)", []);
        if (result.reverted) {
            return new graph_ts_1.ethereum.CallResult();
        }
        var value = result.value;
        return graph_ts_1.ethereum.CallResult.fromValue(value[0].toAddress());
    };
    HNSRegistrar.prototype.register = function (node) {
        var result = _super.prototype.call.call(this, "register", "register(bytes32):(uint256)", [
            graph_ts_1.ethereum.Value.fromFixedBytes(node)
        ]);
        return result[0].toBigInt();
    };
    HNSRegistrar.prototype.try_register = function (node) {
        var result = _super.prototype.tryCall.call(this, "register", "register(bytes32):(uint256)", [
            graph_ts_1.ethereum.Value.fromFixedBytes(node)
        ]);
        if (result.reverted) {
            return new graph_ts_1.ethereum.CallResult();
        }
        var value = result.value;
        return graph_ts_1.ethereum.CallResult.fromValue(value[0].toBigInt());
    };
    HNSRegistrar.prototype.snitchDeposit = function () {
        var result = _super.prototype.call.call(this, "snitchDeposit", "snitchDeposit():(uint256)", []);
        return result[0].toBigInt();
    };
    HNSRegistrar.prototype.try_snitchDeposit = function () {
        var result = _super.prototype.tryCall.call(this, "snitchDeposit", "snitchDeposit():(uint256)", []);
        if (result.reverted) {
            return new graph_ts_1.ethereum.CallResult();
        }
        var value = result.value;
        return graph_ts_1.ethereum.CallResult.fromValue(value[0].toBigInt());
    };
    HNSRegistrar.prototype.supportsInterface = function (interfaceID) {
        var result = _super.prototype.call.call(this, "supportsInterface", "supportsInterface(bytes4):(bool)", [graph_ts_1.ethereum.Value.fromFixedBytes(interfaceID)]);
        return result[0].toBoolean();
    };
    HNSRegistrar.prototype.try_supportsInterface = function (interfaceID) {
        var result = _super.prototype.tryCall.call(this, "supportsInterface", "supportsInterface(bytes4):(bool)", [graph_ts_1.ethereum.Value.fromFixedBytes(interfaceID)]);
        if (result.reverted) {
            return new graph_ts_1.ethereum.CallResult();
        }
        var value = result.value;
        return graph_ts_1.ethereum.CallResult.fromValue(value[0].toBoolean());
    };
    HNSRegistrar.prototype.tldDeposits = function (param0) {
        var result = _super.prototype.call.call(this, "tldDeposits", "tldDeposits(bytes32):(uint256)", [
            graph_ts_1.ethereum.Value.fromFixedBytes(param0)
        ]);
        return result[0].toBigInt();
    };
    HNSRegistrar.prototype.try_tldDeposits = function (param0) {
        var result = _super.prototype.tryCall.call(this, "tldDeposits", "tldDeposits(bytes32):(uint256)", [graph_ts_1.ethereum.Value.fromFixedBytes(param0)]);
        if (result.reverted) {
            return new graph_ts_1.ethereum.CallResult();
        }
        var value = result.value;
        return graph_ts_1.ethereum.CallResult.fromValue(value[0].toBigInt());
    };
    HNSRegistrar.prototype.totalDeposits = function () {
        var result = _super.prototype.call.call(this, "totalDeposits", "totalDeposits():(uint256)", []);
        return result[0].toBigInt();
    };
    HNSRegistrar.prototype.try_totalDeposits = function () {
        var result = _super.prototype.tryCall.call(this, "totalDeposits", "totalDeposits():(uint256)", []);
        if (result.reverted) {
            return new graph_ts_1.ethereum.CallResult();
        }
        var value = result.value;
        return graph_ts_1.ethereum.CallResult.fromValue(value[0].toBigInt());
    };
    HNSRegistrar.prototype.xnhnsOracle = function () {
        var result = _super.prototype.call.call(this, "xnhnsOracle", "xnhnsOracle():(address)", []);
        return result[0].toAddress();
    };
    HNSRegistrar.prototype.try_xnhnsOracle = function () {
        var result = _super.prototype.tryCall.call(this, "xnhnsOracle", "xnhnsOracle():(address)", []);
        if (result.reverted) {
            return new graph_ts_1.ethereum.CallResult();
        }
        var value = result.value;
        return graph_ts_1.ethereum.CallResult.fromValue(value[0].toAddress());
    };
    return HNSRegistrar;
}(graph_ts_1.ethereum.SmartContract));
exports.HNSRegistrar = HNSRegistrar;
var ConstructorCall = /** @class */ (function (_super) {
    __extends(ConstructorCall, _super);
    function ConstructorCall() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ConstructorCall.prototype, "inputs", {
        get: function () {
            return new ConstructorCall__Inputs(this);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ConstructorCall.prototype, "outputs", {
        get: function () {
            return new ConstructorCall__Outputs(this);
        },
        enumerable: false,
        configurable: true
    });
    return ConstructorCall;
}(graph_ts_1.ethereum.Call));
exports.ConstructorCall = ConstructorCall;
var ConstructorCall__Inputs = /** @class */ (function () {
    function ConstructorCall__Inputs(call) {
        this._call = call;
    }
    Object.defineProperty(ConstructorCall__Inputs.prototype, "ens_", {
        get: function () {
            return this._call.inputValues[0].value.toAddress();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ConstructorCall__Inputs.prototype, "namespace", {
        get: function () {
            return this._call.inputValues[1].value.toString();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ConstructorCall__Inputs.prototype, "oracle", {
        get: function () {
            return this._call.inputValues[2].value.toAddress();
        },
        enumerable: false,
        configurable: true
    });
    return ConstructorCall__Inputs;
}());
exports.ConstructorCall__Inputs = ConstructorCall__Inputs;
var ConstructorCall__Outputs = /** @class */ (function () {
    function ConstructorCall__Outputs(call) {
        this._call = call;
    }
    return ConstructorCall__Outputs;
}());
exports.ConstructorCall__Outputs = ConstructorCall__Outputs;
var ClaimSnitchRewardCall = /** @class */ (function (_super) {
    __extends(ClaimSnitchRewardCall, _super);
    function ClaimSnitchRewardCall() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(ClaimSnitchRewardCall.prototype, "inputs", {
        get: function () {
            return new ClaimSnitchRewardCall__Inputs(this);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ClaimSnitchRewardCall.prototype, "outputs", {
        get: function () {
            return new ClaimSnitchRewardCall__Outputs(this);
        },
        enumerable: false,
        configurable: true
    });
    return ClaimSnitchRewardCall;
}(graph_ts_1.ethereum.Call));
exports.ClaimSnitchRewardCall = ClaimSnitchRewardCall;
var ClaimSnitchRewardCall__Inputs = /** @class */ (function () {
    function ClaimSnitchRewardCall__Inputs(call) {
        this._call = call;
    }
    Object.defineProperty(ClaimSnitchRewardCall__Inputs.prototype, "node", {
        get: function () {
            return this._call.inputValues[0].value.toBytes();
        },
        enumerable: false,
        configurable: true
    });
    return ClaimSnitchRewardCall__Inputs;
}());
exports.ClaimSnitchRewardCall__Inputs = ClaimSnitchRewardCall__Inputs;
var ClaimSnitchRewardCall__Outputs = /** @class */ (function () {
    function ClaimSnitchRewardCall__Outputs(call) {
        this._call = call;
    }
    Object.defineProperty(ClaimSnitchRewardCall__Outputs.prototype, "value0", {
        get: function () {
            return this._call.outputValues[0].value.toBoolean();
        },
        enumerable: false,
        configurable: true
    });
    return ClaimSnitchRewardCall__Outputs;
}());
exports.ClaimSnitchRewardCall__Outputs = ClaimSnitchRewardCall__Outputs;
var DonateProfitsCall = /** @class */ (function (_super) {
    __extends(DonateProfitsCall, _super);
    function DonateProfitsCall() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(DonateProfitsCall.prototype, "inputs", {
        get: function () {
            return new DonateProfitsCall__Inputs(this);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DonateProfitsCall.prototype, "outputs", {
        get: function () {
            return new DonateProfitsCall__Outputs(this);
        },
        enumerable: false,
        configurable: true
    });
    return DonateProfitsCall;
}(graph_ts_1.ethereum.Call));
exports.DonateProfitsCall = DonateProfitsCall;
var DonateProfitsCall__Inputs = /** @class */ (function () {
    function DonateProfitsCall__Inputs(call) {
        this._call = call;
    }
    return DonateProfitsCall__Inputs;
}());
exports.DonateProfitsCall__Inputs = DonateProfitsCall__Inputs;
var DonateProfitsCall__Outputs = /** @class */ (function () {
    function DonateProfitsCall__Outputs(call) {
        this._call = call;
    }
    Object.defineProperty(DonateProfitsCall__Outputs.prototype, "value0", {
        get: function () {
            return this._call.outputValues[0].value.toBigInt();
        },
        enumerable: false,
        configurable: true
    });
    return DonateProfitsCall__Outputs;
}());
exports.DonateProfitsCall__Outputs = DonateProfitsCall__Outputs;
var IncreaseDepositCall = /** @class */ (function (_super) {
    __extends(IncreaseDepositCall, _super);
    function IncreaseDepositCall() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(IncreaseDepositCall.prototype, "inputs", {
        get: function () {
            return new IncreaseDepositCall__Inputs(this);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IncreaseDepositCall.prototype, "outputs", {
        get: function () {
            return new IncreaseDepositCall__Outputs(this);
        },
        enumerable: false,
        configurable: true
    });
    return IncreaseDepositCall;
}(graph_ts_1.ethereum.Call));
exports.IncreaseDepositCall = IncreaseDepositCall;
var IncreaseDepositCall__Inputs = /** @class */ (function () {
    function IncreaseDepositCall__Inputs(call) {
        this._call = call;
    }
    Object.defineProperty(IncreaseDepositCall__Inputs.prototype, "node", {
        get: function () {
            return this._call.inputValues[0].value.toBytes();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IncreaseDepositCall__Inputs.prototype, "amount", {
        get: function () {
            return this._call.inputValues[1].value.toBigInt();
        },
        enumerable: false,
        configurable: true
    });
    return IncreaseDepositCall__Inputs;
}());
exports.IncreaseDepositCall__Inputs = IncreaseDepositCall__Inputs;
var IncreaseDepositCall__Outputs = /** @class */ (function () {
    function IncreaseDepositCall__Outputs(call) {
        this._call = call;
    }
    Object.defineProperty(IncreaseDepositCall__Outputs.prototype, "value0", {
        get: function () {
            return this._call.outputValues[0].value.toBoolean();
        },
        enumerable: false,
        configurable: true
    });
    return IncreaseDepositCall__Outputs;
}());
exports.IncreaseDepositCall__Outputs = IncreaseDepositCall__Outputs;
var RegisterCall = /** @class */ (function (_super) {
    __extends(RegisterCall, _super);
    function RegisterCall() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(RegisterCall.prototype, "inputs", {
        get: function () {
            return new RegisterCall__Inputs(this);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RegisterCall.prototype, "outputs", {
        get: function () {
            return new RegisterCall__Outputs(this);
        },
        enumerable: false,
        configurable: true
    });
    return RegisterCall;
}(graph_ts_1.ethereum.Call));
exports.RegisterCall = RegisterCall;
var RegisterCall__Inputs = /** @class */ (function () {
    function RegisterCall__Inputs(call) {
        this._call = call;
    }
    Object.defineProperty(RegisterCall__Inputs.prototype, "node", {
        get: function () {
            return this._call.inputValues[0].value.toBytes();
        },
        enumerable: false,
        configurable: true
    });
    return RegisterCall__Inputs;
}());
exports.RegisterCall__Inputs = RegisterCall__Inputs;
var RegisterCall__Outputs = /** @class */ (function () {
    function RegisterCall__Outputs(call) {
        this._call = call;
    }
    Object.defineProperty(RegisterCall__Outputs.prototype, "id", {
        get: function () {
            return this._call.outputValues[0].value.toBigInt();
        },
        enumerable: false,
        configurable: true
    });
    return RegisterCall__Outputs;
}());
exports.RegisterCall__Outputs = RegisterCall__Outputs;
var SnitchCall = /** @class */ (function (_super) {
    __extends(SnitchCall, _super);
    function SnitchCall() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(SnitchCall.prototype, "inputs", {
        get: function () {
            return new SnitchCall__Inputs(this);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SnitchCall.prototype, "outputs", {
        get: function () {
            return new SnitchCall__Outputs(this);
        },
        enumerable: false,
        configurable: true
    });
    return SnitchCall;
}(graph_ts_1.ethereum.Call));
exports.SnitchCall = SnitchCall;
var SnitchCall__Inputs = /** @class */ (function () {
    function SnitchCall__Inputs(call) {
        this._call = call;
    }
    Object.defineProperty(SnitchCall__Inputs.prototype, "tld", {
        get: function () {
            return this._call.inputValues[0].value.toString();
        },
        enumerable: false,
        configurable: true
    });
    return SnitchCall__Inputs;
}());
exports.SnitchCall__Inputs = SnitchCall__Inputs;
var SnitchCall__Outputs = /** @class */ (function () {
    function SnitchCall__Outputs(call) {
        this._call = call;
    }
    Object.defineProperty(SnitchCall__Outputs.prototype, "requestId", {
        get: function () {
            return this._call.outputValues[0].value.toBytes();
        },
        enumerable: false,
        configurable: true
    });
    return SnitchCall__Outputs;
}());
exports.SnitchCall__Outputs = SnitchCall__Outputs;
var UnregisterCall = /** @class */ (function (_super) {
    __extends(UnregisterCall, _super);
    function UnregisterCall() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(UnregisterCall.prototype, "inputs", {
        get: function () {
            return new UnregisterCall__Inputs(this);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(UnregisterCall.prototype, "outputs", {
        get: function () {
            return new UnregisterCall__Outputs(this);
        },
        enumerable: false,
        configurable: true
    });
    return UnregisterCall;
}(graph_ts_1.ethereum.Call));
exports.UnregisterCall = UnregisterCall;
var UnregisterCall__Inputs = /** @class */ (function () {
    function UnregisterCall__Inputs(call) {
        this._call = call;
    }
    Object.defineProperty(UnregisterCall__Inputs.prototype, "node", {
        get: function () {
            return this._call.inputValues[0].value.toBytes();
        },
        enumerable: false,
        configurable: true
    });
    return UnregisterCall__Inputs;
}());
exports.UnregisterCall__Inputs = UnregisterCall__Inputs;
var UnregisterCall__Outputs = /** @class */ (function () {
    function UnregisterCall__Outputs(call) {
        this._call = call;
    }
    return UnregisterCall__Outputs;
}());
exports.UnregisterCall__Outputs = UnregisterCall__Outputs;
var VerifyCall = /** @class */ (function (_super) {
    __extends(VerifyCall, _super);
    function VerifyCall() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(VerifyCall.prototype, "inputs", {
        get: function () {
            return new VerifyCall__Inputs(this);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(VerifyCall.prototype, "outputs", {
        get: function () {
            return new VerifyCall__Outputs(this);
        },
        enumerable: false,
        configurable: true
    });
    return VerifyCall;
}(graph_ts_1.ethereum.Call));
exports.VerifyCall = VerifyCall;
var VerifyCall__Inputs = /** @class */ (function () {
    function VerifyCall__Inputs(call) {
        this._call = call;
    }
    Object.defineProperty(VerifyCall__Inputs.prototype, "tld", {
        get: function () {
            return this._call.inputValues[0].value.toString();
        },
        enumerable: false,
        configurable: true
    });
    return VerifyCall__Inputs;
}());
exports.VerifyCall__Inputs = VerifyCall__Inputs;
var VerifyCall__Outputs = /** @class */ (function () {
    function VerifyCall__Outputs(call) {
        this._call = call;
    }
    Object.defineProperty(VerifyCall__Outputs.prototype, "requestId", {
        get: function () {
            return this._call.outputValues[0].value.toBytes();
        },
        enumerable: false,
        configurable: true
    });
    return VerifyCall__Outputs;
}());
exports.VerifyCall__Outputs = VerifyCall__Outputs;
