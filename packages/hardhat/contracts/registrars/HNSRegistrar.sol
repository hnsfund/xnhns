pragma solidity ^0.7.0;

import "@chainlink/contracts/src/v0.7/ChainlinkClient.sol";
import "../../interfaces/IENS.sol";
import "../../interfaces/IPanvalaMember.sol";
import "../Root.sol";

/**
 * @dev An ENS registrar that allows the owner of a HNS TLD to claim the
 *      corresponding TLD in ENS.
 */
contract HNSRegistrar is ChainlinkClient {

    ENS public ens;
    // IPanvalaMember public hnsFund;

    address public hnsOracle;
    bytes32 public verifyHnsTldJobId;
    uint256 private oracleFee = 0.1 * 10 ** 18; // 0.1 LINK

    string public xnhnsNS;
    // add versioning var too?
    uint256 public constant snitchDeposit = 0.1 ether;
    uint256 public constant tldDeposit = 0.1 ether;
    uint256 public constant snitchReward = tldDeposit / 2;
    uint256 public tldsRegistered; // Valid tlds currently registered in root from this registrar
    uint256 public pendingSnitches; // snitch calls awaiting completion

    bytes4 constant private INTERFACE_META_ID = bytes4(keccak256("supportsInterface(bytes4)"));
    bytes4 constant private XNHNS_CLAIM_ID = bytes4(
      keccak256("register(string)") ^
      keccak256("unregister(string)") ^
      keccak256("snitch(string)") ^
      keccak256("namespace()") ^
      keccak256("oracle()")
    );

    struct Snitch {
      address snitcher;
      bytes32 tld;
    }
    event NewOracle(address oracle);
    event ClaimVerified(bytes32 indexed node, address indexed owner);
    event SnitchedOn(bytes32 indexed node, address indexed owner, address indexed snitch);
    event SnitchesGotStitches(bytes32 indexed node, address indexed owner, address indexed snitch);

    mapping(bytes32 => bytes32) tldRunIds; // Link run id -> tld node
    mapping(bytes32 => Snitch) snitches; // Link run id -> snitch

    constructor(ENS _ens, string memory _namespace, address _oracle,
                address _link, bytes32 _jobId) {
        ens = _ens;
        xnhnsNS = _namespace;
        hnsOracle = _oracle;
        setChainlinkToken(_link);
        verifyHnsTldJobId = _jobId;
        emit NewOracle(address(_oracle));
    }

    /**
     * @dev This contract's owner-only functions can be invoked by the owner of the ENS root.
     */
    modifier onlyOwner {
        require(msg.sender == _getRoot().owner());
        _;
    }

    /**
     * @dev Claims a name by proving ownership of its HNS equivalent.
     * Chainlink node verifies that NS record is pointed to namespace of this contract (Ethereum)
     * and pulls TXT record with address to give ownership to.
     * @param tld The HNS domain to claim
     */
    function register(string memory tld) public payable returns (bytes32 requestId) {
      require(msg.value >= tldDeposit, 'Insufficient tld deposit');
      requestId = _verify(tld, 0, this.receiveClaimVerification.selector);
      pendingSnitches += 1;
      return requestId;
    }

    function receiveClaimVerification(bytes32 requestId, address owner)
      public
      recordChainlinkFulfillment(requestId)
      returns (bool)
    {
      // TODO prpbab;y best practice to only save response here and do all other logic on a separate call by owner/owner/snitch
      if(owner != address(0)) {
        bytes32 namehash = tldRunIds[requestId];
        // mint NFT and assign tld to address stored on HNS TXT record
        _getRoot().register(uint(namehash), owner);
        emit ClaimVerified(namehash, owner);
        return true;
      }
      return false;
    }


    /** callable by anyone to prove that TLD is not set anymore and revoke teir ENS name */
    function snitch(string memory tld) public payable returns (bytes32 requestId) {
      require(msg.value >= snitchDeposit, 'Insufficient snitch deposit');
      bytes32 node = _getNamehash(tld);
      // TODO: can't frontrun register() since HNS records will be there anyway, should we let snitches get rekt?
      require(ens.recordExists(node), 'NFTLD is not registered');
      requestId = _verify(tld, 1, this.receiveSnitchVerification.selector);
      snitches[requestId] = Snitch({
        snitcher: msg.sender,
        tld: node
      });
      pendingSnitches += 1;
      return requestId;
    }

    function receiveSnitchVerification(bytes32 requestId, address owner)
      public
      recordChainlinkFulfillment(requestId)
      returns (bool)
    {
      Snitch memory _snitch = snitches[requestId];
      delete snitches[requestId];
      pendingSnitches -= 1;

      uint id = uint(_snitch.tld);
      Root root = _getRoot();

      if(owner == address(0)) {
        _unregister(id);
        payable(_snitch.snitcher).transfer(snitchDeposit + snitchReward);
        emit SnitchedOn(_snitch.tld, root.ownerOf(id), _snitch.snitcher);
        return true;
      } else {
        if(owner != root.ownerOf(id)) {
          root.setSubnodeOwner(id, owner);
        }
        emit SnitchesGotStitches(_snitch.tld, root.ownerOf(id), _snitch.snitcher);
        return false;
      }
    
    }

    /**
     * @dev Verifies a name by proving ownership of its HNS equivalent.
     * Chainlink node verifies that NS record is pointed to namespace of this contract
     * and pulls TXT record on TLD with address to give ownership to.
     * CL Node returns address(0) if either NS or TXT is not configured properly
     * @param tld The name to claim, in DNS wire format.
     * @param checkNS - tells CL to check if NS record is set to xnhnsNS in addition to TXT.
     * Boolean 0/1 wrapped in text and parsed by EA
     * @param callback - contract method to call after oracle returns data
     */
    function _verify(string memory tld, int checkNS, bytes4 callback)
      internal
      returns (bytes32)
    {
      Chainlink.Request memory request = buildChainlinkRequest(
        verifyHnsTldJobId,
        address(this),
        callback
      );
      Chainlink.add(request, "tld", tld);
      Chainlink.add(request, "ns", xnhnsNS);
      Chainlink.addInt(request, "checkNS", checkNS);
      
      tldRunIds[request.id] = _getNamehash(tld);

      return sendChainlinkRequestTo(hnsOracle, request, oracleFee);
    }

    function unregister(string memory tld) public payable {
      Root root = _getRoot();
      uint id = uint(_getNamehash((tld)));
      address owner = root.ownerOf(id);
      require(msg.sender == owner, 'Only TLD owner can unregister');
      _unregister(id);
      payable(owner).transfer(tldDeposit);
    }

    function _unregister(uint id) internal returns (bool) {
      _getRoot().unregister(id);
      tldsRegistered -= 1;
      return true;
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

    /**
     * @dev donate fees collected by registrar to HNS Fund via Panvala League
    */
    function donateProfits() public payable returns(uint) {
      uint deposits = (tldsRegistered * tldDeposit) +
        (pendingSnitches * snitchDeposit);
      uint feesCollected = address(this).balance - deposits;
      // hnsFund.regenerate.value(feesCollected)(feesCollected);
      return feesCollected;
    }

    function oracle() public view returns (address, bytes32, uint256) {
      return (hnsOracle, verifyHnsTldJobId, oracleFee);
    }
    
    function namespace() public view returns (string memory) {
      return xnhnsNS;
    }

    function _getNamehash(string memory tld) public pure returns (bytes32) {
      return keccak256(abi.encodePacked(bytes32(0), tld));
    }

    function _getRoot() internal view returns (Root) {
      return Root(ens.owner(bytes32(0)));
    }


    function supportsInterface(bytes4 interfaceID) public pure returns (bool) {
        return interfaceID == INTERFACE_META_ID ||
               interfaceID == XNHNS_CLAIM_ID;
    }
}
