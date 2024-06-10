import { OnboardButton } from '@banx/components/Buttons'
import { PageHeaderBackdrop } from '@banx/components/PageHeader'
import { TokenSwitcher } from '@banx/components/TokenSwitcher'

const LoansHeader = () => {
  return (
    <PageHeaderBackdrop
      title="My loans"
      titleBtn={<OnboardButton contentType="loans" />}
      tokenSwitcher={<TokenSwitcher title="My loans" />}
    ></PageHeaderBackdrop>
  )
}

export default LoansHeader
