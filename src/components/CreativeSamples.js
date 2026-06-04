import React from 'react';
import { useTranslation } from 'react-i18next';

const CreativeSamples = ({ onSelectSampleInstant }) => {
  const { t } = useTranslation();

  const samples = [
    {
      id: 'casual',
      icon: '🏠',
      title: t('tab_casual'),
      desc: t('creative_tips_desc_casual', { defaultValue: "정면 전신 사진으로 온라인 쇼핑 전 내 몸에 딱 맞는 사이즈와 핏을 직접 비교해 보세요." }),
      models: [
        { key: 'sample_model', label: t('sample_male_front'), desc: t('sample_male_front_desc'), gender: 'male' },
        { key: 'sample_model_female', label: t('sample_female_front'), desc: t('sample_female_front_desc'), gender: 'female' }
      ]
    },
    {
      id: 'character',
      icon: '🎨',
      title: t('tab_character'),
      desc: t('creative_tip1_desc'),
      models: [
        { key: 'sample_character', label: t('sample_character'), desc: t('sample_character_desc'), gender: 'male' }
      ]
    },
    {
      id: 'celebrity',
      icon: '⭐',
      title: t('tab_celebrity'),
      desc: t('creative_tip2_desc'),
      models: [
        { key: 'sample_celebrity', label: t('sample_celebrity'), desc: t('sample_celebrity_desc'), gender: 'male' }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-left">
        <h3 className="text-base sm:text-lg font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          📸 {t('sample_title')}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t('sample_desc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {samples.map(section => (
          <div 
            key={section.id} 
            className="bg-slate-50/50 dark:bg-gray-900/10 p-5 rounded-2xl border border-slate-200/50 dark:border-gray-800/80 flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-300"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{section.icon}</span>
                <h4 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-200">
                  {section.title}
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed min-h-[48px]">
                {section.desc}
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              {section.models.map(model => (
                <button
                  key={model.key}
                  onClick={() => onSelectSampleInstant(model.key)}
                  className="w-full flex items-center gap-3 p-2.5 text-left rounded-xl border border-slate-200/60 dark:border-gray-800 bg-white dark:bg-gray-950/40 hover:border-indigo-500/70 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 hover:scale-[1.01] transition-all duration-300 group"
                >
                  <div className="w-10 h-14 rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-gray-800 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img 
                      src={`${process.env.PUBLIC_URL}/assets/${model.key}.png`} 
                      alt={model.label} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {model.label}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {model.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CreativeSamples;
