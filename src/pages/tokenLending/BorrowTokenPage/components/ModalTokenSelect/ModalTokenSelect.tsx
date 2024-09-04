import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react'

import { Input } from '@banx/components/inputs/Input'
import { Modal } from '@banx/components/modals/BaseModal'

import { core } from '@banx/api/tokens'
import { useModal } from '@banx/store/common'

import { PinnedTokensList, TokenListItem, TokensListLabels } from './components'
import { PINNED_TOKENS_MINTS } from './constants'

import styles from './ModalTokenSelect.module.less'

export interface BaseToken {
  collateral: core.TokenMeta
  amountInWallet: number
}

interface ModalTokenSelectProps<T extends BaseToken> {
  onChangeToken: (option: BaseToken) => void
  tokensList: T[]
}

const ModalTokenSelect = <T extends BaseToken>({
  tokensList,
  onChangeToken,
}: ModalTokenSelectProps<T>) => {
  const { close: closeModal } = useModal()

  const [searchInput, setSearchInput] = useState('')

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  const filteredTokensList = useMemo(() => {
    const normalizedSearchInput = searchInput.toLowerCase()

    return tokensList.filter(({ collateral }) => {
      const normalizedTicker = collateral.ticker.toLowerCase()
      return normalizedTicker.includes(normalizedSearchInput)
    })
  }, [tokensList, searchInput])

  const pinnedTokensList = useMemo(() => {
    return tokensList.filter((token) => PINNED_TOKENS_MINTS.includes(token.collateral.mint))
  }, [tokensList])

  const handleChangeToken = (token: BaseToken) => {
    onChangeToken(token)
    closeModal()
  }

  const internalRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (internalRef.current) {
      internalRef.current.focus()
    }
  }, [])

  return (
    <Modal className={styles.modal} open width={468} onCancel={closeModal}>
      <div className={styles.searchInputWrapper}>
        <Input
          ref={internalRef}
          value={searchInput}
          onChange={handleSearchInputChange}
          placeholder="Search tokens..."
          className={styles.searchInput}
        />
      </div>

      <PinnedTokensList onChange={handleChangeToken} tokensList={pinnedTokensList} />

      <TokensListLabels />

      <div className={styles.tokensList}>
        {filteredTokensList.map((token) => (
          <TokenListItem
            key={token.collateral.mint}
            token={token}
            onClick={() => handleChangeToken(token)}
          />
        ))}
      </div>
    </Modal>
  )
}

export default ModalTokenSelect
