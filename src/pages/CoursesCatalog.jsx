
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../services/supabaseClient';
import { SkeletonLoader, EmptyState } from '../components/UIUtils';

export default function CoursesCatalog() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      const { data, error } = await supabase.from('courses').select('*');

      if (error) {
        console.error('[CoursesCatalog] Error fetching courses:', error.message);
        setCourses([]);
      } else {
        setCourses(data.map(course => ({
          ...course,
          name: course.title,
          currency: 'INR',
          highlights: course.highlights || [],
        })));
      }
      setLoading(false);
    }

    fetchCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesLevel = levelFilter === 'all' || course.level === levelFilter;
      const matchesSearch =
        !search ||
        course.name.toLowerCase().includes(search.toLowerCase()) ||
        course.tagline.toLowerCase().includes(search.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [courses, search, levelFilter]);

  return (
    <main className="catalog-wrapper" aria-labelledby="catalog-heading">
      <header className="catalog-header">
        <div className="catalog-header-main">
          <h1 id="catalog-heading" className="heading-medium">
            Featured Courses
          </h1>
          <p className="paragraph-main">
            Pick the perfect course for your 11th or 12th board preparation.
          </p>
          <div className="catalog-filters" aria-label="Filter courses by level">
            {[
              { id: 'all', label: 'All Levels' },
              { id: '10', label: 'Grade 10' },
              { id: '11', label: 'Grade 11' },
              { id: '12', label: 'Grade 12' }
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`filter-pill ${levelFilter === id ? 'is-active' : ''}`}
                onClick={() => setLevelFilter(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="catalog-search">
          <input
            type="search"
            placeholder="Search by subject or board..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search courses"
          />
        </div>
      </header>
      <div className="catalog-grid">
        {loading
          ? Array(6).fill(0).map((_, i) => <SkeletonLoader key={i} height={180} />)
          : filteredCourses.length === 0
            ? <EmptyState message="No courses found for your search." />
            : filteredCourses.map(course => (
                <Link key={course.id} to={`/courses/${course.id}`} className="catalog-card" aria-label={`Open details for ${course.name}`}>
                  <div className="catalog-card-body">
                    <h2 className="course-title" style={{ marginBottom: '.5rem' }}>{course.name}</h2>
                    <p className="course-desc" style={{ marginBottom: '.75rem' }}>{course.tagline}</p>
                    <ul className="mini-highlights">
                      {course.highlights.slice(0,3).map(h => <li key={h}>{h}</li>)}
                    </ul>
                    <p className="price-line"><strong>{course.currency} {course.price}</strong></p>
                  </div>
                </Link>
              ))}
      </div>
    </main>
  );
}
