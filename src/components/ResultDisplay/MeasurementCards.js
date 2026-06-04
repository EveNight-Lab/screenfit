import React from 'react';
import { useTranslation } from 'react-i18next';

export const ConfidenceBadge = ({ score }) => {
  if (score === undefined || score === null) return null;
  const percentage = (score * 100).toFixed(1);
  const getColor = () => {
    if (score > 0.85) return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
    if (score > 0.6) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
    return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
  };
  return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getColor()}`}>{percentage}%</span>;
};

export const MeasurementCard = ({ item }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold" style={{ color: item.color }}>{item.label}</h3>
          <p className="text-2xl font-light text-slate-900 dark:text-white mt-1">{item.value} cm</p>
        </div>
        <ConfidenceBadge score={item.confidence} />
      </div>
      {item.recommendations && (
        <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-gray-700">
          <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">{t('fit_guide_title')}</h4>
          {item.recommendations.map(rec => (
            <div key={rec.label} className="flex justify-between items-center text-sm">
              <span className="text-slate-500 dark:text-slate-400">{rec.label}</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-gray-700/50 px-2 py-0.5 rounded">{rec.value} cm</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MeasurementCards = ({ items }) => {
  return (
    <div className="space-y-4">
      {items.map(item => (
        <MeasurementCard key={item.label} item={item} />
      ))}
    </div>
  );
};

export default MeasurementCards;
