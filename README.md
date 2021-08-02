# XNHNS protocol

XNHNS is an easy way for any [Handshake](https://handshake.org) TLD owner to use their domain trustlessly on other blockchains. XNHNS works on any [EVM compatible](https://github.com/ethereum-lists/chains) blockchain.
We utilize [HIP5](https://github.com/handshake-org/HIPs/blob/master/HIP-0005.md) namespace delegation records to point to your blockchain of choice and TXT record with `xnhns={your address}` to claim your NFTLD to an address on that network. The [ChainLink](https://chain.link) decentralized oracle network securely verifies your DNS records on the Handshake chain to verify your TLD is valid on that chain (by checking NS record) and tells the XNHNS registry who to give ownership of NFTLD to.


Built With:
- Handshake
- Solidity smart contracts
- Ethereum Name Service
- ChainLink oracles + custom external adapters
- The Graph

---


## V2 dev notes
__Adapters__
Adapter contracts are only used for token controller logic, accounting, etc. They do not directly hold deposited assets, those are held in the respective registrar that registered the TLD. This allows us to use assets in other adapters (e.g DeFi integrations) once deposited by DepositAdapter.

__Migrating__
Once you've verified you TLD on a chain, it does not need to be verified again, you can register to any XNHNS registrar on that chain (assuming it uses the same oracle) to gain it's benefits like timelocks or DeFi integrations to yield farm deposits.
All you need to do to migrate registrars is call `unregister()` on your current registrar and then `register()` on your new registrar. Since each registrar has different requirements for TLD deposits this isn't an automated process yet.

__Refferals__
Referrer is set in register() instead of verify() because any person or register can call verify(). Only the owner of NFTLD can call register() meaning that they have given consent to referrer by signing tx with their address.

__Snitching__
Snitch deposits are always in native asset for chain. This makes keeper UX much better since they don't have inventory risk for whatever asset each registrar utilizes. Just deposit ETH, then get paid in X token but you don't need to trade into X token before hand and hold it while snitch is being processed.

## quickstart

```bash
git clone https://github.com/hnsfund/xnhns.git

cd xnhns
```

```bash

yarn install

```

```bash

yarn start

```

> in a second terminal window:

```bash

yarn chain --network hardhat

```

> in a third terminal window:

```bash

yarn deploy:test

```


dapp hot reloads as you build your smart contracts and frontend together

## Testing
- Go to Migrate page /migrate
- Type in whatever TLD you want to migrate
- Click "Migrate" button
- Then Click "Confirm TLD"  (this stubs call the oracle call to confirm you own TLD)
- Go over to Manage page /manage (working on modal to help this UX)
- Your TLD should show up there and have a "Mint NFTLD" button next to it. Click it
- If that tx goes through, congrats you have an NFT on Ethereum representing ownership of you HNS TLD


## How It Works
Lets say you are migrating the TLD `hnsregistry/`
1. You submit your HIP5 NS records and TXT record with your address on the chain you are migrating hnsregistry/ to
2. Wait for those transactions are mined on Handshake
3. Submit a transaction on your host chain to `HNSRegistrar.verify(hnsregistry)` with a value of 0.1 ETH for your deposit (read more about [deposits](#xnhns-deposits))
4. ChainLink oracles will verify you have appropriate records. They will update `XNHNSOracle` contract with owner of TLD to the address you set in your TXT record
5. You can now call `HNSRegistrar.register( namehash(hnsregistry) )` to mint your NFTLD and list your TLD on the `ENSRegistry`
6. Go wild, you are free. You have the power of NFTs and ENS at your disposal. (TODO write article of cool shit to do)
7. When you are done using your NFTLD on this chain, call `HNSRegistrar.unregister( namehash(hnsregistry) )` to receive your deposit back.

## XNHNS Deposits
Deposits are simple on XNHNS. When you want to migrate a domain to another chain, you provide a deposit to "anchor" your TLD to that chain. The deposit amount is entirely up to you, although each type of registrar has a different minimum deposit. When you are done using your TLD on that chain you simply call `HNSRegistrar.unregister(hnsregistry)` and you will get your full deposit back. 
### Why do I need to deposit?
Anchoring your TLD with a deposit increases the utility of your domain on it's host chain. This shows you have skin in the game and are committing to using your TLD on that chain. This can be used by DeFi apps before you take a loan against your NFTLD to make sure you aren't borrowing more than is deposited in your TLD to prevent fraud and liquidate your NFTLD if you fail to pay your loan back on time. Identity systems can increase your reputation points based on your deposit value because you are committed to participating in that chains community.
### Snitching
Your deposit also prevents double spending your TLD across two different chains at once. This happens when you change your NS record to point at a chain other than the one with your deposit. When this happens, anyone can call `HNSRegistrar.snitchOn(hnsregistry)`. This will trigger the same ChainLink oracle job as when you call verify(), if the oracles return a null (address(0) in solidity) then the snitch was successful and can claim half your deposit (the other half gets donated to the [HNS Fund](https://hnsfund.titansofdata.org))

## Types of XNHNS Registrars
You can switch registrars at any time by calling unregister() on your current registrar, then inscreaseDeposit() and register() on your new registrar. You do not need to verify on the new registrar since your ownership will still be stored in the oracle (assuming no one snitches on you but there is no reward for snitches once you unregister so you should be fine).
### HNSRegistrar
Simple registrar. Deposit 0.1ETH to migrate your domain, get 0.1ETH back when you unregister your TLD on that chain.

### HighValueHNSRegistrar
(WIP) For owners of premium domains that want to maximize NFTLD utilization on your host chain. Minimum deposit of 20ETH to migrate your domain. Deposit is immediately invested in DeFi protocols (TBD) so you earn yield and increase capital efficiency of your deposit. When you unregister you get back more ETH than you deposited.

### TimeLockedHNSRegistrar
TODO. A registrar that timelocks a TLD owners deposit for set amount of time. The TLD owner will not be able to call unregister() until timelock has passed at which point they can renew the lock

### Your Suggested Registrar Here
Always open to developing new cool ideas. Open an issue if you have an idea for a different type of TLD registrar.
## Oracles
We have built [external adapters](https://github.com/hnsfund/xnhns-domain-verification-clea) so any ChainLink oracle can join the XNHNS oracle network and help verify DNS records. ChainLink is inherently crosschain protocol just like XNHNS so it is a perfect fit since we can utilize the same smart contracts and service providers on every chain we use. 

Any smart contract can read TLD owners registered by the `XNHNSOracle` contract. There is a whitelist of external contracts that are allowed to initiate requests to verify domains to prevent spam (deposit on verify() reduces spam). This allows multiple registrars to operate at once, and reducing .

### NOTICE: We are currently using a non-Chainlink, trusted oracle while we are in alpha to improve product iterations.
## The Graph
Use the graph for data querying on the frontend. Pulled from [ENS subgraph](https://github.com/ensdomains/ens-subgraph) with some minor additions for XNHNS requirements like oracle events. Subgraphs names follow the format `xnhns-{networkName}` where networkName is the short code used in the HIP5 NS record e.g. 'eth' for Ethereum mainnet.
- [Subgraph.yaml](https://github.com/hnsfund/xnhns/blob/master/packages/subgraph/src/subgraph.template.yaml)
- [Schema.graphql](https://github.com/hnsfund/xnhns/blob/master/packages/subgraph/schema.graphql)

 

# WebApp code docs

## 🔏 Web3 Providers:

The frontend has three different providers that provide different levels of access to different chains:

`mainnetProvider`: (read only) [Infura](https://infura.io/) connection to main [Ethereum](https://ethereum.org/developers/) network (and contracts already deployed like [DAI](https://etherscan.io/address/0x6b175474e89094c44da98b954eedeac495271d0f#code) or [Uniswap](https://etherscan.io/address/0x2a1530c4c41db0b0b2bb646cb5eb1a67b7158667)).

`localProvider`: local [HardHat](https://hardhat.org) accounts, used to read from _your_ contracts (`.env` file points you at testnet or mainnet)

`injectedProvider`: your personal [MetaMask](https://metamask.io/download.html), [WalletConnect](https://walletconnect.org/apps) via [Argent](https://www.argent.xyz/), or other injected wallet (generates [burner-provider](https://www.npmjs.com/package/burner-provider) on page load)

---

🐜 [Ant.design](https://ant.design/components/button/) is the UI library with components like the [grids](https://ant.design/components/grid/), [menus](https://ant.design/components/menu/), [dates](https://ant.design/components/date-picker/), [times](https://ant.design/components/time-picker/), [buttons](https://ant.design/components/button/), etc.

---

## ⛑ Helpers:

`Transactor`: The transactor returns a `tx()` function to make running and tracking transactions as simple and standardized as possible. We will bring in [BlockNative's Notify](https://www.blocknative.com/notify) library to track our testnet and mainnet transactions.

```js
const tx = Transactor(props.injectedProvider, props.gasPrice)
```

Then you can use the `tx()` function to send funds and write to your smart contracts:

```js
tx({
  to: readContracts[contractName].address,
  value: parseEther('0.001'),
})
```

```js
tx(writeContracts['SmartContractWallet'].updateOwner(newOwner))
```

> ☢️ **Warning**: You will need to update the configuration for `react-app/src/helpers/Transactor.js` to use _your_ [BlockNative dappId](https://www.blocknative.com/notify)

---

## 🖇 Hooks:

Commonly used Ethereum hooks located in `packages/react-app/src/`:

`usePoller(fn, delay)`: runs a function on app load and then on a custom interval

```jsx
usePoller(() => {
  //do something cool at start and then every three seconds
}, 3000)
```

<br/>

`useBalance(address, provider, [pollTime])`: poll for the balance of an address from a provider

```js
const localBalance = useBalance(address, localProvider)
```

<br/>

`useBlockNumber(provider,[pollTime])`: get current block number from a provider

```js
const blockNumber = useBlockNumber(props.provider)
```

<br/>

`useGasPrice([speed])`: gets current "fast" price from [ethgasstation](https://ethgasstation.info)

```js
const gasPrice = useGasPrice()
```

<br/>

`useExchangePrice(mainnetProvider, [pollTime])`: gets current price of Ethereum on the Uniswap exchange

```js
const price = useExchangePrice(mainnetProvider)
```

<br/>

`useContractLoader(provider)`: loads your smart contract interface

```js
const readContracts = useContractLoader(localProvider)
const writeContracts = useContractLoader(injectedProvider)
```

<br/>

`useContractReader(contracts, contractName, variableName, [pollTime])`: reads a variable from your contract and keeps it in the state

```js
const title = useContractReader(props.readContracts, contractName, 'title')
const owner = useContractReader(props.readContracts, contractName, 'owner')
```

<br/>

`useEventListener(contracts, contractName, eventName, [provider], [startBlock])`: listens for events from a smart contract and keeps them in the state

```js
const ownerUpdates = useEventListener(
  readContracts,
  contractName,
  'UpdateOwner',
  props.localProvider,
  1
)
```

---

## 📦 Components:

Your commonly used React Ethereum components located in `packages/react-app/src/`:

<br/>

📬 `<Address />`: A simple display for an Ethereum address that uses a [Blockie](https://www.npmjs.com/package/ethereum-blockies), lets you copy, and links to [Etherescan](https://etherscan.io/).

```jsx
  <Address value={address} />
  <Address value={address} size="short" />
  <Address value={address} size="long" blockexplorer="https://blockscout.com/poa/xdai/address/"/>
  <Address value={address} ensProvider={mainnetProvider}/>
```

![ensaddress](https://user-images.githubusercontent.com/2653167/80522487-e375fd80-8949-11ea-84fd-0de3eab5cd03.gif)

<br/>

🖋 `<AddressInput />`: An input box you control with useState for an Ethereum address that uses a [Blockie](https://www.npmjs.com/package/ethereum-blockies) and ENS lookup/display.

```jsx
  const [ address, setAddress ] = useState("")
  <AddressInput
    value={address}
    ensProvider={props.ensProvider}
    onChange={(address)=>{
      setAddress(address)
    }}
  />
```

TODO GIF

<br/>

💵 `<Balance />`: Displays the balance of an address in either dollars or decimal.

```jsx
<Balance
  address={address}
  provider={injectedProvider}
  dollarMultiplier={price}
/>
```

![balance](https://user-images.githubusercontent.com/2653167/80522919-86c71280-894a-11ea-8f61-70bac7a72106.gif)

<br/>

<br/>

👤 `<Account />`: Allows your users to start with an Ethereum address on page load but upgrade to a more secure, injected provider, using [Web3Modal](https://web3modal.com/). It will track your `address` and `localProvider` in your app's state:

```jsx
const [address, setAddress] = useState()
const [injectedProvider, setInjectedProvider] = useState()
const price = useExchangePrice(mainnetProvider)
```

```jsx
<Account
  address={address}
  setAddress={setAddress}
  localProvider={localProvider}
  injectedProvider={injectedProvider}
  setInjectedProvider={setInjectedProvider}
  dollarMultiplier={price}
/>
```

![account](https://user-images.githubusercontent.com/2653167/80527048-fdffa500-8950-11ea-9a0f-576be87e4368.gif)

> 💡 **Notice**: the `<Account />` component will call `setAddress` and `setInjectedProvider` for you.

> ☢️ **Warning**: You will need to update the configuration for `Web3Modal` to use _your_ [Infura Id](https://infura.io/login)

<br/>

<br/>

📡 `<Provider />`: You can choose to display the provider connection status to your users with:

```jsx
<Provider name={"mainnet"} provider={mainnetProvider} />
<Provider name={"local"} provider={localProvider} />
<Provider name={"injected"} provider={injectedProvider} />
```

![providere](https://user-images.githubusercontent.com/2653167/80524033-3781e180-894c-11ea-8965-98eb5e2e5e71.gif)

> 💡 **Notice**: you will need to check the network id of your `injectedProvider` compared to your `localProvider` or `mainnetProvider` and alert your users if they are on the wrong network!

---

## 🛳 Ship it!

You can deploy your static site and your dapp can go live:

```bash

yarn run build

# ship it!

yarn run surge

OR

yarn run s3

OR

yarn run ipfs
```
