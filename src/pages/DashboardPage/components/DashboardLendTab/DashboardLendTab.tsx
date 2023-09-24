import { useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'

import { SearchSelectProps } from '@banx/components/SearchSelect'
import { createSolValueJSX } from '@banx/components/TableComponents'

import ConnectedContent from './components/ConnectedContent/ConnectedContent'
import NotConnectedContent from './components/NotConnectedContent'

const DashboardLendTab = () => {
  const { connected } = useWallet()

  return (
    <>
      {!connected && <NotConnectedContent />}
      {connected && <ConnectedContent />}
    </>
  )
}

export default DashboardLendTab
