import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search, Plane, MapPin, Globe, X, History, RefreshCw, Trash2, Settings, Copy, Plus
} from 'lucide-react';

import BASE_AIRPORT_DATA from './data/airports.json';
import AIRPORT_DATA_V2 from './data/airportsv2.js';

const AIRPORT_DATA = [...BASE_AIRPORT_DATA, ...AIRPORT_DATA_V2];

// ── Country name → ISO 3166-1 alpha-2 ──────────────────────────────────────
const CC = {
  'Afghanistan': 'AF', 'Algeria': 'DZ', 'American Samoa': 'AS',
  'Angola': 'AO', 'Antigua and Barbuda': 'AG', 'Argentina': 'AR',
  'Armenia': 'AM', 'Aruba': 'AW', 'Australia': 'AU', 'Austria': 'AT',
  'Bahamas': 'BS', 'Bahrain': 'BH', 'Bangladesh': 'BD', 'Barbados': 'BB',
  'Belarus': 'BY', 'Belgium': 'BE', 'Belize': 'BZ', 'Benin': 'BJ',
  'Bermuda': 'BM', 'Bolivia': 'BO', 'Brazil': 'BR',
  'British Virgin Islands': 'VG', 'Brunei': 'BN', 'Bulgaria': 'BG',
  'Burkina Faso': 'BF', 'Burundi': 'BI', 'Cambodia': 'KH',
  'Cameroon': 'CM', 'Canada': 'CA', 'Cape Verde': 'CV',
  'Caribbean Netherlands': 'BQ', 'Cayman Islands': 'KY',
  'Central African Republic': 'CF', 'Chad': 'TD', 'Chile': 'CL',
  'China': 'CN', 'Colombia': 'CO', 'Comoros': 'KM', 'Cook Islands': 'CK',
  'Costa Rica': 'CR', 'Croatia': 'HR', 'Cuba': 'CU', 'Curaçao': 'CW',
  'Cyprus': 'CY', 'Czech Republic': 'CZ', "Côte d'Ivoire": 'CI',
  'Democratic Republic of the Congo': 'CD', 'Denmark': 'DK',
  'Djibouti': 'DJ', 'Dominica': 'DM', 'Dominican Republic': 'DO',
  'Ecuador': 'EC', 'Egypt': 'EG', 'El Salvador': 'SV', 'Eritrea': 'ER',
  'Estonia': 'EE', 'Ethiopia': 'ET', 'Fiji': 'FJ', 'Finland': 'FI',
  'France': 'FR', 'French Guiana': 'GF', 'French Polynesia': 'PF',
  'Gabon': 'GA', 'Gambia': 'GM', 'Georgia': 'GE', 'Germany': 'DE',
  'Ghana': 'GH', 'Greece': 'GR', 'Greenland': 'GL', 'Grenada': 'GD',
  'Guadeloupe': 'GP', 'Guam': 'GU', 'Guatemala': 'GT', 'Guernsey': 'GG',
  'Guinea': 'GN', 'Guyana': 'GY', 'Haiti': 'HT', 'Honduras': 'HN',
  'Hong Kong': 'HK', 'Hungary': 'HU', 'Iceland': 'IS', 'India': 'IN',
  'Indonesia': 'ID', 'Iran': 'IR', 'Iraq': 'IQ', 'Ireland': 'IE',
  'Israel': 'IL', 'Italy': 'IT', 'Jamaica': 'JM', 'Japan': 'JP',
  'Jersey': 'JE', 'Johnston Atoll': 'UM', 'Jordan': 'JO',
  'Kazakhstan': 'KZ', 'Kenya': 'KE', 'Kuwait': 'KW', 'Laos': 'LA',
  'Latvia': 'LV', 'Lebanon': 'LB', 'Liberia': 'LR', 'Libya': 'LY',
  'Lithuania': 'LT', 'Luxembourg': 'LU', 'Madagascar': 'MG',
  'Malawi': 'MW', 'Malaysia': 'MY', 'Maldives': 'MV', 'Mali': 'ML',
  'Malta': 'MT', 'Marshall Islands': 'MH', 'Martinique': 'MQ',
  'Mauritania': 'MR', 'Mauritius': 'MU', 'Mexico': 'MX',
  'Micronesia': 'FM', 'Mongolia': 'MN', 'Morocco': 'MA',
  'Mozambique': 'MZ', 'Myanmar': 'MM', 'Namibia': 'NA', 'Nepal': 'NP',
  'Netherlands': 'NL', 'New Caledonia': 'NC', 'New Zealand': 'NZ',
  'Nicaragua': 'NI', 'Niger': 'NE', 'Nigeria': 'NG', 'North Korea': 'KP',
  'Northern Mariana Islands': 'MP', 'Norway': 'NO', 'Oman': 'OM',
  'Pakistan': 'PK', 'Palau': 'PW', 'Panama': 'PA',
  'Papua New Guinea': 'PG', 'Paraguay': 'PY', 'Peru': 'PE',
  'Philippines': 'PH', 'Poland': 'PL', 'Portugal': 'PT',
  'Puerto Rico': 'PR', 'Qatar': 'QA', 'Republic of the Congo': 'CG',
  'Romania': 'RO', 'Russia': 'RU', 'Rwanda': 'RW', 'Réunion': 'RE',
  'Saint Kitts and Nevis': 'KN', 'Saint Lucia': 'LC',
  'Saint Vincent and the Grenadines': 'VC', 'Samoa': 'WS',
  'Saudi Arabia': 'SA', 'Senegal': 'SN', 'Serbia': 'RS',
  'Seychelles': 'SC', 'Sierra Leone': 'SL', 'Singapore': 'SG',
  'Sint Maarten': 'SX', 'Slovakia': 'SK', 'Slovenia': 'SI',
  'South Africa': 'ZA', 'South Korea': 'KR', 'South Sudan': 'SS',
  'Spain': 'ES', 'Sri Lanka': 'LK', 'Suriname': 'SR', 'Sweden': 'SE',
  'Switzerland': 'CH', 'Syria': 'SY', 'São Tomé and Principe': 'ST',
  'Taiwan': 'TW', 'Tanzania': 'TZ', 'Thailand': 'TH', 'Togo': 'TG',
  'Tonga': 'TO', 'Trinidad and Tobago': 'TT', 'Tunisia': 'TN',
  'Turkey': 'TR', 'Turks and Caicos Islands': 'TC',
  'U.S. Virgin Islands': 'VI', 'Uganda': 'UG', 'Ukraine': 'UA',
  'United Arab Emirates': 'AE', 'United Kingdom': 'GB',
  'United States': 'US', 'Uruguay': 'UY', 'Uzbekistan': 'UZ',
  'Vanuatu': 'VU', 'Venezuela': 'VE', 'Vietnam': 'VN', 'Yemen': 'YE',
  'Zambia': 'ZM', 'Zimbabwe': 'ZW',
};

