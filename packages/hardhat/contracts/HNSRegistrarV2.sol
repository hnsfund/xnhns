// import { BaseRegistrar } from "./adapters/BaseRegistrar.sol";
// import { DepositRegistrar } from "./adapters/DepositRegistrar.sol";
// import { LibHNSRegistrar } from  "./utils/LibHNSRegistrar.sol";
// import { IHNSRegistrar } from  "./interfaces/IHNSRegistrar.sol";
// import { IXNHNSOracle } from  "./interfaces/IXNHNSOracle.sol";
// import { IENS } from "./interfaces/IENS.sol";

// /**
//  * @dev An ENS registrar that allows the owner of a HNS TLD to claim the
//  *      corresponding TLD in ENS.
//  */
// contract HNSRegistrarV2 is BaseRegistrar, DepositRegistrar {
//   constructor(
//     IENS _ens,
//     string memory _xnhnsNS,
//     IXNHNSOracle _oracle,
//     address _depositToken,
//     uint256 _minDeposit,
//     uint256 minLockTime
//   )
//     BaseRegistrar(_ens, _xnhnsNS, _oracle)
//     DepositRegistrar(_depositToken, _minDeposit)
//   {
//     // _registerInterface(XNHNS_REGISTRAR_ID);
//     _registerInterface(DEPOSIT_REGISTRAR_ID);
//   }

//   function verify(string calldata tld, uint256 depositAmount) external {
//     bytes32 node = LibHNSRegistrar.toNamehash(tld);
//     super.preVerifyHook(node, address(this), msg.sender);
//     // or explicit DepositRegistrar.preVerifyHook();

//     _verify(tld); // make oracle request
    
//     // assuming this data is available in postVerifyHook, might have to hange hook api
//     tlds[node] = LibHNSRegistrar.TLD({
//       id: uint(node),
//       token: depositToken,
//       depositAmount: depositAmount,
//       unlockTime: 0,
//       owner: msg.sender
//     });
//     super.postVerifyHook(node, address(this), msg.sender);
//   }

//   function register(bytes32 node) external {
//     return this.registerWithReferrer(node, address(0));
//   }
//   function registerWithReferrer(bytes32 node, address referrer) external {
//     super.preRegisterHook(node, address(this), msg.sender);
//     _register(node, referrer);
//     super.postRegisterHook(node, address(this), msg.sender);
//   }

//   function unregister(bytes32 node) external onlyNFTLDOwner {
//     super.preUnregisterHook(node, address(this), msg.sender);
//     _unregister(node);
//     super.postUnregisterHook(node, address(this), msg.sender);
//   }
//   function invokePreMigrationReceiverHook(bytes32 node, address registrar, address owner) external returns(bool)  {
//     super.preMigrationReceiverHook(node, registrar, owner);
//     // get node data from old registrar
//     // copy over to this registrar
//     return true;
//   }

//   function invokePostMigrationReceiverHook(bytes32 node, address registrar, address owner) external returns(bool) {
//     super.postMigrationReceiverHook(node, registrar, owner);
//     return true;
//   }
// }
