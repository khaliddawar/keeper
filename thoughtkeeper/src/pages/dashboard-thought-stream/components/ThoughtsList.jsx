import React, { useState, useEffect, useRef } from 'react';
import ThoughtCard from './ThoughtCard';
import Icon from '../../../components/AppIcon';

const ThoughtsList = ({ 
  thoughts = [], 
  onEdit, 
  onConvertToTask, 
  onArchive, 
  onDelete,
  filters = {},
  isLoading = false 
}) => {
  const [displayedThoughts, setDisplayedThoughts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const observerRef = useRef();
  const THOUGHTS_PER_PAGE = 10;

  // Filter thoughts based on active filters
  const filteredThoughts = thoughts?.filter(thought => {
    if (filters?.category && thought?.category !== filters?.category) return false;
    if (filters?.priority && thought?.priority !== filters?.priority) return false;
    if (filters?.tags && filters?.tags?.length > 0) {
      const hasMatchingTag = filters?.tags?.some(tag => thought?.tags?.includes(tag));
      if (!hasMatchingTag) return false;
    }
    return true;
  });

  // Sort thoughts by creation date (newest first)
  const sortedThoughts = [...filteredThoughts]?.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );

  useEffect(() => {
    // Reset displayed thoughts when filters change
    setDisplayedThoughts(sortedThoughts?.slice(0, THOUGHTS_PER_PAGE));
    setHasMore(sortedThoughts?.length > THOUGHTS_PER_PAGE);
  }, [sortedThoughts]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMoreThoughts();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef?.current) {
      observer?.observe(observerRef?.current);
    }

    return () => observer?.disconnect();
  }, [hasMore, loadingMore, displayedThoughts]);

  const loadMoreThoughts = () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const currentLength = displayedThoughts?.length;
      const nextThoughts = sortedThoughts?.slice(currentLength, currentLength + THOUGHTS_PER_PAGE);
      
      setDisplayedThoughts(prev => [...prev, ...nextThoughts]);
      setHasMore(currentLength + nextThoughts?.length < sortedThoughts?.length);
      setLoadingMore(false);
    }, 500);
  };

  const SkeletonCard = () => (
    <div className="bg-card border border-border rounded-lg p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-16 h-4 bg-muted rounded"></div>
          <div className="w-12 h-4 bg-muted rounded"></div>
        </div>
        <div className="w-16 h-3 bg-muted rounded"></div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="w-full h-4 bg-muted rounded"></div>
        <div className="w-3/4 h-4 bg-muted rounded"></div>
        <div className="w-1/2 h-4 bg-muted rounded"></div>
      </div>
      <div className="flex space-x-2 mb-3">
        <div className="w-12 h-6 bg-muted rounded-full"></div>
        <div className="w-16 h-6 bg-muted rounded-full"></div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex space-x-2">
          <div className="w-12 h-8 bg-muted rounded"></div>
          <div className="w-16 h-8 bg-muted rounded"></div>
        </div>
        <div className="flex space-x-1">
          <div className="w-8 h-8 bg-muted rounded"></div>
          <div className="w-8 h-8 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)]?.map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (sortedThoughts?.length === 0) {
    return (
      <div className="text-center py-12">
        <Icon name="FileText" size={48} className="text-text-secondary mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No thoughts yet</h3>
        <p className="text-text-secondary mb-6">
          {Object.keys(filters)?.length > 0 
            ? "No thoughts match your current filters. Try adjusting your search criteria." :"Start capturing your thoughts and ideas. They'll appear here in your personal stream."
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayedThoughts?.map((thought) => (
        <ThoughtCard
          key={thought?.id}
          thought={thought}
          onEdit={onEdit}
          onConvertToTask={onConvertToTask}
          onArchive={onArchive}
          onDelete={onDelete}
        />
      ))}
      {/* Loading more indicator */}
      {loadingMore && (
        <div className="space-y-4">
          {[...Array(3)]?.map((_, index) => (
            <SkeletonCard key={`loading-${index}`} />
          ))}
        </div>
      )}
      {/* Infinite scroll trigger */}
      {hasMore && !loadingMore && (
        <div ref={observerRef} className="h-4" />
      )}
      {/* End of list indicator */}
      {!hasMore && displayedThoughts?.length > 0 && (
        <div className="text-center py-8 border-t border-border">
          <Icon name="Check" size={24} className="text-text-secondary mx-auto mb-2" />
          <p className="text-text-secondary text-sm">You've reached the end of your thoughts</p>
        </div>
      )}
    </div>
  );
};

export default ThoughtsList;