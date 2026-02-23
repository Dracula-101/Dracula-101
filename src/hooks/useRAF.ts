import { useEffect, useRef } from 'react';
import { raf } from '../utils/raf';

let _id = 0;

export function useRAF(cb: (time: number, delta: number) => void, active: boolean = true) {
  const keyRef = useRef(`raf-hook-${++_id}`);
  const cbRef = useRef(cb);
  cbRef.current = cb;

  useEffect(() => {
    const key = keyRef.current;
    if (active) {
      raf.add(key, (t, d) => cbRef.current(t, d));
      return () => raf.remove(key);
    }
  }, [active]);
}
