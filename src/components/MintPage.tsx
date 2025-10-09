import { useState, useEffect } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config'
import './MintPage.css'

enum Choice {
  COOPERATE = 0,
  STEAL = 1
}

interface GameResult {
  playerChoice: number
  contractChoice: number
  playerNFTs: number
  treasuryNFTs: number
  burned: number
}

export default function MintPage() {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [selectedChoice, setSelectedChoice] = useState<Choice | null>(null)
  const [mintPrice, setMintPrice] = useState<string>('0')
  const [remaining, setRemaining] = useState<number>(0)
  const [minted, setMinted] = useState<number>(0)
  const [maxPerWallet, setMaxPerWallet] = useState<number>(0)
  const [mintingEnabled, setMintingEnabled] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [status, setStatus] = useState<string>('')
  const [showResult, setShowResult] = useState<boolean>(false)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)

  useEffect(() => {
    loadContractInfo()
  }, [address])

  async function loadContractInfo() {
    if (!publicClient || !address) return

    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        new ethers.providers.JsonRpcProvider('https://rpc.hyperliquid.xyz/evm')
      )

      const [price, supply, max, userMinted, enabled] = await Promise.all([
        contract.mintPrice(),
        contract.remainingSupply(),
        contract.maxPerWallet(),
        contract.mintedPerWallet(address),
        contract.mintingEnabled()
      ])

      setMintPrice(ethers.utils.formatEther(price))
      setRemaining(supply.toNumber())
      setMaxPerWallet(max.toNumber())
      setMinted(userMinted.toNumber())
      setMintingEnabled(enabled)
    } catch (error) {
      console.error('Error loading contract info:', error)
    }
  }

  async function handleMint() {
    if (selectedChoice === null || !walletClient || !address) {
      setStatus('Please select Cooperate or Steal')
      return
    }

    try {
      setLoading(true)
      setStatus('Preparing transaction...')

      const provider = new ethers.providers.Web3Provider(walletClient as any)
      const signer = provider.getSigner()
      const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

      const price = await contract.mintPrice()
      
      setStatus('Confirm transaction in wallet...')
      const tx = await contract.mint(selectedChoice, { value: price })

      setStatus('Playing game... Please wait')
      const receipt = await tx.wait()

      // Parse GamePlayed event
      const iface = new ethers.utils.Interface(CONTRACT_ABI)
      const event = receipt.logs
        .map((log: any) => {
          try {
            return iface.parseLog(log)
          } catch {
            return null
          }
        })
        .find((e: any) => e && e.name === 'GamePlayed')

      if (event) {
        const result: GameResult = {
          playerChoice: event.args.playerChoice,
          contractChoice: event.args.contractChoice,
          playerNFTs: event.args.playerNFTs.toNumber(),
          treasuryNFTs: event.args.treasuryNFTs.toNumber(),
          burned: event.args.burned.toNumber()
        }
        setGameResult(result)
        setShowResult(true)
      }

      setSelectedChoice(null)
      await loadContractInfo()
      setStatus('')
    } catch (error: any) {
      console.error('Mint error:', error)
      if (error.code === 4001) {
        setStatus('Transaction rejected')
      } else {
        setStatus('Error: ' + error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  function getResultContent() {
    if (!gameResult) return null

    const playerIcon = gameResult.playerChoice === 0 ? '🤝' : '💰'
    const contractIcon = gameResult.contractChoice === 0 ? '🤝' : '💰'

    let resultIcon = ''
    let resultTitle = ''
    let resultDesc = ''

    if (gameResult.playerChoice === 0 && gameResult.contractChoice === 0) {
      resultIcon = '✅'
      resultTitle = 'smooth'
      resultDesc = `you both cooperated you got ${gameResult.playerNFTs} NFT, treasury got ${gameResult.treasuryNFTs}.`
    } else if (gameResult.playerChoice === 1 && gameResult.contractChoice === 1) {
      resultIcon = '🔥'
      resultTitle = 'cooked'
      resultDesc = `You both stole! ${gameResult.burned} NFTs burned. Nobody wins.`
    } else if (gameResult.playerChoice === 1 && gameResult.contractChoice === 0) {
      resultIcon = '🎉'
      resultTitle = 'smooth'
      resultDesc = `you stole while contract cooperated. you got ${gameResult.playerNFTs} NFTs!`
    } else {
      resultIcon = '😢'
      resultTitle = 'cooked'
      resultDesc = `you cooperated but contract stole ${gameResult.treasuryNFTs} NFTs to treasury.`
    }

    return { resultIcon, resultTitle, resultDesc, playerIcon, contractIcon }
  }

  const result = getResultContent()
  const canMint = mintingEnabled && minted < maxPerWallet && remaining > 0

  return (
    <div className="mint-page">
      <div className="info-box">
        <div className="info-row">
          <span className="label">Price per Mint:</span>
          <span className="value">{mintPrice} HYPE</span>
        </div>
        <div className="info-row">
          <span className="label">Remaining Supply:</span>
          <span className="value">{remaining} / 1800</span>
        </div>
        <div className="info-row">
          <span className="label">Your Minted:</span>
          <span className="value">{minted}</span>
        </div>
        <div className="info-row">
          <span className="label">Max Per Wallet:</span>
          <span className="value">{maxPerWallet}</span>
        </div>
      </div>

      <div className="game-info">
        <h3>🎲 smooth dilemma</h3>
        <ul>
          <li><strong>Both Cooperate:</strong> You get 1 NFT, Treasury gets 1</li>
          <li><strong>Both Steal:</strong> 2 NFTs burned from supply</li>
          <li><strong>You Steal, Contract Cooperates:</strong> You get 2 NFTs</li>
          <li><strong>You Cooperate, Contract Steals:</strong> Treasury gets 2 NFTs</li>
        </ul>
      </div>

      <div className="choice-section">
        <label>choose your strategy:</label>
        <div className="choice-container">
          <button
            className={`choice-btn ${selectedChoice === Choice.COOPERATE ? 'selected' : ''}`}
            onClick={() => setSelectedChoice(Choice.COOPERATE)}
            disabled={loading || !canMint}
          >
            <div className="choice-icon">🤝</div>
            <div className="choice-title">cooperate</div>
            <div className="choice-desc">play fair, share rewards</div>
          </button>
          <button
            className={`choice-btn ${selectedChoice === Choice.STEAL ? 'selected' : ''}`}
            onClick={() => setSelectedChoice(Choice.STEAL)}
            disabled={loading || !canMint}
          >
            <div className="choice-icon">💰</div>
            <div className="choice-title">steal</div>
            <div className="choice-desc">take the risk</div>
          </button>
        </div>
      </div>

      <button
        className="mint-btn"
        onClick={handleMint}
        disabled={loading || !canMint || selectedChoice === null}
      >
        {loading ? 'Processing...' : !mintingEnabled ? 'Minting Not Enabled' : minted >= maxPerWallet ? 'Max Reached' : remaining === 0 ? 'Sold Out' : 'Play Game & Mint'}
      </button>

      {status && <div className="status">{status}</div>}

      {showResult && result && (
        <div className="result-modal" onClick={() => setShowResult(false)}>
          <div className="result-content" onClick={(e) => e.stopPropagation()}>
            <div className="result-icon">{result.resultIcon}</div>
            <div className="result-title">{result.resultTitle}</div>
            <div className="choices-display">
              <div className="choice-result">
                <div className="choice-result-icon">{result.playerIcon}</div>
                <div className="choice-result-label">You</div>
              </div>
              <div className="vs">vs</div>
              <div className="choice-result">
                <div className="choice-result-icon">{result.contractIcon}</div>
                <div className="choice-result-label">Contract</div>
              </div>
            </div>
            <div className="result-desc">{result.resultDesc}</div>
            <button className="close-result" onClick={() => setShowResult(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
