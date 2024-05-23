import { FC, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'

import { Button } from '@banx/components/Buttons'

import { user } from '@banx/api/common'
import { BanxToken, Cashback } from '@banx/icons'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { enqueueSnackbar } from '@banx/utils'

import { updateBanxWithdrawOptimistic, useSeasonUserRewards } from '../../../hooks'

import styles from '../ReferralTab.module.less'

interface ReferralInfoSectionProps {
  rewardsValue: number
}

export const ReferralInfoSection: FC<ReferralInfoSectionProps> = ({ rewardsValue }) => {
  const wallet = useWallet()
  const walletPubkeyString = wallet.publicKey?.toBase58()

  const { data } = useSeasonUserRewards()
  const { available: availableToClaim = 0 } = data?.banxRewards || {}

  const [isLoading, setIsLoading] = useState(false)

  const onClaim = async () => {
    try {
      if (!walletPubkeyString || !wallet.signTransaction) return

      setIsLoading(true)

      const banxWithdrawal = await user.fetchBonkWithdrawal({
        walletPubkey: walletPubkeyString,
        tokenName: 'banx',
      })

      if (!banxWithdrawal) throw new Error('BANX withdrawal fetching error')

      const transaction = web3.Transaction.from(banxWithdrawal.rawTransaction)
      const signedTransaction = await wallet.signTransaction(transaction)
      const signedTranactionBuffer = signedTransaction.serialize({
        verifySignatures: false,
        requireAllSignatures: false,
      })

      await user.sendBonkWithdrawal({
        walletPubkey: walletPubkeyString,
        bonkWithdrawal: {
          requestId: banxWithdrawal.requestId,
          rawTransaction: signedTranactionBuffer.toJSON().data,
        },
      })

      enqueueSnackbar({
        message: 'BANX successfully claimed',
        type: 'success',
      })
      updateBanxWithdrawOptimistic(walletPubkeyString)
    } catch (error) {
      defaultTxnErrorHandler(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.referralInfoSection}>
      <div className={styles.referralInfoContent}>
        <div className={styles.referralInfoRow}>
          <Cashback />
          <span>For the first loan you will receive a 100% cashback in $BANX</span>
        </div>
        <div className={styles.referralInfoRow}>
          <Cashback />
          <span>You will receive 10% every time your referral pays upfront fee</span>
        </div>
      </div>

      <div className={styles.rewardsInfo}>
        <div className={styles.rewardsStatInfo}>
          <span className={styles.rewardsStatLabel}>Rewards</span>
          <div className={styles.rewardsStatValue}>
            <span>{rewardsValue}</span>
            <BanxToken />
          </div>
        </div>
        <Button
          onClick={onClaim}
          disabled={isLoading || !availableToClaim}
          className={styles.claimRewardsButton}
        >
          Claim
        </Button>
      </div>
    </div>
  )
}
