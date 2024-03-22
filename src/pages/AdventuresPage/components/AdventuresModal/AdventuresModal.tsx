import { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { TxnExecutor } from 'solana-transactions-executor'

import { Button } from '@banx/components/Buttons'
import { Tab, Tabs, useTabs } from '@banx/components/Tabs'
import { Modal } from '@banx/components/modals/BaseModal'

import {
  Adventure,
  AdventureNft,
  AdventureStatus,
  AdventuresInfo,
  BanxStakeState,
} from '@banx/api/adventures'
import { TENSOR_BANX_MARKET_URL } from '@banx/constants'
import { TensorFilled } from '@banx/icons'
import { useIsLedger, useModal } from '@banx/store'
import { defaultTxnErrorHandler } from '@banx/transactions'
import {
  calcNftsPartnerPoints,
  getAdventureStatus,
  isNftLoaned,
  makeStakeNftAction,
  makeUnstakeNftAction,
} from '@banx/transactions/adventures'
import { enqueueSnackbar, usePriorityFees } from '@banx/utils'

import { isNftStaked } from '../../helpers'
import { useAdventuresInfo } from '../../hooks'

import styles from './AdventuresModal.module.less'

interface AdventuresModalProps {
  adventuresInfo: AdventuresInfo
}

export const AdventuresModal: FC<AdventuresModalProps> = ({ adventuresInfo }) => {
  const { close } = useModal()

  const modalTabs: Tab[] = useMemo(() => {
    const hasStaked = !!adventuresInfo?.nfts?.find(isNftStaked)

    return [
      {
        label: 'Stake',
        value: 'stake',
      },
      {
        label: 'Unstake',
        value: 'unstake',
        disabled: !hasStaked,
      },
    ]
  }, [adventuresInfo])

  const {
    tabs,
    value: tabValue,
    setValue: setTabValue,
  } = useTabs({
    tabs: modalTabs,
    defaultValue: modalTabs[0].value,
  })

  const sortedNfts = useMemo(() => {
    return [...(adventuresInfo?.nfts || [])]
      ?.sort((a, b) => b.meta.name.localeCompare(a.meta.name))
      ?.sort((a, b) => b.meta.partnerPoints - a.meta.partnerPoints)
  }, [adventuresInfo])

  return (
    <Modal className={styles.modal} open onCancel={close} footer={false} width={768} centered>
      <Tabs className={styles.tabs} tabs={tabs} value={tabValue} setValue={setTabValue} />
      {tabValue === modalTabs[0].value && (
        <StakeContent
          adventures={adventuresInfo?.adventures}
          nfts={sortedNfts.filter(
            (nft) => !nft?.banxStake || nft?.banxStake?.banxStakeState !== BanxStakeState.Staked,
          )}
        />
      )}
      {tabValue !== modalTabs[0].value && (
        <UnstakeContent
          nfts={sortedNfts.filter(
            (nft) => nft?.banxStake?.banxStakeState === BanxStakeState.Staked,
          )}
        />
      )}
    </Modal>
  )
}

interface StakeContent {
  nfts: AdventureNft[]
  adventures: Adventure[]
}
const StakeContent: FC<StakeContent> = ({ nfts = [], adventures = [] }) => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { refetch } = useAdventuresInfo()
  const { isLedger } = useIsLedger()
  const { close } = useModal()

  const priorityFees = usePriorityFees()

  const [selectedNfts, setSelectedNfts] = useState<AdventureNft[]>([])

  const toggleNft = useCallback(
    (nft: AdventureNft) => {
      const isNftSelected = selectedNfts.find(({ mint }) => mint === nft.mint)
      if (isNftSelected) {
        return setSelectedNfts((nfts) => nfts.filter(({ mint }) => mint !== nft.mint))
      }
      setSelectedNfts((nfts) => [...nfts, nft])
    },
    [selectedNfts],
  )

  const selectAllNfts = useCallback(() => {
    setSelectedNfts(nfts)
  }, [nfts])

  const deselectAllNfts = useCallback(() => {
    setSelectedNfts([])
  }, [])

  useEffect(() => {
    return () => setSelectedNfts([])
  }, [])

  const onStake = () => {
    try {
      const adventuresToSubscribe = adventures.filter((adventure) => {
        const status = getAdventureStatus(adventure)
        return status === AdventureStatus.UPCOMING
      })

      const params = selectedNfts.map((nft) => ({
        nftMint: nft.mint,
        adventures: adventuresToSubscribe,
        priorityFees,
      }))

      new TxnExecutor(
        makeStakeNftAction,
        { wallet, connection },
        { signAllChunks: isLedger ? 5 : 40 },
      )
        .addTxnParams(params)
        .on('pfSuccessEach', (results) => {
          const { txnHash } = results[0]
          enqueueSnackbar({
            message: 'Staked successfully',
            type: 'success',
            solanaExplorerPath: `tx/${txnHash}`,
          })
        })
        .on('pfSuccessAll', () => {
          close()
          refetch()
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

  return (
    <>
      <div className={styles.content}>
        <ModalStats nfts={nfts} />
        {!!nfts.length && (
          <ul className={styles.nfts}>
            {nfts.map((nft) => (
              <NftCheckbox
                nft={nft}
                key={nft.mint}
                onClick={() => toggleNft(nft)}
                selected={!!selectedNfts.find((selectedNft) => selectedNft.mint === nft.mint)}
              />
            ))}
          </ul>
        )}
        {!nfts.length && <NoNftsPlaceholder />}
      </div>
      <div className={styles.footer}>
        <Button
          variant="secondary"
          className={styles.footerBtn}
          disabled={!nfts.length}
          onClick={!selectedNfts.length ? selectAllNfts : deselectAllNfts}
        >
          {!selectedNfts.length ? 'Select all' : 'Deselect all'}
        </Button>
        <Button
          variant="primary"
          className={styles.footerBtn}
          disabled={!selectedNfts.length}
          onClick={onStake}
        >
          Stake
        </Button>
      </div>
    </>
  )
}

interface UnstakeContent {
  nfts: AdventureNft[]
}
const UnstakeContent: FC<UnstakeContent> = ({ nfts = [] }) => {
  const { connection } = useConnection()
  const wallet = useWallet()
  const { refetch } = useAdventuresInfo()
  const { isLedger } = useIsLedger()
  const { close } = useModal()

  const priorityFees = usePriorityFees()

  const [selectedNfts, setSelectedNfts] = useState<AdventureNft[]>([])

  const toggleNft = useCallback(
    (nft: AdventureNft) => {
      const isNftSelected = selectedNfts.find(({ mint }) => mint === nft.mint)
      if (isNftSelected) {
        return setSelectedNfts((nfts) => nfts.filter(({ mint }) => mint !== nft.mint))
      }
      setSelectedNfts((nfts) => [...nfts, nft])
    },
    [selectedNfts],
  )

  const selectAllNfts = useCallback(() => {
    setSelectedNfts(nfts.filter((nft) => !isNftLoaned(nft)))
  }, [nfts])

  const deselectAllNfts = useCallback(() => {
    setSelectedNfts([])
  }, [])

  useEffect(() => {
    return () => setSelectedNfts([])
  }, [])

  const onUnstake = () => {
    const txnParams = selectedNfts.map((nft) => ({ nft, priorityFees }))

    try {
      new TxnExecutor(
        makeUnstakeNftAction,
        { wallet, connection },
        { signAllChunks: isLedger ? 5 : 40 },
      )
        .addTxnParams(txnParams)
        .on('pfSuccessEach', (results) => {
          const { txnHash } = results[0]
          enqueueSnackbar({
            message: 'Unstaked successfully',
            type: 'success',
            solanaExplorerPath: `tx/${txnHash}`,
          })
        })
        .on('pfSuccessAll', () => {
          close()
          refetch()
        })
        .on('pfError', (error) => {
          defaultTxnErrorHandler(error, {
            additionalData: selectedNfts,
            walletPubkey: wallet?.publicKey?.toBase58(),
            transactionName: 'UnstakeBanx',
          })
        })
        .execute()
    } catch (error) {
      console.error(error)
    }
  }

  const getAdditionalText = useCallback((nft: AdventureNft) => {
    if (isNftLoaned(nft)) return 'loaned'
    return null
  }, [])

  const loanedNfts = useMemo(() => {
    return nfts.filter((nft) => isNftLoaned(nft))
  }, [nfts])

  return (
    <>
      <div className={styles.content}>
        <ModalStats nfts={nfts} />
        {!!nfts.length && (
          <ul className={styles.nfts}>
            {nfts.map((nft) => (
              <NftCheckbox
                nft={nft}
                key={nft.mint}
                onClick={() => toggleNft(nft)}
                disabled={isNftLoaned(nft)}
                additionalText={getAdditionalText(nft) ?? undefined}
                selected={!!selectedNfts.find((selectedNft) => selectedNft.mint === nft.mint)}
              />
            ))}
          </ul>
        )}
        {!nfts.length && <NoNftsPlaceholder />}
      </div>
      <div className={styles.footer}>
        <Button
          variant="secondary"
          className={styles.footerBtn}
          disabled={!nfts.length || loanedNfts.length === nfts.length}
          onClick={!selectedNfts.length ? selectAllNfts : deselectAllNfts}
        >
          {!selectedNfts.length ? 'Select all' : 'Deselect all'}
        </Button>
        <Button
          variant="primary"
          className={styles.footerBtn}
          disabled={!selectedNfts.length}
          onClick={onUnstake}
        >
          Unstake
        </Button>
      </div>
    </>
  )
}

const NoNftsPlaceholder = () => {
  return (
    <div className={styles.noNfts}>
      <p>{`You don't have suitable NFTs or your Banx are listed`}</p>

      <Button variant="secondary" className={styles.tensorBtn}>
        <a href={TENSOR_BANX_MARKET_URL} target="_blank" rel="noopener noreferrer" />
        <TensorFilled />
        Buy banx on tensor
      </Button>
    </div>
  )
}

interface ModalStatsProps {
  nfts: AdventureNft[]
}
const ModalStats: FC<ModalStatsProps> = ({ nfts = [] }) => {
  const walletPartnerPoints = useMemo(() => calcNftsPartnerPoints(nfts), [nfts])

  return (
    <div className={styles.stats}>
      <div className={styles.statsCol}>
        <p>{nfts.length}</p>
        <p>Banx</p>
      </div>
      <div className={styles.statsCol}>
        <p>{walletPartnerPoints}</p>
        <p>Partner points</p>
      </div>
    </div>
  )
}

interface NftCheckboxProps {
  nft: AdventureNft
  selected?: boolean
  additionalText?: string
  disabled?: boolean
  onClick?: () => void
}

const NftCheckbox: FC<NftCheckboxProps> = ({
  nft,
  selected = false,
  additionalText = '',
  disabled = false,
  onClick,
}) => {
  return (
    <div
      className={classNames(
        styles.nft,
        { [styles.nftPointer]: onClick && !disabled },
        { [styles.nftDisabled]: disabled },
      )}
      onClick={onClick}
    >
      <div className={styles.image}>
        {selected && <div className={styles.selected} />}
        {additionalText && !selected && (
          <div className={styles.additionalText}>{additionalText}</div>
        )}
        <img src={nft.meta.imageUrl} alt={nft.meta.name} />
      </div>

      <p>{nft.meta.partnerPoints} Partner points</p>
    </div>
  )
}
