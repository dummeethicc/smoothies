import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useAccount } from 'wagmi'
import MintPage from './components/MintPage'
import MyNFTs from './components/MyNFTs'
import './App.css'

function App() {
  const { isConnected } = useAccount()

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>🥤 smoothies NFT</h1>
          <ConnectButton />
        </header>

        {isConnected ? (
          <>
            <MintPage />
            <MyNFTs />
          </>
        ) : (
          <div className="welcome">
            <p className="subtitle">smooth dilemma</p>
            <p className="description">
              connect your wallet to get started. choose to cooperate or steal in each mint attempt.
              your choice and the contract's random choice determine the outcome. pretty smooth
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App