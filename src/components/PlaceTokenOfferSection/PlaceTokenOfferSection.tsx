import { FC } from 'react'

import { useWallet } from '@solana/wallet-adapter-react'
import { MAX_APR_SPL } from 'fbonds-core/lib/fbond-protocol/constants'
import { LendingTokenType } from 'fbonds-core/lib/fbond-protocol/types'

import { TokenMarketPreview } from '@banx/api/tokens'
import { useNftTokenType } from '@banx/store/nft'
import {
  convertToDecimalString,
  getTokenDecimals,
  getTokenUnit,
  isBanxSolTokenType,
} from '@banx/utils'

import { Button } from '../Buttons'
import { InputErrorMessage, NumericStepInput } from '../inputs'
import { ActionsButtons } from './components/ActionsButtons'
import { AdditionalSummary } from './components/Summary'
import { formatLeadingZeros, getCollateralDecimalPlaces } from './helpers'
import { usePlaceTokenOffer } from './hooks/usePlaceTokenOffer'

import styles from './PlaceTokenOfferSection.module.less'

interface PlaceTokenOfferSectionProps {
  marketPubkey: string
  offerPubkey?: string
}

const PlaceTokenOfferSection: FC<PlaceTokenOfferSectionProps> = ({
  marketPubkey,
  offerPubkey = '',
}) => {
  const {
    isEditMode,
    market,
    collateralsPerTokenString,
    offerSizeString,
    aprString,
    onAprChange,
    onLoanValueChange,
    onOfferSizeChange,
    aprErrorMessage,
    offerErrorMessage,
    onCreateTokenOffer,
    onUpdateTokenOffer,
    onRemoveTokenOffer,
    disablePlaceOffer,
    disableUpdateOffer,
  } = usePlaceTokenOffer(marketPubkey, offerPubkey)

  const { connected } = useWallet()

  const { tokenType } = useNftTokenType()

  const marketTokenDecimals = getTokenDecimals(tokenType) //? 1e6, 1e9

  const inputStepByTokenType = isBanxSolTokenType(tokenType) ? 0.1 : 1

  return (
    <>
      <div className={styles.fieldsColumn}>
        <NumericStepInput
          label="Offer"
          value={collateralsPerTokenString}
          onChange={onLoanValueChange}
          postfix={getTokenUnit(tokenType)}
          disabled={!connected}
          step={inputStepByTokenType}
          rightLabelJSX={
            <MaxOfferControls market={market} onChange={onLoanValueChange} tokenType={tokenType} />
          }
        />
        <div className={styles.fieldsRow}>
          <div className={styles.fieldColumn}>
            <NumericStepInput
              label="Offer size"
              value={offerSizeString}
              onChange={onOfferSizeChange}
              postfix={getTokenUnit(tokenType)}
              disabled={!connected}
              step={inputStepByTokenType}
            />
            <div className={styles.messageContainer}>
              {offerErrorMessage && <InputErrorMessage message={offerErrorMessage} />}
            </div>
          </div>

          <div className={styles.fieldColumn}>
            <NumericStepInput
              label="Apr"
              value={aprString}
              onChange={onAprChange}
              postfix="%"
              disabled={!connected}
              step={1}
              max={MAX_APR_SPL / 100}
            />
            <div className={styles.messageContainer}>
              {aprErrorMessage && <InputErrorMessage message={aprErrorMessage} />}
            </div>
          </div>
        </div>
      </div>

      <AdditionalSummary
        market={market}
        collateralPerToken={collateralsPerTokenString}
        offerSize={parseFloat(offerSizeString) * marketTokenDecimals}
        apr={parseFloat(aprString)}
      />

      <ActionsButtons
        onCreateOffer={onCreateTokenOffer}
        onRemoveOffer={onRemoveTokenOffer}
        onUpdateOffer={onUpdateTokenOffer}
        disablePlaceOffer={disablePlaceOffer}
        disableUpdateOffer={disableUpdateOffer}
        isEditMode={isEditMode}
      />
    </>
  )
}

export default PlaceTokenOfferSection

interface MaxOfferControlsProps {
  market: TokenMarketPreview | undefined
  onChange: (value: string) => void
  tokenType: LendingTokenType
}

const PERCENTAGES = [60, 75, 90]
const MaxOfferControls: FC<MaxOfferControlsProps> = ({ market, onChange, tokenType }) => {
  const { collateralPrice = 0, bestOffer = 0 } = market || {}

  const tokenDecimals = getTokenDecimals(tokenType) //? 1e6, 1e9

  const onChangePercent = (percent: number) => {
    const value = ((collateralPrice / tokenDecimals) * percent) / 100

    const adjustedValue = parseFloat(value.toPrecision(4))
    const decimalString = convertToDecimalString(adjustedValue, 2)

    onChange(decimalString)
  }

  const onChangeTopOffer = () => {
    const value = bestOffer / tokenDecimals

    const decimalPlaces = getCollateralDecimalPlaces(value)
    const formattedValue = formatLeadingZeros(value, decimalPlaces)

    onChange(formattedValue)
  }

  return (
    <div className={styles.maxOfferControls}>
      <span className={styles.maxOfferLabel}>LTV</span>

      {PERCENTAGES.map((percent) => (
        <Button
          key={percent}
          onClick={() => onChangePercent(percent)}
          className={styles.maxOfferControlsButton}
          variant="tertiary"
          size="small"
        >
          {percent}%
        </Button>
      ))}
      <Button
        onClick={onChangeTopOffer}
        className={styles.maxOfferControlsButton}
        disabled={!bestOffer}
        variant="tertiary"
        size="small"
      >
        Top
      </Button>
    </div>
  )
}
