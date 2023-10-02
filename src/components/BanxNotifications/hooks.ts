import { useEffect } from 'react'

import { useDialectSdk, useDialectWallet } from '@dialectlabs/react-sdk'
import { create } from 'zustand'

import { DIALECT } from '@banx/constants'

import { ScreenType } from './BanxNotificationsSider/constants'

interface BanxSiderState {
  isVisible: boolean
  toggleVisibility: () => void
  setVisibility: (nextValue: boolean) => void
  screenType: ScreenType
  changeContentType: (nextState: ScreenType) => void
}

const useBanxNotificationsSiderState = create<BanxSiderState>((set) => ({
  isVisible: false,
  screenType: ScreenType.SIGN_MESSAGE,
  toggleVisibility: () =>
    set((state) => {
      return { ...state, isVisible: !state.isVisible }
    }),
  setVisibility: (nextValue) =>
    set((state) => {
      return { ...state, isVisible: nextValue }
    }),
  changeContentType: (nextState: ScreenType) =>
    set((state) => ({ ...state, screenType: nextState })),
}))

export const useBanxNotificationsSider = () => {
  const { changeContentType, screenType, ...state } = useBanxNotificationsSiderState()

  const {
    connectionInitiatedState: { get: connectionInitiatedState },
  } = useDialectWallet()

  const sdk = useDialectSdk(true)

  useEffect(() => {
    if (!connectionInitiatedState) {
      return changeContentType(ScreenType.SIGN_MESSAGE)
    }

    // if (connectionInitiatedState) {
    //   // return changeContentType(ScreenType.NOTIFICATIONS)
    // }
    return changeContentType(ScreenType.SETTINGS)
  }, [connectionInitiatedState, changeContentType])

  const authorize = async () => {
    try {
      changeContentType(ScreenType.LOADING)

      if (!sdk) return

      await sdk.wallet.dappAddresses.findAll({
        dappAccountAddress: DIALECT.APP_PUBLIC_KEY,
      })
      changeContentType(ScreenType.SETTINGS)

      // const addresses = await sdk.wallet.dappAddresses.findAll({
      //   dappAccountAddress: DIALECT.APP_PUBLIC_KEY,
      // })
      // if (addresses.length) {
      //   changeContentType(ScreenType.NOTIFICATIONS)
      // } else {
      //   changeContentType(ScreenType.SETTINGS)
      // }
    } catch (error) {
      console.error(error)
      changeContentType(ScreenType.SIGN_MESSAGE)
    }
  }

  return {
    changeContentType,
    screenType,
    ...state,
    authorize,
  }
}
