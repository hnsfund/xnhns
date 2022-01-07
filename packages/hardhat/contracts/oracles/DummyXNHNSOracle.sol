pragma solidity ^0.7.0;

import "../../interfaces/IXNHNSOracle.sol";

/**
 * @dev Fake oracle for testing HNSRegistrar
 */
contract DummyXNHNSOracle is IXNHNSOracle {
    string public NAMESPACE;

    // tld namehash -> owner adddres on HNS
    mapping(bytes32 => address) public tldOwners;
    // contracts that are allowed to initiate oracle requests
    mapping(address => bool) private allowedCallers;

    function requestTLDUpdate(string calldata tld) public override returns (bytes32) {
      require(bytes(tld).length > 0, 'Invalid TLD');
      require(allowedCallers[msg.sender], 'Caller does not have permission to initiate oracle requests');
      bytes32 node = _getNamehash(tld);
      tldOwners[node] = tx.origin;
      emit NewOwner(tld, tx.origin);
      return node;
    }

    function receiveTLDUpdate(bytes32 node, address _owner) public override returns (bool) {
      tldOwners[node] = _owner;
      return true;
    }

    function setOracle(address _oracle, uint fee, bytes32 jobId)
      public override
      returns (bool)
    {
      return true;
    }

    function getTLDOwner(bytes32 node) public view override returns (address) {
      return tldOwners[node];
    }

   
    function setCallerPermission(address addr, bool permission) public override returns (bool) {
      return allowedCallers[addr] = permission;
    }
    function getCallerPermission(address addr) public view override returns (bool) {
      return allowedCallers[addr];
    }

    function _getNamehash(string memory tld) internal pure returns (bytes32) {
      return keccak256(abi.encodePacked(bytes32(0), keccak256(abi.encodePacked(tld))));
    }
}
