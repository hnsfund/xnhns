pragma solidity ^0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../utils/ERC721.sol";
import "../../interfaces/IENS.sol";
import "../../interfaces/IBaseRegistrar.sol";

contract BaseRegistrar is
  IBaseRegistrar,
  ERC721("Cross-Network Handshake SLD Registrar", "XNHNSSLD") 
{
    // A map of expiry times
    mapping(uint256 => uint) expiries;

    bytes4 constant private RECLAIM_ID = bytes4(keccak256("reclaim(uint256,address)"));

    constructor(ENS _ens, bytes32 _baseNode) {
        ens = _ens;
        baseNode = _baseNode;   
        _registerInterface(RECLAIM_ID);
    }

    modifier live {
        require(ens.owner(baseNode) == address(this));
        _;
    }

    modifier onlyController {
        require(controllers[msg.sender]);
        _;
    }

    // /**
    //  * @dev Gets the owner of the specified token ID. Names become uned
    //  *      when their registration expires.
    //  * @param tokenId uint256 ID of the token to query the owner of
    //  * @return address currently marked as the owner of the given token ID
    //  */
    function ownerOf(uint256 tokenId) override public view returns (address) {
        require(expiries[tokenId] > block.timestamp);
        return super.ownerOf(tokenId);
    }

    // Authorises a controller, who can register and renew domains.
    function addController(address controller) onlyOwner external override {
        controllers[controller] = true;
        emit ControllerAdded(controller);
    }

    // Revoke controller permission for an address.
    function removeController(address controller) onlyOwner external override {
        controllers[controller] = false;
        emit ControllerRemoved(controller);
    }

    // Set the resolver for the TLD this registrar manages.
    function setResolver(address resolver) onlyOwner external override {
        ens.setResolver(baseNode, resolver);
    }

    // Returns the expiration timestamp of the specified id.
    function nameExpires(uint256 id) external view override returns(uint) {
        return expiries[id];
    }

    // Returns true iff the specified name is available for registration.
    function available(uint256 id) public view override returns(bool) {
        // Not available if it's registered here or in its grace period.
        return expiries[id] + GRACE_PERIOD < block.timestamp;
    }

    /**
     * @dev Register a name.
     * @param id The token ID (keccak256 of the label).
     * @param _owner The address that should own the registration.
     * @param duration Duration in seconds for the registration.
     */
    function register(uint256 id, address _owner, uint duration) external override returns(uint) {
      return _register(id, _owner, duration, true);
    }

    /**
     * @dev Register a name, without modifying the registry.
     * @param id The token ID (keccak256 of the label).
     * @param _owner The address that should own the registration.
     * @param duration Duration in seconds for the registration.
     */
    function registerOnly(uint256 id, address _owner, uint duration) external returns(uint) {
      return _register(id, _owner, duration, false);
    }

    function _register(uint256 id, address _owner, uint duration, bool updateRegistry) live onlyController internal returns(uint) {
        require(available(id));
        require(block.timestamp + duration + GRACE_PERIOD > block.timestamp + GRACE_PERIOD); // Prevent future overflow

        expiries[id] = block.timestamp + duration;
        if(_exists(id)) {
            // Name was previously owned, and expired
            _burn(id);
        }
        _mint(_owner, id);
        if(updateRegistry) {
            ens.setSubnodeOwner(baseNode, bytes32(id), _owner);
        }

        emit NameRegistered(id, _owner, block.timestamp + duration);

        return block.timestamp + duration;
    }

    function renew(uint256 id, uint duration) live onlyController external override  returns(uint) {
        require(expiries[id] + GRACE_PERIOD >= block.timestamp); // Name must be registered here or in grace period
        require(expiries[id] + duration + GRACE_PERIOD > duration + GRACE_PERIOD); // Prevent future overflow

        expiries[id] += duration;
        emit NameRenewed(id, expiries[id]);
        return expiries[id];
    }

    /**
     * @dev Reclaim ownership of a name in ENS, if you own it in the registrar.
     */
    function reclaim(uint256 id, address _owner) override external live {
        require(_isApprovedOrOwner(msg.sender, id));
        ens.setSubnodeOwner(baseNode, bytes32(id), _owner);
    }

    /**
     * @dev Give ownership of TLD and NFTLD to owner
     */
    function releaseNFTLD(address _owner) onlyController external override returns(bool) {
        ens.setOwner(baseNode, _owner);
        (bool success, bytes memory data) = ens.owner(bytes32(0)).call(
          abi.encodeWithSignature(
            "reclaim(uint256,address)",
            uint256(baseNode),
            _owner
          )
        );
        require(success);
        return true;
    }
}
