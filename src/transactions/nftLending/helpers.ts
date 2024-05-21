import { EMPTY_PUBKEY } from 'fbonds-core/lib/fbond-protocol/constants'

import { BorrowNft, Loan } from '@banx/api/nft/core'

export const convertLoanToBorrowNft = (loan: Loan): BorrowNft => {
  const { nft, fraktBond, bondTradeTransaction } = loan

  const borrowNft = {
    mint: nft.mint,
    loan: {
      marketPubkey: fraktBond.hadoMarket || EMPTY_PUBKEY.toBase58(),
      fraktMarket: fraktBond.fraktMarket,
      marketApr: bondTradeTransaction.amountOfBonds,
      banxStake: fraktBond.banxStake || EMPTY_PUBKEY.toBase58(),
    },
    nft,
  }

  return borrowNft
}
