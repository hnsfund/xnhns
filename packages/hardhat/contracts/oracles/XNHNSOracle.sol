pragma solidity ^0.7.0;

import "@chainlink/contracts/src/v0.7/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../../interfaces/IXNHNSOracle.sol";

/**
 * @dev Oracle that verifies a TLD is configured for this XNHNS namespace
 * and assigns ownership to an address
 */
contract XNHNSOracle is IXNHNSOracle, ChainlinkClient, Ownable {
    // immutable variables about xnhns host chain
    string public XNHNS_NAMESPACE;
    address public XNHNS_REGISTRY;

    // mutable variables for oracle config
    address public hnsOracle;
    bytes32 public verifyHnsTldJobId;
    uint256 private oracleFee = 0.1 * 10 ** 18; // 0.1 LINK

    // tld namehash -> owner adddres on HNS
    mapping(bytes32 => address) public tldOwners;
    // Link request id -> tld
    mapping(bytes32 => string) private tldRunIds;
    // contracts that are allowed to initiate oracle requests
    mapping(address => bool) private allowedCallers;

    constructor(
        string memory _namespace,
        address registry,
        address oracle,
        address link,
        bytes32 jobId
      ) {
        XNHNS_NAMESPACE = _namespace;
        XNHNS_REGISTRY = registry;
        hnsOracle = oracle;
        setChainlinkToken(link);
        verifyHnsTldJobId = jobId;
        emit NewOracle(address(oracle));
    }


    /**
     * @dev Claims a name by proving ownership of its HNS equivalent.
     * Chainlink node verifies that NS record is pointed to namespace of this contract (Ethereum)
     * and pulls TXT record with address to give ownership to.
     * @param tld The HNS domain to claim
     */
    function requestTLDUpdate(string calldata tld) external override returns (bytes32) {
      require(bytes(tld).length > 0, 'Invalid TLD');
      require(allowedCallers[msg.sender], 'Caller does not have permission to initiate oracle requests');

      Chainlink.Request memory request = buildChainlinkRequest(
        verifyHnsTldJobId,
        address(this),
        this.receiveTLDUpdate.selector
      );
      Chainlink.add(request, "tld", tld);
      Chainlink.add(request, "namespace", XNHNS_NAMESPACE);
      Chainlink.add(request, "registry", string(abi.encodePacked(XNHNS_REGISTRY)));
      
      tldRunIds[request.id] = tld;

      return sendChainlinkRequestTo(hnsOracle, request, oracleFee);
    }

    function receiveTLDUpdate(bytes32 requestId, address _owner)
      public override
      recordChainlinkFulfillment(requestId)
      returns (bool)
    {
      string memory tld = tldRunIds[requestId];
      tldOwners[_getNamehash((tld))] = _owner; // oracle returns addres(0) if invalid claim
      // bytes32(0) is root node which is always parent of a tld
      emit NewOwner(tld, _owner);
      return true;
    }

    function setOracle(address oracle, uint fee, bytes32 jobId)
      public override 
      onlyOwner
      returns (bool)
    {
      hnsOracle = oracle;
      verifyHnsTldJobId = jobId;
      oracleFee = fee;
      emit NewOracle(address(hnsOracle));
      return true;
    }

    function getTLDOwner(bytes32 node) external view  override returns (address) {
      return tldOwners[node];
    }

    function getCallerPermission(address addr) external view override returns (bool) {
      return allowedCallers[addr];
    }

    function setCallerPermission(address addr, bool permission) external  override onlyOwner returns (bool) {
      allowedCallers[addr] = permission;
      return true;
    }

    function _getNamehash(string memory tld) internal pure returns (bytes32) {
      return keccak256(abi.encodePacked(bytes32(0), keccak256(abi.encodePacked(tld))));
    }

}
