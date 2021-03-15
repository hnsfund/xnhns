pragma solidity ^0.7.0;

import "@chainlink/contracts/src/v0.7/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "../../interfaces/IXNHNSOracle.sol";

/**
 * @dev Oracle that verifies a TLD is configured for this XNHNS namespace
 * and assigns ownership to an address
 */
contract XNHNSOracle is ChainlinkClient, Ownable, IXNHNSOracle {
    string public constant NAMESPACE = "{namespace}";
    string public constant NS_RECORD = "{ENSRegistrt.address}._{namespace}.";

    address public hnsOracle;
    bytes32 public verifyHnsTldJobId;
    uint256 private oracleFee = 0.1 * 10 ** 18; // 0.1 LINK

    // tld namehash -> owner adddres on HNS
    mapping(bytes32 => address) public tldOwners;
    // Link request id -> tld namehash
    mapping(bytes32 => bytes32) private tldRunIds;
    // contracts that are allowed to initiate oracle requests
    mapping(address => bool) private allowedCallers;

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


    /**
     * @dev Claims a name by proving ownership of its HNS equivalent.
     * Chainlink node verifies that NS record is pointed to namespace of this contract (Ethereum)
     * and pulls TXT record with address to give ownership to.
     * @param tld The HNS domain to claim
     */
    function requestTLDUpdate(string calldata tld) public override returns (bytes32) {
      require(bytes(tld).length > 0, 'Invalid TLD');
      require(allowedCallers[msg.sender], 'Caller does not have permission to initiate oracle requests');

      Chainlink.Request memory request = buildChainlinkRequest(
        verifyHnsTldJobId,
        address(this),
        this.receiveTLDUpdate.selector
      );
      Chainlink.add(request, "tld", tld);
      Chainlink.add(request, "namespace", NAMESPACE);
      Chainlink.add(request, "nsRecord", NS_RECORD);
      
      tldRunIds[request.id] = _getNamehash(tld);

      return sendChainlinkRequestTo(hnsOracle, request, oracleFee);
    }

    function receiveTLDUpdate(bytes32 requestId, address _owner)
      public
      recordChainlinkFulfillment(requestId)
      returns (bool)
    {
      bytes32 namehash = tldRunIds[requestId];
      tldOwners[namehash] = _owner; // oracle returns addres(0) if invalid claim
      // bytes32(0) is root node which is always parent of a tld
      emit NewOwner(bytes32(0), namehash, _owner);
      return true;
    }

    function setOracle(address _oracle, uint _fee, bytes32 _jobId)
      public
      override 
      onlyOwner
      returns (bool)
    {
      hnsOracle = _oracle;
      verifyHnsTldJobId = _jobId;
      oracleFee = _fee;
      emit NewOracle(address(hnsOracle));
      return true;
    }

    function getTLDOwner(bytes32 node) public view  override returns (address) {
      return tldOwners[node];
    }

    function getCallerPermission(address addr) public view override returns (bool) {
      return allowedCallers[addr];
    }

    function setCallerPermission(address addr, bool _permission) public  override onlyOwner returns (bool) {
      allowedCallers[addr] = _permission;
      return true;
    }

    function _getNamehash(string memory tld) internal pure returns (bytes32) {
      return keccak256(abi.encodePacked(bytes32(0), tld));
    }

}
