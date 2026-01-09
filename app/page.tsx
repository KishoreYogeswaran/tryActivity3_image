'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const processFile = async (selectedFile: File) => {
    setError('');
    
    if (!selectedFile.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return;
    }

    setIsLoading(true);
    try {
      const text = await selectedFile.text();
      const data = JSON.parse(text);
      
      // Validate required fields
      if (!data.title || !data.activity_scenario || !data.rubrics) {
        setError('Invalid activity file format');
        setIsLoading(false);
        return;
      }

      // Store in sessionStorage and navigate
      sessionStorage.setItem('activityData', JSON.stringify(data));
      router.push('/activity');
    } catch (err) {
      setError('Error reading file. Please ensure it is a valid JSON file.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-brand-bg)' }}>
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4" style={{ color: 'var(--color-brand-primary)' }}>
            TRY Activity - Image Prompts
          </h1>
          <p className="text-gray-700 text-lg">
            Upload your activity JSON file to practice writing AI image prompts
          </p>
        </div>

        <div
          className={`rounded-2xl shadow-2xl p-12 transition-all duration-300 ${
            isDragging ? 'scale-105 border-4' : 'border-4 border-transparent'
          }`}
          style={{ 
            backgroundColor: 'var(--color-brand-card)',
            borderColor: isDragging ? 'var(--color-brand-primary)' : 'transparent'
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="mb-6">
              <svg
                className="mx-auto h-24 w-24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                style={{ color: 'var(--color-brand-primary)' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
              {isDragging ? 'Drop your file here' : 'Upload Activity JSON'}
            </h2>

            <p className="text-gray-600 mb-8">
              Drag and drop your JSON file here, or click to browse
            </p>

            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleFileInput}
                className="hidden"
                disabled={isLoading}
              />
              <span 
                className="inline-block text-white px-8 py-4 rounded-full font-semibold transition-colors duration-200 disabled:bg-gray-400"
                style={{ 
                  backgroundColor: isLoading ? '#9CA3AF' : 'var(--color-brand-primary)',
                }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.opacity = '1')}
              >
                {isLoading ? 'Loading...' : 'Choose File'}
              </span>
            </label>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Learn to write effective AI image generation prompts
          </p>
        </div>
      </div>
    </div>
  );
}
