pragma solidity ^0.7.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../interfaces/IENS.sol";
import "./utils/Controllable.sol";

contract Root is
  Controllable,
  ERC721("Cross-Network Handshake NFTTLD", "NFTLD")
{
    bytes32 constant private ROOT_NODE = bytes32(0);

    bytes4 constant private RECLAIM_ID = bytes4(keccak256("reclaim(uint,address)"));

    event TLDRegistered(uint indexed id, address indexed owner);
    event TLDUnregistered(uint indexed id, address indexed owner);

    ENS public ens;
    mapping(uint => address) public tldControllers; // sets NFTLD to only be changd by original registrar

    constructor(ENS _ens) {
        ens = _ens;
        _registerInterface(RECLAIM_ID);
    }

    function setResolver(address resolver) external onlyOwner {
      ens.setResolver(ROOT_NODE, resolver);
    }

    function register(uint id, address _owner) external onlyController returns(bool) {
        require(address(0) == tldControllers[id], 'Cannot register claimed TLD');
        if(_exists(id)) {
            // Name was previously owned
            _burn(id);
        }
        _mint(_owner, id);
        ens.setSubnodeOwner(ROOT_NODE, bytes32(id), _owner);
        emit TLDRegistered(id, _owner);
        tldControllers[id] = msg.sender;
        return true;
    }

    function unregister(uint id) external onlyController returns(bool) {
        require(address(0) != tldControllers[id], 'Cannot unregister a nonexistant TLD');
        require(msg.sender == tldControllers[id], 'Controller not allowed for NFTLD');
        address _owner = ownerOf(id);
        if(_exists(id)) {
            _burn(id);
        }
        ens.setSubnodeOwner(ROOT_NODE, bytes32(id), address(0)); // or address(this)?
        delete tldControllers[id];
        emit TLDUnregistered(id, _owner);
        return true;
    }

    /**
     * @dev Reclaim ownership of a name in ENS if you own the NFT.
     */
    function reclaim(uint id, address _owner) external returns (bool) {
        require(_isApprovedOrOwner(msg.sender, id));
        ens.setSubnodeOwner(ROOT_NODE, bytes32(id), _owner);
        return true;
    }
}
