import { apiFetch } from "./api";

export async function testPrompt(systemPrompt, userMessage, model) {
  const data = await apiFetch("/llm/chat", {
    method: "POST",
    body: JSON.stringify({
      system_prompt: systemPrompt,
      user_message: userMessage,
      model,
    }),
  });
  return data.content;
}

export async function evaluatePrompt(exerciseId, userPrompt, aiResponse, model, courseId = "general") {
  return apiFetch("/llm/evaluate", {
    method: "POST",
    body: JSON.stringify({
      exercise_id: exerciseId,
      course_id: courseId,
      user_prompt: userPrompt,
      ai_response: aiResponse,
      model,
    }),
  });
}
