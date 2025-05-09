import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProjectCard } from '../components/ui/ProjectCard';
import { ProjectFilter } from '../components/ui/ProjectFilter';
import { useProjects } from '../hooks/useProjects';
import { testFetchProjects } from '../services/projects';
import { Search } from 'lucide-react';

export function Browse() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [testData, setTestData] = useState<any>(null);
  const [isTestLoaded, setIsTestLoaded] = useState(false);
  
  // Parse URL parameters once with useMemo to prevent recalculation on every render
  const filters = useMemo(() => {
    const dawType = searchParams.get('dawType')?.split(',');
    const genre = searchParams.get('genre')?.split(',');
    const keyParam = searchParams.get('key');
    const key = keyParam ? keyParam : undefined;
    const bpmMin = searchParams.get('bpmMin') ? parseInt(searchParams.get('bpmMin')!) : undefined;
    const bpmMax = searchParams.get('bpmMax') ? parseInt(searchParams.get('bpmMax')!) : undefined;
    const exactBpm = searchParams.get('bpm') ? parseInt(searchParams.get('bpm')!) : undefined;
    const price = searchParams.get('price') as 'free' | 'paid' | undefined;
    
    return {
      dawType,
      genre,
      key,
      bpmMin,
      bpmMax,
      exactBpm,
      price,
      search: searchQuery
    };
  }, [searchParams, searchQuery]);
  
  const { projects, loading, error } = useProjects(filters);

  // Run test query only once
  useEffect(() => {
    async function runTest() {
      if (!isTestLoaded) {
        const results = await testFetchProjects();
        setTestData(results);
        setIsTestLoaded(true);
      }
    }
    
    runTest();
  }, [isTestLoaded]);
  
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
  }, []);
  
  // Use test data if available and main query is still loading
  const displayProjects = (loading && testData?.joinQuery?.data) 
    ? testData.joinQuery.data 
    : projects;
  
  // Only show debug info in development
  const isDevEnvironment = import.meta.env.DEV;
  
  return (
    <div className="container py-12">
      <h1 className="text-3xl font-bold mb-6">Browse Projects</h1>
      
      {/* Debug info - only in development */}
      {isDevEnvironment && testData && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <details>
            <summary className="cursor-pointer font-medium text-yellow-800">
              Debug Information (click to expand)
            </summary>
            <div className="mt-2">
              <p className="text-sm text-yellow-700 mb-2">
                Direct query found {testData.simpleQuery?.data?.length || 0} projects.
                Join query found {testData.joinQuery?.data?.length || 0} projects.
              </p>
              <p className="text-sm text-yellow-700">
                {testData.simpleQuery?.error ? `Simple query error: ${testData.simpleQuery.error.message}` : ''}
                {testData.joinQuery?.error ? `Join query error: ${testData.joinQuery.error.message}` : ''}
              </p>
            </div>
          </details>
        </div>
      )}
      
      {/* Search and Filter */}
      <div className="mb-8">
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input 
              type="text"
              placeholder="Search projects, genres, or creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:border-black"
            />
          </div>
        </form>
        
        <ProjectFilter />
      </div>
      
      {/* Results */}
      {loading && !testData ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading projects...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-bold mb-2">Error loading projects</h3>
          <p className="text-gray-600">{error.message}</p>
        </div>
      ) : displayProjects?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayProjects.map((project: any) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl font-bold mb-2">No projects found</h3>
          <p className="text-gray-600 mb-6">
            Try adjusting your filters or search query to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}