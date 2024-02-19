import { useCallback } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { create } from 'zustand'

import { LinkedWallet, fetchLinkedWallets, linkWallet, unlinkWallet } from '@banx/api/user'
import { useBanxLogin, useIsLedger, useModal } from '@banx/store'
import { generateSignature } from '@banx/utils'

export type SavedLinkingData = {
  walletPubkey: string
  jwt: string
  data: LinkedWallet[] | null
}

type SavedLinkingDataState = {
  savedLinkingData: SavedLinkingData | null
  setSavedLinkingData: (nextValue: SavedLinkingData | null) => void
}

const useSavedDataState = create<SavedLinkingDataState>((set) => ({
  savedLinkingData: null,
  setSavedLinkingData: (nextValue) => set((state) => ({ ...state, savedLinkingData: nextValue })),
}))

export const useLinkWalletsModal = () => {
  const { publicKey, ...wallet } = useWallet()
  const { connection } = useConnection()
  const { savedLinkingData, setSavedLinkingData } = useSavedDataState()
  const { close: closeModal } = useModal()
  const { jwt, AUTH_MESSAGE, logIn, isLoggedIn, ...banxLoginState } = useBanxLogin()
  const { isLedger, setIsLedger } = useIsLedger()

  const { data: linkedWalletsData, isLoading: linkedWalletsDataLoading } = useQuery(
    ['fetchLinkedWallets', publicKey],
    () => fetchLinkedWallets({ walletPublicKey: publicKey?.toBase58() || '' }),
  )

  const onStartLinking = useCallback(() => {
    if (!publicKey || !jwt) return
    setSavedLinkingData({
      walletPubkey: publicKey.toBase58(),
      jwt: jwt,
      data: linkedWalletsData || null,
    })
  }, [jwt, linkedWalletsData, publicKey, setSavedLinkingData])

  const onVerify = useCallback(async () => {
    if (!publicKey || !jwt) return

    const signature = await generateSignature({
      isLedger,
      nonce: AUTH_MESSAGE,
      wallet: {
        publicKey,
        ...wallet,
      },
      connection,
    })

    if (!signature) return

    //? Optimistic here
    await linkWallet({
      linkedWalletJwt: jwt,
      wallet: publicKey.toBase58(),
      signature,
    })

    logIn({
      signature,
      walletPubkey: publicKey,
    })
    setSavedLinkingData(null)
  }, [AUTH_MESSAGE, connection, isLedger, jwt, logIn, publicKey, setSavedLinkingData, wallet])

  const onLogin = useCallback(async () => {
    if (!publicKey) return

    const signature = await generateSignature({
      isLedger,
      nonce: AUTH_MESSAGE,
      wallet: {
        publicKey,
        ...wallet,
      },
      connection,
    })

    if (!signature) return

    logIn({
      signature,
      walletPubkey: publicKey,
    })
  }, [AUTH_MESSAGE, connection, isLedger, logIn, publicKey, wallet])

  const onUnlink = useCallback(
    async (walletToUnlink: string) => {
      if (!publicKey || !jwt) return

      //? Optimistic here
      await unlinkWallet({
        jwt,
        walletToUnlink,
      })
    },
    [jwt, publicKey],
  )

  const onCloseModal = useCallback(() => {
    setSavedLinkingData(null)
    closeModal()
  }, [closeModal, setSavedLinkingData])

  const canUnlink =
    publicKey &&
    linkedWalletsData?.some(({ wallet }) => wallet === publicKey?.toBase58()) &&
    isLoggedIn

  const isDiffWalletConnected =
    !!publicKey && !!savedLinkingData && publicKey.toBase58() !== savedLinkingData?.walletPubkey

  return {
    linkedWalletsData,
    isLoading: linkedWalletsDataLoading,
    onCloseModal,
    wallet: {
      publicKey,
      ...wallet,
    },
    savedLinkingState: {
      savedLinkingData,
      setSavedLinkingData,
    },
    ledgerState: {
      isLedger,
      setIsLedger,
    },
    banxLoginState: { jwt, AUTH_MESSAGE, logIn, isLoggedIn, ...banxLoginState },
    onStartLinking,
    onVerify,
    onLogin,
    onUnlink,
    canUnlink,
    isDiffWalletConnected,
  }
}
