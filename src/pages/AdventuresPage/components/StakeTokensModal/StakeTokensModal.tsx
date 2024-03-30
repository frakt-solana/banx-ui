import { Button } from '@banx/components/Buttons'
import { Tabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import { useModal } from '@banx/store'

import {
  BanxPointsStats,
  BanxWalletBalance,
  IdleTokensBalance,
  Title,
  TokenInputField,
  TotalStakedInfo,
} from './components'
import { ModalTabs, useStakeTokensModal, useTokenTransactions } from './hooks'

import styles from './StakeTokensModal.module.less'

export const StakeTokensModal = () => {
  const { close } = useModal()
  const {
    onSetMax,
    handleChangeValue,
    isUnstakeDisabled,
    isStakeDisabled,
    partnerPoints,
    idleStakedTokens,
    banxWalletBalance,
    playerPoints,
    idleBanxWalletBalance,
    inputTokenAmount,
    currentTabValue,
    tabProps,
    totalTokenStaked,
    onTabClick,
  } = useStakeTokensModal()

  const { onStake, onUnstake } = useTokenTransactions(inputTokenAmount)

  const isStakeTab = currentTabValue === ModalTabs.STAKE

  return (
    <Modal open onCancel={close} className={styles.modal} width={572}>
      <Tabs value={currentTabValue} onTabClick={onTabClick} {...tabProps} />
      <div className={styles.container}>
        {isStakeTab && <BanxWalletBalance banxWalletBalance={banxWalletBalance} />}
        {!isStakeTab && <TotalStakedInfo tokensStaked={totalTokenStaked} />}

        <TokenInputField value={inputTokenAmount} onChange={handleChangeValue} onMax={onSetMax} />

        <div className={styles.content}>
          <div className={styles.stakeContainer}>
            <Title title={isStakeTab ? 'You will stake' : 'You will unstake'} />
            <BanxPointsStats partnerPoints={partnerPoints} playerPoints={playerPoints} />
          </div>

          {isStakeTab && <IdleTokensBalance label="Idle on wallet" value={idleBanxWalletBalance} />}
          {!isStakeTab && <IdleTokensBalance label="Staked" value={idleStakedTokens} />}
        </div>

        {isStakeTab && (
          <Button onClick={onStake} disabled={isStakeDisabled} className={styles.stakeButton}>
            Stake
          </Button>
        )}
        {!isStakeTab && (
          <Button onClick={onUnstake} disabled={isUnstakeDisabled} className={styles.unstakeButton}>
            Unstake
          </Button>
        )}
      </div>
    </Modal>
  )
}
