# @version 0.2.12

from vyper.interfaces import ERC20
from ..interfaces import ILibHNSRegistrar
from ..interfaces import IRoot


struct DepositRegistrarConfig:
  adapterEnabled: bool
  token: address
  minDeposit: uint256
  currentDeposits: uint256
  maxTotalDeposits: uint256

event DepositIncreased:
  node: bytes32
  registrar: address
  amount: uint256

event DepositDecreased:
  node: bytes32
  registrar: address
  amount: uint256


registrarConfigs: public(HashMap[address, DepositRegistrarConfig])
deposits: public(HashMap[bytes32, uint256]) # ENS node -> token amount
ens: public(address)
xnhnsLib: ILibHNSRegistrar

@external
def __init__(ens_: address, xnhnsLib_: address):
  """
    @notice
        Called when contract is deployed.
        Sets ENS instance it validates registrars against
  """
  self.ens = ens_
  self.xnhnsLib = ILibHNSRegistrar(xnhnsLib_)

@external
def updateRegistrarConfig(
  minDeposit: uint256,
  maxTotalDeposits: uint256,
  adapterEnabled: bool,
):
  """
    @notice
        Allows registrar owner to update any parameter
    @dev
        .minDeposit is not updatable to prevent registrars
        from taking deposits hostage by constantly increasing minDeposit which disables withdraws
        .currentDeposits is not updatable to reduce attack vectors
        .adapterEnabled can not be set to False if there are existing deposits
  """
  currentDeposits: uint256 = self.registrarConfigs[msg.sender].currentDeposits
  enabled: bool = adapterEnabled
  if currentDeposits > 0 :
    # cannot disable with funds remaining
    enabled = True

  # more gas efficient to reassign each variable vs new struct obj?
  # Is there a difference once compiled and executed?
  self.registrarConfigs[msg.sender] = DepositRegistrarConfig({
    token: self.registrarConfigs[msg.sender].token,
    minDeposit: minDeposit,       
    currentDeposits: currentDeposits,
    maxTotalDeposits: maxTotalDeposits,
    adapterEnabled: enabled
  })

@external
def increaseDeposit(
  node: bytes32,
  owner: address,
  amount: uint256
) -> bool:
  """
    @notice
        Only accessible to configured registrars.
        Registrar must be controller for node on Root contract.
        Users only interact with registrar contracts.
        Assets are deposited in registrar - NOT this contract. Adapter only handles executing logic.

    @dev
      `amount` must be at least the minDeposit on registrar's DepositRegistrarConfig
    @param node The ENS node for TLD
    @param owner The address to credit account to
    @param amount Amount of tokens deposited
  """
  controller: address = self.xnhnsLib.getControllerOfNFTLD(convert(node, uint256), ens)
  assert msg.sender == controller

  config: DepositRegistrarConfig = self.registrarConfigs[msg.sender]
  assert config.adapterEnabled == True

  assert config.currentDeposits + amount <= config.maxTotalDeposits
  assert self.deposits[node] + amount >= config.minDeposit

  assert ERC20(config.token).transferFrom(owner, msg.sender, amount)


  self.deposits[node] += amount
  config.currentDeposits += amount
  
  log DepositIncreased(node, msg.sender, amount)
  return True


@external
def decreaseDeposit(
  node: bytes32,
  owner: address,
  amount: uint256
) -> bool:
  """
    @notice
        Only accessible to configured registrars.
        Registrar must be controller for node on Root contract.
        Users only interact with registrar contracts.
        Assets are deposited in registrar - NOT this contract. Adapter only handles executing logic.

    @param node The ENS node for TLD
    @param owner The address to credit account to
    @param amount Amount of tokens deposited
  """
  self.xnhnsLib.getControllerOfNFTLD(convert(node, uint256), ens)
 
  config: DepositRegistrarConfig = self.registrarConfigs[msg.sender]

  if amount == self.deposits[node] : # unregistering
    empty(self.deposits[node])
  else : # decreasing deposit
    assert self.deposits[node] - amount >= config.minDeposit
    self.deposits[node] -= amount

  success: bool = ERC20(config.token).transferFrom(msg.sender, owner, amount)
  assert success == True # token transfer for deposit failed

  config.currentDeposits -= amount

  log DepositDecreased(node, msg.sender, amount)
  return True


@view
@external
def tldDepositDetails(node: bytes32) -> (bytes32, address):
  return deposits[node], self.registrarConfigs[registrar].token


@view
@external
def isRegistrarEnabled(registrar: address) -> bool:
  return self.registrarConfigs[registrar].adapterEnabled

@view
@external
def getRegistrarConfig(registrar: address) -> (
  bool,
  address,
  uint256,
  uint256,
  uint256
):
  config: DepositRegistrarConfig = self.registrarConfigs[registrar]
  return (
    config.adapterEnabled,
    config.token,
    config.minDeposit,
    config.currentDeposits,
    config.maxTotalDeposits
  )

@view
@external
def getRegistrarDeposits(registrar: address) -> (address, uint256):
  config: DepositRegistrarConfig = self.registrarConfigs[registrar]
  return (
    config.token,
    config.currentDeposits
  )

## todo add ETH and ERC20 rescue functions
