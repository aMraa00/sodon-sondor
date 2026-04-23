import { useState, useEffect } from 'react';

export const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
};

export const useIsMobile  = () => !useMediaQuery('(min-width: 768px)');
export const useIsTablet  = () => useMediaQuery('(min-width: 768px)') && !useMediaQuery('(min-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
