
import "../interfaces/IENS.sol";
// import "./PanvalaMember.sol";

contract TLDSalesBroker /* is ChainlinkClient, PanvalaMember */ {
    ENS public ens;

    enum SaleStage {
      INITIALIZED,
      TRANSFERED,
      FINALIZED,
      BUYER_CANCELED,
      SELLER_CANCELLED
    }

    struct Sale {
      address buyer;
      address seller;
      bytes32 hnsBuyer;
      bytes32 hnsSeller;
      uint256 tokenId;
      uint256 amount;
      // address token; V2 allow arbitrary tokens 
      SaleStage stage;
    }
    constructor(ENS _ens, address _oracle, uint256 _fee, bytes32 _jobId) {
      ens = _ens;
    }

}
