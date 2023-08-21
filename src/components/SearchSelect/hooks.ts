import { useRef, useState } from 'react'

import { TABLET_WIDTH } from '@banx/constants'
import { useOnClickOutside, useWindowSize } from '@banx/hooks'

export const useSearchSelect = ({
  selectedOptions,
  collapsed,
  onChangeCollapsed,
}: {
  selectedOptions: string[]
  collapsed?: boolean
  onChangeCollapsed?: (value: boolean) => void
}) => {
  const containerRef = useRef(null)

  const { width } = useWindowSize()
  const isMobile = width <= TABLET_WIDTH

  useOnClickOutside(containerRef, onChangeCollapsed ? () => onChangeCollapsed(true) : () => null)

  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>('')

  const handleDropdownVisibleChange = (visible: boolean) => {
    setIsPopupOpen(visible)
  }

  const showSufixIcon = !selectedOptions?.length && !inputValue
  const showCollapsedContent = collapsed && isMobile && onChangeCollapsed

  const defaultOpen = !collapsed && isMobile

  return {
    containerRef,
    isPopupOpen,
    defaultOpen,

    handleInputChange: setInputValue,
    handleDropdownVisibleChange,

    showSufixIcon,
    showCollapsedContent,
  }
}
