import { OnboardButton } from '@banx/components/Buttons'
import { PageHeaderBackdrop } from '@banx/components/PageHeader'
import { TokenSwitcher } from '@banx/components/TokenSwitcher'

const BorrowHeader = () => {
  return (
    <PageHeaderBackdrop
      title="Borrow"
      titleBtn={<OnboardButton contentType="borrow" />}
      tokenSwitcher={<TokenSwitcher title="Borrow" />}
    ></PageHeaderBackdrop>
  )
}

export default BorrowHeader
