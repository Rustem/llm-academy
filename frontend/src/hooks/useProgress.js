import { useState, useEffect, useCallback } from "react";
import * as progressService from "../services/progress";

export function useProgress(courseId = "general") {
  const [progress, setProgress] = useState({ total_xp: 0, level: "Newcomer", completed: {} });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await progressService.fetchProgress(courseId);
      setProgress(data);
    } catch {
      // silently fail if not authenticated yet
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const complete = async (exerciseId, stars, xpEarned, promptUsed, aiResponse, modelUsed) => {
    const data = await progressService.completeExercise(exerciseId, stars, xpEarned, promptUsed, aiResponse, modelUsed, courseId);
    setProgress(data);
    return data;
  };

  return { progress, loading, complete, refresh: load };
}
