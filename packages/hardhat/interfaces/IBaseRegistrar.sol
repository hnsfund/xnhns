pragma solidity ^0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IENS.sol";

abstract contract IBaseRegistrar is Ownable {
    uint256 public constant GRACE_PERIOD = 90 days;

    event ControllerAdded(address indexed controller);
    event ControllerRemoved(address indexed controller);
    event NameMigrated(
        uint256 indexed id,
        address indexed owner,
        uint256 expires
    );
    event NameRegistered(
        uint256 indexed id,
        address indexed owner,
        uint256 expires
    );
    event NameRenewed(uint256 indexed id, uint256 expires);

    // The ENS registry
    ENS public ens;

    // The namehash of the TLD this registrar owns (eg, .eth)
    bytes32 public baseNode;

    // A map of addresses that are authorised to register and renew names.
    mapping(address => bool) public controllers;

    // Authorises a controller, who can register and renew domains.
    function addController(address controller) external virtual;

    // Revoke controller permission for an address.
    function removeController(address controller) external virtual;

    // Set the resolver for the TLD this registrar manages.
    function setResolver(address resolver) external virtual;

    // Returns the expiration timestamp of the specified label hash.
    function nameExpires(uint256 id) external virtual view returns (uint256);

    // Returns true iff the specified name is available for registration.
    function available(uint256 id) public virtual view returns (bool);

    /**
     * @dev Register a name.
     */
    function register(
        uint256 id,
        address owner,
        uint256 duration
    ) external virtual returns (uint256);

    function renew(uint256 id, uint256 duration)
        external
        virtual
        returns (uint256);

    /**
     * @dev Reclaim ownership of a name in ENS, if you own it in the registrar.
     */
    function reclaim(uint256 id, address owner) external virtual;


    /**
     * @dev Send ownership of ENS namehash and NFTLD to owner
     */
    function releaseNFTLD(address _owner) external virtual  returns(bool);
}
