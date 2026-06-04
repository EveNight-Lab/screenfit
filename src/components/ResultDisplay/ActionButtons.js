import React from 'react';
import { useTranslation } from 'react-i18next';

const ActionButtons = ({ canShare, handleCopy, handleSaveOrShare, onReset }) => {
  const { t } = useTranslation();

  return (
    <div className="mt-10 pt-6 border-t border-slate-200 dark:border-gray-700 flex flex-wrap gap-3 justify-center">
      <button 
        onClick={handleCopy} 
        className="flex items-center justify-center gap-2 flex-1 min-w-[120px] bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-full transition-transform hover:scale-105 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
          <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2h-1a1 1 0 110-2h1a4 4 0 014 4v11a4 4 0 01-4 4H6a4 4 0 01-4-4V5a4 4 0 014-4h1a1 1 0 110 2H6z" />
        </svg>
        {t('copy_button')}
      </button>

      <button 
        onClick={() => handleSaveOrShare('save')} 
        className="flex items-center justify-center gap-2 flex-1 min-w-[120px] bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-full transition-transform hover:scale-105 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
        {t('save_button')}
      </button>

      {canShare && (
        <button 
          onClick={() => handleSaveOrShare('share')} 
          className="flex items-center justify-center gap-2 flex-1 min-w-[120px] bg-sky-500 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-full transition-transform hover:scale-105 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
          </svg>
          {t('share_button')}
        </button>
      )}

      <button 
        onClick={onReset} 
        className="flex items-center justify-center gap-2 flex-1 min-w-[120px] bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-full transition-transform hover:scale-105 active:scale-95"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 110 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
        </svg>
        {t('try_again_button')}
      </button>
    </div>
  );
};

export default ActionButtons;
