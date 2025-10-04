export const CONTRACT_ADDRESS = "0x676c13F6637Af30Bca540F06e42D29d43Fd220C5";

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

export const HYPERLIQUID_TESTNET = {
  id: 998,
  name: 'HyperEVM Testnet',
  network: 'hyperliquid-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HYPE',
    symbol: 'HYPE',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.hyperliquid-testnet.xyz/evm'],
    },
    public: {
      http: ['https://rpc.hyperliquid-testnet.xyz/evm'],
    },
  },
  blockExplorers: {
    default: { 
      name: 'HyperEVM Explorer', 
      url: 'https://explorer.hyperliquid-testnet.xyz' 
    },
  },
  testnet: true,
};