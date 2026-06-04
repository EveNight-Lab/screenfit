import React, { useReducer, useCallback, useEffect, useState, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import Uploader from './components/Uploader';
import ResultDisplay from './components/ResultDisplay';
import { calculateBodyMeasurements } from './utils/measurement';
import { sampleModelData } from './utils/sampleData';
import HelpSection from './components/HelpSection';

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
  const [isHelpVisible, setHelpVisible] = useState(false);
  const [currentTip, setCurrentTip] = useState('');

  const loadingTips = useMemo(() => [
    t('loading_tip_1'),
    t('loading_tip_2'),
    t('loading_tip_3'),
    t('loading_tip_4'),
  ], [t]);

  useEffect(() => {
    if (isLoading) {
      setCurrentTip(loadingTips[0]);
      const tipInterval = setInterval(() => {
        setCurrentTip(prevTip => {
          const currentIndex = loadingTips.indexOf(prevTip);
          const nextIndex = (currentIndex + 1) % loadingTips.length;
          return loadingTips[nextIndex];
        });
      }, 3500); // 3.5초마다 팁 변경

      return () => clearInterval(tipInterval);
    }
  }, [isLoading, loadingTips]);

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  const handleAnalysis = useCallback(async ({ files, height }) => {
    if (!files || files.length === 0 || !height) return;

    dispatch({ type: 'START_ANALYSIS' });

    try {
      // 신체 측정을 바로 실행합니다.
      const analysisResult = await calculateBodyMeasurements(files, height);
      
      const { measurements: results, allProcessedImages } = analysisResult;
      dispatch({ type: 'ANALYSIS_SUCCESS', payload: { measurements: results, processedImages: allProcessedImages } });
    } catch (err) {
      const errorMessage = err.message && t(err.message, { ns: 'translation', defaultValue: '' }) ? t(err.message) : t('error_mediapipe');
      dispatch({ type: 'ANALYSIS_FAILURE', payload: errorMessage });
    }
  }, [t]);

  const handleSelectSample = useCallback(async (modelKey) => {
    const sample = sampleModelData[modelKey];
    if (!sample) return;

    dispatch({ type: 'START_ANALYSIS' });

    try {
      const response = await fetch(`${process.env.PUBLIC_URL}/assets/${modelKey}.png`);
      if (!response.ok) throw new Error('Failed to load sample image');
      const blob = await response.blob();
      
      const file = new File([blob], `${modelKey}.png`, { type: 'image/png' });
      const fileWrapper = {
        id: modelKey,
        originalFile: file,
        preview: URL.createObjectURL(file)
      };

      const analysisResult = await calculateBodyMeasurements([fileWrapper], sample.height);
      const { measurements: results, allProcessedImages } = analysisResult;
      
      dispatch({ type: 'ANALYSIS_SUCCESS', payload: { measurements: results, processedImages: allProcessedImages } });
    } catch (err) {
      dispatch({ type: 'ANALYSIS_FAILURE', payload: err.message });
    }
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col justify-center items-center h-full min-h-[500px] bg-slate-50 dark:bg-gray-800/50 rounded-2xl p-8 text-center">
          <div className="relative h-20 w-20">
            <div className="absolute inset-0 rounded-full border-4 border-blue-200 dark:border-blue-800"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-blue-500 animate-spin"></div>
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-8">{t('calculating')}</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-3 max-w-xs animate-fade-in">{currentTip}</p>
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
        </>
      );
    }

    return (
      <>
        <Uploader onAnalysis={handleAnalysis} onSelectSampleInstant={handleSelectSample} />
      </>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-gray-950 min-h-screen font-sans antialiased break-keep selection:bg-blue-200 dark:selection:bg-blue-800/50">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:via-indigo-300 dark:to-purple-400 dark:[text-shadow:0_0_15px_rgba(99,102,241,0.2)]">
                <Trans i18nKey="main_title" />
              </h1>
              <button onClick={() => setHelpVisible(!isHelpVisible)} className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" aria-label={t('help_title')}>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{t('subtitle')}</p>
          </div>
          <div className="flex items-center bg-slate-200 dark:bg-gray-700/50 rounded-full p-1 text-sm font-medium whitespace-nowrap backdrop-blur-sm self-end sm:self-auto">
            <button onClick={() => handleLanguageChange('ko')} className={`px-4 py-1 rounded-full transition-all duration-300 ${i18n.language.startsWith('ko') ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}>한국어</button>
            <button onClick={() => handleLanguageChange('en')} className={`px-4 py-1 rounded-full transition-all duration-300 ${i18n.language.startsWith('en') ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}>English</button>
          </div>
        </header>

        <main className="bg-white dark:bg-gray-800/90 p-4 sm:p-8 rounded-2xl shadow-xl transition-all duration-300 min-h-[500px] border border-slate-100 dark:border-gray-800">
          {renderContent()}
          {isHelpVisible && (
            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-gray-700">
              <HelpSection />
            </div>
          )}
        </main>
        <footer className="text-center mt-8 text-sm text-slate-500 dark:text-slate-400">
          <p>{t('privacy_note')}</p>
          {measurements && (
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">{t('measurement_disclaimer')}</p>
          )}
        </footer>
        <div className="text-center mt-4">
          <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-purple-400">
            {t('brand_name')}
          </span>
          <span className="mx-2 text-slate-400 dark:text-slate-600">|</span>
          <a href="mailto:junhk950331@gmail.com" className="text-sm text-slate-500 dark:text-slate-400 hover:underline">junhk950331@gmail.com</a>
        </div>
      </div>
    </div>
  );
}

export default App;
