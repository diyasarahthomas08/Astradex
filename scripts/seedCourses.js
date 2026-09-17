require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function loadCourses() {
  const sourcePath = path.join(__dirname, '..', 'src', 'data', 'courses.js');
  const source = fs.readFileSync(sourcePath, 'utf8')
    .replace('export const courses', 'const courses')
    .replace('export function getCourseById', 'function getCourseById');
  const module = await import(`data:text/javascript;base64,${Buffer.from(`${source}\nexport { courses };`).toString('base64')}`);
  return module.courses;
}

async function seedCourses() {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    || process.env.SUPABASE_ANON_KEY
    || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables.');
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const courses = await loadCourses();

  for (const course of courses) {
    const row = {
      title: course.name,
      tagline: course.tagline,
      description: course.description,
      board: course.board,
      level: course.level,
      subject: course.subject,
      price: course.price,
      duration: course.durationWeeks,
      modules_count: course.curriculum.length,
      highlights: course.highlights,
      tags: [],
      demo_video_url: course.demoVideo,
    };

    const { error } = await supabase.from('courses').insert(row);

    if (error) {
      console.error(`[seedCourses] Failed: ${course.id} - ${error.message}`);
    } else {
      console.log(`[seedCourses] Inserted: ${course.id}`);
    }
  }
}

seedCourses().catch((error) => {
  console.error(`[seedCourses] Failed to seed courses: ${error.message}`);
  process.exitCode = 1;
});
