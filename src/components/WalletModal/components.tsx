import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Offer } from '@banx/api/nft'
import { useBanxSolBalance, useClusterStats, useDiscordUser, useSolanaBalance } from '@banx/hooks'
import { BanxSOL, ChangeWallet, Copy, SignOut } from '@banx/icons'
import { useUserOffers } from '@banx/pages/nftLending/OffersPage/components/OffersTabContent/hooks'
import { useIsLedger } from '@banx/store/common'
import { useTokenType } from '@banx/store/nft'
import {
  TXN_EXECUTOR_DEFAULT_OPTIONS,
  createExecutorWalletAndConnection,
  defaultTxnErrorHandler,
} from '@banx/transactions'
import { createClaimLenderVaultTxnData } from '@banx/transactions/nftLending'
import {
  copyToClipboard,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmation,
  formatValueByTokenType,
  isBanxSolTokenType,
  shortenAddress,
} from '@banx/utils'

import { Button } from '../Buttons'
import Checkbox from '../Checkbox'
import { EpochProgressBar } from '../EpochProgressBar'
import { StatInfo } from '../StatInfo'
import { DisplayValue } from '../TableComponents'
import UserAvatar from '../UserAvatar'
import { iconComponents } from './constants'
import { getLenderVaultInfo } from './helpers'

import styles from './WalletModal.module.less'

const UserGeneralInfo = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''
  const { data: discordUserData } = useDiscordUser()

  const solWalletBalance = useSolanaBalance({ isLive: true })
  const banxSolWalletBalance = useBanxSolBalance({ isLive: true })

  const { isLedger, setIsLedger } = useIsLedger()
  const { tokenType } = useTokenType()

  return (
    <div className={styles.userGeneralInfoContainer}>
      <UserAvatar className={styles.avatar} imageUrl={discordUserData?.avatarUrl ?? undefined} />
      <div className={styles.userGeneralInfo}>
        <div className={styles.userAddressSection} onClick={() => copyToClipboard(publicKeyString)}>
          <p className={styles.addressText}>{shortenAddress(publicKeyString)}</p>
          <Copy />
        </div>
        <Checkbox onChange={() => setIsLedger(!isLedger)} label="I use ledger" checked={isLedger} />
      </div>
      {isBanxSolTokenType(tokenType) && (
        <BalanceContent
          solWalletBalance={solWalletBalance}
          banxSolWalletBalance={banxSolWalletBalance}
          tokenType={tokenType}
        />
      )}
    </div>
  )
}

interface BalanceContentProps {
  solWalletBalance: number
  banxSolWalletBalance: number
  tokenType: LendingTokenType
}
const BalanceContent: FC<BalanceContentProps> = ({
  solWalletBalance,
  banxSolWalletBalance,
  tokenType,
}) => {
  const formattedBanxSolWalletBalance = banxSolWalletBalance
    ? formatValueByTokenType(banxSolWalletBalance, tokenType)
    : 0

  return (
    <div className={styles.balanceContainer}>
      <div className={styles.balanceContent}>
        <StatInfo
          value={formattedBanxSolWalletBalance}
          classNamesProps={{ value: styles.balanceValue }}
          icon={BanxSOL}
          flexType="row"
        />
        <div className={styles.verticalLine} />
        <StatInfo
          value={<DisplayValue value={solWalletBalance} />}
          classNamesProps={{ value: styles.balanceValue }}
          flexType="row"
        />
      </div>
      <span className={styles.balanceLabel}>Wallet balance</span>
    </div>
  )
}

interface UserInfoProps {
  onChangeWallet: () => void
  disconnect: () => Promise<void>
}

export const UserInfo: FC<UserInfoProps> = ({ onChangeWallet, disconnect }) => (
  <div className={styles.userInfoContainer}>
    <UserGeneralInfo />
    <LenderVaultContent />
    <div className={styles.buttonsWrapper}>
      <div className={styles.changeWalletButton} onClick={onChangeWallet}>
        <ChangeWallet />
        Change wallet
      </div>
      <div className={styles.signOutButton} onClick={disconnect}>
        <SignOut />
        Disconnect
      </div>
    </div>
  </div>
)

interface TooltipRowProps {
  label: string
  value: number
}

const TooltipRow: FC<TooltipRowProps> = ({ label, value }) => (
  <div className={styles.tooltipRow}>
    <span className={styles.tooltipRowLabel}>{label}</span>
    <span className={styles.tooltipRowValue}>
      <DisplayValue value={value} />
    </span>
  </div>
)

