import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CoursesCatalog from './pages/CoursesCatalog';
import CourseDetail from './pages/CourseDetail';

test('navigates to catalog and shows course cards', () => {
  render(
    <MemoryRouter initialEntries={['/courses']}>
      <Routes>
        <Route path="/courses" element={<CoursesCatalog />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/Course Catalog/i)).toBeInTheDocument();
  expect(screen.getByText(/10th Board Science/i)).toBeInTheDocument();
});

test('renders course detail page for valid course', () => {
  render(
    <MemoryRouter initialEntries={['/courses/10th-science']}>
      <Routes>
        <Route path="/courses/:courseId" element={<CourseDetail />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/10th Board Science/i)).toBeInTheDocument();
  expect(screen.getByText(/Curriculum Outline/i)).toBeInTheDocument();
});

test('renders newly added 11th science course with batches', () => {
  render(
    <MemoryRouter initialEntries={['/courses/11th-science']}>
      <Routes>
        <Route path="/courses/:courseId" element={<CourseDetail />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/11th Board Science/i)).toBeInTheDocument();
  expect(screen.getByText(/Upcoming Batches/i)).toBeInTheDocument();
});

test('homepage course card navigates to detail', () => {
  render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/*" element={<App />} />
        <Route path="/courses/:courseId" element={<CourseDetail />} />
      </Routes>
    </MemoryRouter>
  );
  const cardButton = screen.getByRole('button', { name: /view course details for 10th board science/i });
  cardButton.click();
  expect(screen.getByText(/10th Board Science/i)).toBeInTheDocument();
  expect(screen.getByText(/Curriculum Outline/i)).toBeInTheDocument();
});

test('shows not found for invalid course', () => {
  render(
    <MemoryRouter initialEntries={['/courses/unknown-id']}>
      <Routes>
        <Route path="/courses/:courseId" element={<CourseDetail />} />
      </Routes>
    </MemoryRouter>
  );
  expect(screen.getByText(/Course Not Found/i)).toBeInTheDocument();
});
