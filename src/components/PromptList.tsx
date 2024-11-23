import React from 'react';
import { useStore } from '../store/useStore';
import { PromptCard } from './PromptCard';

export const PromptList: React.FC = () => {
  // @ts-ignore
  const { prompts, searchQuery, selectedTags } = useStore();

  const filteredPrompts = prompts.filter((prompt) => {
    const matchesSearch = prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prompt.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every((tag) => prompt.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {filteredPrompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
};