const LenderVaultContent = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const { tokenType } = useTokenType()

  const { offers, updateOrAddOffer } = useUserOffers()
  const { data: clusterStats } = useClusterStats()

  const {
    totalAccruedInterest,
    totalRepaymets,
    totalLstYield,
    totalClosedOffersValue,
    totalClaimableValue,
    totalFundsInCurrentEpoch,
    totalFundsInNextEpoch,
  } = getLenderVaultInfo(offers, clusterStats)

  const claimVault = async () => {
    if (!offers.length) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const txnsData = await Promise.all(
        offers.map(({ offer }) =>
          createClaimLenderVaultTxnData({
            offer,
            walletAndConnection,
            tokenType,
            clusterStats,
          }),
        ),
      )

      await new TxnExecutor<Offer>(walletAndConnection, TXN_EXECUTOR_DEFAULT_OPTIONS)
        .addTxnsData(txnsData)
        .on('sentAll', () => {
          enqueueTransactionsSent()
          enqueueWaitingConfirmation(loadingSnackbarId)
        })
        .on('confirmedAll', (results) => {
          const { confirmed, failed } = results

          destroySnackbar(loadingSnackbarId)

          if (confirmed.length) {
            enqueueSnackbar({ message: 'Successfully claimed', type: 'success' })
            confirmed.forEach(({ result }) => result && updateOrAddOffer([result]))
          }

          if (failed.length) {
            return failed.forEach(({ signature, reason }) =>
              enqueueConfirmationError(signature, reason),
            )
          }
        })
        .on('error', (error) => {
          throw error
        })
        .execute()
    } catch (error) {
      destroySnackbar(loadingSnackbarId)
      defaultTxnErrorHandler(error, {
        additionalData: offers,
        walletPubkey: wallet?.publicKey?.toBase58(),
        transactionName: 'ClaimLenderVault',
      })
    }
  }

  const tooltipContent = (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Repayments" value={totalRepaymets} />
      <TooltipRow label="Closed offers" value={totalClosedOffersValue} />
      <TooltipRow label="Accrued interest" value={totalAccruedInterest} />
    </div>
  )

  const formattedTotalFundsInCurrentEpoch = totalFundsInCurrentEpoch
    ? formatValueByTokenType(totalFundsInCurrentEpoch, tokenType)
    : 0

  const formattedTotalFundsInNextEpoch = totalFundsInNextEpoch
    ? formatValueByTokenType(totalFundsInNextEpoch, tokenType)
    : 0

  const formattedLstYieldValue = totalLstYield
    ? formatValueByTokenType(totalLstYield, tokenType)
    : 0

  return (
    <div className={styles.lenderVaultContainer}>
      {isBanxSolTokenType(tokenType) && (
        <div className={styles.epochContainer}>
          <EpochProgressBar />
          <div className={styles.epochStats}>
            <StatInfo
              label="Yield for this epoch"
              tooltipText="Liquid staking profit, awarded as 6% APR, based on the $SOL you hold in Banx for the entire epoch (excluding taken loans)"
              value={formattedTotalFundsInCurrentEpoch}
              icon={BanxSOL}
              flexType="row"
            />
            <StatInfo
              label="Yield for next epoch"
              tooltipText="Projected liquid staking profit, awarded as 6% APR, based on the $SOL you hold in Banx throughout the next epoch (excluding taken loans)"
              value={formattedTotalFundsInNextEpoch}
              icon={BanxSOL}
              flexType="row"
            />
          </div>
        </div>
      )}

      <div
        className={classNames(styles.lenderValtStatsContainer, {
          [styles.hiddenBorder]: !isBanxSolTokenType(tokenType),
        })}
      >
        <div className={styles.lenderVaultStats}>
          <StatInfo
            label="Liquidity"
            tooltipText={tooltipContent}
            value={<DisplayValue value={totalClaimableValue} />}
          />
          {isBanxSolTokenType(tokenType) && (
            <StatInfo
              label="LST yield"
              tooltipText="Yield generated from the BanxSOL integrated Liquid Staking Token, based on the $SOL you hold in Banx throughout a whole epoch, excluding $SOL in taken loans"
              value={formattedLstYieldValue}
              classNamesProps={{ value: styles.claimableValue }}
              icon={BanxSOL}
            />
          )}
        </div>
        <Button onClick={claimVault} disabled={!totalClaimableValue} size="small">
          Claim
        </Button>
      </div>
    </div>
  )
}

interface WalletItemProps {
  onClick: () => void
  image: string
  name: string
  className?: string
}

// To prevent same background for white icons
const CustomIcon: FC<{ name: string }> = ({ name }) => {
  const IconComponent = iconComponents[name]
  return IconComponent ? <IconComponent className={styles.walletIcon} /> : null
}

export const WalletItem: FC<WalletItemProps> = ({ onClick, image, name, className }) => {
  const customIconNames = Object.keys(iconComponents)
  const hasCustomIcon = customIconNames.includes(name)

  const shortWalletName = name.split(' ')[0]

  return (
    <div className={classNames(styles.walletItem, className)} onClick={onClick}>
      {hasCustomIcon ? <CustomIcon name={name} /> : <img src={image} alt={name} />}
      {shortWalletName}
    </div>
  )
}
