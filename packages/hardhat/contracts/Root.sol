pragma solidity ^0.7.0;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { IENS } from "./interfaces/IENS.sol";
import { IHNSRegistrar } from "./interfaces/IHNSRegistrar.sol";

import "./utils/Controllable.sol";

contract Root is
  Controllable,
  ERC721("Cross-Network Handshake NFTLD", "NFTLD")
{
    bytes32 constant private ROOT_NODE = bytes32(0);

    bytes4 constant private RECLAIM_ID = bytes4(keccak256("reclaim(uint,address)"));

    event TLDRegistered(uint indexed id, address indexed owner);
    event TLDUnregistered(uint indexed id, address indexed owner);

    IENS public ens;
    mapping(uint => address) public tldControllers; // sets NFTLD to only be changd by original registrar

    constructor(IENS _ens) {
        ens = _ens;
        _registerInterface(RECLAIM_ID);
    }

    modifier onlyControllerForTLD(uint256 id) {
      require(_exists(id), 'Root: NFTLD does not exist');
      require(msg.sender == tldControllers[id], 'Root: Controller not allowed for NFTLD');
      _;
    }
    function setResolver(address resolver) external onlyOwner {
      ens.setResolver(ROOT_NODE, resolver);
    }

    function register(uint id, address owner_)
      external
      onlyController
      returns(bool)
    {
        require(address(0) == tldControllers[id], 'Root: Cannot register claimed TLD');
        _mint(owner_, id);
        ens.setSubnodeOwner(ROOT_NODE, bytes32(id), owner_);
        emit TLDRegistered(id, owner_);
        tldControllers[id] = msg.sender;
        return true;
    }

    /**
      * @dev Only callable by registar for TLD. Burns NFTLD and sets ENS node owner to address(0)
      * @param id - NFTLD token id
     */
    function unregister(uint id)
      external
      onlyControllerForTLD(id)
      returns(bool)
    {
      address owner_ = ownerOf(id);
      _burn(id);
      ens.setSubnodeOwner(ROOT_NODE, bytes32(id), address(0)); // or address(this)?
      delete tldControllers[id];
      emit TLDUnregistered(id, owner_);
      return true;
    }

    /**
     * @dev Reclaim ownership of a name in ENS if you own the NFT.
     */
    function reclaim(uint id, address owner_) external returns (bool) {
      require(_isApprovedOrOwner(msg.sender, id));
      ens.setSubnodeOwner(ROOT_NODE, bytes32(id), owner_);
      return true;
    }

    // GETTERS
    function getControllerForNFTLD(uint256 id) external view returns(address) {
      return tldControllers[id];
    }
}
