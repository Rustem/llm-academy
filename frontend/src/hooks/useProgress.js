import { useState, useEffect, useCallback } from "react";
import * as progressService from "../services/progress";

export function useProgress() {
  const [progress, setProgress] = useState({ total_xp: 0, level: "Newcomer", completed: {} });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await progressService.fetchProgress();
      setProgress(data);
    } catch {
      // silently fail if not authenticated yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const complete = async (exerciseId, stars, xpEarned, promptUsed) => {
    const data = await progressService.completeExercise(exerciseId, stars, xpEarned, promptUsed);
    setProgress(data);
    return data;
  };

  return { progress, loading, complete, refresh: load };
}
