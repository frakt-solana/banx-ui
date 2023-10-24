import { useEffect, useRef, useState } from 'react'

import { TABLET_WIDTH } from '@banx/constants'
import { useOnClickOutside, useWindowSize } from '@banx/hooks'

const MAX_TAG_TEXT_LENGTH = 15

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

  const handleClickOutside = () => {
    if (onChangeCollapsed) {
      onChangeCollapsed(true)
    }
  }

  useOnClickOutside(containerRef, handleClickOutside)

  const [isPopupOpen, setIsPopupOpen] = useState<boolean>(false)
  const [inputValue, setInputValue] = useState<string>('')

  useEffect(() => {
    setInputValue('')
  }, [selectedOptions])

  const handleInputChange = (value: string) => {
    const limitedValue = value.slice(0, MAX_TAG_TEXT_LENGTH)
    setInputValue(limitedValue)
  }

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

    inputValue,
    handleInputChange,
    handleDropdownVisibleChange,

    showSufixIcon,
    showCollapsedContent,
  }
}
