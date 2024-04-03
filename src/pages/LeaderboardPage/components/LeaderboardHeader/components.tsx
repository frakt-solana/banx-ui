import { FC } from 'react'

import { NavLink } from 'react-router-dom'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import Tooltip from '@banx/components/Tooltip'

import { Link as LinkIcon } from '@banx/icons'
import { PATHS } from '@banx/router'
import { useModal } from '@banx/store'
import { formatNumbersWithCommas, shortenAddress } from '@banx/utils'

import { LinkWalletsModal } from '../LinkWalletsModal'

import styles from './LeaderboardHeader.module.less'

interface ParticipantsInfoProps {
  participants: number
}
export const ParticipantsInfo: FC<ParticipantsInfoProps> = ({ participants }) => (
  <StatInfo
    label="Participants"
    value={formatNumbersWithCommas(participants)}
    classNamesProps={{
      container: styles.participantsInfo,
      value: styles.participantsValue,
      label: styles.participantsLabel,
    }}
  />
)

interface WalletInfoProps {
  walletPublicKey: string
}
export const WalletInfo: FC<WalletInfoProps> = ({ walletPublicKey }) => {
  const { open } = useModal()

  const onLinkWalletsClick = () => {
    open(LinkWalletsModal, {})
  }

  return (
    <>
      <div className={styles.walletInfo}>
        <span className={styles.walletAddress}>{shortenAddress(walletPublicKey)}</span>
        <Button
          className={styles.connectWalletButton}
          variant="secondary"
          size="small"
          onClick={onLinkWalletsClick}
        >
          Link wallets
        </Button>
      </div>
      <div className={styles.walletInfoMobileBadge} onClick={onLinkWalletsClick}>
        {walletPublicKey.slice(0, 4)} <LinkIcon />
      </div>
    </>
  )
}

interface LoyaltyBlockProps {
  multiplier: number
  lenderPoints: number
  borrowerPoints: number
}
export const LoyaltyBlock: FC<LoyaltyBlockProps> = ({
  multiplier,
  lenderPoints,
  borrowerPoints,
}) => {
  const formattedLenderPoints = formatNumbersWithCommas(lenderPoints?.toFixed(0))
  const formattedBorrowerPoints = formatNumbersWithCommas(borrowerPoints?.toFixed(0))

  return (
    <div className={styles.loyaltyContainer}>
      <ul className={styles.loyaltyList}>
        <li>
          <span className={styles.loyaltyListTitle}>Lender pts</span>
          {formattedLenderPoints}
        </li>
        <li>
          <span className={styles.loyaltyListTitle}>Borrower pts</span> {formattedBorrowerPoints}
        </li>
        <li>
          <span className={styles.loyaltyListTitle}>
            Boost{' '}
            <Tooltip title="Only $BANX rewards are boosted by staking Banx NFTs, the more player points staked the higher the boost" />{' '}
          </span>
          <span className={styles.loyaltyBoost}>{multiplier}x</span>
        </li>
      </ul>

      <div className={styles.loyaltyBoostIncrease}>
        <p>Want to increase your boost?</p>
        <NavLink className={styles.stakeBanxButton} to={PATHS.ADVENTURES}>
          <Button variant="secondary" size="small">
            Stake Banx
          </Button>
        </NavLink>
      </div>
    </div>
  )
}

export const NoConnectedWalletInfo = () => (
  <span className={styles.notConnectedTitle}>Unknown Banx</span>
)
