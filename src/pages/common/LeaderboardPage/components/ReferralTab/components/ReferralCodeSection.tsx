import { FC, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { Skeleton } from 'antd'
import classNames from 'classnames'
import { web3 } from 'fbonds-core'

import { Button } from '@banx/components/Buttons'
import { ReferralInput } from '@banx/components/RefferralModal'

import { user } from '@banx/api/common'
import { BASE_BANX_URL, DISCORD } from '@banx/constants'
import { BanxToken, Copy, Receive } from '@banx/icons'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { copyToClipboard, enqueueSnackbar } from '@banx/utils'

import { updateBanxWithdrawOptimistic, useSeasonUserRewards } from '../../../hooks'
import { useRefPersonalData } from '../hooks'

import styles from '../ReferralTab.module.less'

export const ReferralCodeSection = () => {
  const { connected } = useWallet()

  const { data: refPersonalData, isLoading: isLoadingPersonalData } = useRefPersonalData()
  const { data } = useSeasonUserRewards()

  const { redeemed = 0, available: availableToClaim = 0 } = data?.banxRewards || {}
  const { refCode = '', refUsers = [] } = refPersonalData || {}

  const totalReferred = refUsers.length || 0

  const handleCopyRefCode = () => {
    const referralLink = `${BASE_BANX_URL}ref=${refCode}`
    copyToClipboard(referralLink)

    enqueueSnackbar({ message: 'Copied your referral link', type: 'success' })
  }

  return (
    <div className={styles.referralCodeSection}>
      {connected && (
        <div className={styles.referralCodeContent}>
          <ReferralInput
            label="Your referral code"
            value={refCode}
            actionButton={{ text: 'Copy', icon: Copy, onClick: handleCopyRefCode }}
            className={styles.referralInput}
          />

          <CustomReferralLink />
        </div>
      )}

      <div className={styles.referralCodeBenefit}>
        <Receive />
        <span>10% of all referral upfront fees, forever</span>
      </div>

      <RewardsContent
        totalReferred={totalReferred}
        availableToClaim={availableToClaim}
        totalClaimed={redeemed}
        isLoadingPersonalData={isLoadingPersonalData}
      />
    </div>
  )
}

interface RewardsSectionProps {
  totalReferred: number
  availableToClaim: number
  totalClaimed: number
  isLoadingPersonalData: boolean
}

const RewardsContent: FC<RewardsSectionProps> = ({
  totalReferred,
  availableToClaim,
  totalClaimed,
  isLoadingPersonalData,
}) => {
  const { publicKey, connected, signTransaction } = useWallet()
  const walletPubkeyString = publicKey?.toBase58()

  const [isLoading, setIsLoading] = useState(false)

  const onClaim = async () => {
    try {
      if (!walletPubkeyString || !signTransaction) return

      setIsLoading(true)

      const banxWithdrawal = await user.fetchBonkWithdrawal({
        walletPubkey: walletPubkeyString,
        tokenName: 'banx',
      })

      if (!banxWithdrawal) throw new Error('BANX withdrawal fetching error')

      const transaction = web3.Transaction.from(banxWithdrawal.rawTransaction)
      const signedTransaction = await signTransaction(transaction)
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

  const displayAvailableToClaim = connected ? formatNumber(availableToClaim) : null
  const displayTotalClaimed = totalClaimed ? formatNumber(totalClaimed) : '--'
  const displayTotalReferredValue = connected ? totalReferred : '--'

  return (
    <div className={styles.rewardsContent}>
      {connected && isLoadingPersonalData && (
        <Skeleton.Input className={styles.referralInviteInfoSkeleton} />
      )}

      {(!connected || !isLoadingPersonalData) && (
        <>
          <div className={styles.rewardStat}>
            <span>You referred</span>
            <span className={styles.referredValue}>{displayTotalReferredValue}</span>
          </div>
          <div className={classNames(styles.rewardStat, styles.rightAlign)}>
            <span>Claimed</span>
            <span className={styles.referredValue}>
              {displayTotalClaimed}
              <BanxToken />
            </span>
          </div>
          <Button
            onClick={onClaim}
            loading={isLoading}
            disabled={isLoading || !availableToClaim}
            className={classNames(styles.claimRewardsButton, { [styles.loading]: isLoading })}
          >
            Claim {displayAvailableToClaim}
            <BanxToken />
          </Button>
        </>
      )}
    </div>
  )
}

const CustomReferralLink = () => (
  <div className={styles.customReferralLink}>
    For custom link please join{' '}
    <a href={DISCORD.SERVER_URL} rel="noopener noreferrer" target="_blank">
      our discord
    </a>{' '}
    and create a ticket
  </div>
)

const formatNumber = (value = 0) => {
  if (!value) return ''

  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}