function getFlag(countryEn) {
  const code = CC[countryEn];
  if (!code) return '';
  return [...code].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('');
}

// Split "New York, John F. Kennedy" → { city: "New York", airport: "John F. Kennedy" }
function parseCity(cityField) {
  const i = cityField.indexOf(',');
  if (i === -1) return { city: cityField, airport: null };
  return { city: cityField.slice(0, i).trim(), airport: cityField.slice(i + 1).trim() };
}

export default function App() {
  const [language, setLanguage] = useState('it');
  const [page, setPage] = useState('main');
  const [query, setQuery] = useState('');
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [missingPromptCode, setMissingPromptCode] = useState(null);
  const [history, setHistory] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem('iata-history');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [missingCodes, setMissingCodes] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem('iata-missing-codes');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const resultRef = useRef(null);

  const copy = {
    en: {
      title: 'Translate IATA Code',
      subtitle: 'Search by code, city, or country.',
      inputLabel: 'Code or City',
      placeholder: 'MXP',
      settings: 'Settings',
      back: 'Back',
      recent: 'Recent Lookups',
      ready: 'Ready',
      city: 'City',
      airport: 'Airport',
      country: 'Country',
      readyTag: 'Type a code or city name',
      clearHistory: 'Clear',
      unknownTitle: 'Code not found',
      saveCode: 'Save code',
      dismiss: 'Dismiss',
      missingTitle: 'Missing IATA Codes',
      missingSubtitle: 'Stored locally in this browser.',
      emptyMissing: 'No missing codes saved yet.',
      copyRaw: 'Copy raw text',
      clearMissing: 'Clear list',
    },
    it: {
      title: 'Traduci codice IATA',
      subtitle: 'Cerca per codice, città o paese.',
      inputLabel: 'Codice o Città',
      placeholder: 'MXP',
      settings: 'Impostazioni',
      back: 'Indietro',
      recent: 'Ricerche Recenti',
      ready: 'Pronto',
      city: 'Città',
      airport: 'Aeroporto',
      country: 'Paese',
      readyTag: 'Cerca un codice o una città',
      clearHistory: 'Cancella',
      unknownTitle: 'Codice non trovato',
      saveCode: 'Salva codice',
      dismiss: 'Chiudi',
      missingTitle: 'Codici IATA Mancanti',
      missingSubtitle: 'Salvati localmente in questo browser.',
      emptyMissing: 'Nessun codice mancante salvato.',
      copyRaw: 'Copia testo',
      clearMissing: 'Svuota lista',
    }
  };

  const t = copy[language];

  // Search by IATA prefix OR city/country name
  const suggestions = useMemo(() => {
    if (query.length < 1) return [];
    const upper = query.toUpperCase();
    const lower = query.toLowerCase();

    const codeMatches = upper.length <= 3
      ? AIRPORT_DATA.filter(a => a.iata.startsWith(upper))
      : [];

    const codeSet = new Set(codeMatches.map(a => a.iata));
    const cityMatches = query.length >= 2
      ? AIRPORT_DATA.filter(a =>
          !codeSet.has(a.iata) && (
            a.city.toLowerCase().includes(lower) ||
            a.city_it.toLowerCase().includes(lower) ||
            a.country.toLowerCase().includes(lower) ||
            a.country_it.toLowerCase().includes(lower)
          )
        )
      : [];

    return [...codeMatches, ...cityMatches].slice(0, 8);
  }, [query]);

  const handleSelect = (airport) => {
    if (!airport) return;
    setSelectedAirport(airport);
    setQuery(airport.iata);
    setShowSuggestions(false);
    addToHistory(airport);
    setTimeout(() => {
      if (resultRef.current) {
        resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const addToHistory = (airport) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.iata !== airport.iata);
      return [airport, ...filtered];
    });
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('iata-history', JSON.stringify(history));
    } catch {}
  }, [history]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('iata-missing-codes', JSON.stringify(missingCodes));
    } catch {}
  }, [missingCodes]);

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase();
    setQuery(val);
    setShowSuggestions(true);
    setMissingPromptCode(null);
    // Auto-select on exact 3-char IATA match
    if (/^[A-Z]{3}$/.test(val)) {
      const exactMatch = AIRPORT_DATA.find(a => a.iata === val);
      if (exactMatch) { handleSelect(exactMatch); return; }
      setSelectedAirport(null);
      setMissingPromptCode(val);
      e.target.blur();
      return;
    }
    setSelectedAirport(null);
  };

  const saveMissingCode = (code) => {
    if (!code) return;
    setMissingCodes(prev => (prev.includes(code) ? prev : [...prev, code]));
    setMissingPromptCode(null);
  };

  const copyMissingCodes = async () => {
    if (!missingCodes.length || typeof navigator === 'undefined' || !navigator.clipboard) return;
    await navigator.clipboard.writeText(missingCodes.join('\n'));
  };

  // ── Reusable JSX sections ────────────────────────────────────────────────

  const headerSection = (
    <header className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-teal-400/20 flex items-center justify-center border border-teal-300/40">
          <Plane className="w-7 h-7 text-teal-300" />
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-teal-200">IATA Translator</p>
          <h1 className="text-3xl md:text-4xl font-bold">{t.title}</h1>
          <p className="text-sm text-slate-300 max-w-sm">{t.subtitle}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-slate-900/60 rounded-2xl p-1 border border-slate-700/60">
        {['en', 'it'].map(lang => (
          <button key={lang} onClick={() => setLanguage(lang)}
            className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition ${language === lang ? 'bg-white text-slate-900' : 'text-slate-300'}`}>
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
      <button
        onClick={() => setPage(page === 'settings' ? 'main' : 'settings')}
        className="flex items-center gap-2 bg-slate-900/60 rounded-2xl px-4 py-3 border border-slate-700/60 text-xs font-black uppercase tracking-[0.2em] text-slate-300 hover:text-teal-200 transition"
      >
        <Settings className="w-4 h-4" />
        {page === 'settings' ? t.back : t.settings}
      </button>
    </header>
  );

  const searchSection = (
    <div className="relative">
      <label className="text-xs uppercase tracking-[0.5em] text-slate-400">{t.inputLabel}</label>
      <div className="mt-3 relative">
        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          autoCapitalize="characters"
          autoCorrect="off"
          spellCheck={false}
          className={`w-full bg-slate-950/60 border border-slate-700 rounded-3xl pl-14 pr-14 py-5 text-teal-200 uppercase focus:border-teal-300 focus:ring-2 focus:ring-teal-300/40 outline-none transition placeholder:text-slate-700 ${
            query.length > 3
              ? 'text-2xl md:text-3xl font-bold tracking-wide'
              : 'text-4xl md:text-5xl font-black tracking-[0.35em] font-mono'
          }`}
          placeholder={t.placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
        />
        {missingPromptCode && query.length === 3 && (
          <button
            onClick={() => saveMissingCode(missingPromptCode)}
            className="absolute right-16 top-1/2 -translate-y-1/2 p-2 bg-amber-500/15 rounded-xl text-amber-300 border border-amber-400/40 hover:bg-amber-500/20 transition"
            title={t.saveCode}
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
        {query && (
          <button onClick={() => { setQuery(''); setSelectedAirport(null); setMissingPromptCode(null); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-900 rounded-xl text-slate-400 border border-slate-700">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && !selectedAirport && (
        <div className="absolute z-30 w-full mt-4 glass rounded-3xl overflow-hidden shadow-2xl">
          {suggestions.map(airport => {
            const parsed = parseCity(language === 'it' ? airport.city_it : airport.city);
            return (
              <button key={airport.iata}
                className="w-full text-left px-6 py-4 hover:bg-slate-900/80 flex items-center justify-between border-b border-slate-800 last:border-0"
                onClick={() => handleSelect(airport)}>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black text-teal-300 font-mono">{airport.iata}</span>
                  <span className="text-slate-200 font-semibold">{parsed.city}</span>
                  {parsed.airport && (
                    <span className="text-slate-500 text-xs hidden sm:inline">{parsed.airport}</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1 shrink-0 ml-2">
                  <span>{getFlag(airport.country)}</span>
                  <span className="hidden sm:inline">{language === 'it' ? airport.country_it : airport.country}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  const historySection = (
    <div className="glass rounded-3xl p-6">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-3 text-slate-300">
          <History className="w-4 h-4 text-teal-300" />
          <p className="text-xs uppercase tracking-[0.4em]">{t.recent}</p>
        </div>
        {history.length > 0 && (
          <button onClick={() => setHistory([])}
            className="flex items-center gap-1 text-slate-600 hover:text-rose-400 transition text-[10px] uppercase tracking-widest font-bold">
            <Trash2 className="w-3 h-3" />
            {t.clearHistory}
          </button>
        )}
      </div>
      {history.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {history.map(h => {
            const parsed = parseCity(language === 'it' ? h.city_it : h.city);
            return (
              <div key={h.iata} className="relative group">
                <button onClick={() => handleSelect(h)}
                  className="w-full flex flex-col items-start p-4 bg-slate-950/70 rounded-2xl border border-slate-800 hover:border-teal-400 transition">
                  <span className="font-black text-teal-200 text-xl font-mono tracking-widest">{h.iata}</span>
                  <span className="text-slate-400 text-xs font-semibold truncate w-full text-left">{parsed.city}</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setHistory(prev => prev.filter(x => x.iata !== h.iata)); }}
                  className="absolute top-2 right-2 p-1 rounded-lg bg-slate-900/80 text-slate-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition border border-slate-700">
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 text-center text-slate-600 text-xs uppercase tracking-[0.4em]">{t.ready}</div>
      )}
    </div>
  );

  const resultSection = (
    <div ref={resultRef} className="glass rounded-[32px] p-8 shadow-2xl">
      {selectedAirport ? (() => {
        const cityField = language === 'it' ? selectedAirport.city_it : selectedAirport.city;
        const { city, airport: airportName } = parseCity(cityField);
        const emoji = getFlag(selectedAirport.country);
        const countryName = language === 'it' ? selectedAirport.country_it : selectedAirport.country;
        return (
          <div className="space-y-6">
            <div className="flex items-start justify-between">
              <div className="bg-teal-300/20 p-4 rounded-2xl border border-teal-300/40">
                <MapPin className="text-teal-300 w-7 h-7" />
              </div>
              <div className="text-right">
                <div className="text-4xl font-black text-teal-200 font-mono tracking-[0.3em]">
                  {selectedAirport.iata}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-slate-400">{t.city}</p>
              <h2 className="text-5xl md:text-6xl font-black leading-none mt-1">{city}</h2>
              {airportName && (
                <p className="text-slate-400 text-lg font-semibold mt-2">{airportName}</p>
              )}
            </div>

            <div className="border-t border-slate-800 pt-6 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.5em] text-slate-400">{t.country}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-3xl leading-none">{emoji}</span>
                  <p className="text-xl font-semibold text-slate-200">{countryName}</p>
                </div>
              </div>
              <button onClick={() => { setSelectedAirport(null); setQuery(''); }}
                className="p-3 bg-slate-900 rounded-2xl text-slate-400 hover:text-teal-200 border border-slate-800 transition">
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        );
      ) : (
        <div className="text-center text-slate-400">
          <Plane className="w-16 h-16 text-slate-700 mx-auto mb-4" />
          <p className="text-xs uppercase tracking-[0.5em]">{t.readyTag}</p>
        </div>
      )}
    </div>
  );

  const settingsSection = (
    <section className="flex flex-col gap-6 glass rounded-[32px] p-6 md:p-10 shadow-2xl">
      {headerSection}
      <div className="glass rounded-[32px] p-6 shadow-2xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-teal-200">{t.missingTitle}</p>
            <p className="text-sm text-slate-400 mt-1">{t.missingSubtitle}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={copyMissingCodes}
              disabled={!missingCodes.length}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-black uppercase tracking-[0.2em] text-slate-300 disabled:opacity-40"
            >
              <Copy className="w-4 h-4" />
              {t.copyRaw}
            </button>
            <button
              onClick={() => setMissingCodes([])}
              disabled={!missingCodes.length}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-black uppercase tracking-[0.2em] text-slate-300 disabled:opacity-40"
            >
              <Trash2 className="w-4 h-4" />
              {t.clearMissing}
            </button>
          </div>
        </div>

        {missingCodes.length ? (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-2">
              {missingCodes.map(code => (
                <span
                  key={code}
                  className="px-3 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-teal-200 font-black font-mono tracking-[0.2em]"
                >
                  {code}
                </span>
              ))}
            </div>
            <textarea
              readOnly
              value={missingCodes.join('\n')}
              className="w-full min-h-48 bg-slate-950/60 border border-slate-800 rounded-3xl p-4 text-sm text-slate-300 font-mono outline-none resize-y"
            />
          </div>
        ) : (
          <div className="mt-6 text-center text-slate-600 text-xs uppercase tracking-[0.4em]">{t.emptyMissing}</div>
        )}
      </div>
    </section>
  );

  // ── Layout ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen app-shell text-white pb-16 md:pb-0">
      <div className="absolute inset-0 bg-grid bg-[size:36px_36px] opacity-60" />
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8 md:px-10">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          {page === 'settings' ? (
            settingsSection
          ) : (
            <>
              <section className="flex flex-col gap-6 glass rounded-[32px] p-6 md:p-10 shadow-2xl">
                {headerSection}
                <div className="mt-2">{searchSection}</div>
                {resultSection}
              </section>

              <div className="glass rounded-[32px] p-6 shadow-2xl">
                {historySection}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
