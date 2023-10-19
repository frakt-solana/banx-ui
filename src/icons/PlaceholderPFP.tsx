import { FC, SVGProps } from 'react'

export const PlaceholderPFP: FC<SVGProps<SVGSVGElement>> = (props) => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" {...props}>
    <rect x="0.5" y="0.5" width="99" height="99" fill="#EFEFEF" stroke="#CCCCCC" />
    <path
      d="M25.4866 94.5715C23.742 95.685 22.2797 97.1164 21.1578 98.876C20.9452 99.2099 20.7676 99.5761 20.6293 99.9486H73.9531C73.3381 98.8245 72.5062 97.8587 71.6556 96.9118C70.4561 95.5771 69.1751 94.3496 67.4671 93.6851C67.4526 93.6795 67.4449 93.6571 67.4343 93.642C67.782 93.2821 67.761 92.9964 67.3562 92.6974C66.795 92.2832 66.1478 92.0597 65.4884 91.8696C64.1864 91.494 62.9303 91.0133 61.7652 90.3035C60.3783 89.4589 59.5032 88.2432 59.1272 86.6619C59.0634 86.3936 59.0429 86.1103 59.039 85.833C59.034 85.4937 59.0967 85.4669 59.4289 85.4429C60.147 85.3909 60.8702 85.3618 61.5789 85.2473C63.0784 85.0047 64.5385 84.6095 65.9304 83.9745C66.2426 83.8326 66.602 83.7566 66.9452 83.7303C68.0028 83.6492 69.0742 83.6816 70.1217 83.5369C74.1472 82.9813 77.7556 81.4436 80.7973 78.6875C81.5421 78.0129 82.1937 77.2303 82.8625 76.4741C83.1325 76.1683 82.9861 75.8766 82.5757 75.8497C82.263 75.8291 81.9474 75.8358 81.6336 75.8425C80.3221 75.8699 79.0333 75.7117 77.7673 75.3668C77.6841 75.3445 77.6026 75.3143 77.5066 75.283C77.5787 75.1214 77.6436 74.9979 77.6902 74.8677C77.7401 74.7279 77.7589 74.5759 77.8194 74.4418C77.851 74.3713 77.9325 74.3015 78.0068 74.2758C79.2496 73.8454 80.2217 73.0561 80.9609 71.9779C81.3685 71.3832 81.3164 71.2765 80.6648 70.9881C79.8025 70.6063 78.9385 70.2279 78.0867 69.8238C77.9186 69.7438 77.7783 69.5711 77.6674 69.4118C77.4401 69.0854 77.2493 68.7327 77.0286 68.4007C76.7973 68.0536 76.5334 67.7272 76.3143 67.3728C76.1885 67.1694 76.1236 66.9279 76.0265 66.6915C77.15 66.5903 77.9669 65.9665 78.7921 65.3712C79.0117 65.2125 78.9762 65.0141 78.7416 64.8838C77.4406 64.1634 76.3515 63.1701 75.2801 62.1551C75.1193 62.0025 74.9585 61.8404 74.8398 61.6548C74.7289 61.4816 74.6257 61.2775 74.6036 61.0774C74.4045 59.2933 74.4067 57.5097 74.6424 55.7272C74.6851 55.4042 74.6995 55.0923 75.1337 55.0766C75.2014 55.0738 75.2707 55.0224 75.3339 54.9844C76.3776 54.3506 77.2316 53.5362 77.7423 52.3976C77.81 52.2467 77.8693 52.0919 77.9214 51.9655C78.4017 52.0287 78.8553 52.1148 79.3122 52.1422C80.1363 52.1919 80.9249 51.9717 81.7073 51.7453C81.8188 51.7135 81.994 51.6123 81.9929 51.5458C81.9912 51.4351 81.8914 51.301 81.7961 51.2216C80.6753 50.2921 79.8069 49.177 79.3078 47.7925C79.2718 47.6935 79.2973 47.5303 79.3588 47.4437C81.5066 44.4204 83.1131 41.1165 84.317 37.6141C85.0806 35.3929 85.689 33.1247 86.0788 30.8017C86.091 30.7313 86.1814 30.6502 86.2541 30.6178C87.4114 30.1047 88.5721 29.5989 89.7322 29.0908C90.0089 28.9689 90.0816 28.7962 89.9013 28.5419C89.6401 28.1741 89.3773 27.7929 89.0495 27.4894C88.2843 26.7801 87.3665 26.3156 86.3883 25.9752C85.9907 25.8372 85.5831 25.7282 85.1433 25.5946C85.2498 25.4996 85.3429 25.4269 85.4234 25.3425C85.7605 24.9882 86.101 24.6366 86.4254 24.2705C86.5785 24.0972 86.5391 23.9513 86.3256 23.8216C85.7522 23.4734 85.1172 23.3147 84.4745 23.1794C83.0111 22.8714 81.5526 23.0078 80.0925 23.2308C76.9643 23.7087 73.9486 24.5471 71.1443 26.0569C70.0899 26.6244 69.0532 27.2254 68.0167 27.8263L67.8342 27.9321C67.5369 28.1043 67.2347 28.1831 66.8959 28.2228C65.8517 28.3452 64.8052 28.4698 63.7732 28.6666C63.3301 28.751 62.9314 28.6615 62.5122 28.6526L62.4922 28.5581C63.3723 28.2339 64.2529 27.9103 65.1895 27.5654C65.0648 27.49 65.0076 27.4447 64.9428 27.4179C63.9163 26.9976 62.9004 26.5487 61.8595 26.1686C60.3101 25.6035 58.7263 25.1475 57.0721 25.0317C54.4468 24.8484 51.9408 25.3476 49.5435 26.4291C49.4259 26.4822 49.3062 26.5359 49.1825 26.5694C48.3712 26.7885 47.5521 26.9802 46.7475 27.2217C44.3191 27.95 42.087 29.0522 40.1888 30.7805C40.1173 30.8453 39.9443 30.8626 39.8489 30.8246C37.5641 29.9208 35.2051 29.2685 32.8283 28.6688C29.3773 27.798 25.9397 26.8712 22.3956 26.4481C19.8397 26.1429 17.2771 25.9529 14.7073 26.2005C13.7185 26.2955 12.7348 26.4872 11.7626 26.6991C11.2064 26.8198 11.1288 27.1524 11.4843 27.6057C12.0887 28.377 12.7431 29.0964 13.6392 29.5407C13.6587 29.5502 13.6686 29.5793 13.6797 29.595C13.6709 29.6134 13.6692 29.6246 13.6631 29.6296C13.5322 29.733 13.4008 29.8347 13.2694 29.9376C12.0311 30.9062 10.9696 32.0381 10.1484 33.3879C9.88162 33.8262 9.97367 34.119 10.4317 34.2549C11.243 34.4958 12.0743 34.6199 12.9228 34.5584C13.1474 34.5416 13.3686 34.4757 13.6038 34.4298C13.6503 34.5785 13.6958 34.7098 13.733 34.8434C14.7683 38.5917 16.2001 42.1684 18.1189 45.5567C19.5951 48.1636 21.4101 50.5067 23.3511 52.7581C24.3687 53.9375 25.475 55.0397 26.5502 56.1677C26.7244 56.3505 26.8297 56.5349 26.7809 56.7859C26.6501 57.46 26.5796 58.1547 26.3695 58.8037C25.5199 61.4296 24.2417 63.8341 22.5664 66.0224C22.2974 66.3734 22.3368 66.54 22.7743 66.602C23.4109 66.692 24.0581 66.7384 24.7014 66.7423C25.2471 66.7457 25.7927 66.6618 26.3467 66.616C26.329 66.6479 26.3079 66.6875 26.2852 66.7261C25.7828 67.5729 25.2559 68.4063 24.7823 69.2693L24.7214 69.3804C23.8558 70.9565 22.9891 72.5348 22.4754 74.2769C22.4388 74.4015 22.4166 74.5418 22.3434 74.6419C22.1832 74.861 22.2824 75.0052 22.4671 75.0901C22.8592 75.2707 23.2507 75.4948 23.6666 75.5747C25.44 75.9151 27.2274 75.9884 29.0152 75.6854C29.5931 75.5876 30.162 75.4423 30.7504 75.3154C30.6672 75.5815 30.5685 75.8324 30.5108 76.0929C30.4204 76.5009 30.3561 76.9156 30.2812 77.3276C30.1127 78.2515 29.8232 79.1291 29.3152 79.9267C29.2537 80.0234 29.2093 80.1983 29.2559 80.2788C29.303 80.3604 29.4705 80.3777 29.5892 80.4096C29.6391 80.423 29.6984 80.4018 29.7533 80.3951C30.7149 80.2782 31.6737 80.1363 32.6381 80.0502C34.5618 79.8786 36.4312 80.2168 38.279 80.722C38.4048 80.7567 38.488 80.7925 38.4647 80.9646C38.2063 82.8829 37.7749 84.7526 37.0079 86.5373C36.7323 87.179 36.3735 87.7072 35.6648 87.9022C35.6204 87.9145 35.5794 87.9391 35.5389 87.9609C34.3333 88.6099 33.1194 89.2431 31.9271 89.9155C31.3116 90.2626 30.8486 90.7948 30.5058 91.4141C30.3944 91.6153 30.2519 91.7304 30.0644 91.8405C28.5333 92.7421 26.9839 93.6157 25.4866 94.5715Z"
      fill="#CCCCCC"
    />
  </svg>
)
