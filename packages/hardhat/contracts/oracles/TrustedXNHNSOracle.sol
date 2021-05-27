pragma solidity ^0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../../interfaces/IXNHNSOracle.sol";

/**
 * @dev Fake oracle for testing HNSRegistrar
 */
contract TrustedXNHNSOracle is IXNHNSOracle, Ownable {
    string public NAMESPACE;

    // tld namehash -> owner adddres on HNS
    mapping(bytes32 => address) public tldOwners;
    // contracts that are allowed to initiate oracle requests
    mapping(address => bool) private allowedCallers;

    constructor(string memory _namespace) {
      NAMESPACE = _namespace;
    }

    function requestTLDUpdate(string calldata tld)
      external
      override
      returns (bytes32)
    {
      require(bytes(tld).length > 0, 'Invalid TLD');
      require(allowedCallers[msg.sender], 'Caller does not have permission to initiate oracle requests');
      bytes32 node = _getNamehash(tld);
      tldOwners[node] = tx.origin;
      emit NewOwner(_getNamehash(tld), tx.origin);
      return node;
    }

    function receiveTLDUpdate(bytes32 node, address owner_)
      external
      override
      onlyOwner returns (bool)
    {
      tldOwners[node] = owner_;
      emit NewOwner(node, owner_);
      return true;
    }

    function setOracle(address oracle, uint fee, bytes32 jobId)
      external override
      returns (bool)
    {
      return true;
    }

    function getTLDOwner(bytes32 node)
      external view
      override
      returns (address)
    {
      return tldOwners[node];
    }

    function setCallerPermission(address addr, bool permission)
      external
      override
      onlyOwner
      returns (bool)
    {
      return allowedCallers[addr] = permission;
    }
    function getCallerPermission(address addr) external view override returns (bool) {
      return allowedCallers[addr];
    }

    function _getNamehash(string memory tld) internal pure returns (bytes32) {
      return keccak256(abi.encodePacked(bytes32(0), keccak256(abi.encodePacked(tld))));
    }

}
