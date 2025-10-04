import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config'
import './MyNFTs.css'

interface NFT {
  tokenId: number
  imageUrl: string
  metadataUrl: string
}

export default function MyNFTs() {
  const { address } = useAccount()
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (address) {
      loadNFTs()
    }
  }, [address])

  async function loadNFTs() {
    if (!address) return

    try {
      setLoading(true)
      const provider = new ethers.providers.JsonRpcProvider('https://rpc.hyperliquid-testnet.xyz/evm')
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

      // Get balance
      const balance = await contract.balanceOf(address)
      console.log('NFT Balance:', balance.toNumber())

      if (balance.toNumber() === 0) {
        setNfts([])
        setLoading(false)
        return
      }

      // Get current block
      const currentBlock = await provider.getBlockNumber()
      console.log('Current block:', currentBlock)
      
      // Only query last 2000 blocks (contract is new, so events are recent)
      const fromBlock = Math.max(0, currentBlock - 2000)
      
      try {
        const filter = contract.filters.Transfer(null, address)
        const events = await contract.queryFilter(filter, fromBlock, currentBlock)
        
        console.log('Transfer events found:', events.length)
        
        // Extract unique token IDs
        const tokenIds = [...new Set(events.map((event: any) => event.args.tokenId.toNumber()))]
        console.log('Token IDs owned:', tokenIds)
        
        const nftList: NFT[] = tokenIds.map(tokenId => ({
          tokenId,
          metadataUrl: `https://smoothies.arweave.net/${tokenId}`,
          imageUrl: `https://img_smoothies.arweave.net/${tokenId}.png`
        }))

        setNfts(nftList)
      } catch (err) {
        console.error('Error querying events:', err)
        // Fallback: show placeholder based on balance
        const placeholderNfts: NFT[] = Array.from({length: balance.toNumber()}, (_, i) => ({
          tokenId: i,
          metadataUrl: `https://smoothies.arweave.net/${i}`,
          imageUrl: `https://img_smoothies.arweave.net/${i}.png`
        }))
        setNfts(placeholderNfts)
      }
    } catch (error) {
      console.error('Error loading NFTs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="my-nfts">
        <h2>My Smoothies</h2>
        <p>Loading your NFTs...</p>
      </div>
    )
  }

  if (nfts.length === 0) {
    return (
      <div className="my-nfts">
        <h2>My Smoothies</h2>
        <p>You haven't minted any Smoothies yet!</p>
      </div>
    )
  }

  return (
    <div className="my-nfts">
      <h2>My Smoothies ({nfts.length})</h2>
      <div className="nft-grid">
        {nfts.map((nft) => (
          <div key={nft.tokenId} className="nft-card">
            <div className="nft-image">
              <img 
                src={nft.imageUrl} 
                alt={`Smoothie #${nft.tokenId}`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200?text=Smoothie+' + nft.tokenId
                }}
              />
            </div>
            <div className="nft-info">
              <h3>Smoothie #{nft.tokenId}</h3>
              <a 
                href={nft.metadataUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="metadata-link"
              >
                View Metadata →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}