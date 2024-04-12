import { FC, useMemo } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { BN } from 'fbonds-core'
import { BanxAdventureSubscriptionState } from 'fbonds-core/lib/fbond-protocol/types'
import { chain, uniqueId } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { StatInfo, StatsInfoProps, VALUES_TYPES } from '@banx/components/StatInfo'

import { BanxInfoBN, BanxStakingSettingsBN } from '@banx/api/staking'
import { BANX_TOKEN_DECIMALS, TXN_EXECUTOR_BASE_OPTIONS } from '@banx/constants'
import { BanxToken, Gamepad, MoneyBill } from '@banx/icons'
import {
  banxTokenBNToFixed,
  calcPartnerPoints,
  calculateAdventureRewards,
  calculatePlayerPointsForBanxTokens,
  isAdventureEnded,
} from '@banx/pages/AdventuresPage'
import { StakeNftsModal, StakeTokensModal } from '@banx/pages/AdventuresPage/components'
import { useModal, usePriorityFees } from '@banx/store'
import { createWalletInstance, defaultTxnErrorHandler } from '@banx/transactions'
import { stakeBanxClaimAction } from '@banx/transactions/staking/stakeBanxClaimAction'
import {
  ZERO_BN,
  bnToFixed,
  destroySnackbar,
  enqueueConfirmationError,
  enqueueSnackbar,
  enqueueTransactionsSent,
  enqueueWaitingConfirmationSingle,
  formatCompact,
  formatNumbersWithCommas,
} from '@banx/utils'

import styles from './Sidebar.module.less'

interface SidebarProps {
  className?: string
  banxStakingSettings: BanxStakingSettingsBN
  banxStakeInfo: BanxInfoBN
}

