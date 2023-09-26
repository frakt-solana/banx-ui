import { FC, useMemo } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import classNames from 'classnames'
import { staking } from 'fbonds-core/lib/fbond-protocol/functions'
import { Adventure, BanxUser } from 'fbonds-core/lib/fbond-protocol/types'
import { capitalize } from 'lodash'

import { AdventureNft, AdventureStatus, AdventuresInfo } from '@banx/api/adventures'
import { useModal } from '@banx/store'
import { getAdventureStatus, isNftParticipating } from '@banx/transactions/adventures'

import { AdventuresModal } from '../AdventuresModal'
import {
  AdventureStatusLine,
  AdventureSubscribeButton,
  AdventuresTimer,
  NotParticipatedColumn,
  TotalParticipationColumn,
  WalletParticipationColumn,
} from './components'

import styles from './AdventuresList.module.less'

interface AdventuresCardProps {
  adventure: Adventure
  banxUser?: BanxUser
  nfts?: AdventureNft[]
  walletConnected?: boolean
  setNftsModalOpen: (nextValue: boolean) => void
}

const AdventuresCard: FC<AdventuresCardProps> = (props) => {
  const adventureStatus = getAdventureStatus(props.adventure)

  const isEnded = adventureStatus === AdventureStatus.ENDED

  const isParticipating = useMemo(() => {
    if (props.nfts?.length) {
      return !!props.nfts.find((nft) => isNftParticipating(nft, props.adventure.publicKey))
    }

    return false
  }, [props.nfts, props.adventure])

  return (
    <li className={styles.card}>
      <div className={styles.header}>
        <h3 className={classNames(styles.title, { [styles.titleEnded]: isEnded })}>
          Week {staking.helpers.adventureTimestampToWeeks(props.adventure.periodStartedAt)}
        </h3>
        <p className={classNames(styles.status, styles[`status__${adventureStatus}`])}>
          {capitalize(adventureStatus)}
        </p>
      </div>
      <div className={styles.info}>
        {!isEnded && <AdventuresTimer {...props} />}

        <div className={styles.stats}>
          <TotalParticipationColumn {...props} />

          {isParticipating && props.walletConnected && <WalletParticipationColumn {...props} />}

          {!isParticipating && props.walletConnected && <NotParticipatedColumn {...props} />}
        </div>

        {props.walletConnected && (
          <div className={styles.statusAndBtnWrapper}>
            {!isEnded && <AdventureStatusLine {...props} />}
            <AdventureSubscribeButton {...props} />
          </div>
        )}
      </div>
    </li>
  )
}

interface AdventuresListProps {
  adventuresInfo: AdventuresInfo
  historyMode?: boolean
  className?: string
}

export const AdventuresList: FC<AdventuresListProps> = ({
  adventuresInfo,
  historyMode,
  className,
}) => {
  const { connected } = useWallet()
  const { open } = useModal()

  const filteredAdventures = useMemo(() => {
    const filteredAdventures = adventuresInfo.adventures.filter((adventure) => {
      const adventureStatus = getAdventureStatus(adventure)
      const isEnded = adventureStatus === AdventureStatus.ENDED
      return historyMode ? isEnded : !isEnded
    })

    return historyMode
      ? filteredAdventures.sort((adventureA, adventureB) => {
          return (
            staking.helpers.adventureTimestampToWeeks(adventureB.periodStartedAt) -
            staking.helpers.adventureTimestampToWeeks(adventureA.periodStartedAt)
          )
        })
      : filteredAdventures
  }, [adventuresInfo, historyMode])

  return (
    <ul className={classNames(styles.list, className)}>
      {filteredAdventures.map((adventure) => (
        <AdventuresCard
          key={adventure.publicKey}
          adventure={adventure}
          banxUser={adventuresInfo?.banxUserPDA}
          walletConnected={connected}
          nfts={adventuresInfo?.nfts}
          setNftsModalOpen={() => open(AdventuresModal, { adventuresInfo })}
        />
      ))}
    </ul>
  )
}
