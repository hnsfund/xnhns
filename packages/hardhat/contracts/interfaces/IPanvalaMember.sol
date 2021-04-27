pragma solidity ^0.7.0;
import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Pair.sol';
abstract contract IPanvalaMember {
  address public constant PAN_TOKEN = 0xD56daC73A4d6766464b38ec6D91eB45Ce7457c44;
  address public constant PAN_UNISWAP_POOL = 0x1b21609D42fa32F371F58DF294eD25b2D2e5C8ba;
  // TODO add panvala staking contract and interface

  event PanDonated(uint indexed amount, address member, address indexed donor);
  event PanStaked(uint indexed amount, address member);
  event PanWithdrawn(uint indexed amount, address member);
    
  function regenerate(uint amount) external payable virtual returns (uint panStaked, uint panDonated);
  function donatePAN(uint amount) external payable virtual returns (uint panDonated);
  function stakePAN(uint amount) external payable virtual returns (uint panStaked);
  function withdrawPAN() external virtual returns (uint panWithdrawn);

  function buyPAN(uint amount) internal virtual returns (uint panBought);
  function _buyPAN(IUniswapV2Pair uniPool, uint amount, uint minPanOutt) internal virtual returns (uint panBought);
  function _donatePAN(uint amount, address donor) internal virtual returns (bool);
  function _stakePAN(uint amount) internal virtual returns (bool);
}
