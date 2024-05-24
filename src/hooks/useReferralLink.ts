import { useCallback, useEffect } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useLocation, useNavigate } from 'react-router-dom'

import RefferralModal from '@banx/components/RefferralModal'

import { user } from '@banx/api/common'
import { useBanxLogin, useIsLedger, useModal } from '@banx/store/common'
import { enqueueSnackbar, generateSignature } from '@banx/utils'

export const useReferralLink = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { isLedger } = useIsLedger()

  const location = useLocation()
  const navigate = useNavigate()

  const { close } = useModal()

  const { jwt, AUTH_MESSAGE, logIn } = useBanxLogin()

  const removeRefFromPath = useCallback(() => {
    const pathWithoutRef = location.pathname.replace(/ref=([^/]*)/, '')
    navigate(pathWithoutRef, { replace: true })
  }, [location.pathname, navigate])

  const getWalletJwt = useCallback(async () => {
    if (!wallet.publicKey) return

    const signature = await generateSignature({
      isLedger,
      nonce: AUTH_MESSAGE,
      wallet,
      connection,
    })

    if (!signature) return

    return await logIn({
      signature,
      walletPubkey: wallet.publicKey,
    })
  }, [AUTH_MESSAGE, connection, isLedger, logIn, wallet])

  const onRefLink = useCallback(
    async (referralCode: string) => {
      try {
        const walletJwt = jwt || (await getWalletJwt())

        if (!walletJwt) return

        const linkResponse = await user.linkRef({
          walletJwt,
          refCode: referralCode,
        })

        if (!linkResponse.success) {
          throw new Error(linkResponse.message || 'Unable to link ref code')
        }

        enqueueSnackbar({
          message: 'Added referrer successfully',
          type: 'success',
        })

        removeRefFromPath()
        close()
      } catch (error) {
        console.error({ error })
        if (error instanceof Error) {
          enqueueSnackbar({ message: error?.message, type: 'error' })
        }
      }
    },
    [jwt, getWalletJwt, removeRefFromPath, close],
  )

  return { onRefLink, removeRefFromPath }
}

export const useReferralCodeModalTrigger = () => {
  const { open } = useModal()
  const location = useLocation()

  useEffect(() => {
    const referralCode = extractReferralCodeFromPath(location.pathname)

    if (referralCode) {
      open(RefferralModal)
    }
  }, [open, location])
}

export const extractReferralCodeFromPath = (pathname: string) => {
  const match = pathname.match(/ref=([^/]*)/)
  return match ? match[1] : null
}
