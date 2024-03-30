import { useEffect, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN } from 'fbonds-core'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { calculatePlayerPointsForTokens } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxTokenStaking'
import { parseInt } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { StatInfo, VALUES_TYPES } from '@banx/components/StatInfo'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'
import Tooltip from '@banx/components/Tooltip'
import NumericInput from '@banx/components/inputs/NumericInput'
import { Modal } from '@banx/components/modals/BaseModal'

import {
  convertToBanxAdventure,
  convertToBanxStake,
  convertToBanxStakingSettingsString,
  convertToBanxSubscription,
} from '@banx/api/staking'
import { BANX_TOKEN_DECIMALS, BANX_TOKEN_STAKE_DECIMAL } from '@banx/constants'
import { BanxToken } from '@banx/icons'
import {
  banxTokenBNToFixed,
  calcPartnerPoints,
  useBanxStakeInfo,
  useBanxStakeSettings,
} from '@banx/pages/AdventuresPage'
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { stakeBanxTokenAction, unstakeBanxTokenAction } from '@banx/transactions/banxStaking'
import {
  enqueueSnackbar,
  formatNumbersWithCommas,
  fromDecimals,
  toDecimals,
  usePriorityFees,
} from '@banx/utils'
import { bnToHuman } from '@banx/utils/bn'

import styles from './StakeTokensModal.module.less'

