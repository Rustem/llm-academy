import { apiFetch } from "./api";

export function fetchCourses() {
  return apiFetch("/courses");
}

export function fetchExercises(courseId) {
  return apiFetch(`/courses/${courseId}/exercises`);
}

export function fetchExercise(courseId, exerciseId) {
  return apiFetch(`/courses/${courseId}/exercises/${exerciseId}`);
}

export function fetchTemplates(courseId) {
  return apiFetch(`/templates?course=${courseId}`);
}
