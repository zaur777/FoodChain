
import React from 'react';
import { translations } from '../translations';
import { Language, Company } from '../types';
import { ICONS } from '../constants';

interface LandingPageProps {
  lang: Language;
  onLogin: (company: Company, shouldCreate?: boolean) => void;
  setLang: (lang: Language) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ lang, onLogin, setLang }) => {
  const t = translations[lang];

  const handleMockAction = (plan: 'small' | 'middle' | 'big', shouldCreate: boolean = false) => {
    onLogin({
      id: `company-${Date.now()}`,
      name: "Global Food Corp",
      email: "info@foodcorp.com",
      plan: plan
    }, shouldCreate);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 text-slate-900">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <ICONS.Clipboard />
          </div>
          <span className="text-2xl font-black tracking-tighter">FoodSafe</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-200 p-1 rounded-lg">
            {(['az', 'ru', 'en'] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all uppercase ${lang === l ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
              >
                {l}
              </button>
            ))}
          </div>
          <button onClick={() => handleMockAction('middle')} className="text-sm font-bold text-slate-600 hover:text-indigo-600">{t.login}</button>
          <button onClick={() => handleMockAction('middle')} className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg hover:bg-slate-800 transition-all">{t.register}</button>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="px-6 pt-20 pb-32 text-center max-w-5xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 leading-tight tracking-tighter">
            {t.heroTitle}
          </h1>
          <p className="text-xl text-slate-500 mb-10 max-w-3xl mx-auto leading-relaxed">
            {t.heroSub}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => handleMockAction('middle', true)} 
              className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-bold shadow-xl hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
            >
              {t.getStarted}
            </button>
            <div className="flex items-center gap-4 px-8 py-4 bg-white rounded-xl border border-slate-200 text-slate-600 font-semibold">
              <span className="flex text-amber-500">★★★★★</span>
              <span>BRCGS Compliant</span>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="bg-slate-900 py-32 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-black text-white mb-4 tracking-tight">{t.pricingTitle}</h2>
              <p className="text-slate-400 font-medium">{t.pricingSub}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <PricingCard 
                title={t.smallCompany} 
                price="19" 
                features={t.features.small} 
                onSelect={() => handleMockAction('small', true)}
                lang={lang}
              />
              <PricingCard 
                title={t.middleCompany} 
                price="29" 
                features={t.features.middle} 
                featured={true} 
                onSelect={() => handleMockAction('middle', true)}
                lang={lang}
              />
              <PricingCard 
                title={t.bigCompany} 
                price="199" 
                features={t.features.big} 
                onSelect={() => handleMockAction('big', true)}
                lang={lang}
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="p-12 text-center text-slate-400 text-sm font-medium border-t border-slate-100">
        &copy; 2024 FoodSafe HACCP Systems. {t.heroTitle}
      </footer>
    </div>
  );
};

const PricingCard = ({ title, price, features, featured = false, onSelect, lang }: any) => {
  const t = translations[lang as Language];
  return (
    <div className={`relative p-8 rounded-3xl border transition-all duration-500 hover:scale-105 ${
      featured 
      ? 'bg-indigo-600 border-indigo-400 shadow-2xl scale-110 z-10' 
      : 'bg-slate-800 border-slate-700 hover:border-slate-500'
    }`}>
      {featured && (
        <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
          {t.popular}
        </span>
      )}
      <h3 className={`text-xl font-bold mb-6 ${featured ? 'text-white' : 'text-slate-300'}`}>{title}</h3>
      <div className="flex items-baseline gap-2 mb-8">
        <span className={`text-5xl font-black ${featured ? 'text-white' : 'text-slate-100'}`}>{price} ₼</span>
        <span className={featured ? 'text-indigo-200' : 'text-slate-500'}>/ {t.perMonth}</span>
      </div>
      <ul className="space-y-4 mb-10">
        {features.map((f: string) => (
          <li key={f} className={`flex items-center gap-3 text-sm font-medium ${featured ? 'text-indigo-50' : 'text-slate-400'}`}>
            <span className={featured ? 'text-amber-300' : 'text-indigo-400'}>✔</span> {f}
          </li>
        ))}
      </ul>
      <button 
        onClick={onSelect}
        className={`w-full py-4 rounded-xl font-bold transition-all ${
          featured 
          ? 'bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg' 
          : 'bg-slate-700 text-white hover:bg-slate-600'
        }`}
      >
        {t.getStarted}
      </button>
    </div>
  );
};

export default LandingPage;
