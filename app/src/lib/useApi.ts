import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';

/**
 * Runs `fn` on mount and every time the screen regains focus, plus a manual
 * `reload()` for pull-to-refresh. `deps` re-creates the fetcher when inputs
 * (e.g. a sort key) change.
 */
export function useApi<T>(fn: () => Promise<T>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(async () => {
    setError(null);
    try {
      setData(await fn());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, deps);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return { data, error, loading, reload: load };
}
