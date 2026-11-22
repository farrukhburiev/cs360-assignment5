// Validation shared by every operation that takes a course name or a grade (REF-201).

const MIN_GRADE = 0;
const MAX_GRADE = 100;

// Courses are case-insensitive and ignore surrounding whitespace ("cs360 " -> "CS360").
export function normalizeCourse(course) {
  return String(course ?? "").trim().toUpperCase();
}

// Returns the normalized course name or throws if no course was given.
export function requireCourse(course) {
  const normalizedCourse = normalizeCourse(course);
  if (!normalizedCourse) {
    throw new Error("Course name is required");
  }
  return normalizedCourse;
}

// Returns the grade as a number or throws if it is not an integer from 0 to 100.
export function requireGrade(grade) {
  const numericGrade = Number(grade);
  if (!Number.isInteger(numericGrade) || numericGrade < MIN_GRADE || numericGrade > MAX_GRADE) {
    throw new Error(`Grade must be an integer from ${MIN_GRADE} to ${MAX_GRADE}`);
  }
  return numericGrade;
}
