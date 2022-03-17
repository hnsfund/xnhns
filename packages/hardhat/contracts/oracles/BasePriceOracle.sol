pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

import { IPriceOracle } from "../../interfaces/IPriceOracle.sol";
import { StringUtils } from "../utils/StringUtils.sol";

contract BasePriceOracle is IPriceOracle {
    using StringUtils for *;

    event RentPriceChanged(uint256[] prices);
    
    // flat prices to charge at given tier
    // price ascends with array length
    uint256[] public prices;
    // domain length that tier kicks in at
    // length ascends with array length
    uint256[] public priceTiers;
    // e.g. prices = [1,10] priceTiers = [5,10]
    // means domains <= 5 chars long are priced at 1 and domains >= 6 are priced at 10
    constructor(uint256[] memory _prices, uint256[] memory _priceTiers) {
        require(_prices.length == _priceTiers.length);
        prices = _prices;
        priceTiers = _priceTiers;
    }

    function price(
        string calldata name,
        uint256 expires,
        uint256 duration
    ) external view override returns (uint256) {
      return  (
        _getPriceForDomainLength(name.strlen()) +
        _premium(name, expires, duration)
      );
    }


        /**
     * @dev Returns the pricing premium in wei.
     */
    function premium(
        string calldata name,
        uint256 expires,
        uint256 duration
    ) external view returns (uint256) {
        return _premium(name, expires, duration);
    }


    /**
     * @dev Returns the pricing premium in internal base units.
     */
    function _premium(
        string memory name,
        uint256 expires,
        uint256 duration
    ) internal view virtual returns (uint256) {
        return 0;
    }

    function _getPriceForDomainLength(uint256 domainLength) internal view returns(uint256) {
      uint256 tiers = prices.length;
      for(uint i; i < tiers; i++) {
        if(priceTiers[i] >= domainLength) {
          return prices[i];
        }
      }
      // domain is longer than we have prices for, return cheapest rate
      return prices[tiers - 1];
    }
}
