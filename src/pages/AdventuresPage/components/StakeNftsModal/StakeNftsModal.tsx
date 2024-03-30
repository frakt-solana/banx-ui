import { useEffect, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { web3 } from 'fbonds-core'
import { BanxSubscribeAdventureOptimistic } from 'fbonds-core/lib/fbond-protocol/functions/banxStaking/banxAdventure'
import { BanxStakeState } from 'fbonds-core/lib/fbond-protocol/types'
// import { keyBy } from 'lodash'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import {
  BanxStakeNft,
  convertToBanxAdventure,
  convertToBanxStake,
  convertToBanxStakingSettingsString,
  convertToBanxSubscription,
  convertToStake,
} from '@banx/api/staking'
import { BANX_STAKING } from '@banx/constants'
import { TensorFilled } from '@banx/icons'
import { useBanxStakeInfo, useBanxStakeSettings } from '@banx/pages/AdventuresPage'
import { NftCheckbox, NftsStats } from '@banx/pages/AdventuresPage/components'
import { useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import { stakeBanxNftAction, unstakeBanxNftsAction } from '@banx/transactions/banxStaking'
import { enqueueSnackbar, usePriorityFees } from '@banx/utils'

import styles from './StakeNftsModal.module.less'

//TODO Refactor
export const StakeNftsModal = () => {
  const { connection } = useConnection()
  const wallet = useWallet()

  const { close } = useModal()
  const priorityFees = usePriorityFees()
  const { banxStakeSettings /* setBanxTokenSettingsOptimistic */ } = useBanxStakeSettings()
  const { banxStakeInfo /* setBanxTokenStakeOptimistic */ } = useBanxStakeInfo()

  const [selectedNfts, setSelectedNfts] = useState<BanxStakeNft[]>([])

  const { value: currentTab, ...tabsProps } = useTabs({
    tabs: MODAL_TABS,
    defaultValue: MODAL_TABS[0].value,
  })

  const isNftSelected = (mint: string) =>
    !!selectedNfts.find(({ mint: nftMint }) => nftMint === mint)

  const onSelect = (nft: BanxStakeNft) => {
    const isSelected = isNftSelected(nft.mint)

    if (isSelected) {
      return setSelectedNfts((prev) => prev.filter(({ mint }) => mint !== nft.mint))
    }

    return setSelectedNfts((prev) => [...prev, nft])
  }
  const onSelectAll = () => {
    const hasSelected = !!selectedNfts.length

    if (hasSelected) {
      return setSelectedNfts([])
    }

    return setSelectedNfts(filteredNfts)
  }

  const filteredNfts = useMemo(() => {
    if (!banxStakeInfo?.nfts?.length) return []

    const { nfts } = banxStakeInfo

    if (currentTab === MODAL_TABS[0].value) {
      return nfts.filter(
        (nft) => !nft?.stake || nft?.stake?.banxStakeState === BanxStakeState.Unstaked,
      )
    }

    return nfts.filter((nft) => nft?.stake?.banxStakeState === BanxStakeState.Staked)
  }, [banxStakeInfo, currentTab])

  const onStake = () => {
    try {
      if (!wallet.publicKey || !banxStakeSettings || !banxStakeInfo) {
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

      const params = selectedNfts.map((nft) => ({
        tokenMint: new web3.PublicKey(nft.mint),
        whitelistEntry: new web3.PublicKey(BANX_STAKING.WHITELIST_ENTRY_PUBKEY),
        hadoRegistry: new web3.PublicKey(BANX_STAKING.HADO_REGISTRY_PUBKEY),
        banxPointsMap: nft.pointsMap,
        optimistic: banxSubscribeAdventureOptimistic,
        priorityFees,
      }))

      new TxnExecutor(stakeBanxNftAction, { wallet, connection })
        .addTxnParams(params)
        .on('pfSuccessEach', (results) => {
          const { txnHash } = results[0]
          enqueueSnackbar({
            message: 'Transaction sent',
            type: 'info',
            solanaExplorerPath: `tx/${txnHash}`,
          })
          // results.forEach(({ result }) => {
          //   if (result) {
          //     const banxAdventuresMap = keyBy(
          //       result.banxAdventures,
          //       ({ adventure }) => adventure.publicKey,
          //     )

          //     const updatedBanxTokenStake = {
          //       ...banxStake,
          //       banxTokenStake: result.banxTokenStake,
          //       banxAdventures: result.banxAdventures.map(
          //         (adv) => banxAdventuresMap[adv.adventure && adv.adventure.publicKey] || adv,
          //       ),
          //     }

          //     setBanxTokenStakeOptimistic(walletPubkey, updatedBanxTokenStake)
          //     setBanxTokenSettingsOptimistic({ ...result.banxStakingSettings })
          //   }
          // })
        })
        .on('pfSuccessAll', () => {
          close()
        })
        .on('pfError', (error) => {
          defaultTxnErrorHandler(error, {
            additionalData: params,
            walletPubkey: wallet?.publicKey?.toBase58(),
            transactionName: 'StakeBanx',
          })
        })
        .execute()
    } catch (error) {
      console.error(error)
    }
  }
  const onUnstake = () => {
    try {
      if (!wallet.publicKey?.toBase58() || !banxStakeSettings || !banxStakeInfo) {
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

      const params = selectedNfts.map((nft) => ({
        tokenMint: new web3.PublicKey(nft.mint),
        userPubkey: wallet.publicKey as web3.PublicKey,
        optimistic: {
          banxSubscribeAdventureOptimistic,
          banxStake: convertToStake(nft.stake),
        },
        priorityFees,
      }))

      new TxnExecutor(unstakeBanxNftsAction, { wallet, connection })
        .addTxnParams(params)
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
            transactionName: 'UnstakeBanx',
          })
        })
        .execute()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    setSelectedNfts([])
  }, [currentTab])

  const disabledSelect = !!filteredNfts.filter(({ isLoaned }) => !isLoaned).length

  return (
    <Modal className={styles.modal} open onCancel={close} footer={false} width={768} centered>
      <Tabs className={styles.tabs} value={currentTab} {...tabsProps} />

      <div className={styles.content}>
        <NftsStats nfts={filteredNfts} />
        {!filteredNfts.length && (
          <div className={styles.emptyNfts}>
            You don’t have suitable NFTs or your Banx is listed
          </div>
        )}
        {!!filteredNfts.length && (
          <ul className={styles.nfts}>
            {filteredNfts.map((nft) => (
              <NftCheckbox
                disabled={nft?.isLoaned}
                key={nft.mint}
                nft={nft}
                onClick={() => onSelect(nft)}
                selected={isNftSelected(nft.mint)}
              />
            ))}
          </ul>
        )}
      </div>
      <div className={styles.footerEmpty}>
        {!filteredNfts.length && (
          <Button className={styles.footerTensorBtn}>
            <a href="https://www.tensor.trade/trade/banx" target="_blank" rel="noreferrer">
              <TensorFilled />
              <span>Buy Banx on Tensor</span>
            </a>
          </Button>
        )}
      </div>
      {!!filteredNfts.length && (
        <div className={styles.footer}>
          <>
            <Button
              variant="secondary"
              className={styles.footerBtn}
              disabled={!disabledSelect}
              onClick={onSelectAll}
            >
              {!Object.values(selectedNfts).length ? 'Select all' : 'Deselect all'}
            </Button>
            <Button
              variant="primary"
              className={styles.footerBtn}
              disabled={!Object.values(selectedNfts).length}
              onClick={currentTab === MODAL_TABS[0].value ? onStake : onUnstake}
            >
              {currentTab === MODAL_TABS[0].value && 'Stake'}
              {currentTab === MODAL_TABS[1].value && 'Unstake'}
            </Button>
          </>
        </div>
      )}
    </Modal>
  )
}

const MODAL_TABS: Tab[] = [
  {
    label: 'Stake',
    value: 'stake',
  },
  {
    label: 'Unstake',
    value: 'unstake',
  },
]
