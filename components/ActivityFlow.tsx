'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ActivityData {
  title: string;
  language?: string;
  activity_scenario: string;
  supervisor_directions: string;
  final_instruction: string;
  model_prompt: string;
  model_prompt_explanation: string;
  rubrics: string[];
  generated_image_base64?: string;
}

interface FeedbackResponse {
  score: number;
  summary: string;
  detailed_feedback: Array<{
    heading: string;
    status: 'PASS' | 'FAIL';
    feedback: string;
  }>;
}

export default function ActivityFlow({ activityData }: { activityData: ActivityData }) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<'prompt' | 'feedback' | 'image'>('prompt');
  const [userPrompt, setUserPrompt] = useState('');
  const [attemptNumber, setAttemptNumber] = useState(1);
  const [feedback, setFeedback] = useState<FeedbackResponse | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [showModelPrompt, setShowModelPrompt] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState<string>('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const evaluatePrompt = async () => {
    if (!userPrompt.trim()) {
      alert('Please write a prompt first!');
      return;
    }

    setIsEvaluating(true);
    
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          learning_activity_content: activityData,
          user_prompt: userPrompt
        })
      });

      const result = await response.json();
      setFeedback(result);
      setCurrentStep('feedback');

      // If score is 5/5, set the user's prompt as the final prompt
      if (result.score === 5) {
        setFinalPrompt(userPrompt);
      }
    } catch (error) {
      console.error('Error evaluating prompt:', error);
      alert('Error evaluating your prompt. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleTryAgain = () => {
    if (attemptNumber >= 3) {
      // Show model prompt after 3rd attempt
      setShowModelPrompt(true);
      setFinalPrompt(activityData.model_prompt);
    } else {
      // Reset for next attempt
      setAttemptNumber(attemptNumber + 1);
      setCurrentStep('prompt');
      setFeedback(null);
    }
  };

  const handleGenerateImage = async (useUserPrompt: boolean = true) => {
    setIsGeneratingImage(true);
    setCurrentStep('image');

    try {
      if (useUserPrompt) {
        // User scored 5/5 - generate new image with their prompt
        console.log('Generating image with user prompt');
        const response = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            prompt: finalPrompt,
            language: activityData.language || "hi"
          })
        });

        const result = await response.json();
        if (result.image_base64) {
          setGeneratedImage(result.image_base64);
        } else {
          throw new Error('Failed to generate image');
        }
      } else {
        // Using model prompt - use pre-generated base64 from JSON
        console.log('Using pre-generated image from JSON');
        if (activityData.generated_image_base64) {
          setGeneratedImage(activityData.generated_image_base64);
        } else {
          throw new Error('No pre-generated image available in JSON');
        }
      }
    } catch (error) {
      console.error('Error loading/generating image:', error);
      alert('Error with image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const useModelPrompt = () => {
    setFinalPrompt(activityData.model_prompt);
    setCurrentStep('image');
    handleGenerateImage(false); // Use pre-generated base64 image
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'var(--color-brand-bg)' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="rounded-t-2xl shadow-2xl p-6 md:p-8 mb-4" style={{ backgroundColor: 'var(--color-brand-card)' }}>
          <button
            onClick={() => router.push('/')}
            className="mb-4 flex items-center gap-2 transition-opacity"
            style={{ color: 'var(--color-brand-primary)' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Back to Upload
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-center" style={{ color: 'var(--color-brand-primary)' }}>
            {activityData.title}
          </h1>
          
          {/* Progress Indicator */}
          <div className="mt-6 text-center text-gray-600">
            <p>Attempt {attemptNumber} of 3</p>
          </div>
        </div>

        {/* Content */}
        <div className="shadow-2xl p-6 md:p-8 rounded-b-2xl" style={{ backgroundColor: 'var(--color-brand-card)' }}>
          
          {/* Step 1: Prompt Writing */}
          {currentStep === 'prompt' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="border-l-4 p-4 rounded" style={{ backgroundColor: 'var(--color-brand-input)', borderColor: 'var(--color-brand-primary)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-brand-primary)' }}>Your Task</h3>
                <p className="text-gray-700 mb-3">{activityData.activity_scenario}</p>
                <p className="text-gray-700 mb-3">{activityData.supervisor_directions}</p>
                <p className="text-gray-700 font-semibold">{activityData.final_instruction}</p>
              </div>

              <div className="border-l-4 p-4 rounded" style={{ backgroundColor: 'var(--color-brand-section)', borderColor: 'var(--color-brand-primary)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-brand-primary)' }}>Evaluation Criteria</h3>
                <ul className="list-disc list-inside space-y-1">
                  {activityData.rubrics && activityData.rubrics.map((rubric, index) => (
                    <li key={index} className="text-gray-700">{rubric}</li>
                  ))}
                </ul>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Write Your Prompt:
                </label>
                <textarea
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="w-full h-40 p-4 border-2 rounded-lg focus:outline-none focus:border-opacity-80"
                  style={{ borderColor: 'var(--color-brand-primary)', backgroundColor: 'var(--color-brand-input)' }}
                  placeholder="Type your AI image generation prompt here..."
                />
              </div>

              <div className="text-center">
                <button
                  onClick={evaluatePrompt}
                  disabled={isEvaluating || !userPrompt.trim()}
                  className="text-white px-8 py-3 rounded-full font-semibold transition-opacity disabled:cursor-not-allowed"
                  style={{ backgroundColor: (isEvaluating || !userPrompt.trim()) ? '#9CA3AF' : 'var(--color-brand-primary)' }}
                  onMouseEnter={(e) => (!isEvaluating && userPrompt.trim()) && (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (!isEvaluating && userPrompt.trim()) && (e.currentTarget.style.opacity = '1')}
                >
                  {isEvaluating ? 'Evaluating...' : 'Submit Prompt'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Feedback */}
          {currentStep === 'feedback' && feedback && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <div className="inline-block px-6 py-3 rounded-full mb-4" 
                     style={{ backgroundColor: feedback.score === 5 ? '#10b981' : 'var(--color-brand-section)' }}>
                  <p className="text-2xl font-bold" style={{ color: feedback.score === 5 ? 'white' : 'var(--color-brand-primary)' }}>
                    Score: {feedback.score}/5
                  </p>
                </div>
                <p className="text-lg text-gray-700">{feedback.summary}</p>
              </div>

              <div className="border-l-4 p-4 rounded" style={{ backgroundColor: 'var(--color-brand-input)', borderColor: 'var(--color-brand-primary)' }}>
                <h3 className="font-semibold mb-3" style={{ color: 'var(--color-brand-primary)' }}>Detailed Feedback</h3>
                <div className="space-y-3">
                  {feedback.detailed_feedback && feedback.detailed_feedback.map((item, index) => (
                    <div key={index} className="p-3 rounded" style={{ backgroundColor: 'var(--color-brand-card)' }}>
                      <div className="flex items-start gap-2">
                        <span className={`text-xl ${item.status === 'PASS' ? 'text-green-600' : 'text-red-600'}`}>
                          {item.status === 'PASS' ? '✓' : '✗'}
                        </span>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{item.heading}</p>
                          <p className="text-gray-600 text-sm">{item.feedback}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center space-y-4">
                {feedback.score === 5 ? (
                  <button
                    onClick={() => handleGenerateImage(true)}
                    className="text-white px-8 py-3 rounded-full font-semibold transition-opacity"
                    style={{ backgroundColor: 'var(--color-brand-primary)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                  >
                    Generate Image
                  </button>
                ) : (
                  <>
                    {attemptNumber < 3 ? (
                      <button
                        onClick={handleTryAgain}
                        className="text-white px-8 py-3 rounded-full font-semibold transition-opacity"
                        style={{ backgroundColor: 'var(--color-brand-primary)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        Try Again (Attempt {attemptNumber + 1}/3)
                      </button>
                    ) : (
                      <button
                        onClick={handleTryAgain}
                        className="text-white px-8 py-3 rounded-full font-semibold transition-opacity"
                        style={{ backgroundColor: 'var(--color-brand-primary)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                      >
                        View Model Prompt
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Show Model Prompt after 3 attempts */}
              {showModelPrompt && (
                <div className="border-l-4 p-4 rounded animate-fadeIn" style={{ backgroundColor: 'var(--color-brand-section)', borderColor: 'var(--color-brand-primary)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: 'var(--color-brand-primary)' }}>Model Prompt</h3>
                  <p className="text-gray-700 mb-3 italic">{activityData.model_prompt}</p>
                  <p className="text-gray-600 text-sm mb-4"><strong>Why this works:</strong> {activityData.model_prompt_explanation}</p>
                  
                  <div className="text-center">
                    <button
                      onClick={useModelPrompt}
                      className="text-white px-8 py-3 rounded-full font-semibold transition-opacity"
                      style={{ backgroundColor: 'var(--color-brand-primary)' }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      Generate Image with Model Prompt
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Generated Image */}
          {currentStep === 'image' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-brand-primary)' }}>
                  Generated Image
                </h2>
                
                {isGeneratingImage ? (
                  <div className="p-12 rounded-lg" style={{ backgroundColor: 'var(--color-brand-input)' }}>
                    <div className="animate-pulse">
                      <div className="h-64 bg-gray-300 rounded"></div>
                      <p className="mt-4 text-gray-600">Generating your image...</p>
                    </div>
                  </div>
                ) : generatedImage ? (
                  <div className="overflow-hidden rounded-lg">
                    <img 
                      src={`data:image/png;base64,${generatedImage}`} 
                      alt="Generated workplace scenario" 
                      className="w-full h-auto block object-cover"
                      style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
                    />
                  </div>
                ) : (
                  <p className="text-gray-600">Failed to load image</p>
                )}
              </div>

              <div className="border-l-4 p-4 rounded" style={{ backgroundColor: 'var(--color-brand-section)', borderColor: 'var(--color-brand-primary)' }}>
                <h3 className="font-semibold mb-2" style={{ color: 'var(--color-brand-primary)' }}>Prompt Used</h3>
                <p className="text-gray-700 italic">{finalPrompt}</p>
              </div>

              <div className="text-center space-x-4">
                <button
                  onClick={() => router.push('/')}
                  className="bg-gray-500 text-white px-8 py-3 rounded-full font-semibold transition-opacity"
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  Complete Activity
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

