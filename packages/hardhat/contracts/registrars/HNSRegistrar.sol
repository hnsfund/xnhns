pragma solidity ^0.7.0;

import "../../interfaces/IDNSSEC.sol";
import "../../interfaces/IENS.sol";
import "../utils/BytesUtils.sol";
import "../utils/DNSClaimChecker.sol"; // turn this into ChainLink oracle?
import "../Root.sol";

/**
 * @dev An ENS registrar that allows the owner of a HNS TLD to claim the
 *      corresponding TLD in ENS.
 */
contract HNSRegistrar /* is ChainlinkClient */ {
    using BytesUtils for bytes;

    IDNSSEC public oracle;
    ENS public ens;

    bytes4 constant private INTERFACE_META_ID = bytes4(keccak256("supportsInterface(bytes4)"));
    bytes4 constant private DNSSEC_CLAIM_ID = bytes4(
        keccak256("claim(bytes,bytes)") ^
        keccak256("proveAndClaim(bytes,bytes,bytes)") ^
        keccak256("oracle()")
    );

    event Claim(bytes32 indexed node, address indexed owner, bytes dnsname);
    event NewOracle(address oracle);

    constructor(IDNSSEC _dnssec, ENS _ens) {
        ens = _ens;
        oracle = _dnssec;
        emit NewOracle(address(oracle));
    }

    /**
     * @dev This contract's owner-only functions can be invoked by the owner of the ENS root.
     */
    modifier onlyOwner {
        Root root = _getRoot();
        address owner = root.owner();
        require(msg.sender == owner);
        _;
    }

    function setOracle(IDNSSEC _dnssec) public onlyOwner {
        oracle = _dnssec;
        emit NewOracle(address(oracle));
    }

    /**
     * @dev Claims a name by proving ownership of its DNS equivalent.
     * @param name The name to claim, in DNS wire format.
     * @param proof A DNS RRSet proving ownership of the name. Must be verified
     *        in the DNSSEC oracle before calling. This RRSET must contain a TXT
     *        record for '_ens.' + name, with the value 'a=0x...'. Ownership of
     *        the name will be transferred to the address specified in the TXT
     *        record.
     */
    function claim(bytes memory name, bytes memory proof) public {
        // TODO Make sure this is verifying _ens.tld not _ens.sld.tld
        // Get the first label
        uint labelLen = name.readUint8(0);
        bytes32 labelHash = name.keccak(1, labelLen);
        address addr;
        // replace with CL oracle call?
        (addr,) = DNSClaimChecker.getOwnerAddress(oracle, name, proof);

        bytes32 namehash = keccak256(abi.encodePacked(bytes32(0), labelHash));
        // mint NFT and assign tld to claimant
        _getRoot().register(uint256(namehash), addr);
        emit Claim(namehash, addr, name);
    }

    /**
     * @dev Submits proofs to the DNSSEC oracle, then claims a name using those proofs.
     * @param name The name to claim, in DNS wire format.
     * @param input The data to be passed to the Oracle's `submitProofs` function. The last
     *        proof must be the TXT record required by the registrar.
     * @param proof The proof record for the first element in input.
     */
    function proveAndClaim(bytes memory name, bytes memory input, bytes memory proof) public {
        proof = oracle.submitRRSets(input, proof);
        claim(name, proof);
    }

    // this gives TLD to this contract and sld to user
    // function enableNode(bytes memory domain, uint offset) internal returns(bytes32 node) {
    //     uint len = domain.readUint8(offset);
    //     if(len == 0) { // if domain is root
    //         return bytes32(0);
    //     }

    //     bytes32 parentNode = enableNode(domain, offset + len + 1);
    //     bytes32 label = domain.keccak(offset + 1, len);
    //     node = keccak256(abi.encodePacked(parentNode, label));
    //     address owner = ens.owner(node);
    //     require(owner == address(0) || owner == address(this), "Cannot enable a name owned by someone else");
    //     if(owner != address(this)) {
    //         if(parentNode == bytes32(0)) {
    //             Root root = _getRoot();
    //             root.setSubnodeOwner(label, address(this));
    //         } else {
    //             ens.setSubnodeOwner(parentNode, label, address(this));
    //         }
    //     }
    //     return node;
    // }

    function _getRoot() internal view returns (Root) {
      return Root(ens.owner(bytes32(0)));
    }

    function supportsInterface(bytes4 interfaceID) public pure returns (bool) {
        return interfaceID == INTERFACE_META_ID ||
               interfaceID == DNSSEC_CLAIM_ID;
    }
}
