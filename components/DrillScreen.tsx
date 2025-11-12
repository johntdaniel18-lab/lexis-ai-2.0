import React, { useState, useEffect, useCallback } from 'react';
import { DrillContent, DrillCriterion } from '../types';
import { generateDrillContent } from '../services/geminiService';
import Spinner from './common/Spinner';
import Button from './common/Button';
import MarkdownRenderer from './common/MarkdownRenderer';

interface DrillScreenProps {
  criterion: DrillCriterion;
  topic: string;
  onExit: () => void;
}

const DrillScreen: React.FC<DrillScreenProps> = ({ criterion, topic, onExit }) => {
  const [drillContent, setDrillContent] = useState<DrillContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for interactions
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [userTextInput, setUserTextInput] = useState('');

  const fetchDrill = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setDrillContent(null);
    // Reset interaction state for the new question
    setIsAnswerRevealed(false);
    setSelectedChoice(null);
    setUserTextInput('');

    try {
      const content = await generateDrillContent(criterion, topic);
      setDrillContent(content);
    } catch (err) {
      console.error("Failed to fetch drill content:", err);
      setError("Could not generate a drill at this time. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [criterion, topic]);

  useEffect(() => {
    fetchDrill();
  }, [fetchDrill]);
  
  const handleNextQuestion = () => {
    fetchDrill();
  };

  const handleCheckAnswer = () => {
    setIsAnswerRevealed(true);
  };

  const getChoiceButtonClass = (index: number) => {
    const base = 'w-full text-left p-4 rounded-lg border-2 transition-all duration-200 disabled:cursor-not-allowed';

    if (!isAnswerRevealed) {
        return `${base} bg-white border-slate-300 hover:border-orange-500 hover:bg-orange-50 ${selectedChoice === index ? 'ring-2 ring-orange-500 border-orange-500' : ''}`;
    }
    
    // After answer is revealed
    const isCorrect = index === drillContent?.correctAnswerIndex;
    const isSelected = index === selectedChoice;

    if (isCorrect) {
        return `${base} bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500`;
    }
    if (isSelected && !isCorrect) {
        return `${base} bg-red-50 border-red-500 ring-2 ring-red-500`;
    }
    
    return `${base} bg-slate-100 border-slate-200 text-slate-500 disabled:opacity-70`;
  }

  const renderMCQDrill = (content: DrillContent) => {
    const isPunctuationDrill = content.type === 'PUNCTUATION_CHOICE';
    return (
        <div className="space-y-6">
            <div className="p-6 bg-slate-100 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">
                    {isPunctuationDrill ? 'Which sentence is punctuated correctly?' : content.taskContent ? 'Your Task:' : 'Select the best option:'}
                </h4>
                {content.taskContent && (
                    <div className="text-slate-700 text-lg">
                        <MarkdownRenderer text={content.taskContent} />
                    </div>
                )}
            </div>
            
            <div className="space-y-3">
                {content.choices?.map((choice, index) => (
                    <button 
                        key={index}
                        onClick={() => setSelectedChoice(index)}
                        disabled={isAnswerRevealed}
                        className={getChoiceButtonClass(index)}
                    >
                        <span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span> {choice}
                    </button>
                ))}
            </div>

            {!isAnswerRevealed && (
                <Button 
                    variant="secondary" 
                    onClick={handleCheckAnswer}
                    disabled={selectedChoice === null}
                >
                    Check Answer
                </Button>
            )}

            {isAnswerRevealed && content.modelAnswer && (
                 <div className="p-6 bg-emerald-50 rounded-lg border border-emerald-200 transition-opacity duration-500">
                   <h4 className="font-semibold text-emerald-800 mb-2">Corrected Sentence:</h4>
                   <p className="text-slate-800 text-lg italic">"{content.modelAnswer}"</p>
                </div>
            )}
            
            {isAnswerRevealed && content.explanation && (
                <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 transition-opacity duration-500">
                   <h4 className="font-semibold text-slate-800 mb-2">Explanation:</h4>
                    <div className="text-slate-700">
                        <MarkdownRenderer text={content.explanation} />
                    </div>
                </div>
            )}
        </div>
    );
  }

  const renderTextInputDrill = (content: DrillContent) => {
    const isVerbConjugation = content.type === 'VERB_CONJUGATION';
    return (
      <div className="space-y-6">
        <div className="p-6 bg-slate-100 rounded-lg border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-2">Your Task:</h4>
          <div className="text-slate-700 text-lg">
            <MarkdownRenderer text={content.taskContent} />
          </div>
        </div>
        
        {!isAnswerRevealed ? (
          <div className="space-y-4">
            <textarea
              value={userTextInput}
              onChange={(e) => setUserTextInput(e.target.value)}
              rows={isVerbConjugation ? 1 : 4}
              className="w-full p-3 border border-slate-300 bg-white text-slate-900 rounded-md focus:ring-orange-500 focus:border-orange-500"
              placeholder={isVerbConjugation ? "Type the correct verb form..." : "Rewrite the sentence correctly..."}
              aria-label="Your answer"
            />
            <Button 
              variant="secondary" 
              onClick={handleCheckAnswer}
              disabled={!userTextInput.trim()}
            >
              Check Answer
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-slate-600 mb-2 text-sm">Your Answer:</h4>
              <p className="text-slate-800 italic">"{userTextInput}"</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <h4 className="font-semibold text-emerald-800 mb-2 text-sm">Model Answer:</h4>
              <p className="text-slate-800 font-bold italic">"{content.modelAnswer}"</p>
            </div>
            {content.explanation && (
              <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">Explanation:</h4>
                <div className="text-slate-700">
                  <MarkdownRenderer text={content.explanation} />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };


  const renderCompareDrill = (content: DrillContent) => {
     return (
        <div className="space-y-6">
            <div className="p-6 bg-slate-100 rounded-lg border border-slate-200">
                <h4 className="font-semibold text-slate-800 mb-2">Your Task:</h4>
                <div className="text-slate-700 whitespace-pre-wrap">
                    <MarkdownRenderer text={content.taskContent} />
                </div>
            </div>
            
            {!isAnswerRevealed ? (
                 <Button variant="secondary" onClick={() => setIsAnswerRevealed(true)}>
                    Show Model Answer
                </Button>
            ) : (
              <div className="space-y-4">
                <div className="p-6 bg-emerald-50 rounded-lg border border-emerald-200 transition-opacity duration-500">
                   <h4 className="font-semibold text-emerald-800 mb-2">Model Answer:</h4>
                    <div className="text-slate-700 whitespace-pre-wrap">
                        <MarkdownRenderer text={content.modelAnswer || ''} />
                    </div>
                </div>
                {content.explanation && (
                   <div className="p-6 bg-slate-50 rounded-lg border border-slate-200 transition-opacity duration-500">
                       <h4 className="font-semibold text-slate-800 mb-2">Explanation:</h4>
                        <div className="text-slate-700">
                            <MarkdownRenderer text={content.explanation} />
                        </div>
                    </div>
                )}
              </div>
            )}
        </div>
     );
  };


  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center p-12">
          <Spinner />
          <h3 className="mt-4 text-xl font-semibold text-slate-700">Building your personalized drill...</h3>
          <p className="text-slate-500 mt-2">Your AI tutor is creating a custom exercise just for you.</p>
        </div>
      );
    }

    if (error) {
      return <div className="text-center p-8 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>;
    }

    if (drillContent) {
      return (
        <div className="p-8">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">{drillContent.title}</h3>
            <p className="text-slate-600 mb-6">{drillContent.instructions}</p>
            
            {(() => {
                switch(drillContent.type) {
                    case 'SUPPORTING_IDEA':
                    case 'GRAMMAR_ERROR_CORRECTION':
                    case 'CONNECTOR_CHOICE':
                    case 'PUNCTUATION_CHOICE':
                        return renderMCQDrill(drillContent);
                    
                    case 'VERB_CONJUGATION':
                    case 'SENTENCE_REWRITE_ERROR':
                        return renderTextInputDrill(drillContent);

                    case 'VOCABULARY_REPLACEMENT':
                    case 'SENTENCE_COMBINING':
                    case 'SENTENCE_TRANSFORMATION':
                    default:
                        return renderCompareDrill(drillContent);
                }
            })()}

        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-slate-200 max-w-4xl mx-auto">
       <div className="p-6 border-b border-slate-200 flex justify-between items-center">
            <div>
                <h3 className="text-xl font-semibold text-slate-900">Focused Practice Drill</h3>
                <p className="mt-1 text-slate-500">A short, 5-minute exercise to sharpen your skills.</p>
            </div>
        </div>
        {renderContent()}
        <div className="p-6 border-t border-slate-200 bg-slate-50/50">
            <div className="flex justify-between items-center">
                <Button onClick={onExit} variant="secondary">End Drill</Button>
                {isAnswerRevealed && (
                    <Button onClick={handleNextQuestion} variant="primary">Next Question</Button>
                )}
            </div>
        </div>
    </div>
  );
};

export default DrillScreen;