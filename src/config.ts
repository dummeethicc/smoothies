export const CONTRACT_ADDRESS = "0x39E67A6455318d526Fe30b513fc49F85f3e81681";

export const CONTRACT_ABI = [
  "function mint(uint8 playerChoice) public payable",
  "function mintPrice() public view returns (uint256)",
  "function remainingSupply() public view returns (uint256)",
  "function maxPerWallet() public view returns (uint256)",
  "function mintedPerWallet(address) public view returns (uint256)",
  "function mintingEnabled() public view returns (bool)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
  "event GamePlayed(address indexed player, uint8 playerChoice, uint8 contractChoice, uint256 playerNFTs, uint256 treasuryNFTs, uint256 burned)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
] as const;

export const HYPERLIQUID_MAINNET = {
  id: 999,
  name: 'HyperEVM',
  network: 'hyperliquid',
  nativeCurrency: {
    decimals: 18,
    name: 'HYPE',
    symbol: 'HYPE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
    public: {
      http: ['https://rpc.hyperliquid.xyz/evm'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'HyperEVM Explorer', 
      url: 'https://explorer.hyperliquid.xyz'
    },
  },
  testnet: false,
};
