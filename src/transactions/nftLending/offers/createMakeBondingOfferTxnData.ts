import { BN, web3 } from 'fbonds-core'
import { LOOKUP_TABLE } from 'fbonds-core/lib/fbond-protocol/constants'
import {
  BondOfferOptimistic,
  createPerpetualBondOfferBonding,
  getBondingCurveTypeFromLendingToken,
} from 'fbonds-core/lib/fbond-protocol/functions/perpetual'
import { BondFeatures, LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'
import { CreateTxnData, WalletAndConnection } from 'solana-transactions-executor'

import { BONDS } from '@banx/constants'
import { banxSol } from '@banx/transactions'
import { calculateOfferSize, removeDuplicatedPublicKeys } from '@banx/utils'

import { sendTxnPlaceHolder } from '../../helpers'

type CreateMakeBondingOfferTxnData = (params: {
  marketPubkey: string
  loanValue: number //? normal number
  loansAmount: number
  deltaValue: number //? normal number
  tokenType: LendingTokenType
  walletAndConnection: WalletAndConnection
}) => Promise<CreateTxnData<BondOfferOptimistic>>

export const createMakeBondingOfferTxnData: CreateMakeBondingOfferTxnData = async ({
  marketPubkey,
  loanValue,
  loansAmount,
  tokenType,
  deltaValue,
  walletAndConnection,
}) => {
  const bondingCurveType = getBondingCurveTypeFromLendingToken(tokenType)

  const offerSize = calculateOfferSize({ loanValue, loansAmount, deltaValue })

  const { instructions: swapInstructions, lookupTable: swapLookupTable } =
    await banxSol.getSwapSolToBanxSolInstructions({
      inputAmount: new BN(offerSize),
      walletAndConnection,
    })

  const {
    instructions: createInstructions,
    signers: createSigners,
    optimisticResult,
  } = await createPerpetualBondOfferBonding({
    programId: new web3.PublicKey(BONDS.PROGRAM_PUBKEY),
    connection: walletAndConnection.connection,
    accounts: {
      hadoMarket: new web3.PublicKey(marketPubkey),
      userPubkey: walletAndConnection.wallet.publicKey,
    },
    args: {
      loanValue: loanValue,
      delta: deltaValue,
      quantityOfLoans: loansAmount,
      bondingCurveType,
      bondFeature: BondFeatures.AutoReceiveAndReceiveNft,
      collateralsPerToken: 0,
    },
    sendTxn: sendTxnPlaceHolder,
  })

  const { instructions: closeInstructions, lookupTable: closeLookupTable } =
    await banxSol.getCloseBanxSolATAsInstructions({
      walletAndConnection,
    })

  return {
    instructions: [...swapInstructions, ...createInstructions, ...closeInstructions],
    signers: [...createSigners],
    result: optimisticResult,
    lookupTables: removeDuplicatedPublicKeys([
      swapLookupTable,
      new web3.PublicKey(LOOKUP_TABLE),
      closeLookupTable,
    ]),
  }
}
