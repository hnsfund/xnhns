pragma solidity ^0.7.0;


import { IXNHNSOracle } from "../interfaces/IXNHNSOracle.sol";
import { IHNSRegistrar } from "../interfaces/IHNSRegistrar.sol";
import { Root } from "../Root.sol";

interface IENS {
  function owner(bytes32 node) external returns (address);
}

library LibHNSRegistrar {

  struct TLD {
    uint256 id; // NFTLD id on Root.sol
    address depositToken; // ERC20 that registrar is using for 
    uint256 depositAmount; // in token
    uint256 unlockTime; // when TLD can be unregistered
    address referrer; // address to send rewards for entity that signed up the TLD
  }

  struct Snitch {
    address addr;
    uint256 blockStart; // when snitch() was called
  }

  // HELPER FUNCTIONS
  /**
    * @dev Gets the contract controlling root zone for agiven ENS instance
    * @param _ens - ENS registry instance for calling registrar
   */
  function getRoot(address _ens) external pure returns (Root) {
    return Root(IENS(_ens).owner(bytes32(0)));
  }

  /**
    * @dev Takes a string TLD and computes the ENS node for it
    * @param _tld - domain to hash
   */
  function toNamehash(string calldata _tld) external pure returns (bytes32) {
    return keccak256(abi.encodePacked(
      bytes(0),
      keccak256(abi.encodePacked(_tld))
    ));
  }

  function isValidTLDOwner(address _owner) external pure returns (bool) {
    return address(0) != _owner && msg.sender == _owner;
  }


  /**
    * @dev Checks if calling registrar is able to un/register TLDs on root
    * and can initiate
    * @param _registrar - registrar to check status of
    * @param _ens - ENS registry instance
    * @param _oracle - XNHNS oracle that registrar wants to call for checking tld status
    * @return - true if enabled on both Root and Oracle, false if not
   */
  function isRegistrarEnabled(
    address _registrar,
    address _ens,
    address _oracle
  ) internal returns (bool) {
    return (
      this.getRoot(_ens).isController(_registrar) &&
      IXNHNSOracle(_oracle).getCallerPermission(_registrar)
    );
  }

  function isValidMigrationInvocation(
    bytes32 _node,
    address _ens,
    address _caller,
    address _origin
  ) external returns (bool) {
    return (
      _caller == address(this.getRoot(_ens)) &&
      _origin == this.getRoot(_ens).ownerOf(uint(_node))
    );
  }

  function isSnitchable(bytes32 _node, address _ens, address _registrar) external returns (bool) {
    require(this.getRoot(_ens).exists(uint(_node)), 'LibHNSRegistrar: cant snitch on unregistered TLD');
    (uint256 id) = IHNSRegistrar(_registrar).getTLD(_node);
    require(id != 0, 'LibHNSRegistrar: tld not snitchable on registrar');
    (address addr) = IHNSRegistrar(_registrar).getSnitch(_node);
    require(addr == address(0), 'LibHNSRegistrar: TLD already snitched on');
    return true;
  }

}
