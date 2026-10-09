import { useEffect, useRef } from 'react';

export function useAutoRefresh(fn, ms = 15000) {
  const ref = useRef(fn);
  useEffect(() => { ref.current = fn; });
  useEffect(() => {
    const tick = () => { if (document.visibilityState === 'visible') ref.current(); };
    const timer = setInterval(tick, ms);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [ms]);
}
