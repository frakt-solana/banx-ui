import { OnboardButton } from '@banx/components/Buttons'
import { PageHeaderBackdrop } from '@banx/components/PageHeader'
import { TokenSwitcher } from '@banx/components/TokenSwitcher'

const OffersHeader = () => {
  return (
    <PageHeaderBackdrop
      title="My offers"
      titleBtn={<OnboardButton contentType="offers" />}
      tokenSwitcher={<TokenSwitcher title="My offers" />}
    ></PageHeaderBackdrop>
  )
}

export default OffersHeader
