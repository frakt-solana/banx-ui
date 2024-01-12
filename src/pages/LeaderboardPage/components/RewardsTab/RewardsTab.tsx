import { FC, useState } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'

import { Button } from '@banx/components/Buttons'
import EmptyList from '@banx/components/EmptyList'
import { Loader } from '@banx/components/Loader'

import { fetchBonkWithdrawal, sendBonkWithdrawal } from '@banx/api/user'
import { enqueueUnknownErrorSnackbar } from '@banx/transactions'
import { enqueueSnackbar } from '@banx/utils'

import { updateBonkWithdrawOptimistic, useSeasonUserRewards } from '../../hooks'
import AnybodiesImg from './assets/Anybodies.png'
import BanxImg from './assets/Banx.png'

import styles from './RewardsTab.module.less'

const RewardsTab = () => {
  const { data, isLoading } = useSeasonUserRewards()
  const { available = 0, redeemed = 0, totalAccumulated = 0 } = data?.bonkRewards || {}

  return (
    <div className={styles.container}>
      {isLoading && <Loader />}
      {!isLoading && (
        <>
          <ClaimRewardsBlock totalWeekRewards={totalAccumulated} />
          <ClaimBlock availableToClaim={available} totalClaimed={redeemed} />
        </>
      )}
    </div>
  )
}

export default RewardsTab

interface ClaimRewardsBlockProps {
  totalWeekRewards: number
}

const ClaimRewardsBlock: FC<ClaimRewardsBlockProps> = ({ totalWeekRewards }) => {
  return (
    <div className={styles.weeklyRewardsBlock}>
      <div className={styles.weeklyRewardsInfo}>
        <p className={styles.blockTitle}>This week bounty</p>
        <p className={styles.rewardsValue}>{formatNumber(totalWeekRewards)} BONK</p>
      </div>
      <div className={styles.partnersInfoWrapper}>
        <p className={styles.blockTitle}>Powered by</p>
        <div className={styles.partnersImages}>
          <img src={BanxImg} alt="Banx" />
          <img src={AnybodiesImg} alt="Anybodies" />
        </div>
      </div>
    </div>
  )
}
interface ClaimBlockProps {
  availableToClaim: number
  totalClaimed: number
}

const ClaimBlock: FC<ClaimBlockProps> = ({ availableToClaim, totalClaimed }) => {
  const wallet = useWallet()
  const walletPubkeyString = wallet.publicKey?.toBase58()

  const [isLoading, setIsLoading] = useState(false)

  const onClaim = async () => {
    try {
      if (!walletPubkeyString || !wallet.signTransaction) return
      setIsLoading(true)
      const bonkWithdrawal = await fetchBonkWithdrawal({ walletPubkey: walletPubkeyString })

      if (!bonkWithdrawal) throw new Error('BONK withdrawal fetching error')

      const transaction = web3.Transaction.from(bonkWithdrawal.rawTransaction)
      const signedTransaction = await wallet.signTransaction(transaction)
      const signedTranactionBuffer = signedTransaction.serialize({
        verifySignatures: false,
        requireAllSignatures: false,
      })

      await sendBonkWithdrawal({
        walletPubkey: walletPubkeyString,
        bonkWithdrawal: {
          requestId: bonkWithdrawal.requestId,
          rawTransaction: signedTranactionBuffer.toJSON().data,
        },
      })

      enqueueSnackbar({
        message: 'BONK successfully claimed',
        type: 'success',
      })
      updateBonkWithdrawOptimistic(walletPubkeyString)
    } catch (error) {
      console.error(error)
      enqueueUnknownErrorSnackbar(error as Error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={styles.availableToClaim}>
      <div className={styles.availableToClaimInfo}>
        <p className={styles.blockTitle}>Available to claim</p>
        <p className={styles.rewardsValue}>{formatNumber(availableToClaim)} BONK</p>
      </div>
      <div className={styles.totalClaimedInfo}>
        <p className={styles.totalClaimedLabel}>Claimed to date:</p>
        <p className={styles.totalClaimedValue}>{formatNumber(totalClaimed)} BONK</p>
      </div>
      {wallet.connected ? (
        <Button
          className={styles.claimButton}
          onClick={onClaim}
          loading={isLoading}
          disabled={isLoading || !availableToClaim}
        >
          Claim
        </Button>
      ) : (
        <EmptyList className={styles.emptyList} message="Connect wallet to see claimable" />
      )}
    </div>
  )
}

const formatNumber = (value = 0) => {
  if (!value) return '--'

  return Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}
