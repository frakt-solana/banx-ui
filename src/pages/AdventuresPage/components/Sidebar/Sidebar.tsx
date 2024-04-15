import { FC } from 'react'

import classNames from 'classnames'

import { BanxInfoBN, BanxStakingSettingsBN } from '@banx/api/staking'
import { BANX_TOKEN_DECIMALS } from '@banx/constants'
import { Gamepad, MoneyBill } from '@banx/icons'
import { banxTokenBNToFixed } from '@banx/pages/AdventuresPage'
import { StakeNftsModal, StakeTokensModal } from '@banx/pages/AdventuresPage/components'
import { useModal } from '@banx/store'
import { ZERO_BN, bnToFixed, formatCompact, formatNumbersWithCommas } from '@banx/utils'

import {
  ClaimSection,
  InfoSection,
  ManageStakeSection,
  Title,
  TotalClaimedSection,
  WalletStakedStatsSection,
} from './components'
import { useAdventuresSidebar } from './hooks'

import styles from './Sidebar.module.less'

interface SidebarProps {
  className?: string
  banxStakingSettings: BanxStakingSettingsBN
  banxStakeInfo: BanxInfoBN
}

export const Sidebar: FC<SidebarProps> = ({ className, banxStakingSettings, banxStakeInfo }) => {
  const { nfts, banxTokenStake } = banxStakeInfo

  const {
    walletRewards,
    walletRewardsHarvestedTotal,
    totalPartnerPoints,
    totalPlayersPoints,
    claimBanx,
  } = useAdventuresSidebar({
    banxStakingSettings,
    banxStakeInfo,
  })
  const { open } = useModal()

  const stakedNftsValue = `${formatNumbersWithCommas(
    banxTokenStake?.banxNftsStakedQuantity || 0,
  )}/${formatNumbersWithCommas(nfts?.length.toString() || '0')}`

  const stakedTokensValue = `${formatCompact(
    bnToFixed({
      value: banxTokenStake?.tokensStaked ?? ZERO_BN,
      decimals: BANX_TOKEN_DECIMALS,
      fractionDigits: 2,
    }),
  )}`

  return (
    <div className={classNames(styles.sidebar, className)}>
      <div className={styles.sidebarContent}>
        <Title text="My squad" icon={<Gamepad />} className={styles.mySquadTitle} />

        <ManageStakeSection
          onClick={() => open(StakeNftsModal)}
          label="NFTs staked"
          value={stakedNftsValue}
          className={styles.manageNftsSection}
        />

        <ManageStakeSection
          onClick={() => open(StakeTokensModal)}
          label="Tokens staked"
          value={stakedTokensValue}
          className={styles.manageTokensSection}
        />

        <WalletStakedStatsSection
          totalPartnerPoints={totalPartnerPoints}
          totalPlayersPoints={totalPlayersPoints}
          className={styles.walletStakedStatsSectionAdditional}
        />

        <Title text="Rewards" icon={<MoneyBill />} className={styles.rewardsTitle} />

        <ClaimSection
          value={formatNumbersWithCommas(banxTokenBNToFixed(walletRewards, 2))}
          onClick={claimBanx}
          disabled={walletRewards.eq(ZERO_BN)}
          className={styles.claimSectionAdditional}
        />

        <TotalClaimedSection
          value={formatNumbersWithCommas(banxTokenBNToFixed(walletRewardsHarvestedTotal, 2))}
          className={styles.totalClaimedSectionAdditional}
        />

        <InfoSection className={styles.infoSectionAdditional} />
      </div>
    </div>
  )
}
