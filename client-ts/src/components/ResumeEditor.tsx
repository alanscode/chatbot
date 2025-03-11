import React, { useState, useEffect } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { fetchResumeContent, saveResumeContent } from '../services/resumeService';

const ResumeEditor: React.FC = () => {
  const [content, setContent] = useState<string | undefined>('Loading...');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const loadResumeContent = async () => {
      try {
        const resumeContent = await fetchResumeContent();
        setContent(resumeContent);
        setError(null);
      } catch (err) {
        setError('Failed to load resume content. Please try again later.');
        console.error('Error loading resume:', err);
      }
    };

    loadResumeContent();
  }, []);

  const handleSave = async () => {
    if (!content) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    setError(null);
    
    try {
      await saveResumeContent(content);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Clear success message after 3 seconds
    } catch (err) {
      setError('Failed to save resume content. Please try again later.');
      console.error('Error saving resume:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <h2 className="text-lg font-medium text-white">Resume Editor</h2>
        </div>
        <div className="flex items-center gap-4">
          {saveSuccess && (
            <span className="text-green-400 text-sm flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Saved successfully
            </span>
          )}
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-purple-500/20 flex items-center gap-2"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M7.707 10.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V6h-2v5.586l-1.293-1.293z" />
                </svg>
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/30 border-l-4 border-red-500 p-4 text-red-200">
          <p className="text-sm flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </p>
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div data-color-mode="dark">
          <MDEditor
            value={content}
            onChange={setContent}
            preview="edit"
            height="100%"
            className="!bg-transparent"
            textareaProps={{
              placeholder: "Start typing your resume in Markdown format...",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ResumeEditor; 