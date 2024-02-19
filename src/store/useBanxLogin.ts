import { useCallback } from 'react'

import { web3 } from 'fbonds-core'
import moment from 'moment'
import { create } from 'zustand'

import { banxSignIn, checkBanxJwt } from '@banx/api/user'
import { parseBanxLoginJwt } from '@banx/utils'

const AUTH_MESSAGE = 'Hello! Please sign this message to proceed!'

interface BanxLoginState {
  isLoggingIn: boolean
  jwt: string | null
  setIsLoggingIn: (nextValue: boolean) => void
  setJwt: (nextValue: string | null) => void
}

const useBanxLoginState = create<BanxLoginState>((set) => ({
  isLoggingIn: false,
  jwt: null,
  setIsLoggingIn: (nextValue) => set((state) => ({ ...state, isLoggingIn: nextValue })),
  setJwt: (nextValue) => set((state) => ({ ...state, jwt: nextValue })),
}))

export const useBanxLogin = () => {
  const { isLoggingIn, setIsLoggingIn, jwt, setJwt } = useBanxLoginState()

  const logIn = useCallback(
    async (props: { walletPubkey: web3.PublicKey; signature: string }) => {
      const { walletPubkey, signature } = props

      if (isLoggingIn) return
      try {
        setIsLoggingIn(true)

        const jwt = await banxSignIn({
          publicKey: walletPubkey,
          signature,
        })

        if (!jwt) throw new Error('BE auth error')

        setBanxJwtLS(walletPubkey, jwt)
        setJwt(jwt)

        return jwt
      } catch (error) {
        setBanxJwtLS(walletPubkey, null)
        setJwt(null)

        return null
      } finally {
        setIsLoggingIn(false)
      }
    },
    [isLoggingIn, setIsLoggingIn, setJwt],
  )

  const clearWalletJwt = useCallback(
    (walletPubKey: web3.PublicKey) => {
      setBanxJwtLS(walletPubKey, null)
      setJwt(null)
    },
    [setJwt],
  )

  const checkAccess = useCallback(
    async (walletPubkey: web3.PublicKey) => {
      try {
        setIsLoggingIn(true)

        const jwt = getBanxJwtFromLS(walletPubkey)
        //? Check if jwt exists in LS
        if (!jwt) {
          clearWalletJwt(walletPubkey)
          return
        }

        const { exp: tokenExpiredAt } = parseBanxLoginJwt(jwt)

        //? Check if jwt expired
        if (tokenExpiredAt < moment().unix()) {
          clearWalletJwt(walletPubkey)
          return
        }

        //? Check jwt validity using BE
        const isJwtValid = await checkBanxJwt(jwt)
        if (!isJwtValid) {
          clearWalletJwt(walletPubkey)
          return
        }

        setJwt(jwt)
      } catch (error) {
        console.error(error)
        clearWalletJwt(walletPubkey)
      } finally {
        setIsLoggingIn(false)
      }
    },
    [setJwt, setIsLoggingIn, clearWalletJwt],
  )

  return {
    jwt,
    isLoggedIn: !!jwt,
    isLoggingIn,
    logIn,
    checkAccess,
    AUTH_MESSAGE,
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
