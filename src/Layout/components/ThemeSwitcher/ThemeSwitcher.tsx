import { FC } from 'react'

import { Button } from '@banx/components/Buttons'

import { Theme, useTheme } from '@banx/hooks'
import { Moon, Sun } from '@banx/icons'

interface ThemeSwitcherProps {
  className?: string
}

const ThemeSwitcher: FC<ThemeSwitcherProps> = ({ className }) => {
  const { theme, toggleTheme } = useTheme()

  const Icon = theme === Theme.LIGHT ? Sun : Moon

  return (
    <Button className={className} type="circle" variant="secondary" onClick={toggleTheme}>
      <Icon />
    </Button>
  )
}

export default ThemeSwitcher
