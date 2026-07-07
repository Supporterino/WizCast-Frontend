import type { MutableRefObject } from 'react';
import { useRef } from 'react';

export function useStableRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}
