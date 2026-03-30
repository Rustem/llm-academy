import { apiFetch } from "./api";

export async function fetchProgress(courseId = "general") {
  return apiFetch(`/progress?course=${courseId}`);
}

export async function completeExercise(exerciseId, stars, xpEarned, promptUsed, aiResponse, modelUsed, courseId = "general") {
  return apiFetch("/progress/complete", {
    method: "POST",
    body: JSON.stringify({
      exercise_id: exerciseId,
      course_id: courseId,
      stars,
      xp_earned: xpEarned,
      prompt_used: promptUsed,
      ai_response: aiResponse,
      model_used: modelUsed,
    }),
  });
}

export async function fetchAttempts(courseId, exerciseId) {
  return apiFetch(`/progress/attempts/${exerciseId}?course=${courseId}`);
}
