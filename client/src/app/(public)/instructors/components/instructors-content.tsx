'use client';

import { useState, useEffect } from 'react';
import { GraduationCap, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { InstructorCard, InstructorCardSkeleton } from './instructor-card';
import { InstructorsService } from '@/services/instructors';
import type { IInstructor } from '@/types/instructor';

const InstructorsContent = () => {
  const [instructors, setInstructors] = useState<IInstructor[]>([]);
  const [filteredInstructors, setFilteredInstructors] = useState<IInstructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const res = await InstructorsService.getInstructors();
        setInstructors(res.data);
        setFilteredInstructors(res.data);
      } catch (err) {
        console.error('Failed to load instructors', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInstructors();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFilteredInstructors(
      instructors.filter(
        (i) =>
          i.username.toLowerCase().includes(q) ||
          i.instructorProfile?.headline?.toLowerCase().includes(q),
      ),
    );
  }, [search, instructors]);

  return (
    <section className="bg-gray-50 py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Search bar */}
        <div className="mb-8 flex items-center gap-3 sm:mb-10">
          <div className="relative max-w-md flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              id="instructor-search"
              type="search"
              placeholder="Search instructors..."
              className="border-gray-200 bg-white pl-10 focus:border-emerald-400 focus:ring-emerald-400/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {!isLoading && (
            <span className="text-sm whitespace-nowrap text-gray-500">
              {filteredInstructors.length} instructor{filteredInstructors.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, i) => (
              <InstructorCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredInstructors.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredInstructors.map((instructor) => (
              <InstructorCard key={instructor.id} instructor={instructor} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <GraduationCap className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900">No instructors found</h3>
            <p className="text-gray-500">
              {search
                ? `No results for "${search}". Try a different keyword.`
                : 'Check back later.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default InstructorsContent;
