pragma solidity ^0.7.0;

import "../interfaces/IXNHNSOracle.sol"

/**
 * @dev Fake oracle for testing HNSRegistrar
 */
contract DummyXNHNSOracle is IXNHNSOracle {
    string public NAMESPACE;
    string public NS_RECORD;
    ENS public ens;
    // IPanvalaMember public hnsFund;

    address public hnsOracle;
    bytes32 public verifyHnsTldJobId;
    uint256 private oracleFee = 0.1 * 10 ** 18; // 0.1 LINK

    // tld namehash -> owner adddres on HNS
    mapping(bytes32 => address) public tldOwners;
    // Link request id -> tld namehash
    mapping(bytes32 => bytes32) private tldRunIds;
    // contracts that are allowed to initiate oracle requests
    mapping(address => bool) private allowedCallers;

    event NewOracle(address oracle);
    event TLDOwnerSet(bytes32 indexed node, address indexed owner);
      constructor(
        address _oracle,
        address _link,
        bytes32 _jobId
      ) {
        hnsOracle = _oracle;
        setChainlinkToken(_link);
        verifyHnsTldJobId = _jobId;
        emit NewOracle(address(_oracle));
    }

  function updateTLD(string calldata tld) public returns (bytes32) {
      require(bytes(tld).length > 0, 'Invalid TLD');
      require(allowedCallers[msg.sender], 'Caller does not have permission to initiate oracle requests');
      bytes32 node = _getNamehash(tld);
      tldOwners[node] = tx.origin;
      return 
    }

    function setOracle(address _oracle, uint _fee, bytes32 _jobId)
      public
      onlyOwner
      returns (bool)
    {
      hnsOracle = _oracle;
      verifyHnsTldJobId = _jobId;
      oracleFee = _fee;
      emit NewOracle(address(hnsOracle));
      return true;
    }

    function getTLDOwner(bytes32 node) public view returns (address) {
      return tldOwners[node];
    }

    function setTLDOwner(bytes32 node, address _owner) public view returns (address) {
      tldOwners[node] = _owner;
      return _owner;
    }

    function getCallerPermission(address addr) public view returns (bool) {
      return allowedCallers[msg.sender]
    }

    function _getNamehash(string memory tld) internal pure returns (bytes32) {
      return keccak256(abi.encodePacked(bytes32(0), tld));
    }

}
