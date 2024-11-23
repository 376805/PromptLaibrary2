import React from 'react';
import { Clock, Tag as TagIcon } from 'lucide-react';
import { Prompt, Tag } from '../types';
import { useStore } from '../store/useStore';

interface PromptCardProps {
  prompt: Prompt;
}

export const PromptCard = ({ prompt }: PromptCardProps) => {
  const { tags } = useStore();
  const promptTags = tags.filter((tag: Tag) => prompt.tags.includes(tag.id));

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-300 p-5 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800">{prompt.title}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
             // @ts-ignore
          prompt.priority === 'high'
            ? 'bg-red-200 text-red-800'
               // @ts-ignore
            : prompt.priority === 'medium'
            ? 'bg-yellow-200 text-yellow-800'
            : 'bg-green-200 text-green-800'
        }`}>
          {prompt.priority}
        </span>
      </div>
      
      <p className="text-gray-700 text-sm mb-4 line-clamp-2">{prompt.content}</p>
      
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {promptTags.map((tag) => (
            <span
              key={tag.id}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
            >
              <TagIcon className="w-3 h-3" style={{ color: tag.color }} />
              {tag.name}
            </span>
          ))}
        </div>
        
        <div className="flex items-center text-xs text-gray-500">
          <Clock className="w-3 h-3 mr-1" />
          {new Date(prompt.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};