import { useCallback, useMemo } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useQuery } from '@tanstack/react-query'
import { create } from 'zustand'

import { LinkedWallet, fetchLinkedWallets, linkWallet, unlinkWallet } from '@banx/api/user'
import { useBanxLogin, useIsLedger, useModal } from '@banx/store'
import { enqueueSnackbar, generateSignature, queryClient } from '@banx/utils'

type SavedLinkingData = {
  walletPubkey: string
  jwt: string
  linkedWallets: LinkedWallet[] | null
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

  const { data: linkedWalletsDataBE, isLoading: linkedWalletsDataBELoading } = useQuery(
    createFetchLinkedWalletsQueryKey(publicKey?.toBase58() || ''),
    () => fetchLinkedWallets({ walletPublicKey: publicKey?.toBase58() || '' }),
  )

  const linkedWalletsData = useMemo(() => {
    if (savedLinkingData?.linkedWallets) {
      return savedLinkingData?.linkedWallets
    }
    return linkedWalletsDataBE
  }, [linkedWalletsDataBE, savedLinkingData])

  const onStartLinking = useCallback(() => {
    if (!publicKey || !jwt) return
    setSavedLinkingData({
      walletPubkey: publicKey.toBase58(),
      jwt: jwt,
      linkedWallets: linkedWalletsDataBE || null,
    })
  }, [jwt, linkedWalletsDataBE, publicKey, setSavedLinkingData])

  const onLink = useCallback(async () => {
    if (!publicKey || !savedLinkingData) return

    try {
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
      const linkResponse = await linkWallet({
        linkedWalletJwt: savedLinkingData.jwt,
        wallet: publicKey.toBase58(),
        signature,
      })
      if (!linkResponse.success) {
        throw new Error(linkResponse.message || 'Unable to link wallet')
      }

      logIn({
        signature,
        walletPubkey: publicKey,
      })

      if (savedLinkingData.linkedWallets) {
        setLinkedWalletsOptimistic(publicKey.toBase58(), [
          ...savedLinkingData.linkedWallets,
          { type: 'linked', wallet: publicKey.toBase58() },
        ])
      }
      setSavedLinkingData(null)
      enqueueSnackbar({
        message: 'Linked sucessfully',
        type: 'success',
      })
    } catch (error) {
      console.error({ error })
      if (error instanceof Error) {
        enqueueSnackbar({
          message: error?.message,
          type: 'error',
        })
      }
    }
  }, [
    publicKey,
    savedLinkingData,
    isLedger,
    AUTH_MESSAGE,
    wallet,
    connection,
    logIn,
    setSavedLinkingData,
  ])

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

      try {
        //? Optimistic here
        const unlinkResponse = await unlinkWallet({
          jwt,
          walletToUnlink,
        })
        if (!unlinkResponse.success) {
          throw new Error(unlinkResponse.message || 'Unable to link wallet')
        }

        removeLinkedWalletOptimistic(publicKey.toBase58(), walletToUnlink)

        enqueueSnackbar({
          message: 'Unlinked sucessfully',
          type: 'success',
        })
      } catch (error) {
        console.error({ error })
        if (error instanceof Error) {
          enqueueSnackbar({
            message: error?.message,
            type: 'error',
          })
        }
      }
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
    isLoading: linkedWalletsDataBELoading,
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
    onLink,
    onLogin,
    onUnlink,
    canUnlink,
    isDiffWalletConnected,
  }
}

const USE_FETCH_LINKED_WALLETS_QUERY_KEY = 'fetchLinkedWallets'
const createFetchLinkedWalletsQueryKey = (walletPubkey: string) => [
  USE_FETCH_LINKED_WALLETS_QUERY_KEY,
  walletPubkey,
]
//? Optimistics based on queryData modification
const setLinkedWalletsOptimistic = (walletPubkey: string, nextState: LinkedWallet[]) =>
  queryClient.setQueryData(
    createFetchLinkedWalletsQueryKey(walletPubkey),
    (queryData: LinkedWallet[] | undefined) => {
      if (!queryData) return queryData
      return nextState
    },
  )

const removeLinkedWalletOptimistic = (walletPubkey: string, walletPubkeyToRemove: string) =>
  queryClient.setQueryData(
    createFetchLinkedWalletsQueryKey(walletPubkey),
    (queryData: LinkedWallet[] | undefined) => {
      if (!queryData) return queryData

      //TODO: try to remove explicit typing
      if (walletPubkey === walletPubkeyToRemove) {
        return [{ wallet: walletPubkey, type: 'main' }] as LinkedWallet[]
      }

      return queryData.filter(({ wallet }) => wallet !== walletPubkeyToRemove)
    },
  )
