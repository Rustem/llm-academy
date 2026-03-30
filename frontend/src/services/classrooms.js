import { apiFetch } from "./api";

export function fetchClassrooms() {
  return apiFetch("/classrooms");
}

export function createClassroom(data) {
  return apiFetch("/classrooms", { method: "POST", body: JSON.stringify(data) });
}

export function joinClassroom(joinCode) {
  return apiFetch("/classrooms/join", { method: "POST", body: JSON.stringify({ join_code: joinCode }) });
}

export function fetchClassroom(id) {
  return apiFetch(`/classrooms/${id}`);
}

export function fetchAssignments(classroomId) {
  return apiFetch(`/classrooms/${classroomId}/assignments`);
}

export function assignExercise(classroomId, data) {
  return apiFetch(`/classrooms/${classroomId}/assignments`, { method: "POST", body: JSON.stringify(data) });
}

export function fetchClassroomProgress(classroomId) {
  return apiFetch(`/classrooms/${classroomId}/progress`);
}

export function fetchCustomExercises(classroomId) {
  return apiFetch(`/classrooms/${classroomId}/exercises`);
}

export function createCustomExercise(classroomId, data) {
  return apiFetch(`/classrooms/${classroomId}/exercises`, { method: "POST", body: JSON.stringify(data) });
}