export const Sidebar: FC<SidebarProps> = ({ className, banxStakingSettings, banxStakeInfo }) => {
  const { open } = useModal()
  const wallet = useWallet()
  const { connection } = useConnection()
  const { priorityLevel } = usePriorityFees()

  const { nfts, banxAdventures, banxTokenStake } = banxStakeInfo

  const nftsCount = nfts?.length.toString() || '0'

  const rewards: BN = useMemo(() => {
    if (!banxAdventures) return ZERO_BN

    const rewardsBN = calculateAdventureRewards(
      banxAdventures //? Claim only from active subscriptions
        .filter(
          ({ adventureSubscription }) =>
            adventureSubscription?.adventureSubscriptionState ===
            BanxAdventureSubscriptionState.Active,
        )
        //? Claim only from ended adventures
        .filter(({ adventure }) => isAdventureEnded(adventure))
        .map(({ adventure, adventureSubscription }) => ({
          adventure,
          subscription: adventureSubscription ?? undefined,
        })),
    )

    return rewardsBN
  }, [banxAdventures])

  const totalRewardsHarvested: BN = useMemo(() => {
    if (!banxAdventures) return ZERO_BN

    const rewardsBN = calculateAdventureRewards(
      banxAdventures //? Claim only from active subscriptions
        .filter(
          ({ adventureSubscription }) =>
            adventureSubscription?.adventureSubscriptionState ===
            BanxAdventureSubscriptionState.Claimed,
        )
        //? Claim only from ended adventures
        .filter(({ adventure }) => isAdventureEnded(adventure))
        .map(({ adventure, adventureSubscription }) => ({
          adventure,
          subscription: adventureSubscription ?? undefined,
        })),
    )

    return rewardsBN
  }, [banxAdventures])

  const { tokensPerPartnerPoints } = banxStakingSettings

  const tokensPts = calcPartnerPoints(
    banxTokenStake?.tokensStaked ?? ZERO_BN,
    tokensPerPartnerPoints,
  )

  const totalPtsStr = (tokensPts + (banxTokenStake?.partnerPointsStaked ?? 0)).toFixed(2)

  const claimAction = () => {
    if (!wallet.publicKey?.toBase58() || !banxTokenStake) {
      return
    }

    const weeks = chain(banxAdventures)
      //? Claim only from active subscriptions
      .filter(
        ({ adventureSubscription }) =>
          adventureSubscription?.adventureSubscriptionState ===
          BanxAdventureSubscriptionState.Active,
      )
      //? Claim only from ended adventures
      .filter(({ adventure }) => isAdventureEnded(adventure))
      .map(({ adventure }) => adventure.week)
      .value()

    const params = { weeks, priorityFeeLevel: priorityLevel }

    const loadingSnackbarId = uniqueId()

    new TxnExecutor(
      stakeBanxClaimAction,
      { wallet: createWalletInstance(wallet), connection },
      {
        ...TXN_EXECUTOR_BASE_OPTIONS,
      },
    )
      .addTransactionParam(params)
      .on('sentAll', (results) => {
        enqueueTransactionsSent()
        enqueueWaitingConfirmationSingle(loadingSnackbarId, results[0].signature)
      })
      .on('confirmedAll', (results) => {
        destroySnackbar(loadingSnackbarId)

        const { confirmed, failed } = results

        if (confirmed.length) {
          enqueueSnackbar({ message: 'Claimed successfully', type: 'success' })
        }

        if (failed.length) {
          return failed.forEach(({ signature, reason }) =>
            enqueueConfirmationError(signature, reason),
          )
        }
      })
      .on('error', (error) => {
        destroySnackbar(loadingSnackbarId)
        defaultTxnErrorHandler(error, {
          additionalData: params,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Claim StakeBanx',
        })
      })
      .execute()
  }

  const Totals = () => {
    const stakenTokensPlayersPoints = calculatePlayerPointsForBanxTokens(
      banxTokenStake?.tokensStaked ?? ZERO_BN,
    )
    const totalPlayersPoints = (
      (banxTokenStake?.playerPointsStaked ?? 0) + stakenTokensPlayersPoints
    ).toFixed(2)

    return (
      <div>
        <div className={styles.totalValues}>{formatNumbersWithCommas(totalPtsStr)} partner</div>
        <div className={styles.totalValues}>
          {formatNumbersWithCommas(totalPlayersPoints)} player
        </div>
      </div>
    )
  }

  return (
    <div className={classNames(styles.sidebar, className)}>
      <div className={styles.content}>
        <div className={styles.squadSection}>
          <Title text="My squad" icon={<Gamepad />} />

          <div className={styles.stakedInfoContainer}>
            <div className={styles.stakedInfo}>
              <StakingStat
                label="NFTs staked"
                value={`${formatNumbersWithCommas(
                  banxTokenStake?.banxNftsStakedQuantity || 0,
                )}/${formatNumbersWithCommas(nftsCount)}`}
              />

              <Button
                onClick={() => open(StakeNftsModal)}
                className={styles.manageButton}
                variant="secondary"
              >
                Manage
              </Button>
            </div>

            <div className={styles.stakedInfo}>
              <StakingStat
                label="Tokens staked"
                value={`${formatCompact(
                  bnToFixed({
                    value: banxTokenStake?.tokensStaked ?? ZERO_BN,
                    decimals: BANX_TOKEN_DECIMALS,
                    fractionDigits: 2,
                  }),
                )}`}
              />

              <Button
                onClick={() => open(StakeTokensModal)}
                className={styles.manageButton}
                variant="secondary"
              >
                Manage
              </Button>
            </div>
          </div>

          <div className={styles.divider} />

          <StakingStat
            classNamesProps={{
              label: styles.totalPointsStaked,
              labelWrapper: styles.labelWrapper,
            }}
            tooltipText="The Banx ecosystem is governed by Partner and Player points. These points determine holder benefits, proportional to total amount of points staked."
            label="Total points staked"
            value={<Totals />}
            flexType="row"
          />
        </div>

        <div className={styles.claimSection}>
          <Title text="Rewards" icon={<MoneyBill />} />

          <div className={styles.claimStatsContainer}>
            <StakingStat
              label="claimable"
              value={formatNumbersWithCommas(banxTokenBNToFixed(rewards, 2))}
              icon={BanxToken}
            />
            <Button
              onClick={claimAction}
              disabled={rewards.eq(ZERO_BN)}
              className={styles.manageButton}
            >
              Claim
            </Button>
          </div>

          <div className={styles.divider} />

          <StakingStat
            label="Total claimed"
            value={formatNumbersWithCommas(banxTokenBNToFixed(totalRewardsHarvested, 2))}
            icon={BanxToken}
            flexType="row"
          />
        </div>
      </div>

      <div className={styles.infoSection}>
        <p>
          <ExclamationCircleOutlined />
          As your Banx NFTs stay in your wallet when used as collateral for a loan on Banx.gg they
          can be sent in Adventures in parallel
        </p>
      </div>
    </div>
  )
}

interface TitleProps {
  text: string
  icon?: JSX.Element
}

const Title: FC<TitleProps> = ({ text, icon }) => (
  <h2 className={styles.titleWrapper}>
    <div className={styles.icon}>{icon}</div>
    <span>{text}</span>
  </h2>
)

const StakingStat: FC<StatsInfoProps> = ({
  value,
  label,
  flexType = 'column',
  classNamesProps,
  ...props
}) => {
  const stakingStatClassNames = {
    container: classNames(
      styles.stakingStatInfo,
      { [styles.col]: flexType === 'column' },
      classNamesProps?.container,
    ),
    value: classNames(styles.value, classNamesProps?.value),
    label: classNames(styles.label, classNamesProps?.label),
    labelWrapper: classNamesProps?.labelWrapper,
  }

  return (
    <StatInfo
      label={label}
      value={value}
      valueType={VALUES_TYPES.STRING}
      flexType={flexType}
      classNamesProps={stakingStatClassNames}
      {...props}
    />
  )
}
