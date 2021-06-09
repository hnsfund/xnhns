# @version 0.2.12

from vyper.interfaces import ERC20

struct RegistrarDepositConfig:
  token: address
  minDeposit: uint256
  currentDeposits: uint256
  maxTotalDeposits: uint256
  adapterEnabled: bool

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
        .minDeposit is not updtable to prevent registrars
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
        Users only interact with registrar contracts.
        Assets are deposited in registrar - NOT this contract. Adapter only handles executing logic.

    @dev
      `amount` must be at least the minDeposit on registrar's RegistrarDepositConfig
    @param node The ENS node for TLD
    @param owner The address to credit account to
    @param amount Amount of tokens deposited
  """
  config: RegistrarDepositConfig = self.registrarConfigs[msg.sender]
  assert config.adapterEnabled == True

  self.deposits[node] = self.deposits[node] + amount
  assert self.deposits[node] >= config.minDeposit

  success: bool = ERC20(config.token).transferFrom(owner, msg.sender, amount)
  assert success == True # token transfer for deposit failed

  config.currentDeposits = config.currentDeposits + amount
  

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
        Users only interact with registrar contracts.
        Assets are deposited in registrar - NOT this contract. Adapter only handles executing logic.

    @param node The ENS node for TLD
    @param owner The address to credit account to
    @param amount Amount of tokens deposited
  """
  config: RegistrarDepositConfig = self.registrarConfigs[msg.sender]

  assert self.deposits[node] - amount >= config.minDeposit
  self.deposits[node] = self.deposits[node] - amount

  success: bool = ERC20(config.token).transferFrom(msg.sender, owner, amount)
  assert success == True # token transfer for deposit failed

  config.currentDeposits = config.currentDeposits - amount

  log DepositDecreased(node, msg.sender, amount)
