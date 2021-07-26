# @version 0.2.12

from vyper.interfaces import ERC20
import ILibHNSRegistrar as LibHNSRegistrar

struct RegistrarDepositConfig:
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


registrarConfigs: public(HashMap[address, RegistrarDepositConfig])
deposits: public(HashMap[bytes32, uint256]) # ENS node -> token amount
ens: public(address)

@external
def initialize(_ens: address):
  """
    @notice
        Called when contract is deployed.
        Sets ENS instance it validates registrars against
  """
  self.ens = _ens

@external
def updateRegistrarConfig(
  token: address, 
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

  self.registrarConfigs[msg.sender] = RegistrarDepositConfig({
    token: token,
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
):
  """
    @notice
        Only accessible to configured registrars.
        Registrar must be controller for node on Root contract.
        Users only interact with registrar contracts.
        Assets are deposited in registrar - NOT this contract. Adapter only handles executing logic.

    @dev
      `amount` must be at least the minDeposit on registrar's RegistrarDepositConfig
    @param node The ENS node for TLD
    @param owner The address to credit account to
    @param amount Amount of tokens deposited
  """
  assert msg.sender == LibHNSRegistrar.getControllerForNFLTD(convert(node, uint256), ens)
  
  config: RegistrarDepositConfig = self.registrarConfigs[msg.sender]
  assert config.adapterEnabled == True

  assert config.currentDeposits + amount <= config.maxTotalDeposits
  assert self.deposits[node] + amount >= config.minDeposit

  success: bool = ERC20(config.token).transferFrom(owner, msg.sender, amount)
  assert success == True # token transfer for deposit failed

  self.deposits[node] += amount
  config.currentDeposits += amount
  
  log DepositIncreased(node, msg.sender, amount)


@external
def decreaseDeposit(
  node: bytes32,
  owner: address,
  amount: uint256
):
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
  assert msg.sender == LibHNSRegistrar.getControllerForNFLTD(convert(node, uint256), ens)
 
  config: RegistrarDepositConfig = self.registrarConfigs[msg.sender]

  if amount == self.deposits[node] : # unregistering
    empty(self.deposits[node])
  else : # decreasing deposit
    assert self.deposits[node] - amount >= config.minDeposit
    self.deposits[node] -= amount

  success: bool = ERC20(config.token).transferFrom(msg.sender, owner, amount)
  assert success == True # token transfer for deposit failed

  config.currentDeposits -= amount

  log DepositDecreased(node, msg.sender, amount)

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
  config: RegistrarDepositConfig = self.registrarConfigs[registrar]
  return (
    config.adapterEnabled,
    config.token,
    config.minDeposit,
    config.currentDeposits,
    config.maxTotalDeposits
  )

