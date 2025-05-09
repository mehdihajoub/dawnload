import { useState, useEffect } from 'react';
import { getProjects } from '../services/projects';
import type { Database } from '../types/supabase';

type Project = Database['public']['Tables']['projects']['Row'];

export function useProjects(filters: {
  dawType?: string[];
  genre?: string[];
  key?: string;
  bpmMin?: number;
  bpmMax?: number;
  exactBpm?: number;
  price?: 'free' | 'paid';
  search?: string;
}) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Stringify the filters to compare them properly in the dependency array
  const filtersString = JSON.stringify(filters);

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        const data = await getProjects(filters);
        setProjects(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [filtersString]); // Use the stringified filters instead

  return { projects, loading, error };
}