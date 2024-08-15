import Checkbox from '@banx/components/Checkbox'
import { MAX_APR_VALUE } from '@banx/components/PlaceOfferSection'
import { ColumnType } from '@banx/components/Table'
import { DisplayValue, HeaderCell, createPercentValueJSX } from '@banx/components/TableComponents'

import { Offer } from '@banx/api/nft'
import { calculateIdleFundsInOffer } from '@banx/utils'

import styles from './OrderBook.module.less'

export const getTableColumns = () => {
  const columns: ColumnType<Offer>[] = [
    {
      key: 'borrow',
      title: (
        <div className={styles.checkboxRow}>
          <Checkbox className={styles.checkbox} onChange={() => null} checked={false} />
          <HeaderCell label="To borrow" />
        </div>
      ),
      render: (offer) => (
        <div className={styles.checkboxRow}>
          <Checkbox className={styles.checkbox} onChange={() => null} checked={false} />
          <DisplayValue value={calculateIdleFundsInOffer(offer).toNumber()} />
        </div>
      ),
    },
    {
      key: 'apr',
      title: <HeaderCell label="APR" />,
      render: () => createPercentValueJSX(MAX_APR_VALUE),
    },
    {
      key: 'offerSize',
      title: <HeaderCell label="Offer size" />,
      render: (offer) => <DisplayValue value={calculateIdleFundsInOffer(offer).toNumber()} />,
    },
  ]

  return columns
}
