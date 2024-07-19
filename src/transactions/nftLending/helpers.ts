import { web3 } from 'fbonds-core'

import { coreNew } from '@banx/api/nft'

export const convertLoanToBorrowNft = (loan: coreNew.Loan): coreNew.BorrowNft => {
  const { nft, fraktBond, bondTradeTransaction } = loan

  const borrowNft = {
    mint: nft.mint,
    loan: {
      marketPubkey: fraktBond.hadoMarket || web3.PublicKey.default,
      fraktMarket: fraktBond.fraktMarket,
      marketApr: bondTradeTransaction.amountOfBonds,
      banxStake: fraktBond.banxStake || web3.PublicKey.default,
    },
    nft,
  }

  return borrowNft
}
