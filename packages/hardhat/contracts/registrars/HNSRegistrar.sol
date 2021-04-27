pragma solidity ^0.7.0;

import "../interfaces/IENS.sol";
import "../interfaces/IXNHNSOracle.sol";
import "../interfaces/IPanvalaMember.sol";
import "../Root.sol";

/**
 * @dev An ENS registrar that allows the owner of a HNS TLD to claim the
 *      corresponding TLD in ENS.
 */
contract HNSRegistrar {

    IENS public ens;
    // IPanvalaMember public hnsFund;

    // oracle that requests and stores tld verification data
    IXNHNSOracle public xnhnsOracle;
    // namespace that this contract lives in
    // formal registry of namespaces tbd in a HIP
    string public xnhnsNS;
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
    event TLDMigrationRequested(bytes32 indexed node, address indexed owner, uint256 deposit);
    // NewOwner identitcal to IENS.sol
    event NewOwner(bytes32 indexed node, address owner);
    event SnitchedOn(bytes32 indexed node, address indexed owner, address snitch, uint256 snitchReward);
    event SnitchesGotStitches(bytes32 indexed node, address indexed owner, address snitch, uint256 snitchPenalty);

    struct Snitch {
      address addr;
      uint256 blockStart;
    }
    
    mapping(bytes32 => Snitch) snitches; // namehash -> snitcher
    mapping(bytes32 => uint256) public tldDeposits; // namehash -> tld deposit

    constructor(IENS _ens, string memory _namespace, IXNHNSOracle _oracle) {
        ens = _ens;
        xnhnsNS = _namespace;
        xnhnsOracle = _oracle;
        emit NewOracle(address(_oracle));
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
      uint256 total = msg.value + totalDeposits;
      require(total > totalDeposits, 'Maximum deposits limit hit'); // uint overflow
      bytes32 node = _getNamehash(tld);
      tldDeposits[node] = msg.value;
      totalDeposits = total;

      requestId = xnhnsOracle.requestTLDUpdate(tld);
      emit TLDMigrationRequested(node, msg.sender, msg.value);
      return requestId;
    }

    /**
     * @dev Claims a name by proving ownership of its HNS equivalent.
     * Chainlink node verifies that NS record is pointed to namespace of this contract (Ethereum)
     * and pulls TXT record with address to give ownership to.
     * @param tld The HNS domain to claim
     */
    function register(string memory tld) public returns (uint id) {
      bytes32 node = _getNamehash(tld);
      require(tldDeposits[node] >= minTLDDeposit, 'Insufficient deposit for TLD');
      address tldOwner = IXNHNSOracle(xnhnsOracle).getTLDOwner(node);
      require(tldOwner != address(0), 'TLD is invalid on this namespace');
      require(tldOwner == msg.sender, 'Only TLD owner can register');

       _getRoot().register(uint(node), tldOwner);
      emit NewOwner(_getNamehash(tld), tldOwner);
      return uint(node);
    }

    function increaseDeposit(bytes32 node, uint256 amount) public payable returns (bool) {
      address tldOwner = IXNHNSOracle(xnhnsOracle).getTLDOwner(node);
      require(tldOwner != address(0), 'TLD is invalid on this namespace');
      require(tldOwner == msg.sender, 'Only TLD owner can register');
      uint256 total = tldDeposits[node] + msg.value;
      require(total>= minTLDDeposit, 'Insufficient deposit for TLD');
      return true;
    }

    /** @dev Allows anyone to prove that TLD is not set anymore and revoke teir ENS name
     * @param tld - human readable string 
    */
    function snitchOn(string memory tld)
      public payable
      whileRegistrarEnabled
      returns (bytes32 requestId)
    {
      require(msg.value >= snitchDeposit, 'Insufficient snitch deposit');

      bytes32 node  = _getNamehash(tld);
      require(ens.recordExists(node), 'Cant snitch on unregistered TLD');
      // require(tldDeposits[node] >= minTLDDeposit, 'No reward for snitching on TLD');

      (address addr,) = _getSnitch(node);
      require(addr == address(0), 'TLD already snitched on');

      snitches[node] = Snitch({
        addr: msg.sender,
        blockStart: block.timestamp
      });
      totalDeposits += snitchDeposit;

      return IXNHNSOracle(xnhnsOracle).requestTLDUpdate(tld);
    }

    function claimSnitchReward(bytes32 node) public returns (bool) {
      (address addr, uint256 blockStart) = _getSnitch(node);
      // prevent snitch front running oracle response
      require(block.timestamp > blockStart + 2 hours, 'Cannot snitch yet');
      delete snitches[node];

      address owner = _getRoot().ownerOf(uint(node));
      if(IXNHNSOracle(xnhnsOracle).getTLDOwner(node) == address(0)) {
        // snitch successful
        uint256 tldDeposit = _unregister(node);
        payable(addr).transfer(snitchDeposit + (tldDeposit / 2));
        totalDeposits -= (snitchDeposit + tldDeposit);
        emit SnitchedOn(node, owner, addr, tldDeposit / 2);
        return true;
      } else {
        // snitch failed
        // move snitch deposit to smart contract's fees
        totalDeposits -= snitchDeposit;
        emit SnitchesGotStitches(node, owner, addr, snitchDeposit);
        return false;
      }
    }

    function unregister(bytes32 node) public payable {
      address owner = _getRoot().ownerOf(uint(node));
      require(msg.sender == owner, 'Only TLD owner can unregister');

      uint256 deposit = _unregister(node);
      payable(owner).transfer(deposit);
    }

    function _unregister(bytes32 node) internal returns (uint256 deposit) {
      _getRoot().unregister(uint(node));
      deposit = tldDeposits[node];
      totalDeposits -= deposit;
      tldDeposits[node] = 0;
      return deposit;
    }

    function setOracle(IXNHNSOracle _oracle) public onlyOwner returns (bool) {
      xnhnsOracle = _oracle;
      emit NewOracle(address(xnhnsOracle));
      return true;
    }

    /**
     * @dev donate fees collected by registrar to HNS Fund via Panvala League
    */
    function donateProfits() public returns(uint) {
      uint feesCollected = address(this).balance - totalDeposits;
      // hnsFund.regenerate.value(feesCollected)(feesCollected);
      return feesCollected;
    }

    /** Getter Functions */

    function oracle() public view returns (IXNHNSOracle) {
      return xnhnsOracle;
    }
    
    function namespace() public view returns (string memory) {
      return xnhnsNS;
    }

    function _getNamehash(string memory tld) internal pure returns (bytes32) {
      return keccak256(abi.encodePacked(
        bytes32(0),
        keccak256(abi.encodePacked(tld))
      ));
    }
    function _getRoot() internal view returns (Root) {
      return Root(ens.owner(bytes32(0)));
    }

    function _getSnitch(bytes32 node) public view returns (address, uint256) {
      Snitch memory _snitch = snitches[node];
      return (_snitch.addr, _snitch.blockStart);
    }

    function _registrarEnabled() internal returns (bool) {
      return (
        _getRoot().isController(address(this)) &&
        IXNHNSOracle(xnhnsOracle).getCallerPermission(address(this))
      );
    }

    function supportsInterface(bytes4 interfaceID) public pure returns (bool) {
        return interfaceID == INTERFACE_META_ID ||
               interfaceID == XNHNS_CLAIM_ID;
    }
}
