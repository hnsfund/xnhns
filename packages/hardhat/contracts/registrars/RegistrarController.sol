pragma solidity^0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../../interfaces/IPublicResolver.sol";
import "../../interfaces/IPriceOracle.sol";
import "../utils/StringUtils.sol";
import "./BaseRegistrar.sol";

/**
 * @dev A registrar controller for registering and renewing names at fixed cost.
 */
contract RegistrarController is Ownable {
    using StringUtils for *;
    uint256 public constant GRACE_PERIOD = 90 days;
    uint constant public MIN_REGISTRATION_DURATION = 28 days;

    bytes4 constant private INTERFACE_META_ID = bytes4(keccak256("supportsInterface(bytes4)"));
    bytes4 constant private COMMITMENT_CONTROLLER_ID = bytes4(
        keccak256("rentPrice(string,uint256)") ^
        keccak256("available(string)") ^
        keccak256("makeCommitment(string,address,bytes32)") ^
        keccak256("commit(bytes32)") ^
        keccak256("register(string,address,uint256,bytes32)") ^
        keccak256("renew(string,uint256)")
    );

    bytes4 constant private COMMITMENT_WITH_CONFIG_CONTROLLER_ID = bytes4(
        keccak256("registerWithConfig(string,address,uint256,bytes32,address,address)") ^
        keccak256("makeCommitmentWithConfig(string,address,bytes32,address,address)")
    );

    BaseRegistrar base;
    IPriceOracle prices;
    uint public minCommitmentAge;
    uint public maxCommitmentAge;

    mapping(bytes32=>uint) public commitments;

    event NameRegistered(string name, bytes32 indexed label, address indexed owner, uint cost, uint expires);
    event NameRenewed(string name, bytes32 indexed label, uint cost, uint expires);
    event NewPriceOracle(address indexed oracle);

    constructor(BaseRegistrar _base, IPriceOracle _prices, uint _minCommitmentAge, uint _maxCommitmentAge) {
        require(_maxCommitmentAge > _minCommitmentAge);
        base = _base;
        prices = _prices;
        minCommitmentAge = _minCommitmentAge;
        maxCommitmentAge = _maxCommitmentAge;
    }

    function rentPrice(string memory name, uint duration) view public returns(uint) {
        bytes32 hash = keccak256(bytes(name));
        return prices.price(name, base.nameExpires(uint256(hash)), duration);
    }

    function valid(string memory name) public pure returns(bool) {
        return name.strlen() > 0;
    }

    function available(string memory name) public view returns(bool) {
        bytes32 label = keccak256(bytes(name));
        return valid(name) && base.available(uint256(label));
    }

    function makeCommitment(string memory name, address owner_, bytes32 secret) pure public returns(bytes32) {
        return makeCommitmentWithConfig(name, owner_, secret, address(0), address(0));
    }

    function makeCommitmentWithConfig(string memory name, address owner_, bytes32 secret, address resolver, address addr) pure public returns(bytes32) {
        bytes32 label = keccak256(bytes(name));
        if (resolver == address(0) && addr == address(0)) {
            return keccak256(abi.encodePacked(label, owner_, secret));
        }
        require(resolver != address(0));
        return keccak256(abi.encodePacked(label, owner_, resolver, addr, secret));
    }

    function commit(bytes32 commitment) public {
        require(commitments[commitment] + maxCommitmentAge <block.timestamp);
        commitments[commitment] =block.timestamp;
    }

    function register(string calldata name, address owner_, uint duration, bytes32 secret) external payable {
      registerWithConfig(name, owner_, duration, secret, address(0), address(0));
    }

    function registerWithConfig(string memory name, address owner_, uint duration, bytes32 secret, address resolver, address addr) public payable {
        bytes32 commitment = makeCommitmentWithConfig(name, owner_, secret, resolver, addr);
        uint cost = _consumeCommitment(name, duration, commitment);

        bytes32 label = keccak256(bytes(name));
        uint256 tokenId = uint256(label);

        uint expires;
        if(resolver != address(0)) {
            // Set this contract as the (temporary) owner, giving it
            // permission to set up the resolver.
            expires = base.register(tokenId, address(this), duration);

            // The nodehash of this label
            bytes32 nodehash = keccak256(abi.encodePacked(base.baseNode(), label));

            // Set the resolver
            base.ens().setResolver(nodehash, resolver);

            // Configure the resolver
            if (addr != address(0)) {
                IPublicResolver(resolver).setAddr(nodehash, addr);
            }

            // Now transfer full ownership to the expeceted owner
            base.reclaim(tokenId, owner_);
            base.transferFrom(address(this), owner_, tokenId);
        } else {
            require(addr == address(0));
            expires = base.register(tokenId, owner_, duration);
        }

        emit NameRegistered(name, label, owner_, cost, expires);

        // Refund any extra payment
        if(msg.value > cost) {
            msg.sender.transfer(msg.value - cost);
        }
    }

    function renew(string calldata name, uint duration) external payable {
        uint cost = rentPrice(name, duration);
        require(msg.value >= cost);

        bytes32 label = keccak256(bytes(name));
        uint expires = base.renew(uint256(label), duration);

        if(msg.value > cost) {
            msg.sender.transfer(msg.value - cost);
        }

        emit NameRenewed(name, label, cost, expires);
    }

    function setPriceOracle(IPriceOracle _prices) public onlyOwner {
        prices = _prices;
        emit NewPriceOracle(address(prices));
    }

    function setCommitmentAges(uint _minCommitmentAge, uint _maxCommitmentAge) public onlyOwner {
        minCommitmentAge = _minCommitmentAge;
        maxCommitmentAge = _maxCommitmentAge;
    }

    function withdraw() public onlyOwner {
        msg.sender.transfer(address(this).balance);
    }

    function supportsInterface(bytes4 interfaceID) external pure returns (bool) {
        return interfaceID == INTERFACE_META_ID ||
               interfaceID == COMMITMENT_CONTROLLER_ID ||
               interfaceID == COMMITMENT_WITH_CONFIG_CONTROLLER_ID;
    }

    function _consumeCommitment(string memory name, uint duration, bytes32 commitment) internal returns (uint256) {
        // Require a valid commitment
        require(commitments[commitment] + minCommitmentAge <=block.timestamp);

        // If the commitment is too old, or the name is registered, stop
        require(commitments[commitment] + maxCommitmentAge >block.timestamp);
        require(available(name));

        delete(commitments[commitment]);

        uint cost = rentPrice(name, duration);
        require(duration >= MIN_REGISTRATION_DURATION);
        require(msg.value >= cost);

        return cost;
    }

    function releaseNFTLD(address _owner) onlyOwner external returns (bool) {
      require(base.releaseNFTLD(_owner));
      return true;
    }
}
