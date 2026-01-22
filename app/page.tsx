'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [activityData, setActivityData] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
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

      // Store activity data
      setActivityData(data);
      setFile(selectedFile);
      setIsLoading(false);
    } catch (err) {
      setError('Error reading file. Please ensure it is a valid JSON file.');
      setIsLoading(false);
    }
  };

  const startActivity = () => {
    if (activityData) {
      sessionStorage.setItem('activityData', JSON.stringify(activityData));
      router.push('/activity');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-brand-bg)' }}>
      <div className="max-w-4xl w-full">
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

        {/* Show activity loaded state with action buttons */}
        {activityData && (
          <div className="mt-8 p-6 rounded-2xl shadow-xl" style={{ backgroundColor: 'var(--color-brand-card)' }}>
            <div className="text-center">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-brand-primary)' }}>
                {activityData.title}
              </h3>
              <p className="text-gray-600 mb-6">Activity loaded successfully!</p>
              
              <div className="flex flex-col md:flex-row gap-4 justify-center">
                <button
                  onClick={startActivity}
                  className="text-white px-8 py-3 rounded-full font-semibold transition-opacity"
                  style={{ backgroundColor: 'var(--color-brand-primary)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Start Activity
                </button>
                
                <button
                  onClick={() => setShowPreview(true)}
                  className="border-2 px-8 py-3 rounded-full font-semibold transition-all"
                  style={{ 
                    borderColor: 'var(--color-brand-primary)', 
                    color: 'var(--color-brand-primary)' 
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-brand-primary)';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--color-brand-primary)';
                  }}
                >
                  Preview Model Prompt & Image
                </button>
              </div>
            </div>
          </div>
        )}

        {!activityData && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm">
              Learn to write effective AI image generation prompts
            </p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && activityData && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setShowPreview(false)}
        >
          <div 
            className="max-w-5xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-8"
            style={{ backgroundColor: 'var(--color-brand-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-3xl font-bold" style={{ color: 'var(--color-brand-primary)' }}>
                Model Prompt & Image Preview
              </h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Model Prompt Section */}
            <div className="mb-6 border-l-4 p-4 rounded" style={{ backgroundColor: 'var(--color-brand-section)', borderColor: 'var(--color-brand-primary)' }}>
              <h3 className="font-semibold mb-3 text-xl" style={{ color: 'var(--color-brand-primary)' }}>
                Model Prompt
              </h3>
              <p className="text-gray-700 mb-4 text-lg italic">
                {activityData.model_prompt || 'No model prompt available'}
              </p>
              {activityData.model_prompt_explanation && (
                <div className="mt-4 p-3 rounded" style={{ backgroundColor: 'var(--color-brand-input)' }}>
                  <p className="text-gray-600 text-sm">
                    <strong>Why this works:</strong> {activityData.model_prompt_explanation}
                  </p>
                </div>
              )}
            </div>

            {/* Generated Image Section */}
            <div className="border-l-4 p-4 rounded" style={{ backgroundColor: 'var(--color-brand-input)', borderColor: 'var(--color-brand-primary)' }}>
              <h3 className="font-semibold mb-4 text-xl" style={{ color: 'var(--color-brand-primary)' }}>
                Pre-Generated Image
              </h3>
              {activityData.generated_image_base64 ? (
                <div className="overflow-hidden rounded-lg">
                  <img 
                    src={`data:image/png;base64,${activityData.generated_image_base64}`} 
                    alt="Pre-generated model result" 
                    className="w-full h-auto block object-cover"
                    style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                  />
                </div>
              ) : (
                <p className="text-gray-600">No pre-generated image available in this activity</p>
              )}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setShowPreview(false);
                  startActivity();
                }}
                className="text-white px-8 py-3 rounded-full font-semibold transition-opacity"
                style={{ backgroundColor: 'var(--color-brand-primary)' }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                Start Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
