pragma solidity^0.7.0;

import { IERC20 } from '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import { ENS } from '../../interfaces/IENS.sol';
import { Root } from '../Root.sol';
import { BasePriceOracle } from '../oracles/BasePriceOracle.sol';
import { BaseRegistrar } from './BaseRegistrar.sol';
import { RegistrarController } from './RegistrarController.sol';
contract XNHNSRegistrarFactory {
  ENS immutable ens;
  Root immutable root;

  address public resolver; // default XNHNS public resolver

  address public feeToken; // token to take fees for deployment in. address(0) is ETH
  uint256 public fee;      // amount of `feeToken` to take as fees. Must be in `feeToken` decimals

  // defaults for registrars. owner can update later

  uint256 constant MIN_COMMITMENT_AGE = 2 minutes;
  uint256 constant MAX_COMMITMENT_AGE = 1 days;
  uint256[] DEFAULT_PRICES            = [
    uint256(50  ether),
    uint256(15  ether),
    uint256(5  ether),
    uint256(1 ether)
  ];
  uint256[] DEFAULT_PRICE_TIERS       = [
    uint256(3),   // length = 0 <= x < 4
    uint256(6),   // length = 4 <= x < 6
    uint256(10),  // length = 6 <= x < 10
    uint256(15)   // length 10 <= x < n
  ];

  event RegistrarDeployed(
    bytes32 indexed node,
    address indexed controller,
    address indexed resolver,
    address owner
  );
  
  constructor(ENS ens_, address resolver_) {
    ens = ens_;
    root = Root(ens_.owner(bytes32(0))); // XNHNS root cant be transferred so can set once
    resolver = resolver_;
  }

  modifier onlyRootOwner() {
    require(msg.sender == root.owner());
    _;
  }

  modifier onlyNFTLDOwner(bytes32 node) {
    require(msg.sender == root.ownerOf(uint256(node)));
    _;
  }

  modifier takeDeploymentFee() {
    if(feeToken == address(0)) {
      require(msg.value >= fee, 'XNHNS Factory: failed paying fee');
    } else {
      require(
        IERC20(feeToken).transferFrom(msg.sender, root.owner(), fee),
        'XNHNS Factory: failed paying fee'
      );
    }
    _;
  }

  /**
  * @dev deploys default registrar for TLD with `node`
  * @param node - ENS namehash of TLD to deploy registrar for
  */
  function createRegistrar(bytes32 node)
    onlyNFTLDOwner(node)
    takeDeploymentFee
    payable
    external
    returns(address)
  {
    uint256[] memory prices_ = DEFAULT_PRICES;
    uint256[] memory priceTiers_ = DEFAULT_PRICE_TIERS;

    return _deploy(node, msg.sender, feeToken, prices_, priceTiers_);
  }

  function createRegistrarWithCustomPricing(
    bytes32 node,
    address token,
    uint256[] memory prices,
    uint256[] memory priceTiers
  )
    onlyNFTLDOwner(node)
    takeDeploymentFee
    payable
    external
    returns(address)
  {
    return _deploy(node, msg.sender, token, prices, priceTiers);
  }

  function _deploy(
    bytes32 node,
    address owner,
    address token,
    uint256[] memory prices,
    uint256[] memory priceTiers
  ) internal returns(address) {
    // get control of node by claiming ownership of NFTLD
    root.reclaim(uint256(node), address(this));

    // deploy registrar
    BaseRegistrar registrar = new BaseRegistrar(ens, node);

    // deploy price oracle
    BasePriceOracle priceOracle = new BasePriceOracle(prices, priceTiers);
    RegistrarController controller = new RegistrarController(
      registrar,
      priceOracle,
      MIN_COMMITMENT_AGE,
      MAX_COMMITMENT_AGE
    );
    
    // configure new contracts
    registrar.setResolver(resolver); // set resolver for all SLDs to use automatically
    
    // transfer ownership of registrars and domains from this to NFLTD owner
    registrar.transferOwnership(owner);
    controller.transferOwnership(owner);
    ens.setOwner(node, owner);

    emit RegistrarDeployed(node, address(controller), resolver, owner);

    return address(controller);
  }

  /**
  * @dev update settings for fees paid by NFTLD owners to deploy registrars
  * @notice changing `feeToken` changes value default pricing.
            consider calling setPrices() if feeToken changes
  * @param token - address of token to take as fees. address(0) == ETH
  * @param amount - amount of token to take per registrar deployment
   */

  function setFees(address token, uint256 amount) onlyRootOwner external returns(bool) {
    feeToken = token;
    fee = amount;
    return true;
  }

    function setPrices(uint256[] calldata prices, uint256[] calldata tiers) onlyRootOwner external returns(bool) {
    DEFAULT_PRICES = prices;
    DEFAULT_PRICE_TIERS = tiers;
    return true;
  }

  function setResolver(address publicResolver) onlyRootOwner external returns(bool) {
    require(publicResolver != address(0));
    resolver = publicResolver;
    return true;
  }

}
