import { IHNSRegistrar } from "../interfaces/IHNSRegistrar.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";

abstract contract DepositRegistrar {
  // using SafeMath for uint256;

  // these are duped in BaseRegistrar and here, any way to avoid?
  address depositToken;
  uint256 minDepositAmount;

  bytes4 DEPOSIT_REGISTRAR_ID = bytes4(keccak256("snitchOn(string)"));

  constructor(address _depositToken, uint256 _minDepositAmount) {
    depositToken = _depositToken;
    minDepositAmount = _minDepositAmount;
  }

  function preVerifyHook(bytes32 node, address registrar, address caller) internal virtual {
    // Assumption: the TLD has been saved in parent contract before
    require(isValidTokenDeposit(node, registrar), 'DepositRegistrar: invalid token deposit');
    (, address token, uint256 deposit) = IHNSRegistrar(registrar).getTLD(node);
    
    (bool success) = IERC20(depositToken).transferFrom(msg.sender, registrar, deposit);
    require(success, 'DepositRegistrar: token transfer failed');
  }
  
  function preRegisterHook(bytes32 node, address registrar, address caller) internal virtual {
    require(isValidTokenDeposit(node, registrar), 'DepositRegistrar: invalid token deposit');
  }

   /**
    * @dev can probs pull preVerify and postUnregister logic into single lib function
   */
  function postUnregisterHook(bytes32 node, address registrar, address caller) internal virtual {
    (, address token, uint256 deposit) = IHNSRegistrar(registrar).getTLD(node);
    require(IERC20(token).balanceOf(address(this)) >= deposit, 'DepositRegistrar: insufficient token balance');
    (bool success) = IERC20(token).transfer(caller, deposit);
    require(success, 'DepositRegistrar: token transfer failed');
  }

  /**
    * @dev I think this can be moved to a library
   */
  function isValidTokenDeposit(bytes32 node, address registrar, address caller) returns (bool) {
    // getTLD return is not finalized yet
    (, address token, uint256 deposit) = IHNSRegistrar(registrar).getTLD(node);
    require(token == depositToken, 'DepositRegistrar: TLD has invalid deposit token');
    require(deposit >= minDepositAmount, 'DepositRegistrar: insufficient deposit for TLD');
    return true;
  }


  // Add non-hook functions to retrieve deposit

}
