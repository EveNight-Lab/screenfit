import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

const Uploader = ({ onAnalysis }) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [height, setHeight] = useState('');
  const [error, setError] = useState('');

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setError('');
    if (fileRejections.length > 0) {
      const firstError = fileRejections[0].errors[0].code;
      if (firstError === 'file-too-large') {
        setError(t('error_file_size'));
      } else {
        setError(t('error_file_type'));
      }
    }
    
    setFiles(prevFiles => {
        if (prevFiles.length + acceptedFiles.length > 3) {
            setError(t('error_file_limit'));
            return prevFiles;
        }
        const newFiles = acceptedFiles.map(file => ({
            id: Date.now() + Math.random(),
            preview: URL.createObjectURL(file),
            originalFile: file,
        }));
        return [...prevFiles, ...newFiles];
    });
  }, [t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/heic': [] },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const handleRemove = (id) => {
    const fileToRemove = files.find(f => f.id === id);
    if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
    }
    setFiles(prevFiles => prevFiles.filter(f => f.id !== id));
  };

  const handleSubmit = () => {
    setError('');
    const h = parseFloat(height);
    if (files.length === 0) {
      setError(t('error_no_files'));
      return;
    }
    if (isNaN(h) || h < 100 || h > 230) {
      setError(t('error_height'));
      return;
    }
    onAnalysis({ files, height: h });
  };

  useEffect(() => {
    return () => files.forEach(file => URL.revokeObjectURL(file.preview));
  }, [files]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        {/* Previews */}
        {files.map(f => (
          <div key={f.id} className="w-full md:w-1/3 bg-slate-50 dark:bg-gray-700/50 p-3 rounded-lg ring-1 ring-slate-200 dark:ring-gray-700 flex flex-col">
            <div className="relative h-48 bg-white dark:bg-gray-700 rounded-md">
                <img src={f.preview} alt="Preview" className="w-full h-full object-contain rounded-md" />
                <button onClick={() => handleRemove(f.id)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">&times;</button>
            </div>
          </div>
        ))}

        {/* Dropzone */}
        {files.length < 3 && (
          <div {...getRootProps()} className={`relative w-full md:flex-1 border-2 border-dashed rounded-xl text-center cursor-pointer transition-all duration-300 flex items-center justify-center p-6 min-h-[150px] ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-300 dark:border-gray-600 hover:border-slate-400 dark:hover:border-gray-500'}`}>
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center text-slate-500 dark:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <p className="font-semibold text-base">{t('upload_prompt')}</p>
              <p className="text-xs mt-1">{files.length > 0 ? t('upload_more', { count: 3 - files.length }) : t('upload_title')}</p>
            </div>
          </div>
        )}
      </div>

      <p className="text-sm text-center text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-gray-700/50 p-3 rounded-lg">{t('upload_guideline')}</p>

      <div className="space-y-4">
        <div>
          <label htmlFor="height" className="block text-lg font-medium text-slate-700 dark:text-slate-200">{t('height_label')}</label>
          <div className="mt-2 relative">
            <input type="number" id="height" value={height} onChange={(e) => setHeight(e.target.value)} placeholder={t('height_placeholder')} className="w-full px-4 py-3 bg-slate-50 dark:bg-gray-700 border-2 border-slate-200 dark:border-gray-600 rounded-full text-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition" />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium">cm</span>
          </div>
        </div>

        {error && <p className="text-red-500 dark:text-red-400 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}

        <div className="text-center pt-4">
          <button
            onClick={handleSubmit}
            className="w-full lg:w-auto lg:px-16 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-bold text-lg py-4 px-8 rounded-full hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-300"
            disabled={files.length === 0 || !height}
          >
            {t('submit_button')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Uploader;