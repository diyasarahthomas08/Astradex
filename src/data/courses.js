// Central course data model
// Structured as 16 courses: 
// 11th CBSE (Mat, Phy, Chem, Bio), 12th CBSE (Mat, Phy, Chem, Bio)
// 11th TN (Mat, Phy, Chem, Bio), 12th TN (Mat, Phy, Chem, Bio)

const standardHighlights = [
  '9 - 10 classes per month',
  'Weekly doubt sessions',
  'Weekly quizzes',
  'Monthly test',
  'Progress report'
];

const standardInstructors = [
  { id: 'i1', name: 'Dr. Expert Faculty', role: 'Senior Mentor', bio: 'Specially trained in board exam preparation.', experienceYears: 10 },
  { id: 'i2', name: 'Prof. Assistant', role: 'Associate Mentor', bio: 'Focusing on problem solving and doubts.', experienceYears: 5 }
];

const standardCurriculum = [
  { module: 'Unit 1', lessons: ['Introduction', 'Core Concepts', 'Advanced Problems'] },
  { module: 'Unit 2', lessons: ['Theoretical Framework', 'Applications', 'Previous Year Questions'] },
  { module: 'Unit 3', lessons: ['Complex Topics', 'Case Studies', 'Mock Test Analysis'] }
];

const demoVideoUrl = 'https://www.youtube.com/embed/TBmFf9Ouwe0';

const createCourse = (id, name, level, subject, board) => ({
  id,
  name,
  tagline: `Master ${subject} for ${level} (${board})`,
  description: `Comprehensive ${subject} course for ${level} ${board} students. Focus on conceptual clarity and exam success.`,
  level: level,
  durationWeeks: 40,
  price: 4999,
  currency: 'INR',
  demoVideo: demoVideoUrl,
  highlights: standardHighlights,
  curriculum: standardCurriculum,
  instructors: standardInstructors,
  board: board,
  subject: subject
});

export const courses = [
  // 11th CBSE
  createCourse('11-cbse-math', '11th CBSE Math', 'Grade 11', 'Mathematics', 'CBSE'),
  createCourse('11-cbse-phy', '11th CBSE Physics', 'Grade 11', 'Physics', 'CBSE'),
  createCourse('11-cbse-chem', '11th CBSE Chemistry', 'Grade 11', 'Chemistry', 'CBSE'),
  createCourse('11-cbse-bio', '11th CBSE Biology', 'Grade 11', 'Biology', 'CBSE'),

  // 12th CBSE
  createCourse('12-cbse-math', '12th CBSE Math', 'Grade 12', 'Mathematics', 'CBSE'),
  createCourse('12-cbse-phy', '12th CBSE Physics', 'Grade 12', 'Physics', 'CBSE'),
  createCourse('12-cbse-chem', '12th CBSE Chemistry', 'Grade 12', 'Chemistry', 'CBSE'),
  createCourse('12-cbse-bio', '12th CBSE Biology', 'Grade 12', 'Biology', 'CBSE'),

  // 11th TN Board
  createCourse('11-tn-math', '11th TN Board Math', 'Grade 11', 'Mathematics', 'TN Board'),
  createCourse('11-tn-phy', '11th TN Board Physics', 'Grade 11', 'Physics', 'TN Board'),
  createCourse('11-tn-chem', '11th TN Board Chemistry', 'Grade 11', 'Chemistry', 'TN Board'),
  createCourse('11-tn-bio', '11th TN Board Biology', 'Grade 11', 'Biology', 'TN Board'),

  // 12th TN Board
  createCourse('12-tn-math', '12th TN Board Math', 'Grade 12', 'Mathematics', 'TN Board'),
  createCourse('12-tn-phy', '12th TN Board Physics', 'Grade 12', 'Physics', 'TN Board'),
  createCourse('12-tn-chem', '12th TN Board Chemistry', 'Grade 12', 'Chemistry', 'TN Board'),
  createCourse('12-tn-bio', '12th TN Board Biology', 'Grade 12', 'Biology', 'TN Board'),
];

export function getCourseById(id) {
  return courses.find(c => c.id === id);
}
