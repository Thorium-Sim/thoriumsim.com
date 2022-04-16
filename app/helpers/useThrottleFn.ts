import {useEffect, useRef, useState} from "react";

const useUnmount = (fn: () => any): void => {
  const fnRef = useRef(fn);

  // update the ref each render so if it change the newest callback will be invoked
  fnRef.current = fn;

  useEffect(() => () => fnRef.current(), []);
};

type UnwrapPromise<T> = T extends Promise<infer R> ? UnwrapPromise<R> : T;

const useThrottleFn = <T, U extends any[]>(
  fn: (...args: U) => T | Promise<T>,
  ms: number = 200,
  args: U
) => {
  const [state, setState] = useState<T | null>(null);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const nextArgs = useRef<U>();

  useEffect(() => {
    const callback = async () => {
      setState(await fn(...args));
      const timeoutCallback = async () => {
        if (nextArgs.current) {
          setState(await fn(...nextArgs.current));
          nextArgs.current = undefined;
          timeout.current = setTimeout(timeoutCallback, ms);
        } else {
          timeout.current = undefined;
        }
      };
      timeout.current = setTimeout(timeoutCallback, ms);
    };
    if (!timeout.current) {
      callback();
    } else {
      nextArgs.current = args;
    }
  }, args);

  useUnmount(() => {
    timeout.current && clearTimeout(timeout.current);
  });

  return state;
};

export default useThrottleFn;
