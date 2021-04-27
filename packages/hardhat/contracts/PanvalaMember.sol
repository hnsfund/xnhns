import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import "./interfaces/IPanvalaMember.sol";
contract PanvalaMember is IPanvalaMember {
  using SafeMath for uint;

  address public member;
  constructor(address _member) {
    member = _member;
  }

  modifier onlyMember() {
    require(msg.sender == member, 'PanvalaMember: Only Panvala member can call this function');
    _;
  }

  modifier enoughEthSent(uint amount) {
    require(amount > 0, 'PanvalaMember: Insufficient amount');
    require(msg.value >= amount, 'PanvalaMember: Insufficient ETH sent');
    _;
  }
 /**
   * @dev takes eth, market buys PAN, and splits PAN between donating directly to member wallet
   * and staking to member on Panvala contract
   * @param amount - Amount of ETH tokens to  to member on Panvala contractr
  */
  function regenerate(uint amount)
    public payable override
    enoughEthSent(amount)
    returns (uint, uint)
  {
    uint panBought = buyPAN(amount);
    uint toEach = panBought / 2;
    _donatePAN(toEach, msg.sender);
    _stakePAN(toEach);
    return (toEach, toEach);
  }
  function donatePAN(uint amount)
    public payable override
    enoughEthSent(amount)
    returns (uint panDonated) 
  {
    panDonated = buyPAN(amount);
    _donatePAN(panDonated, msg.sender);
    return panDonated;
  }
  
  // asked Niran and if Panvala member wallet is staking then any PAN sent to their wallet
  // will automatically stake so can remove staking from this contract
  function stakePAN(uint amount)
    public payable override
    enoughEthSent(amount)
    returns (uint panStaked) 
  {
    panStaked = buyPAN(amount);
    _stakePAN(panStaked);
    return panStaked;
  }
  function buyPAN(uint amount) internal override returns (uint panBought) {
    IUniswapV2Pair uniPool = IUniswapV2Pair(PAN_UNISWAP_POOL);
    (uint wethReserves, uint panReserves,) = uniPool.getReserves();
    require(wethReserves > 0 && panReserves > 0, 'PanvalaMember: Insufficient liquidity');
    uint minPanOut = _getAmountOut(amount, wethReserves, panReserves);
    // get PAN price from pool
    // caluclate PAN out for ETH in
    // wrap ETH
    // approve WETH on UniRouter
    // panBought = _buyPAN(amount, minPanOut)
    return panBought;
  }

  function _buyPAN(IUniswapV2Pair uniPool, uint amount, uint minPanOut) internal override returns (uint panBought) {
    // amountTokenOut = UniswapV2Library.getAmountOut(scaledAmountEth, tokenReserveA, tokenReserveB);
    // (panBought,) = uniPool.swap(amount, minPanOut, address(this), bytes(0));
    return panBought;
  }

  function _getAmountOut(uint ethAmount, uint wethReserve, uint panReserve) internal pure returns (uint amountOut) {
    uint amountInWithFee = ethAmount.mul(997);
    uint numerator = amountInWithFee.mul(panReserve);
    uint denominator = wethReserve.mul(1000).add(amountInWithFee);
    amountOut = numerator / denominator;
  }

  /**
   * @param amount - Amount of PAN tokens to stake to member on Panvala contractr
  */
  function _stakePAN(uint amount) internal override returns (bool) {
    // approve staking contract to use tokens?
    // call func to stake / sign whatever
    emit PanStaked(amount, member);
    return true;
  }

  /**
   * @param amount - Amount of PAN tokens to donate to member
  */
  function _donatePAN(uint amount, address donor) internal override returns (bool) {
    IERC20 pan = IERC20(PAN_TOKEN);
    require(amount <= pan.balanceOf(address(this)), 'PanvalaMember: Insufficient PAN to donate');
    pan.transferFrom(address(this), member, amount);
    emit PanDonated(amount, member, donor);
    return true;
  }

  // if removing staking functionality then can also remove withdrawal function
  function withdrawPAN() public override onlyMember returns (uint panWithdrawn) {
    IERC20 pan = IERC20(PAN_TOKEN);
    panWithdrawn = pan.balanceOf(address(this));
    pan.transferFrom(address(this), member, panWithdrawn);
    emit PanWithdrawn(panWithdrawn, member);
    return panWithdrawn;
  }
}
