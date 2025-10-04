import React from 'react';
import { useTranslation } from 'react-i18next';

const HelpSection = () => {
  const { t } = useTranslation();

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">{t('help_title')}</h2>
      <div className="text-slate-600 dark:text-slate-300 space-y-4 prose prose-slate dark:prose-invert max-w-none">
        <p>{t('help_p1')}</p>
        <p>{t('help_p2')}</p>
        <p className="font-semibold">{t('help_p3')}</p>
      </div>
    </div>
  );
};

export default HelpSection;