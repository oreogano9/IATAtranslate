import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Search,
  Plane,
  MapPin,
  Globe,
  X,
  History,
  Camera,
  Keyboard,
  RefreshCw,
  Loader2,
  Info,
  Sparkles
} from 'lucide-react';

import AIRPORT_DATA from './data/airports.json';

const apiKey = ""; // Runtime provides the key

/**
 * HELPER: Exponential backoff for API calls
 */
async function fetchWithRetry(url, options, retries = 5, backoff = 1000) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise(resolve => setTimeout(resolve, backoff));
    return fetchWithRetry(url, options, retries - 1, backoff * 2);
  }
}

export default function App() {
  const [mode, setMode] = useState('keyboard'); // 'keyboard' or 'camera'
  const [language, setLanguage] = useState('en'); // 'en' or 'it'
  const [query, setQuery] = useState('');
  const [selectedAirport, setSelectedAirport] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [history, setHistory] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [flashMessage, setFlashMessage] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const copy = {
    en: {
      title: 'Tag to Terminal',
      subtitle: 'Translate airport codes instantly or scan luggage tags with onboard OCR.',
      inputLabel: 'IATA Code',
      placeholder: 'TAG',
      type: 'Type',
      scan: 'Scan',
      hubs: 'Hot Hubs',
      recent: 'Recent Lookups',
      ready: 'Scanner Ready',
      validated: 'Validated',
      city: 'City',
      country: 'Country',
      scanError: 'SCAN ERROR',
      dismiss: 'Dismiss',
      readyTag: 'Ready for your tag',
      how: 'How it works',
      how1: 'Type a 3-letter IATA code or scan the luggage tag.',
      how2: 'Instant match pulls city and country from our ops list.',
      how3: 'Recent lookups keep your handling workflow fast.',
      align: 'Align Tag',
      scanning: 'Identifying Tag...',
      scanTag: 'SCAN TAG',
      scanningBtn: 'SCANNING...',
      detected: 'Detected',
      notInList: 'Code detected but not in our list.',
      noCode: 'No 3-letter code found in tag.',
      cameraDenied: 'Camera access denied or not available.',
      scanFail: 'Scanning failed. Try again.'
    },
    it: {
      title: 'Tag verso Terminal',
      subtitle: 'Traduci i codici IATA in un attimo o scansiona le etichette bagaglio.',
      inputLabel: 'Codice IATA',
      placeholder: 'TAG',
      type: 'Digita',
      scan: 'Scansiona',
      hubs: 'Hub Rapidi',
      recent: 'Ricerche Recenti',
      ready: 'Scanner Pronto',
      validated: 'Verificato',
      city: 'Città',
      country: 'Paese',
      scanError: 'ERRORE SCANSIONE',
      dismiss: 'Chiudi',
      readyTag: 'Pronto per il tuo tag',
      how: 'Come funziona',
      how1: 'Digita un codice IATA di 3 lettere o scansiona l’etichetta.',
      how2: 'Il match immediato mostra città e paese dalla lista operativa.',
      how3: 'Le ricerche recenti accelerano il flusso di handling.',
      align: 'Allinea Tag',
      scanning: 'Identificazione Tag...',
      scanTag: 'SCANSIONA TAG',
      scanningBtn: 'SCANSIONANDO...',
      detected: 'Rilevato',
      notInList: 'Codice rilevato ma non presente nella lista.',
      noCode: 'Nessun codice a 3 lettere trovato.',
      cameraDenied: 'Accesso alla fotocamera negato o non disponibile.',
      scanFail: 'Scansione non riuscita. Riprova.'
    }
  };

  const t = copy[language];

  // Filter ONLY by IATA code prefix
  const suggestions = useMemo(() => {
    if (query.length < 1) return [];
    const upperQuery = query.toUpperCase();
    return AIRPORT_DATA.filter((a) => a.iata.startsWith(upperQuery)).slice(0, 8);
  }, [query]);

  const handleSelect = (airport) => {
    if (!airport) return;
    setSelectedAirport(airport);
    setQuery(airport.iata);
    setShowSuggestions(false);
    addToHistory(airport);
  };

  const addToHistory = (airport) => {
    setHistory(prev => {
      const filtered = prev.filter(h => h.iata !== airport.iata);
      return [airport, ...filtered].slice(0, 6);
    });
  };

  const handleInputChange = (e) => {
    const val = e.target.value.toUpperCase().slice(0, 3);
    setQuery(val);
    setShowSuggestions(true);

    const exactMatch = AIRPORT_DATA.find(a => a.iata === val);
    if (exactMatch) {
      handleSelect(exactMatch);
    } else {
      setSelectedAirport(null);
    }
  };

  // Start/Stop Camera logic
  useEffect(() => {
    let stream = null;
    if (mode === 'camera') {
      const startCamera = async () => {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (err) {
          console.error(err);
          setCameraError(t.cameraDenied);
          setMode('keyboard');
        }
      };
      startCamera();
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode]);

  // OCR Scan logic
  const handleScan = async () => {
    if (!videoRef.current || !canvasRef.current || scanning) return;

    setScanning(true);
    setCameraError(null);

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d');

      // Capture frame
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const base64Image = canvas.toDataURL('image/png').split(',')[1];

      // Call Gemini for OCR
      const prompt = language === 'it'
        ? "Guarda questa etichetta bagaglio. Estrai il codice aeroporto IATA principale di 3 lettere (es. JFK, LAX, CDG). Restituisci solo le 3 lettere maiuscole. Se non trovi nulla, restituisci 'None'."
        : "Look at this luggage tag. Extract the primary 3-letter IATA airport code (e.g., JFK, LAX, CDG). Only return the 3 uppercase letters. If not found, return 'None'.";

      const result = await fetchWithRetry(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/png', data: base64Image } }
              ]
            }]
          })
        }
      );

      const detectedCode = result.candidates?.[0]?.content?.parts?.[0]?.text
        ?.trim()
        .toUpperCase()
        .slice(0, 3);

      if (detectedCode && detectedCode !== 'NON' && detectedCode !== 'NONE') {
        const match = AIRPORT_DATA.find(a => a.iata === detectedCode);
        if (match) {
          handleSelect(match);
          setFlashMessage(`${t.detected}: ${detectedCode}`);
          setTimeout(() => setFlashMessage(null), 2000);
        } else {
          setCameraError(`${t.notInList} (${detectedCode})`);
        }
      } else {
        setCameraError(t.noCode);
      }
    } catch (err) {
      console.error(err);
      setCameraError(t.scanFail);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="min-h-screen app-shell text-white">
      <div className="absolute inset-0 bg-grid bg-[size:36px_36px] opacity-60" />
      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8 md:px-10">
        <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="glass rounded-[32px] p-6 md:p-10 shadow-2xl">
            <header className="flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-400/20 flex items-center justify-center border border-teal-300/40">
                  <Plane className="w-7 h-7 text-teal-300" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-teal-200">IATA Translator</p>
                  <h1 className="text-3xl md:text-4xl font-bold">{t.title}</h1>
                  <p className="text-sm text-slate-300 max-w-sm">
                    {t.subtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/60 rounded-2xl p-1 border border-slate-700/60">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition ${
                    language === 'en'
                      ? 'bg-white text-slate-900'
                      : 'text-slate-300'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('it')}
                  className={`px-3 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition ${
                    language === 'it'
                      ? 'bg-white text-slate-900'
                      : 'text-slate-300'
                  }`}
                >
                  IT
                </button>
              </div>
              <div className="flex items-center gap-2 bg-slate-900/60 rounded-2xl p-1 border border-slate-700/60">
                <button
                  onClick={() => setMode('keyboard')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition ${
                    mode === 'keyboard'
                      ? 'bg-teal-300 text-slate-900'
                      : 'text-slate-300'
                  }`}
                >
                  <Keyboard className="inline-block w-4 h-4 mr-2" />
                  {t.type}
                </button>
                <button
                  onClick={() => setMode('camera')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-[0.2em] transition ${
                    mode === 'camera'
                      ? 'bg-teal-300 text-slate-900'
                      : 'text-slate-300'
                  }`}
                >
                  <Camera className="inline-block w-4 h-4 mr-2" />
                  {t.scan}
                </button>
              </div>
            </header>

            <div className="mt-10">
              {mode === 'keyboard' ? (
                <div className="relative">
                  <label className="text-xs uppercase tracking-[0.5em] text-slate-400">{t.inputLabel}</label>
                  <div className="mt-3 relative">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      autoFocus
                      className="w-full bg-slate-950/60 border border-slate-700 rounded-3xl pl-14 pr-14 py-5 text-4xl md:text-5xl font-black tracking-[0.35em] text-teal-200 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/40 outline-none transition placeholder:text-slate-700 font-mono"
                      placeholder={t.placeholder}
                      value={query}
                      onChange={handleInputChange}
                      onFocus={() => setShowSuggestions(true)}
                    />
                    {query && (
                      <button
                        onClick={() => {
                          setQuery('');
                          setSelectedAirport(null);
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-900 rounded-xl text-slate-400 border border-slate-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  {showSuggestions && suggestions.length > 0 && !selectedAirport && (
                    <div className="absolute z-30 w-full mt-4 glass rounded-3xl overflow-hidden shadow-2xl">
                      {suggestions.map((airport) => (
                        <button
                      key={airport.iata}
                      className="w-full text-left px-6 py-4 hover:bg-slate-900/80 flex items-center justify-between border-b border-slate-800 last:border-0"
                      onClick={() => handleSelect(airport)}
                    >
                      <div className="flex items-baseline gap-4">
                        <span className="text-2xl font-black text-teal-300 font-mono">
                          {airport.iata}
                        </span>
                        <span className="text-slate-200 font-semibold">
                          {language === 'it' ? airport.city_it : airport.city}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 uppercase font-bold">
                        {language === 'it' ? airport.country_it : airport.country}
                      </span>
                    </button>
                  ))}
                </div>
                  )}
                </div>
              ) : (
                <div className="relative bg-slate-900/60 rounded-[32px] overflow-hidden aspect-[4/5] border border-slate-800">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-56 h-32 rounded-3xl border border-teal-300/60 scan-ring flex items-center justify-center">
                      <span className="text-teal-200 text-[10px] font-black uppercase tracking-[0.4em]">
                        {t.align}
                      </span>
                    </div>
                  </div>

                  {scanning && (
                    <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-white">
                      <Loader2 className="w-10 h-10 animate-spin text-teal-300 mb-2" />
                      <p className="text-xs font-black uppercase tracking-[0.4em]">{t.scanning}</p>
                    </div>
                  )}

                  <div className="absolute bottom-6 left-0 right-0 flex justify-center px-6">
                    <button
                      onClick={handleScan}
                      disabled={scanning}
                      className="w-full bg-teal-300 text-slate-950 py-4 rounded-2xl font-black text-lg shadow-glow active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                      {scanning ? t.scanningBtn : t.scanTag}
                    </button>
                  </div>

                  {flashMessage && (
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-teal-400 text-slate-950 px-6 py-3 rounded-full font-black text-xs shadow-glow animate-bounce">
                      {flashMessage}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-10 grid md:grid-cols-2 gap-6">
              <div className="glass rounded-3xl p-6">
                <div className="flex items-center gap-3 text-slate-300">
                  <Sparkles className="w-4 h-4 text-teal-300" />
                  <p className="text-xs uppercase tracking-[0.4em]">{t.hubs}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['LHR', 'JFK', 'DXB', 'SIN', 'CDG', 'BCN'].map(code => (
                    <button
                      key={code}
                      onClick={() => handleSelect(AIRPORT_DATA.find(a => a.iata === code))}
                      className="px-4 py-2 rounded-full text-xs font-black tracking-widest border border-slate-700 text-slate-200 hover:border-teal-300 hover:text-teal-200 transition"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="glass rounded-3xl p-6">
                <div className="flex items-center gap-3 text-slate-300">
                  <History className="w-4 h-4 text-teal-300" />
                  <p className="text-xs uppercase tracking-[0.4em]">{t.recent}</p>
                </div>
                {history.length > 0 ? (
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {history.map((h) => (
                      <button
                        key={h.iata}
                        onClick={() => handleSelect(h)}
                        className="flex flex-col items-start p-4 bg-slate-950/70 rounded-2xl border border-slate-800 hover:border-teal-400 transition"
                      >
                        <span className="font-black text-teal-200 text-xl font-mono tracking-widest">
                          {h.iata}
                        </span>
                        <span className="text-slate-400 text-xs font-semibold truncate w-full text-left">
                          {language === 'it' ? h.city_it : h.city}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-6 text-center text-slate-600 text-xs uppercase tracking-[0.4em]">
                    {t.ready}
                  </div>
                )}
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-6">
            <div className="glass rounded-[32px] p-8 shadow-2xl">
              {selectedAirport ? (
                <div className="space-y-8">
                  <div className="flex items-start justify-between">
                    <div className="bg-teal-300/20 p-4 rounded-2xl border border-teal-300/40">
                      <MapPin className="text-teal-300 w-7 h-7" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase tracking-[0.5em] text-slate-400">{t.validated}</span>
                      <div className="text-4xl font-black text-teal-200 font-mono tracking-[0.3em]">
                        {selectedAirport.iata}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase tracking-[0.5em] text-slate-400">{t.city}</p>
                    <h2 className="text-5xl md:text-6xl font-black leading-none mt-2">
                      {language === 'it' ? selectedAirport.city_it : selectedAirport.city}
                    </h2>
                  </div>

                  <div className="border-t border-slate-800 pt-6 flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.5em] text-slate-400">{t.country}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Globe className="w-5 h-5 text-teal-200" />
                        <p className="text-2xl font-semibold text-slate-200">
                          {language === 'it' ? selectedAirport.country_it : selectedAirport.country}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedAirport(null);
                        setQuery('');
                      }}
                      className="p-3 bg-slate-900 rounded-2xl text-slate-400 hover:text-teal-200 border border-slate-800 transition"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : cameraError ? (
                <div className="text-center">
                  <div className="bg-rose-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/30">
                    <Info className="text-rose-400 w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-100 mb-2">{t.scanError}</h3>
                  <p className="text-rose-300 text-sm font-semibold px-2">{cameraError}</p>
                  <button
                    onClick={() => setCameraError(null)}
                    className="mt-6 text-teal-200 font-black uppercase text-xs tracking-[0.4em]"
                  >
                    {t.dismiss}
                  </button>
                </div>
              ) : (
                <div className="text-center text-slate-400">
                  <Plane className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                  <p className="text-xs uppercase tracking-[0.5em]">{t.readyTag}</p>
                </div>
              )}
            </div>

            <div className="glass rounded-[32px] p-6 text-sm text-slate-300">
              <p className="uppercase tracking-[0.4em] text-xs text-slate-400">{t.how}</p>
              <ul className="mt-4 space-y-3">
                <li>{t.how1}</li>
                <li>{t.how2}</li>
                <li>{t.how3}</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
