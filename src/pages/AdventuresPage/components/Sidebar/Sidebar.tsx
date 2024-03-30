import { FC, useMemo } from 'react'

import { ExclamationCircleOutlined } from '@ant-design/icons'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { BN, web3 } from 'fbonds-core'
import { BANX_TOKEN_MINT } from 'fbonds-core/lib/fbond-protocol/constants'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { BanxAdventureSubscriptionState } from 'fbonds-core/lib/fbond-protocol/types'
import { chain } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { StatInfo, StatsInfoProps, VALUES_TYPES } from '@banx/components/StatInfo'

import {
  BanxInfoBN,
  BanxStakingSettingsBN,
  convertToBanxAdventure,
  convertToBanxStake,
  convertToBanxStakingSettingsString,
  convertToBanxSubscription,
} from '@banx/api/staking'
import { BANX_TOKEN_DECIMALS, BANX_TOKEN_STAKE_DECIMAL } from '@banx/constants/banxNfts'
import { BanxToken, Gamepad, MoneyBill } from '@banx/icons'
import { StakeNftsModal, StakeTokensModal } from '@banx/pages/AdventuresPage/components'
import {
  banxTokenBNToFixed,
  calcPartnerPoints,
  calculateAdventureRewards,
  calculatePlayerPointsForBanxTokens,
} from '@banx/pages/AdventuresPage/helpers'
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { stakeBanxClaimAction } from '@banx/transactions/banxStaking/stakeBanxClaimAction'
import {
  enqueueSnackbar,
  formatCompact,
  formatNumbersWithCommas,
  fromDecimals,
  usePriorityFees,
} from '@banx/utils'
import { bnToFixed, bnToHuman } from '@banx/utils/bn'

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
  const priorityFees = usePriorityFees()

  const { nfts, banxAdventures, banxTokenStake } = banxStakeInfo

  const nftsCount = nfts?.length.toString() || '0'

  //TODO move to separate function
  const rewards: string = useMemo(() => {
    if (!banxAdventures) return '0'

    const rewardsBN = calculateAdventureRewards(
      banxAdventures.map(({ adventure, adventureSubscription }) => ({
        adventure,
        subscription: adventureSubscription ?? undefined,
      })),
    )

    return banxTokenBNToFixed(rewardsBN, 2)
  }, [banxAdventures])

  const { tokensPerPartnerPoints, rewardsHarvested } = banxStakingSettings

  const tokensPts = calcPartnerPoints(
    banxTokenStake?.tokensStaked ?? new BN(0),
    tokensPerPartnerPoints,
  )

  const totalPtsStr = (tokensPts + (banxTokenStake?.partnerPointsStaked ?? 0)).toFixed(2)

  const claimAction = () => {
    if (!wallet.publicKey?.toBase58() || !banxTokenStake) {
      return
    }

    const banxSubscribeAdventureOptimistic = {
      banxStakingSettings: convertToBanxStakingSettingsString(banxStakingSettings),
      banxAdventures: banxAdventures.map(({ adventure, adventureSubscription }) => ({
        adventure: convertToBanxAdventure(adventure),
        adventureSubscription: adventureSubscription
          ? convertToBanxSubscription(adventureSubscription)
          : undefined,
      })),
      banxTokenStake: banxTokenStake ? convertToBanxStake(banxTokenStake) : undefined,
      //TODO Remove explicit conversion here when sdk updates ready
    } as BanxSubscribeAdventureOptimistic

    const weeks = chain(banxAdventures)
      .filter(
        ({ adventureSubscription }) =>
          adventureSubscription?.adventureSubscriptionState ===
          BanxAdventureSubscriptionState.Active,
      )
      .map(({ adventure }) => adventure.week)
      .value()

    const params = {
      tokenMint: new web3.PublicKey(BANX_TOKEN_MINT),
      optimistic: banxSubscribeAdventureOptimistic,
      priorityFees,
      weeks,
    }

    new TxnExecutor(stakeBanxClaimAction, { wallet, connection })
      .addTxnParam(params)
      .on('pfSuccessEach', (results) => {
        const { txnHash } = results[0]
        enqueueSnackbar({
          message: 'Transaction sent',
          type: 'info',
          solanaExplorerPath: `tx/${txnHash}`,
        })
      })
      .on('pfSuccessAll', () => {
        close()
      })
      .on('pfError', (error) => {
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
      banxTokenStake?.tokensStaked ?? new BN(0),
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
                    value: banxTokenStake?.tokensStaked || new BN(0),
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
              value={formatNumbersWithCommas(
                fromDecimals(rewards.toString(), BANX_TOKEN_STAKE_DECIMAL),
              )}
              icon={BanxToken}
            />
            <Button onClick={claimAction} disabled={!rewards} className={styles.manageButton}>
              Claim
            </Button>
          </div>

          <div className={styles.divider} />

          <StakingStat
            label="Total claimed"
            value={formatNumbersWithCommas(
              bnToHuman(rewardsHarvested, BANX_TOKEN_DECIMALS).toFixed(2),
            )}
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
