pragma solidity ^0.7.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract Controllable is Ownable {
    // TODO change so its address -> bytes32  and we can scope controllers to specific domains
    mapping(address=>bool) public controllers;

    event ControllerChanged(address indexed controller, bool enabled);

    modifier onlyController {
        require(controllers[msg.sender], 'Invalid Controller');
        _;
    }

    function setController(address controller, bool enabled) public onlyOwner {
        // TODO check address is owner of node
        controllers[controller] = enabled;
        emit ControllerChanged(controller, enabled);
    }
}
