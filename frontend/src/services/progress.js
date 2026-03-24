import { apiFetch } from "./api";

export async function fetchProgress() {
  return apiFetch("/progress");
}

export async function completeExercise(exerciseId, stars, xpEarned, promptUsed) {
  return apiFetch("/progress/complete", {
    method: "POST",
    body: JSON.stringify({
      exercise_id: exerciseId,
      stars,
      xp_earned: xpEarned,
      prompt_used: promptUsed,
    }),
  });
}
