import { useState, useEffect } from 'react';

export function useStudents(searchTerm = '', activeOnly = false) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (activeOnly) params.append('active', 'true');

      const response = await fetch(`/api/students?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch students');
      }

      setStudents(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchTerm, activeOnly]);

  const createStudent = async (studentData: any) => {
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create student');
      }

      setStudents(prev => [...prev, result.data]);
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create student');
      throw err;
    }
  };

  const updateStudent = async (loginId: string, updates: any) => {
    try {
      const response = await fetch('/api/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_id: loginId, ...updates }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update student');
      }

      setStudents(prev => prev.map((student: any) =>
        student.login_id === loginId ? result.data : student
      ));
      return result.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update student');
      throw err;
    }
  };

  return {
    students,
    loading,
    error,
    refetch: fetchStudents,
    createStudent,
    updateStudent,
  };
}