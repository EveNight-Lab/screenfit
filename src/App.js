import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import Uploader from './components/Uploader';
import ResultDisplay from './components/ResultDisplay';
import { calculateBodyMeasurements } from './utils/measurement';
import AdPlaceholder from './components/AdPlaceholder';

function App() {
  const { t } = useTranslation();
  const [measurements, setMeasurements] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [processedImages, setProcessedImages] = useState([]);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleAnalysis = async ({ files, height }) => {
    if (!files || files.length === 0 || !height) return;

    setIsLoading(true);
    setError('');
    setMeasurements(null);
    setProcessedImages([]);

    try {
      // 5초 지연을 위한 Promise
      const minDelay = new Promise(resolve => setTimeout(resolve, 5000));

      // 신체 측정과 5초 지연을 동시에 실행
      const [analysisResult] = await Promise.all([
        calculateBodyMeasurements(files, height),
        minDelay
      ]);

      const { measurements: results, allProcessedImages } = analysisResult;
      setMeasurements(results);
      setProcessedImages(allProcessedImages);
    } catch (err) {
      setError(t(err.message) || t('error_mediapipe'));
    } finally {
      setIsLoading(false);
    }
  };

  const resetState = () => {
    setMeasurements(null);
    setError('');
    setIsLoading(false);
    setProcessedImages([]);
  };

  return (
    <div className="bg-slate-100 dark:bg-gray-900 min-h-screen font-sans antialiased break-keep">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              {t('main_title')}
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">{t('subtitle')}</p>
          </div>
          <div className="flex items-center bg-slate-200 dark:bg-gray-700 rounded-full p-1 text-sm font-medium whitespace-nowrap">
            <button onClick={() => handleLanguageChange('ko')} className={`px-4 py-1 rounded-full transition-colors ${i18n.language.startsWith('ko') ? 'bg-white text-blue-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}>한국어</button>
            <button onClick={() => handleLanguageChange('en')} className={`px-4 py-1 rounded-full transition-colors ${i18n.language.startsWith('en') ? 'bg-white text-blue-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}>English</button>
          </div>
        </header>

        <main className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-xl transition-all duration-300 min-h-[500px]">
          {isLoading && (
            <div className="flex flex-col justify-center items-center h-full min-h-[500px]">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-lg font-semibold text-slate-600 dark:text-slate-300 mt-6">{t('calculating')}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{t('ad_loading_notice')}</p>
              <AdPlaceholder style={{ minHeight: '280px', width: '336px', marginTop: '24px' }} />
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col justify-center items-center h-full min-h-[500px] text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">{t('error_title')}</h3>
              <p className="mt-3 text-red-500 dark:text-red-400/80 max-w-md">{error}</p>
              <button onClick={resetState} className="mt-8 bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition-transform hover:scale-105">
                {t('try_again_button')}
              </button>
            </div>
          )}

          {!isLoading && !error && !measurements && (
            <>
              <Uploader onAnalysis={handleAnalysis} />
              <AdPlaceholder />
            </>
          )}

          {measurements && (
            <>
              <ResultDisplay 
                measurements={measurements} 
                processedImages={processedImages}
                onReset={resetState} 
              />
              <AdPlaceholder />
            </>
          )}
        </main>
        <footer className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
          <p>{t('privacy_note')}</p>
        </footer>
        <div className="text-center mt-4">
            <p className="text-sm font-semibold bg-gradient-to-r from-red-800 to-purple-600 bg-clip-text text-transparent">
                {t('brand_name')}
            </p>
        </div>
      </div>
    </div>
  );
}

export default App;
