import { useParams } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

export default function CourseRoute({ children }) {
  const { courseId } = useParams();

  // General course is accessible without auth
  if (courseId === "general") {
    return children;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
}
