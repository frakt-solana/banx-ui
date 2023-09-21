import { useWallet } from '@solana/wallet-adapter-react'

import NotConnectedContent from './components/NotConnectedContent'

const DashboardLendTab = () => {
  const { connected } = useWallet()

  return <>{connected && <NotConnectedContent />}</>
}

export default DashboardLendTab
