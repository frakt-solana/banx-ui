import { FC } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { sumBy, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Offer } from '@banx/api/nft'
import { useDiscordUser } from '@banx/hooks'
import { ChangeWallet, Copy, SignOut } from '@banx/icons'
import { useUserOffers } from '@banx/pages/nftLending/OffersPage/components/OffersTabContent/hooks'
import { useIsLedger } from '@banx/store/common'
import { useNftTokenType } from '@banx/store/nft'
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
  shortenAddress,
} from '@banx/utils'

import { Button } from '../Buttons'
import Checkbox from '../Checkbox'
import { DisplayValue } from '../TableComponents'
import Tooltip from '../Tooltip'
import UserAvatar from '../UserAvatar'
import { iconComponents } from './constants'

import styles from './WalletModal.module.less'

const UserGeneralInfo = () => {
  const { publicKey } = useWallet()
  const publicKeyString = publicKey?.toBase58() || ''
  const { data: discordUserData } = useDiscordUser()

  const { isLedger, setIsLedger } = useIsLedger()

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
  const { tokenType } = useNftTokenType()

  const { offers, updateOrAddOffer } = useUserOffers()

  const totalAccruedInterest = sumBy(offers, ({ offer }) => offer.concentrationIndex)
  const totalRepaymets = sumBy(offers, ({ offer }) => offer.bidCap)
  // const totalLstYeild = sumBy(offers, ({ offer }) => offer.bidCap)

  const totalClaimableValue = totalAccruedInterest + totalRepaymets

  const claimVault = async () => {
    if (!offers.length) return

    const loadingSnackbarId = uniqueId()

    try {
      const walletAndConnection = createExecutorWalletAndConnection({ wallet, connection })

      const filteredOffets = offers.filter(({ offer }) => offer.concentrationIndex || offer.bidCap)

      const txnsData = await Promise.all(
        filteredOffets.map(({ offer }) =>
          createClaimLenderVaultTxnData({
            offer,
            walletAndConnection,
            tokenType,
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

  const tooltipContent = () => (
    <div className={styles.tooltipContent}>
      <TooltipRow label="Accrued interest" value={totalAccruedInterest} />
      <TooltipRow label="Repaymets" value={totalRepaymets} />
      {/* <TooltipRow label="Lst Yield" value={totalLstYeild} /> */}
    </div>
  )

  return (
    <div className={styles.lenderVaultContainer}>
      <div className={styles.lenderVaultStat}>
        <p className={styles.lenderVaultStatValue}>
          <DisplayValue value={totalClaimableValue} />
        </p>
        <div className={styles.lenderVaultStatLabel}>
          <span>Lender</span>
          <span>
            Vault <Tooltip title={tooltipContent}></Tooltip>
          </span>
        </div>
      </div>
      <Button onClick={claimVault} disabled={!totalClaimableValue} size="small">
        Claim
      </Button>
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