//TODO Refactor it completely
export const StakeTokensModal = () => {
  const wallet = useWallet()
  const { connection } = useConnection()
  const priorityFees = usePriorityFees()
  const { banxStakeSettings } = useBanxStakeSettings()
  const { banxStakeInfo } = useBanxStakeInfo()

  const banxWalletBalance = bnToHuman(
    banxStakeInfo?.banxWalletBalance ?? new BN(0),
    BANX_TOKEN_DECIMALS,
  )

  const { close } = useModal()
  const [value, setValue] = useState('0')

  const { value: currentTabValue, ...tabProps } = useTabs({
    tabs: MODAL_TABS,
    defaultValue: MODAL_TABS[0].value,
  })

  const handleChangeValue = (v: string) => {
    const isMaxBanxBalance =
      currentTabValue === ModalTabs.STAKE && parseFloat(v) < banxWalletBalance
    const isMaxStaked =
      currentTabValue === ModalTabs.UNSTAKE &&
      parseFloat(v) <
        bnToHuman(banxStakeInfo?.banxTokenStake?.tokensStaked ?? new BN(0), BANX_TOKEN_DECIMALS)

    if (!v || isMaxBanxBalance || isMaxStaked) {
      setValue(v || '0')
    }
  }

  const calcPts = (value: string) =>
    calcPartnerPoints(
      //TODO Prevent assertion failed for big number (fix with normal string to BN parsing)
      new BN(parseFloat(value)).mul(new BN(10 ** BANX_TOKEN_DECIMALS)),
      banxStakeSettings?.tokensPerPartnerPoints,
    )

  const pointsToReceive = calcPts(value).toFixed(2)

  const onStakeTokens = () => {
    if (!wallet.publicKey || !banxStakeSettings || !value || !banxStakeInfo) {
      return
    }

    const { banxAdventures, banxTokenStake } = banxStakeInfo

    const banxSubscribeAdventureOptimistic = {
      banxStakingSettings: convertToBanxStakingSettingsString(banxStakeSettings),
      banxAdventures: banxAdventures.map(({ adventure, adventureSubscription }) => ({
        adventure: convertToBanxAdventure(adventure),
        adventureSubscription: adventureSubscription
          ? convertToBanxSubscription(adventureSubscription)
          : undefined,
      })),
      banxTokenStake: banxTokenStake ? convertToBanxStake(banxTokenStake) : undefined,
      //TODO Remove explicit conversion here when sdk updates ready
    } as BanxSubscribeAdventureOptimistic

    const txnParam = {
      tokensToStake: toDecimals(parseFloat(value), BANX_TOKEN_STAKE_DECIMAL),
      userPubkey: wallet.publicKey,
      optimistic: banxSubscribeAdventureOptimistic,
      priorityFees,
    }

    new TxnExecutor(stakeBanxTokenAction, { wallet, connection })
      .addTxnParam(txnParam)
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
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Stake banx token',
        })
      })
      .execute()
  }
  const onUnstakeTokens = () => {
    if (!wallet.publicKey || !banxStakeSettings || !value || !banxStakeInfo) {
      return
    }

    const { banxAdventures, banxTokenStake } = banxStakeInfo

    const banxSubscribeAdventureOptimistic = {
      banxStakingSettings: convertToBanxStakingSettingsString(banxStakeSettings),
      banxAdventures: banxAdventures.map(({ adventure, adventureSubscription }) => ({
        adventure: convertToBanxAdventure(adventure),
        adventureSubscription: adventureSubscription
          ? convertToBanxSubscription(adventureSubscription)
          : undefined,
      })),
      banxTokenStake: banxTokenStake ? convertToBanxStake(banxTokenStake) : undefined,
      //TODO Remove explicit conversion here when sdk updates ready
    } as BanxSubscribeAdventureOptimistic

    const txnParam = {
      tokensToUnstake: toDecimals(parseFloat(value), BANX_TOKEN_STAKE_DECIMAL),
      userPubkey: wallet.publicKey,
      optimistic: banxSubscribeAdventureOptimistic,
      priorityFees,
    }

    new TxnExecutor(unstakeBanxTokenAction, { wallet, connection })
      .addTxnParam(txnParam)
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
          additionalData: txnParam,
          walletPubkey: wallet?.publicKey?.toBase58(),
          transactionName: 'Unstake banx token',
        })
      })
      .execute()
  }

  const onSubmit = () => {
    if (currentTabValue === ModalTabs.STAKE) {
      return void onStakeTokens()
    }

    return void onUnstakeTokens()
  }

  const idleOnWallet = formatNumbersWithCommas(
    (
      fromDecimals(banxWalletBalance || 0, BANX_TOKEN_STAKE_DECIMAL) - parseFloat(value || '0')
    ).toFixed(0),
  )
  const banxBalance = formatNumbersWithCommas(
    parseFloat(fromDecimals(banxWalletBalance, BANX_TOKEN_STAKE_DECIMAL)),
  )
  const tokensStaked = formatNumbersWithCommas(
    (
      bnToHuman(banxStakeInfo?.banxTokenStake?.tokensStaked ?? new BN(0)) - parseFloat(value || '0')
    ).toFixed(0),
  )

  const ptsAmount = formatNumbersWithCommas(
    calcPts(
      banxTokenBNToFixed(banxStakeInfo?.banxTokenStake?.tokensStaked ?? new BN(0), 2),
    ).toFixed(2),
  )

  const disabledBtn = useMemo(() => {
    const emptyValue = !parseFloat(value)
    const notEnoughStake =
      currentTabValue === ModalTabs.STAKE &&
      parseFloat(fromDecimals(banxWalletBalance, BANX_TOKEN_STAKE_DECIMAL)) < parseFloat(value)
    const notEnoughUnStake =
      currentTabValue === ModalTabs.UNSTAKE &&
      bnToHuman(banxStakeSettings?.tokensStaked || new BN(0), BANX_TOKEN_DECIMALS) <
        parseFloat(value)

    return emptyValue || notEnoughStake || notEnoughUnStake
  }, [value, banxWalletBalance, currentTabValue, banxStakeSettings?.tokensStaked])

  const onSetMax = () => {
    if (currentTabValue === ModalTabs.STAKE) {
      return setValue(fromDecimals(banxWalletBalance.toString() || 0, BANX_TOKEN_STAKE_DECIMAL))
    }
    return setValue(banxTokenBNToFixed(banxStakeInfo?.banxTokenStake?.tokensStaked ?? new BN(0), 2))
  }

  useEffect(() => {
    setValue('0')
  }, [currentTabValue])

  const calcTokensPlayersPoints = calculatePlayerPointsForTokens(
    parseFloat(toDecimals(parseFloat(value))),
  ).toFixed(2)

  return (
    <Modal className={styles.modal} open onCancel={close} footer={false} width={572} centered>
      <Tabs value={currentTabValue} {...tabProps} />
      <div className={styles.container}>
        {currentTabValue === ModalTabs.STAKE && (
          <div className={styles.row}>
            <span className={styles.uppercaseText}>Wallet balance</span>
            <span className={styles.valueText}>{banxBalance}</span>
            <BanxToken />
          </div>
        )}

        {currentTabValue === ModalTabs.UNSTAKE && (
          <div className={styles.row}>
            <span className={styles.uppercaseText}>Total staked</span>
            <span className={styles.valueText}>{tokensStaked}</span>
            <BanxToken />
            <span className={styles.valueText}>{ptsAmount} pts</span>
          </div>
        )}

        <div className={styles.input}>
          <NumericInput
            positiveOnly
            onChange={handleChangeValue}
            value={parseInt(value).toFixed(0)}
          />
          <Button size="small" variant="secondary" onClick={onSetMax}>
            Use max
          </Button>
        </div>

        {currentTabValue === ModalTabs.STAKE && (
          <div className={styles.stats}>
            <div className={styles.youWillStake}>
              <p className={styles.title}>
                <span>You will stake</span>
                <Tooltip title="The Banx ecosystem is governed by Partner and Player points. These points determine holder benefits, proportional to total amount of points staked." />
              </p>

              <div className={styles.valuesRaw}>
                <div className={styles.values}>
                  <span>{pointsToReceive}</span>
                  <span>PARTNER POINTS</span>
                </div>
                <div className={styles.values}>
                  <span>{calcTokensPlayersPoints}</span>
                  <span>player POINTS</span>
                </div>
              </div>
            </div>
            <StatInfo
              label="Idle on wallet"
              value={idleOnWallet}
              valueType={VALUES_TYPES.STRING}
              classNamesProps={{ value: styles.value }}
              icon={BanxToken}
              flexType="row"
            />
          </div>
        )}

        {currentTabValue === ModalTabs.UNSTAKE && (
          <div className={styles.stats}>
            <div className={styles.youWillStake}>
              <p className={styles.title}>
                <span>You will unstake</span>
                <Tooltip title="The Banx ecosystem is governed by Partner and Player points. These points determine holder benefits, proportional to total amount of points staked." />
              </p>

              <div className={styles.valuesRaw}>
                <div className={styles.values}>
                  <span>{pointsToReceive}</span>
                  <span>PARTNER POINTS</span>
                </div>
                <div className={styles.values}>
                  <span>{calcTokensPlayersPoints}</span>
                  <span>player POINTS</span>
                </div>
              </div>
            </div>

            <StatInfo
              label="Staked"
              value={tokensStaked}
              valueType={VALUES_TYPES.STRING}
              classNamesProps={{ value: styles.value }}
              icon={BanxToken}
              flexType="row"
            />
          </div>
        )}

        <Button
          disabled={disabledBtn}
          size="default"
          variant="primary"
          className={styles.btn}
          onClick={onSubmit}
        >
          {currentTabValue === ModalTabs.STAKE && 'Stake'}
          {currentTabValue === ModalTabs.UNSTAKE && 'Unstake'}
        </Button>
      </div>
    </Modal>
  )
}

enum ModalTabs {
  STAKE = 'stake',
  UNSTAKE = 'unstake',
}

const MODAL_TABS: Tab[] = [
  {
    label: 'Stake',
    value: ModalTabs.STAKE,
  },
  {
    label: 'Unstake',
    value: ModalTabs.UNSTAKE,
  },
]
