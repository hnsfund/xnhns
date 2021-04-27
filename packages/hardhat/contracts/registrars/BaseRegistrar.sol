pragma solidity ^0.7.0;

import { LibHNSRegistrar } from "../utils/LibHNSRegistrar.sol";
import { ERC165 } from "@openzeppelin/contracts/introspection/ERC165.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { IENS } from "../interfaces/IENS.sol";
import { IXNHNSOracle } from "../interfaces/IXNHNSOracle.sol";

/**
 * @dev An ENS registrar that allows the owner of a HNS TLD to claim the
 *      corresponding TLD in ENS.
 */
abstract contract BaseRegistrar is ERC165 {

  event TLDVerificationRequested(bytes32 indexed node, address indexed caller); // is this really needed for anything?
  event NewOwner(bytes32 indexed node, address indexed owner);

  mapping(bytes32 => LibHNSRegistrar.TLD) tlds; // ENS namehash -> TLD data


  // HIP05 namespace that this contract lives in
  string public xnhnsNS;

  // ENS registry instance for this namespace
  IENS public ens;

  // oracle that requests and stores tld verification data
  IXNHNSOracle public xnhnsOracle;

  // for snitch and/or TLD deposits
  address depositToken;

  // in depositToken. For snitchs and TLDs
  uint256 minDepositAmount;

  // TODO precompute
  // ID for core registrar functionality
  bytes4 constant private XNHNS_REGISTRAR_ID = bytes4(
    keccak256("register(string)") ^
    keccak256("unregister(string)") ^
    keccak256("migrate(bytes32,address)") ^
    keccak256("namespace()") ^
    keccak256("oracle()")
  );


  constructor(
    IENS _ens,
    string memory _xnhnsNS,
    IXNHNSOracle _oracle,
    address _depositToken,
    uint256 _minDepositAmount
  ) {
    ens = _ens;
    xnhnsNS = _xnhnsNS;
    xnhnsOracle = _oracle;
    depositToken = _depositToken;
    minDepositAmount = _minDepositAmount;
  }


  /**
    * @dev Ensures Registrar can call Oracle to update records and Root to un/register
   */
  modifier whileRegistrarEnabled {
    require(
      LibHNSRegistrar.isRegistrarEnabled(address(this), ens, xnhnsOracle),
      'BaseRegistrar: registrar disabled'
    );
    _;
  }

  /**
    * @dev only owner of the NFT for ENS node issued by Root can call functions with this modifier
   */
  modifier onlyNFTLDOwner(bytes32 node) {
    require(
      LibHNSRegistrar.isValidTLDOwner( LibHNSRegistrar.getRoot(ens).ownerOf(uint(node)) ),
      'BaseRegistrar: invalid owner to unregister tld'
    );
  }

  function _verify(string calldata tld)
    internal view
    whileRegistrarEnabled
    returns (bytes32)
  {
    tlds[LibHNSRegistrar.toNamehash(tld)] = LibHNSRegistrar.TLD({
      id: uint(bytes32),
      depositToken: address(0),
      depositAMount: 0,
      unlockTime: 0,
      referrer: address(0)
    });

    // add TLD data
    return xnhnsOracle.requestTLDUpdate(tld);
  }

  /**
    * @dev 
   */
  function _register(bytes32 node, address referrer)
    internal
    whileRegistrarEnabled
    returns(bool success)
  {
    address tldOwner = IXNHNSOracle(xnhnsOracle).getTLDOwner(node);
    require(LibHNSRegistrar.isValidTLDOwner(tldOwner), 'BaseRegistrar: invalid owner to register tld');

    LibHNSRegistrar.getRoot(ens).register(uint(node), tldOwner);
    // update TLD data with referrer
    emit NewOwner(node, tldOwner);
    return true;
  }

  /**
    * @dev only owner of NFTLD can unregister. Calls unregister() on Root
   */
  function _unregister(bytes32 node)
    internal
    onlyNFTLDOwner(node)
    returns(bool success)
  {
    LibHNSRegistrar.getRoot(ens).unregister(uint(node));
    delete tlds[node];
    emit NewOwner(node, address(0));
    return true;
  }

  function _migrate(bytes32 node, address to, address owner)
    internal
    onlyNFTLDOwner(node)
    returns (bool success)
  {
    LibHNSRegistrar.getRoot(ens).migrate(uint(node), to, owner);
    delete tlds[node];

    return true;
  }

  function _snitch(string calldata tld)
    internal view
    returns (bytes32)
  {
    return _verify(tld);
  }

  // GETTERS

  function getTLD(bytes32 node)
    external view
    returns (
      uint256 id,
      address token,
      uint256 deposit,
      uint256 unlockTime,
      address referrer
    )
  {
    LibHNSRegistrar.TLD memory tld = tlds[node];
    return (tld.id, tld.depositToken, tld.depositAmount, tld.unlockTime, tld.referrer);
  }

  // HOOKS

  // Ok there has to be a better way than all these hooks lol
  // maybe an library with only internal functions

  function preVerifyHook(bytes32 node, address registrar, address caller) internal virtual {
    require(!ens.recordExists(node), 'BaseRegistrar: TLD is already claimed');
  }
  function postVerifyHook(bytes32 node, address registrar, address caller) internal virtual {}

  function preSnitchHook(bytes32 node, address registrar, address caller) internal virtual {
    require(
      LibHNSRegistrar.isSnitchable(node, ens, registrar),
      'BaseRegistrar: invalid TLD to snitch'
    );
    require(
      IERC20(depositToken).transferFrom(msg.sender, address(this), minDepositAmount),
      'BaseRegistrar: snitch deposit failed'
    );
  }

  function postSnitchHook(bytes32 node, address registrar, address caller) internal virtual {}


  function preRegisterHook(bytes32 node, address registrar, address caller) internal virtual {}
  function postRegisterHook(bytes32 node, address registrar, address caller) internal virtual {}

  function preUnregisterHook(bytes32 node, address registrar, address caller) internal virtual {}
  function postUnregisterHook(bytes32 node, address registrar, address caller) internal virtual {}
  

  function preMigrationHook(bytes32 node, address registrar, address caller) internal virtual {
    require(
      LibHNSRegistrar.isValidMigrationInvocation(node, ens, msg.sender, tx.origin),
      'BaseRegistrar: invalid migration initiator'
    );
  }

  function postMigrationHook(bytes32 node, address registrar, address caller) internal virtual {
    require(
      LibHNSRegistrar.getRoot(ens).getControllerForNFTLD(uint(node)) == address(this),
      'BaseRegistrar: migration goofed'
    );
  }

}
