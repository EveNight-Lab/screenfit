import React, { useReducer, useCallback } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Uploader from './components/Uploader';
import ResultDisplay from './components/ResultDisplay';
import { calculateBodyMeasurements } from './utils/measurement';
import AdPlaceholder from './components/AdPlaceholder';

function App() {
  const { t, i18n } = useTranslation();

  const initialState = {
    measurements: null,
    error: '',
    isLoading: false,
    processedImages: [],
  };

  function reducer(state, action) {
    switch (action.type) {
      case 'START_ANALYSIS':
        return { ...initialState, isLoading: true };
      case 'ANALYSIS_SUCCESS':
        return { ...state, isLoading: false, measurements: action.payload.measurements, processedImages: action.payload.processedImages };
      case 'ANALYSIS_FAILURE':
        return { ...state, isLoading: false, error: action.payload };
      case 'RESET':
        return initialState;
      default:
        throw new Error();
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState);
  const { measurements, error, isLoading, processedImages } = state;

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleAnalysis = useCallback(async ({ files, height }) => {
    if (!files || files.length === 0 || !height) return;

    dispatch({ type: 'START_ANALYSIS' });

    try {
      // 5초 지연을 위한 Promise
      const minDelay = new Promise(resolve => setTimeout(resolve, 5000));

      // 신체 측정과 5초 지연을 동시에 실행
      const [analysisResult] = await Promise.all([
        calculateBodyMeasurements(files, height),
        minDelay
      ]);

      const { measurements: results, allProcessedImages } = analysisResult;
      dispatch({ type: 'ANALYSIS_SUCCESS', payload: { measurements: results, processedImages: allProcessedImages } });
    } catch (err) {
      const errorMessage = err.message && t(err.message, { ns: 'translation', defaultValue: '' }) ? t(err.message) : t('error_mediapipe');
      dispatch({ type: 'ANALYSIS_FAILURE', payload: errorMessage });
    }
  }, [t]);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-full min-h-[500px]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-lg font-semibold text-slate-600 dark:text-slate-300 mt-6">{t('calculating')}</p>
          <AdPlaceholder style={{ minHeight: '280px', width: '336px', marginTop: '24px' }} />
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col justify-center items-center h-full min-h-[500px] text-center bg-red-50 dark:bg-red-900/20 p-8 rounded-lg">
          <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">{t('error_title')}</h3>
          <p className="mt-3 text-red-500 dark:text-red-400/80 max-w-md">{error}</p>
          <button onClick={resetState} className="mt-8 bg-blue-600 text-white font-bold py-2 px-6 rounded-full hover:bg-blue-700 transition-transform hover:scale-105">
            {t('try_again_button')}
          </button>
        </div>
      );
    }

    if (measurements) {
      return (
        <>
          <ResultDisplay 
            measurements={measurements} 
            processedImages={processedImages}
            onReset={resetState} 
          />
          <AdPlaceholder />
        </>
      );
    }

    return (
      <>
        <Uploader onAnalysis={handleAnalysis} />
        <AdPlaceholder />
      </>
    );
  }

  return (
    <div className="bg-slate-100 dark:bg-gray-900 min-h-screen font-sans antialiased break-keep">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:[text-shadow:0_0_5px_rgba(255,255,255,0.5)]">
              <Trans i18nKey="main_title" />
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">{t('subtitle')}</p>
          </div>
          <div className="flex items-center bg-slate-200 dark:bg-gray-700 rounded-full p-1 text-sm font-medium whitespace-nowrap">
            <button onClick={() => handleLanguageChange('ko')} className={`px-4 py-1 rounded-full transition-colors ${i18n.language.startsWith('ko') ? 'bg-white text-blue-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}>한국어</button>
            <button onClick={() => handleLanguageChange('en')} className={`px-4 py-1 rounded-full transition-colors ${i18n.language.startsWith('en') ? 'bg-white text-blue-600 shadow' : 'text-slate-600 dark:text-slate-300'}`}>English</button>
          </div>
        </header>

        <main className="bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-2xl shadow-xl transition-all duration-300 min-h-[500px]">
          {renderContent()}
        </main>
        <footer className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
          <p>{t('privacy_note')}</p>
          {measurements && (
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{t('measurement_disclaimer')}</p>
          )}
        </footer>
        <div className="text-center mt-4">
          <span className="text-sm font-semibold bg-gradient-to-r from-red-800 to-purple-600 bg-clip-text text-transparent dark:[text-shadow:0_0_5px_rgba(255,255,255,0.5)]">
            {t('brand_name')}
          </span>
          <span className="mx-2 text-slate-500 dark:text-slate-400">|</span>
          <a href="mailto:dorubru0331@gmail.com" className="text-sm text-slate-500 dark:text-slate-400 hover:underline">dorubru0331@gmail.com</a>
        </div>
      </div>
    </div>
  );
}

export default App;
