import { DISCORD, DOCS_URL, GITHUB_URL, X_URL } from '@banx/constants'
import { Borrow, Dashboard, Discord, Docs, Github, Lend, Rewards, Twitter } from '@banx/icons'
import { StakeFilled } from '@banx/icons/Stake'
import { PATHS } from '@banx/router'

const COMMON_NAVIGATION_LINKS = [
  {
    label: 'Dashboard',
    pathname: PATHS.DASHBOARD,
    icon: Dashboard,
    primary: true,
  },
]

export const NFT_NAVIGATION_LINKS = [
  ...COMMON_NAVIGATION_LINKS,
  {
    label: 'Borrow',
    pathname: PATHS.BORROW,
    icon: Borrow,
    primary: true,
  },
  {
    label: 'My loans',
    pathname: PATHS.LOANS,
  },
  {
    label: 'Lend',
    pathname: PATHS.LEND,
    icon: Lend,
    primary: true,
  },
  {
    label: 'My offers',
    pathname: PATHS.OFFERS,
  },
]

export const TOKEN_NAVIGATION_LINKS = [
  ...COMMON_NAVIGATION_LINKS,
  {
    label: 'Borrow',
    pathname: PATHS.BORROW_TOKEN,
    icon: Borrow,
    primary: true,
  },
  {
    label: 'My loans',
    pathname: PATHS.LOANS_TOKEN,
  },
  {
    label: 'Lend',
    pathname: PATHS.LEND_TOKEN,
    icon: Lend,
    primary: true,
  },
  {
    label: 'My offers',
    pathname: PATHS.OFFERS_TOKEN,
  },
]

export const SECONDARY_NAVIGATION_LINKS = [
  {
    label: 'Rewards',
    pathname: PATHS.LEADERBOARD,
    icon: Rewards,
  },
  {
    label: 'Stake',
    pathname: PATHS.ADVENTURES,
    icon: StakeFilled,
  },
]

export const EXTERNAL_LINKS = [
  {
    label: 'X',
    href: X_URL,
    icon: Twitter,
  },
  {
    label: 'Discord',
    href: DISCORD.SERVER_URL,
    icon: Discord,
  },
  {
    label: 'Docs',
    href: DOCS_URL,
    icon: Docs,
  },
  {
    label: 'Github',
    href: GITHUB_URL,
    icon: Github,
  },
]
