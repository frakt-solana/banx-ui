import { ChangeEvent, useMemo, useState } from 'react'

import { Input } from '@banx/components/inputs/Input'
import { Modal } from '@banx/components/modals/BaseModal'

import { core } from '@banx/api/tokens'
import { useModal } from '@banx/store/common'

import { TokenListItem, TokensListLabels } from './components'

import styles from './ModalTokenSelect.module.less'

export interface BaseToken {
  collateral: core.TokenMeta
  amountInWallet: number
}

interface ModalTokenSelectProps<T extends BaseToken> {
  onChangeToken: (option: T) => void
  tokenList: T[]
}

const ModalTokenSelect = <T extends BaseToken>({
  tokenList,
  onChangeToken,
}: ModalTokenSelectProps<T>) => {
  const { close: closeModal } = useModal()

  const [searchInput, setSearchInput] = useState('')

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(event.target.value)
  }

  const filteredTokensList = useMemo(() => {
    const normalizedSearchInput = searchInput.toLowerCase()

    return tokenList.filter(({ collateral }) => {
      const normalizedTicker = collateral.ticker.toLowerCase()
      return normalizedTicker.includes(normalizedSearchInput)
    })
  }, [tokenList, searchInput])

  const handleChangeToken = (token: T) => {
    onChangeToken(token)
    closeModal()
  }

  return (
    <Modal className={styles.modal} open width={468} onCancel={closeModal}>
      <div className={styles.searchInputWrapper}>
        <Input
          value={searchInput}
          onChange={handleSearchInputChange}
          placeholder="Search tokens..."
          className={styles.searchInput}
        />
      </div>

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
