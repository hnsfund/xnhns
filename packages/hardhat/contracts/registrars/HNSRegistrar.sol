pragma solidity ^0.7.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../../interfaces/IENS.sol";
import "../../interfaces/IXNHNSOracle.sol";
import "../Root.sol";

/**
 * @dev An ENS registrar that allows the owner of a HNS TLD to claim the
 *      corresponding TLD in ENS.
 */
contract HNSRegistrar {
    using SafeMath for uint256;

    ENS public ens;
    bytes32 constant private ROOT_NODE = bytes32(0);

    // oracle that requests and stores tld verification data
    IXNHNSOracle public xnhnsOracle;

    // namespace that this contract lives in
    // formal registry of namespaces tbd in a HIP
    string public NAMESPACE;

    // add versioning var too?

    uint256 public constant snitchDeposit = 0.1 ether;
    uint256 public constant minTLDDeposit = 0.1 ether;

    // total tld + snitch deposits in contract
    uint256 public totalDeposits;

    bytes4 constant private INTERFACE_META_ID = bytes4(keccak256("supportsInterface(bytes4)"));
    bytes4 constant private XNHNS_CLAIM_ID = bytes4(
      keccak256("register(string)") ^
      keccak256("unregister(string)") ^
      keccak256("snitchOn(string)") ^
      keccak256("namespace()") ^
      keccak256("oracle()")
    );

    event NewOracle(address oracle);
    event TLDMigrationRequested(string indexed tld, address indexed owner, uint256 deposit);
    // NewOwner identitcal to IENS.sol
    event NewOwner(string indexed tld, address owner);
    event SnitchedOn(bytes32 indexed node, address indexed owner, address snitch, uint256 snitchReward);
    event SnitchesGotStitches(bytes32 indexed node, address indexed owner, address snitch, uint256 snitchPenalty);
    event FeesCollected(uint indexed fees, address indexed owner);

    struct Snitch {
      address addr;
      uint256 startTime;
    }
    
    mapping(bytes32 => Snitch) snitches; // namehash -> snitcher
    mapping(bytes32 => uint256) public tldDeposits; // namehash -> tld deposit

    constructor(ENS ens_, string memory namespace, IXNHNSOracle oracle) {
        ens = ens_;
        NAMESPACE = namespace;
        xnhnsOracle = oracle;
        emit NewOracle(address(oracle));
    }

    /**
     * @dev This contract's owner-only functions can be invoked by the owner of the ENS root.
     */
    modifier onlyOwner {
      require(msg.sender == _getRoot().owner());
      _;
    }

    modifier whileRegistrarEnabled {
      require(_registrarEnabled(), 'Registrar disabled');
      _;
    }

    /**
      * @dev Called by HNS TLD owners to get XNHNS oracle to verify ownership on host chain.
      * Also used by new HNS TLD owners to change host chain owner even if NFTLD already exists.
     */
    function verify(string calldata tld)
      public payable
      whileRegistrarEnabled
      returns (bytes32 requestId)
    {
      require(msg.value >= minTLDDeposit, 'Insufficient tld deposit');
      bytes32 node = _getNamehash(tld);
      totalDeposits = totalDeposits.add(msg.value);
      tldDeposits[node] = tldDeposits[node].add(msg.value); // add to protect user funds incase they have to verify multiple times
      requestId = xnhnsOracle.requestTLDUpdate(tld);
      emit TLDMigrationRequested(tld, msg.sender, tldDeposits[node]);
      return requestId;
    }

    /**
     * @dev Claims a name by proving ownership of its HNS equivalent.
     * Chainlink node verifies that NS record is pointed to namespace of this contract (Ethereum)
     * and pulls TXT record with address to give ownership to.
     * @param tld The HNS domain to claim
     */
    function register(string calldata tld) public returns (bool) {
      bytes32 node = _getNamehash(tld);
      require(tldDeposits[node] >= minTLDDeposit, 'Insufficient deposit for TLD');
      address tldOwner = IXNHNSOracle(xnhnsOracle).getTLDOwner(node);
      require(tldOwner != address(0), 'Invalid TLD in namespace');
      require(tldOwner == msg.sender, 'Only TLD owner can register');

      Root nftld = _getRoot();
      nftld.register(_getLabel(tld), tldOwner);
      emit NewOwner(tld, tldOwner);

      return true;
    }

    function increaseDeposit(bytes32 node, uint256 amount) public payable returns (bool) {
      uint256 total = tldDeposits[node].add(msg.value);
      totalDeposits = totalDeposits.add(msg.value);
      return true;
    }

    /** @dev Allows anyone to prove that TLD is not set anymore and revoke teir ENS name
     * @param tld - human readable string 
    */
    function snitch(string memory tld)
      public payable
      whileRegistrarEnabled
      returns (bytes32 requestId)
    {
      require(msg.value >= snitchDeposit, 'Insufficient snitch deposit');
      bytes32 node  = _getNamehash(tld);
      require(ens.recordExists(node), 'Cant snitch on unregistered TLD');

      (address addr,) = _getSnitch(node);
      require(addr == address(0), 'TLD already snitched on');

      snitches[node] = Snitch({
        addr: msg.sender,
        startTime: block.timestamp
      });
      totalDeposits = totalDeposits.add(snitchDeposit);

      return IXNHNSOracle(xnhnsOracle).requestTLDUpdate(tld);
    }

    function claimSnitchReward(string calldata tld) public returns (bool) {
      bytes32 node = _getNamehash(tld);
      (address addr, uint256 startTime) = _getSnitch(node);
      // prevent snitch front running oracle response
      require(block.timestamp > startTime.add(2 hours), 'Cant snitch yet');
      delete snitches[node];

      address owner = _getRoot().ownerOf(uint(node));
      if(IXNHNSOracle(xnhnsOracle).getTLDOwner(node) == address(0)) {
        // snitch successful
        uint256 tldDeposit = _unregister(tld);
        totalDeposits = totalDeposits.sub( snitchDeposit.add(tldDeposit) );
        payable(addr).transfer( snitchDeposit.add(tldDeposit.div(2)) );
        emit SnitchedOn(node, owner, addr, tldDeposit.div(2));
        return true;
      } else {
        // snitch failed, claim snitch deposit 
        totalDeposits = totalDeposits.sub(snitchDeposit);
        emit SnitchesGotStitches(node, owner, addr, snitchDeposit);
        return false;
      }
    }

    function unregister(string calldata tld) public payable {
      bytes32 node = _getNamehash(tld);
      uint id = uint(node);
      address owner = _getRoot().ownerOf(id);
      require(msg.sender == owner, 'Only NFTLD owner can unregister');

      uint256 deposit = _unregister(tld);
      payable(owner).transfer(deposit);
    }

    function _unregister(string memory tld) internal returns (uint256 deposit) {
      _getRoot().unregister(_getLabel(tld));
      deposit = tldDeposits[_getNamehash(tld)];
      delete tldDeposits[_getNamehash(tld)];
      totalDeposits = totalDeposits.sub(deposit);
      return deposit;
    }

    /**
     * @dev donate fees collected by registrar to HNS Fund via Panvala League
    */
    function claimFees() external returns(bool) {
      uint feesCollected = address(this).balance.sub(totalDeposits) ;
      payable(_getRoot().owner()).call{value: feesCollected};
      emit FeesCollected(feesCollected, _getRoot().owner());
      return true;
    }

    /** Getter Functions */

    function oracle() public view returns (IXNHNSOracle) {
      return xnhnsOracle;
    }
    
    function namespace() public view returns (string memory) {
      return NAMESPACE;
    }
    
    function getLabel(string memory tld) external pure returns (bytes32) {
        return _getLabel(tld);
    }
    function _getLabel(string memory tld) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(tld));
    }

    function getNamehash(string memory tld) external pure returns (bytes32) {
        return _getNamehash(tld);
    }
    function _getNamehash(string memory tld) internal pure returns (bytes32) {
      return keccak256(abi.encodePacked( ROOT_NODE, _getLabel(tld) ));
    }

    function _getRoot() internal view returns (Root) {
      return Root(ens.owner(ROOT_NODE));
    }

    function _getSnitch(bytes32 node) public view returns (address, uint256) {
      Snitch memory _snitch = snitches[node];
      return (_snitch.addr, _snitch.startTime);
    }

    function _registrarEnabled() internal view returns (bool) {
      return IXNHNSOracle(xnhnsOracle).getCallerPermission(address(this));
    }

    function supportsInterface(bytes4 interfaceID) public pure returns (bool) {
        return interfaceID == INTERFACE_META_ID ||
               interfaceID == XNHNS_CLAIM_ID;
    }
}
