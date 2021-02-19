pragma solidity ^0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IENS.sol";
import "./utils/Controllable.sol";
import "./ERC721/ERC721.sol";

contract Root is
  Ownable,
  Controllable,
  ERC721("Handshake Ethereum Naming Service", "HENS")
{
    bytes32 constant private ROOT_NODE = bytes32(0);

    // bytes4 constant private INTERFACE_META_ID = bytes4(keccak256("supportsInterface(bytes4)"));
    // bytes4 constant private ERC721_ID = bytes4(
    //     keccak256("balanceOf(address)") ^
    //     keccak256("ownerOf(uint256)") ^
    //     keccak256("approve(address,uint256)") ^
    //     keccak256("getApproved(uint256)") ^
    //     keccak256("setApprovalForAll(address,bool)") ^
    //     keccak256("isApprovedForAll(address,address)") ^
    //     keccak256("transferFrom(address,address,uint256)") ^
    //     keccak256("safeTransferFrom(address,address,uint256)") ^
    //     keccak256("safeTransferFrom(address,address,uint256,bytes)")
    // );

    // event TLDLocked(bytes32 indexed label);
    event TLDRegistered(uint256 indexed id, address indexed owner);

    ENS public ens;
    // mapping(bytes32=>bool) public locked;

    constructor(ENS _ens) public {
        ens = _ens;
    }

    function setSubnodeOwner(bytes32 label, address owner) public {
        // require(!locked[label]);
        ens.setSubnodeOwner(ROOT_NODE, label, owner);
    }

    function setResolver(address resolver) external onlyOwner {
        ens.setResolver(ROOT_NODE, resolver);
    }

    function register(uint256 id, address owner) external onlyController returns(bool) {
        if(_exists(id)) {
            // Name was previously owned, and expired
            _burn(id);
        }
        _mint(owner, id);
        setSubnodeOwner(bytes32(id), owner);
        emit TLDRegistered(id, owner);
        return true;
    }

    // function lock(bytes32 label) external onlyOwner {
    //     emit TLDLocked(label);
    //     locked[label] = true;
    // }

    // can remove because all interfaces already declared in erc721 contract
    // function supportsInterface(bytes4 interfaceID) public pure override returns (bool) {
    //     return interfaceID == INTERFACE_META_ID ||
    //            interfaceID == ERC721_ID;
    // }
}
