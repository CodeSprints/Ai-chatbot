import { useMediaQuery } from '@vueuse/core';

export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
