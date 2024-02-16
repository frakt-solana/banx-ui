import { useCallback, useEffect } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import moment from 'moment'
import { create } from 'zustand'

import { banxSignIn, checkBanxJwt } from '@banx/api/user'
import { generateSignature, parseBanxLoginJwt } from '@banx/utils'

import { useIsLedger } from './useIsLedger'

const AUTH_MESSAGE = 'Hello! Please sign this message to proceed!'

interface BanxLoginState {
  isLoggingIn: boolean
  jwt: string | null
  setIsLoggingIn: (nextValue: boolean) => void
  setAccessToken: (nextValue: string | null) => void
}

const useBanxLoginState = create<BanxLoginState>((set) => ({
  isLoggingIn: false,
  jwt: null,
  setIsLoggingIn: (nextValue) => set((state) => ({ ...state, isLoggingIn: nextValue })),
  setAccessToken: (nextValue) => set((state) => ({ ...state, jwt: nextValue })),
}))

export const useBanxLogin = () => {
  const wallet = useWallet()
  const { connection } = useConnection()

  const { isLoggingIn, setIsLoggingIn, jwt, setAccessToken } = useBanxLoginState()

  const { isLedger } = useIsLedger()

  const logIn = useCallback(async () => {
    if (isLoggingIn || !wallet.publicKey) return
    try {
      setIsLoggingIn(true)
      const signature = await generateSignature({
        isLedger,
        nonce: AUTH_MESSAGE,
        wallet,
        connection,
      })

      if (!signature) return

      const jwt = await banxSignIn({
        publicKey: wallet.publicKey,
        signature,
      })

      if (!jwt) throw new Error('BE auth error')

      setBanxJwtLS(wallet.publicKey, jwt)

      setAccessToken(jwt)

      return jwt
    } catch (error) {
      setBanxJwtLS(wallet.publicKey, null)
      setAccessToken(null)

      return null
    } finally {
      setIsLoggingIn(false)
    }
  }, [connection, wallet, isLoggingIn, setIsLoggingIn, setAccessToken, isLedger])

  const clearWalletJwt = useCallback(
    (walletPubKey: web3.PublicKey) => {
      setBanxJwtLS(walletPubKey, null)
      setAccessToken(null)
    },
    [setAccessToken],
  )

  //? Try to get jwt from LS and check its validity
  useEffect(() => {
    const checkWalletAccessLS = async () => {
      if (!wallet.publicKey) return

      try {
        setIsLoggingIn(true)

        const jwt = getBanxJwtFromLS(wallet.publicKey)
        //? Check if jwt exists in LS
        if (!jwt) {
          clearWalletJwt(wallet.publicKey)
          return
        }

        //? Check jwt validity using BE
        const isJwtValid = await checkBanxJwt(jwt)
        if (!isJwtValid) {
          clearWalletJwt(wallet.publicKey)
          return
        }

        const { exp: tokenExpiredAt } = parseBanxLoginJwt(jwt)

        //? Check if jwt expired
        if (tokenExpiredAt < moment().unix()) {
          clearWalletJwt(wallet.publicKey)
          return
        }

        setAccessToken(jwt)
      } catch (error) {
        console.error(error)
        clearWalletJwt(wallet.publicKey)
      } finally {
        setIsLoggingIn(false)
      }
    }

    checkWalletAccessLS()
  }, [wallet.publicKey, setAccessToken, setIsLoggingIn, clearWalletJwt])

  return {
    jwt,
    isLoggedIn: !!jwt,
    isLoggingIn,
    logIn,
  }
}

const BANX_LOGIN_DATA_LS_KEY = '@banx.login'

type BanxJwtsMap = Record<string, string> //? Record<walletPubkeyString, jwt>

const getBanxJwtsFromLS = (): BanxJwtsMap | null => {
  const banxLoginsRaw = localStorage.getItem(BANX_LOGIN_DATA_LS_KEY)
  if (!banxLoginsRaw) return null

  const banxLogins: BanxJwtsMap | null = JSON.parse(banxLoginsRaw)

  return banxLogins || null
}

export const getBanxJwtFromLS = (walletPubkey: web3.PublicKey): string | null => {
  const banxJwts = getBanxJwtsFromLS()
  return banxJwts?.[walletPubkey.toBase58()] || null
}

const setBanxJwtLS = (walletPubkey: web3.PublicKey, jwt: string | null) => {
  const banxJwts = getBanxJwtsFromLS()
  localStorage.setItem(
    BANX_LOGIN_DATA_LS_KEY,
    JSON.stringify({ ...banxJwts, [walletPubkey.toBase58()]: jwt }),
  )
}
