import { useEffect } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { debounce } from 'lodash'

import { setMixpanelUser, trackPageEvent } from './core'
import { PAGE_NAMES } from './types'

const trackPageDebounced = debounce(trackPageEvent, 1000)

export const useMixpanelLocationTrack = (pageName: `${PAGE_NAMES}`) => {
  useEffect(() => {
    trackPageDebounced(pageName, 'start')
  }, [pageName])
}

export const useMixpanelUser = () => {
  const { publicKey } = useWallet()

  useEffect(() => {
    setMixpanelUser(publicKey?.toBase58())
  }, [publicKey])
}
