import {
  COMMUNITY_LINKS,
  DOCUMENTATIONS_LINKS,
  NAVIGATION_LINKS,
  SECONDARY_NAVIGATION_LINKS,
} from '../Navbar/constants'

export const communityLinks = [
  {
    subtitle: 'Community',
    links: COMMUNITY_LINKS,
  },
  {
    subtitle: 'Documentation',
    links: DOCUMENTATIONS_LINKS,
  },
]

export const navigationsLinks = [...NAVIGATION_LINKS, ...SECONDARY_NAVIGATION_LINKS]
