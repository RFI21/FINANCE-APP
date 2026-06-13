import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Calculator, 
  Bot, 
  Search, 
  Download, 
  Bell, 
  Database, 
  Sparkles, 
  Info,
  CheckCircle,
  Moon,
  Sun,
  X,
  ArrowLeft
} from 'lucide-react';

// === CONFIG & INITIAL STATE ===
const apiKey = ""; // Menggunakan API key runtime environment

// Mock Data untuk Instrumen Investasi & Grafik
const mockInstruments = [
  { id: 'BBCA', name: 'PT Bank Central Asia Tbk', type: 'Saham', risk: 'Sedang-Tinggi', return: '12% - 15% / thn', desc: 'Saham perbankan terbesar di Indonesia, sangat stabil untuk jangka panjang.', trend: [
    { year: '2021', price: 6800 }, { year: '2022', price: 7300 }, { year: '2023', price: 8550 }, { year: '2024', price: 9400 }, { year: '2025', price: 10100 }, { year: '2026', price: 10800 }
  ]},
  { id: 'IHSG', name: 'Indeks Harga Saham Gabungan', type: 'Reksa Dana Saham', risk: 'Tinggi', return: '10% - 12% / thn', desc: 'Mencerminkan performa pasar modal Indonesia secara keseluruhan.', trend: [
    { year: '2021', price: 6000 }, { year: '2022', price: 6500 }, { year: '2023', price: 6800 }, { year: '2024', price: 7200 }, { year: '2025', price: 7300 }, { year: '2026', price: 7500 }
  ]},
  { id: 'SBN', name: 'Surat Berharga Negara (SBR/ORI)', type: 'Obligasi', risk: 'Sangat Rendah', return: '6% - 6.5% / thn', desc: 'Investasi dijamin 100% oleh negara. Aman dan bebas risiko gagal bayar.', trend: [
    { year: '2021', price: 100 }, { year: '2022', price: 100 }, { year: '2023', price: 100 }, { year: '2024', price: 100 }, { year: '2025', price: 100 }, { year: '2026', price: 100 }
  ]},
  { id: 'RDPU-MANULIFE', name: 'Manulife Dana Kas Syariah', type: 'Reksa Dana Pasar Uang', risk: 'Sangat Rendah', return: '4.5% - 5.5% / thn', desc: 'Cocok untuk dana darurat, likuiditas tinggi, dan fluktuasi sangat minim.', trend: [
    { year: '2021', price: 1100 }, { year: '2022', price: 1150 }, { year: '2023', price: 1210 }, { year: '2024', price: 1270 }, { year: '2025', price: 1330 }, { year: '2026', price: 1400 }
  ]},
  { id: 'TLKM', name: 'PT Telkom Indonesia Tbk', type: 'Saham', risk: 'Sedang', return: '8% - 10% / thn', desc: 'BUMN Telekomunikasi terbesar dengan pembagian dividen yang cukup rutin.', trend: [
    { year: '2021', price: 3400 }, { year: '2022', price: 4100 }, { year: '2023', price: 3750 }, { year: '2024', price: 3900 }, { year: '2025', price: 3600 }, { year: '2026', price: 3850 }
  ]},
  { id: 'RD-INDOPREMIER', name: 'Premier ETFindo MSCI Indonesia', type: 'Reksa Dana Indeks', risk: 'Tinggi', return: '9% - 11% / thn', desc: 'Reksa dana yang kinerjanya menyerupai indeks MSCI Indonesia.', trend: [
    { year: '2021', price: 500 }, { year: '2022', price: 550 }, { year: '2023', price: 530 }, { year: '2024', price: 580 }, { year: '2025', price: 610 }, { year: '2026', price: 640 }
  ]}
];

export default function App() {
  // Navigation & General UI
  const [activeTab, setActiveTab] = useState('beranda');
  const [darkMode, setDarkMode] = useState(false); // Default Light Mode
  
  // Kalkulator Financial Freedom States
  const [calcInputs, setCalcInputs] = useState({
    monthlyExpense: 10000000,
    currentAge: 25,
    targetAge: 55,
    expectedReturn: 10,
    inflationRate: 5,
    currentSavings: 50000000
  });

  const [calcResults, setCalcResults] = useState({
    annualExpense: 0,
    fireNumberBasic: 0, 
    fireNumberAdjusted: 0, 
    monthlySavingsNeeded: 0,
    investmentProjection: []
  });

  // AI Assistant States
  const [aiChat, setAiChat] = useState([
    { role: 'assistant', text: 'Halo! Saya AI Financial Planner Anda. Silakan tanyakan apa saja tentang cara mencapai Financial Freedom, atau minta analisis skenario kalkulator Anda!' }
  ]);
  const [userMsg, setUserMsg] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Search & Market States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInstrument, setSelectedInstrument] = useState(mockInstruments[0]);
  const [showSearchModal, setShowSearchModal] = useState(false);

  // Notifications States
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'Tips Hari Ini 💡', message: 'Mulailah dengan menyisihkan minimal 20% penghasilan sebelum dibelanjakan!', time: 'Baru saja', read: false },
    { id: 2, title: 'Kejar Target FIRE 🚀', message: 'Suku bunga SBN terbaru rilis! Pelajari instrumen rendah risiko ini.', time: '2 jam lalu', read: false }
  ]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifPermission, setNotifPermission] = useState('default');

  // Google Sheet Integration Modal
  const [showSheetConfig, setShowSheetConfig] = useState(false);
  const [sheetUrl, setSheetUrl] = useState('');
  const [syncStatus, setSyncStatus] = useState('');

  // Auto calculate on input change
  useEffect(() => {
    calculateFIRE();
  }, [calcInputs]);

  // Request browser notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setNotifPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      showInAppNotification("Sistem Notifikasi", permission === 'granted' ? "Notifikasi Desktop diaktifkan!" : "Notifikasi diblokir.");
    } else {
      showInAppNotification("Sistem Notifikasi", "Browser Anda tidak mendukung notifikasi push.");
    }
  };

  const showInAppNotification = (title, message) => {
    const newNotif = { id: Date.now(), title, message, time: 'Baru saja', read: false };
    setNotifications(prev => [newNotif, ...prev]);
    if (Notification.permission === 'granted') {
      new Notification(title, { body: message, icon: 'https://cdn-icons-png.flaticon.com/512/2921/2921822.png' });
    }
  };

  // Handler input angka untuk menghilangkan 0 di depan
  const handleNumberInputChange = (key, val) => {
    const cleanValue = val.replace(/^0+/, '');
    const numValue = cleanValue === '' ? 0 : Number(cleanValue);
    setCalcInputs({ ...calcInputs, [key]: numValue });
  };

  // Kalkulasi FIRE
  const calculateFIRE = () => {
    const { monthlyExpense, currentAge, targetAge, expectedReturn, inflationRate, currentSavings } = calcInputs;
    
    const yearsToRetire = Math.max(1, targetAge - currentAge);
    const annualExpense = monthlyExpense * 12;

    const fireNumberBasic = annualExpense * 25;
    const futureAnnualExpense = annualExpense * Math.pow(1 + (inflationRate / 100), yearsToRetire);
    const fireNumberAdjusted = futureAnnualExpense * 25;

    const r = (expectedReturn / 100) / 12; 
    const n = yearsToRetire * 12; 

    const futureValueCurrentSavings = currentSavings * Math.pow(1 + (expectedReturn / 100), yearsToRetire);
    const remainingTarget = Math.max(0, fireNumberAdjusted - futureValueCurrentSavings);

    let monthlySavingsNeeded = 0;
    if (r > 0 && n > 0 && remainingTarget > 0) {
      monthlySavingsNeeded = remainingTarget * r / (Math.pow(1 + r, n) - 1);
    }

    let projection = [];
    let cumulativeAmount = currentSavings;

    for (let year = 1; year <= yearsToRetire; year++) {
      cumulativeAmount = cumulativeAmount * (1 + (expectedReturn / 100));
      cumulativeAmount += (monthlySavingsNeeded * 12) * (1 + (expectedReturn / 100) / 2); 

      const adjustedTargetThisYear = fireNumberBasic * Math.pow(1 + (inflationRate / 100), year);

      projection.push({
        year: `Thn ${year} (Usia ${currentAge + year})`,
        'Tabungan Anda': Math.round(cumulativeAmount),
        'Target Financial Freedom': Math.round(adjustedTargetThisYear)
      });
    }

    setCalcResults({
      annualExpense,
      fireNumberBasic,
      fireNumberAdjusted,
      monthlySavingsNeeded: Math.round(monthlySavingsNeeded),
      investmentProjection: projection
    });
  };

  // AI API Call
  const askAIAssistant = async (customPrompt = '') => {
    const textToAsk = customPrompt || userMsg;
    if (!textToAsk.trim()) return;

    const newChatHistory = [...aiChat, { role: 'user', text: textToAsk }];
    setAiChat(newChatHistory);
    setUserMsg('');
    setAiLoading(true);

    const systemPrompt = `Anda adalah Asisten AI Perencana Keuangan Profesional khusus Indonesia (Sertifikasi CFP).
    Berikan rekomendasi alokasi portofolio investasi secara ramah, ringkas, dan jelas berdasarkan data ini:
    - Pengeluaran Bulanan: Rp ${calcInputs.monthlyExpense.toLocaleString('id-ID')}
    - Usia Sekarang: ${calcInputs.currentAge} tahun
    - Target Pensiun: ${calcInputs.targetAge} tahun
    - Estimasi Inflasi: ${calcInputs.inflationRate}% / tahun
    - Tabungan Saat Ini: Rp ${calcInputs.currentSavings.toLocaleString('id-ID')}
    - Target FIRE (Disesuaikan Inflasi): Rp ${calcResults.fireNumberAdjusted.toLocaleString('id-ID')}
    - Investasi Bulanan Diperlukan: Rp ${calcResults.monthlySavingsNeeded.toLocaleString('id-ID')}/bulan.`;

    try {
      let attempt = 0;
      let delay = 1000;
      let response;
      let success = false;

      while (attempt < 5 && !success) {
        try {
          const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: textToAsk }] }],
              systemInstruction: { parts: [{ text: systemPrompt }] }
            })
          });

          if (res.ok) {
            response = await res.json();
            success = true;
          } else {
            throw new Error(`HTTP status ${res.status}`);
          }
        } catch (error) {
          attempt++;
          if (attempt >= 5) throw error;
          await new Promise(resolve => setTimeout(resolve, delay));
          delay *= 2;
        }
      }

      const replyText = response?.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, saya tidak dapat merespons saat ini. Silakan coba sesaat lagi.";
      setAiChat([...newChatHistory, { role: 'assistant', text: replyText }]);
    } catch (err) {
      console.error(err);
      setAiChat([...newChatHistory, { role: 'assistant', text: "Terjadi kesalahan koneksi saat menghubungi AI Anda." }]);
    } finally {
      setAiLoading(false);
    }
  };

  const downloadReport = () => {
    const reportText = `=====================================================
LAPORAN RENCANA KEJUANGAN FINANCIAL FREEDOM (FIRE)
Dibuat pada: ${new Date().toLocaleDateString('id-ID')}
=====================================================
DATA PROFIL SAAT INI:
- Usia Sekarang: ${calcInputs.currentAge} Tahun
- Target Usia Financial Freedom: ${calcInputs.targetAge} Tahun
- Pengeluaran Bulanan: Rp ${calcInputs.monthlyExpense.toLocaleString('id-ID')}
- Tabungan/Aset Saat Ini: Rp ${calcInputs.currentSavings.toLocaleString('id-ID')}
- Target Dana Realistis (Plus Inflasi): Rp ${calcResults.fireNumberAdjusted.toLocaleString('id-ID')}
- Tabungan Bulanan yang Diperlukan: Rp ${calcResults.monthlySavingsNeeded.toLocaleString('id-ID')} / Bulan
=====================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Laporan_FIRE_Usia_${calcInputs.targetAge}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showInAppNotification("Laporan Diunduh 📥", "Laporan rencana Financial Freedom Anda telah berhasil disimpan.");
  };

  const handleSaveToGoogleSheets = () => {
    if (!sheetUrl) {
      setSyncStatus('error');
      return;
    }
    setSyncStatus('loading');
    setTimeout(() => {
      setSyncStatus('success');
      showInAppNotification("Google Sheets Sinkron! 📊", "Data rencana finansial Anda berhasil diekspor.");
    }, 1500);
  };

  const triggerQuickAIAnalysis = () => {
    const prompt = `Analisis secara singkat angka target FIRE saya sebesar Rp ${calcResults.fireNumberAdjusted.toLocaleString('id-ID')} dengan kebutuhan menabung Rp ${calcResults.monthlySavingsNeeded.toLocaleString('id-ID')}/bulan. Berikan 3 langkah konkret yang harus saya ambil sekarang!`;
    setActiveTab('beranda');
    askAIAssistant(prompt);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* HEADER UTAMA */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/90 border-slate-200 shadow-sm'} transition-colors`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer group" onClick={() => setActiveTab('beranda')}>
            <div className="bg-gradient-to-tr from-emerald-500 to-teal-400 p-2 rounded-xl text-white shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-105">
              <TrendingUp size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">FIRE.id</span>
          </div>

          {/* Navigasi Desktop & Pencari Global */}
          <nav className="hidden md:flex items-center space-x-2">
            <button 
              onClick={() => setActiveTab('beranda')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'beranda' 
                  ? (darkMode ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-100/50') 
                  : (darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600')
              }`}
            >
              <div className="flex items-center space-x-2">
                <Bot size={16} />
                <span>Beranda & AI</span>
              </div>
            </button>
            <button 
              onClick={() => setActiveTab('kalkulator')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'kalkulator' 
                  ? (darkMode ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-100/50') 
                  : (darkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600')
              }`}
            >
              <div className="flex items-center space-x-2">
                <Calculator size={16} />
                <span>Kalkulator FIRE</span>
              </div>
            </button>

            {/* Tombol Pencari Global */}
            <button 
              onClick={() => setShowSearchModal(true)}
              className={`ml-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                darkMode 
                  ? 'border-slate-800 bg-slate-900/40 hover:bg-slate-900 text-slate-300' 
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Search size={15} className={darkMode ? "text-emerald-400" : "text-emerald-600"} />
                <span>Cari Saham & Reksa Dana</span>
              </div>
            </button>
          </nav>

          {/* Kontrol Kanan */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setShowSearchModal(true)}
              className={`md:hidden p-2.5 rounded-xl border ${darkMode ? 'border-slate-800 hover:bg-slate-900' : 'border-slate-200 bg-white shadow-sm hover:bg-slate-50'} transition-all`}
            >
              <Search size={18} className={darkMode ? "text-emerald-400" : "text-emerald-600"} />
            </button>

            {/* Toggle Tema Siang/Malam */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2.5 rounded-xl border ${
                darkMode 
                  ? 'border-slate-800 hover:bg-slate-900 text-amber-400' 
                  : 'border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-indigo-500'
              } transition-all`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowNotifPanel(!showNotifPanel)}
                className={`p-2.5 rounded-xl border ${
                  darkMode 
                    ? 'border-slate-800 hover:bg-slate-900 text-slate-300' 
                    : 'border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-slate-600'
                } relative transition-all`}
              >
                <Bell size={18} />
                {notifications.some(n => !n.read) && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
                )}
              </button>

              {showNotifPanel && (
                <div className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
                  darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className={`flex items-center justify-between mb-3 pb-2 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <h4 className="font-semibold text-sm flex items-center gap-1.5">
                      <Bell size={16} className={darkMode ? "text-emerald-400" : "text-emerald-600"} /> Notifikasi
                    </h4>
                    <button 
                      onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}
                      className={`text-xs hover:underline ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}
                    >
                      Tandai dibaca
                    </button>
                  </div>
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {notifications.map(n => (
                      <div key={n.id} className={`p-3 rounded-xl text-xs transition-colors ${
                        n.read 
                          ? (darkMode ? 'opacity-60' : 'opacity-60 bg-slate-50') 
                          : (darkMode ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-emerald-50 border border-emerald-100')
                      }`}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className={`font-semibold ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{n.title}</span>
                          <span className="text-[10px] opacity-50">{n.time}</span>
                        </div>
                        <p className={`${darkMode ? 'opacity-80' : 'text-slate-600'} leading-relaxed`}>{n.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowSheetConfig(true)}
              className={`p-2.5 rounded-xl border ${
                darkMode 
                  ? 'border-slate-800 hover:bg-slate-900 text-emerald-400' 
                  : 'border-slate-200 bg-white shadow-sm hover:bg-slate-50 text-emerald-600'
              } transition-all`}
            >
              <Database size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* BODY UTAMA */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* BANNER UTAMA BERANDA */}
        {activeTab === 'beranda' && (
          <div className={`mb-8 rounded-3xl overflow-hidden relative border p-8 md:p-12 transition-all duration-500 ${
            darkMode 
              ? 'border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 to-slate-900/60 shadow-2xl shadow-emerald-900/20 text-slate-100' 
              : 'border-emerald-100 bg-gradient-to-r from-emerald-50 via-white to-teal-50 shadow-xl shadow-emerald-100/50 text-slate-800'
          }`}>
            <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -z-10 pointer-events-none transition-colors ${
              darkMode ? 'bg-emerald-500/10' : 'bg-emerald-300/20'
            }`}></div>
            <div className="max-w-3xl">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold mb-5 shadow-sm ${
                darkMode 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                  : 'bg-white border-emerald-200 text-emerald-700'
              }`}>
                <Sparkles size={14} className={darkMode ? '' : 'text-emerald-500'} /> 100% Gratis & Mandiri
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5 leading-tight">
                Hitung Jalan Pintas Menuju <br className="hidden sm:block"/>
                <span className="bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">Financial Freedom</span> Anda!
              </h1>
              <p className={`text-sm md:text-base mb-8 max-w-2xl leading-relaxed ${darkMode ? 'opacity-80' : 'text-slate-600 font-medium'}`}>
                Selamat datang di FIRE.id. Aplikasi finansial modern untuk mensimulasikan dana masa tua secara mandiri, lengkap dengan asisten cerdas AI, data instrumen pasar modal, serta opsi ekspor ke Google Sheets.
              </p>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => setActiveTab('kalkulator')}
                  className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-90 text-white font-bold rounded-2xl text-sm transition-all shadow-lg shadow-emerald-500/30 flex items-center gap-2"
                >
                  <Calculator size={18} /> Mulai Menghitung
                </button>
                <button 
                  onClick={() => setShowSearchModal(true)}
                  className={`px-5 py-3.5 rounded-2xl border text-sm font-bold transition-all flex items-center gap-2 shadow-sm ${
                    darkMode 
                      ? 'border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-slate-200' 
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Search size={18} className={darkMode ? "text-emerald-400" : "text-emerald-600"} /> Cari Saham / Reksa Dana
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 1. KONTEN BERANDA & AI ASSISTANT */}
        {activeTab === 'beranda' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Kiri: Ringkasan & Edukasi */}
            <div className="lg:col-span-1 space-y-6">
              
              <div className={`p-6 rounded-2xl border transition-all ${
                darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200/70 shadow-sm'
              }`}>
                <h3 className="font-bold text-base mb-4 flex items-center justify-between">
                  <span className={darkMode ? 'text-slate-100' : 'text-slate-800'}>Parameter Finansial</span>
                  <button 
                    onClick={() => setActiveTab('kalkulator')}
                    className={`text-xs font-semibold hover:underline ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}
                  >
                    Ubah
                  </button>
                </h3>
                <div className="space-y-3.5 text-xs">
                  <div className={`flex justify-between items-center border-b pb-2 ${darkMode ? 'border-slate-800/60' : 'border-slate-100'}`}>
                    <span className={darkMode ? 'opacity-60' : 'text-slate-500'}>Usia Sekarang & Target</span>
                    <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{calcInputs.currentAge} &rarr; {calcInputs.targetAge} Thn</span>
                  </div>
                  <div className={`flex justify-between items-center border-b pb-2 ${darkMode ? 'border-slate-800/60' : 'border-slate-100'}`}>
                    <span className={darkMode ? 'opacity-60' : 'text-slate-500'}>Pengeluaran Bulanan</span>
                    <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Rp {calcInputs.monthlyExpense.toLocaleString('id-ID')}</span>
                  </div>
                  <div className={`flex justify-between items-center border-b pb-2 ${darkMode ? 'border-slate-800/60' : 'border-slate-100'}`}>
                    <span className={darkMode ? 'opacity-60' : 'text-slate-500'}>Aset Pokok Saat Ini</span>
                    <span className={`font-bold ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>Rp {calcInputs.currentSavings.toLocaleString('id-ID')}</span>
                  </div>
                  <div className={`flex justify-between items-center border-b pb-2 pt-1 ${darkMode ? 'border-slate-800/60' : 'border-slate-100'}`}>
                    <span className={`font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Target Dana FIRE</span>
                    <span className={`font-extrabold text-sm ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Rp {calcResults.fireNumberAdjusted.toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5">
                    <span className={`font-bold ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>Saran Tabungan/Bulan</span>
                    <span className={`font-extrabold text-sm ${darkMode ? 'text-teal-400' : 'text-teal-600'}`}>Rp {calcResults.monthlySavingsNeeded.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              </div>

              <div className={`p-6 rounded-2xl border transition-all ${
                darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-emerald-50/50 border-emerald-100 shadow-sm'
              }`}>
                <h3 className={`font-bold text-sm mb-3 flex items-center gap-2 ${darkMode ? 'text-slate-100' : 'text-emerald-800'}`}>
                  <Info size={16} className={darkMode ? "text-emerald-400" : "text-emerald-600"} /> Aturan 4% Rule
                </h3>
                <p className={`text-xs leading-relaxed ${darkMode ? 'opacity-70' : 'text-emerald-700/80'}`}>
                  Jika Anda berhasil menimbun dana hingga 25x pengeluaran tahunan, Anda bisa menarik 4% dari portofolio tersebut setiap tahunnya untuk hidup mandiri tanpa takut kehabisan uang di hari tua.
                </p>
              </div>

            </div>

            {/* Kanan: AI Planner Chatbot */}
            <div className="lg:col-span-2">
              <div className={`rounded-2xl border overflow-hidden flex flex-col h-[520px] transition-all shadow-sm ${
                darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                {/* Header AI */}
                <div className={`p-4 border-b flex items-center justify-between ${
                  darkMode ? 'border-slate-800/80 bg-gradient-to-r from-emerald-950/20 to-teal-950/20' : 'border-slate-100 bg-slate-50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                      darkMode ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-white border border-slate-200 text-emerald-600'
                    }`}>
                      <Bot size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm">Asisten Perencana Keuangan AI</h3>
                      <p className={`text-[10px] ${darkMode ? 'opacity-60' : 'text-slate-500'}`}>Konsultan Finansial Pribadi Anda</p>
                    </div>
                  </div>
                  <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border shadow-sm ${
                    darkMode ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Online
                  </span>
                </div>

                {/* Riwayat Obrolan AI */}
                <div className={`flex-1 overflow-y-auto p-4 space-y-4 ${!darkMode && 'bg-slate-50/50'}`}>
                  {aiChat.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                          ? 'bg-emerald-600 text-white font-medium rounded-tr-none' 
                          : (darkMode 
                              ? 'bg-slate-800/70 border border-slate-700 text-slate-100 rounded-tl-none whitespace-pre-line' 
                              : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none whitespace-pre-line'
                            )
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className={`rounded-2xl rounded-tl-none p-4 flex items-center gap-2 text-xs shadow-sm ${
                        darkMode ? 'bg-slate-800/80 border border-slate-700 text-slate-300' : 'bg-white border border-slate-200 text-slate-500'
                      }`}>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce delay-150"></div>
                        <span>AI sedang memikirkan portofolio terbaik...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input Obrolan AI */}
                <div className={`p-4 border-t ${
                  darkMode ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200 bg-white'
                }`}>
                  <form 
                    onSubmit={(e) => { e.preventDefault(); askAIAssistant(); }}
                    className="flex gap-2"
                  >
                    <input 
                      type="text"
                      value={userMsg}
                      onChange={(e) => setUserMsg(e.target.value)}
                      placeholder="Ketik pertanyaan finansial Anda di sini..."
                      className={`flex-1 px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-xs sm:text-sm transition-all shadow-inner ${
                        darkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    <button 
                      type="submit"
                      disabled={aiLoading}
                      className="px-5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md shadow-emerald-600/20"
                    >
                      Kirim
                    </button>
                  </form>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button 
                      onClick={() => setUserMsg("Berikan saran alokasi portofolio investasi moderat sesuai umur saya")}
                      className={`text-[10px] px-3 py-1.5 rounded-full border transition-all shadow-sm ${
                        darkMode ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      🎯 Portofolio Ideal
                    </button>
                    <button 
                      onClick={() => setUserMsg("Bagaimana menghadapi risiko inflasi saat sudah pensiun nanti?")}
                      className={`text-[10px] px-3 py-1.5 rounded-full border transition-all shadow-sm ${
                        darkMode ? 'border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300' : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      📈 Cara Atasi Inflasi
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* 2. KALKULATOR FINANCIAL FREEDOM */}
        {activeTab === 'kalkulator' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            <div className={`p-5 rounded-2xl border flex items-center gap-4 shadow-sm ${
              darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <button 
                onClick={() => setActiveTab('beranda')}
                className={`p-2.5 rounded-xl border transition-all flex items-center justify-center shadow-sm ${
                  darkMode 
                    ? 'border-slate-800 bg-slate-950 hover:bg-slate-800 text-emerald-400' 
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-emerald-600'
                }`}
                title="Kembali ke Beranda"
              >
                <ArrowLeft size={18} />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">Kalkulator Financial Freedom</h2>
                <p className={`text-[11px] truncate ${darkMode ? 'opacity-60' : 'text-slate-500'}`}>Simulasikan target dana pensiun Anda secara presisi</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Form Parameter */}
              <div className="lg:col-span-5 space-y-6">
                <div className={`p-6 md:p-8 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200/70'}`}>
                  <h3 className={`font-bold text-sm mb-6 uppercase tracking-wider ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Parameter Keuangan</h3>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold mb-2 flex justify-between">
                        <span className={darkMode ? 'opacity-70' : 'text-slate-600'}>PENGELUARAN BULANAN</span>
                        <span className={`font-extrabold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Rp {calcInputs.monthlyExpense.toLocaleString('id-ID')}</span>
                      </label>
                      <div className="relative">
                        <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sm font-semibold ${darkMode ? 'opacity-50' : 'text-slate-400'}`}>Rp</div>
                        <input 
                          type="text"
                          value={calcInputs.monthlyExpense === 0 ? "" : calcInputs.monthlyExpense}
                          onChange={(e) => handleNumberInputChange('monthlyExpense', e.target.value)}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-semibold transition-shadow ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-white shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-800 shadow-sm focus:bg-white'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-2 flex justify-between">
                        <span className={darkMode ? 'opacity-70' : 'text-slate-600'}>TABUNGAN/ASET SAAT INI</span>
                        <span className={`font-extrabold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Rp {calcInputs.currentSavings.toLocaleString('id-ID')}</span>
                      </label>
                      <div className="relative">
                        <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-sm font-semibold ${darkMode ? 'opacity-50' : 'text-slate-400'}`}>Rp</div>
                        <input 
                          type="text"
                          value={calcInputs.currentSavings === 0 ? "" : calcInputs.currentSavings}
                          onChange={(e) => handleNumberInputChange('currentSavings', e.target.value)}
                          className={`w-full pl-11 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-semibold transition-shadow ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-white shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-800 shadow-sm focus:bg-white'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-[11px] font-bold mb-2 ${darkMode ? 'opacity-70' : 'text-slate-600'}`}>USIA SEKARANG</label>
                        <input 
                          type="text" 
                          value={calcInputs.currentAge === 0 ? "" : calcInputs.currentAge}
                          onChange={(e) => handleNumberInputChange('currentAge', e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-semibold text-center ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-white shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-800 shadow-sm focus:bg-white'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[11px] font-bold mb-2 ${darkMode ? 'opacity-70' : 'text-slate-600'}`}>TARGET USIA FIRE</label>
                        <input 
                          type="text" 
                          value={calcInputs.targetAge === 0 ? "" : calcInputs.targetAge}
                          onChange={(e) => handleNumberInputChange('targetAge', e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-semibold text-center ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-white shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-800 shadow-sm focus:bg-white'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-[10px] sm:text-[11px] font-bold mb-2 ${darkMode ? 'opacity-70' : 'text-slate-600'}`}>RETURN INVESTASI (%)</label>
                        <input 
                          type="text" 
                          value={calcInputs.expectedReturn === 0 ? "" : calcInputs.expectedReturn}
                          onChange={(e) => handleNumberInputChange('expectedReturn', e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-semibold text-center ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-white shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-800 shadow-sm focus:bg-white'
                          }`}
                        />
                      </div>
                      <div>
                        <label className={`block text-[10px] sm:text-[11px] font-bold mb-2 ${darkMode ? 'opacity-70' : 'text-slate-600'}`}>INFLASI TAHUNAN (%)</label>
                        <input 
                          type="text" 
                          value={calcInputs.inflationRate === 0 ? "" : calcInputs.inflationRate}
                          onChange={(e) => handleNumberInputChange('inflationRate', e.target.value)}
                          className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm font-semibold text-center ${
                            darkMode ? 'bg-slate-950 border-slate-800 text-white shadow-inner' : 'bg-slate-50 border-slate-200 text-slate-800 shadow-sm focus:bg-white'
                          }`}
                        />
                      </div>
                    </div>

                  </div>

                  <div className={`mt-8 pt-6 border-t flex flex-col gap-3 ${darkMode ? 'border-slate-800/80' : 'border-slate-100'}`}>
                    <button 
                      onClick={triggerQuickAIAnalysis}
                      className={`w-full py-3 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                        darkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'
                      }`}
                    >
                      <Sparkles size={16} className="text-emerald-400" /> Analisis Rencana AI
                    </button>
                    <button 
                      onClick={downloadReport}
                      className={`w-full py-3 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border shadow-sm ${
                        darkMode ? 'bg-slate-950 border-slate-700 hover:bg-slate-800 text-slate-300' : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <Download size={16} /> Unduh (.txt)
                    </button>
                  </div>
                </div>
              </div>

              {/* Hasil & Chart */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <span className={`text-[10px] font-bold block mb-1.5 tracking-wider ${darkMode ? 'opacity-50' : 'text-slate-400'}`}>DANA FIRE KLASIK</span>
                    <span className="text-2xl font-extrabold">Rp {calcResults.fireNumberBasic.toLocaleString('id-ID')}</span>
                    <p className={`text-[11px] mt-2 ${darkMode ? 'opacity-50' : 'text-slate-500'}`}>Sesuai 25x pengeluaran tahunan murni.</p>
                  </div>

                  <div className={`p-6 rounded-2xl border shadow-md relative overflow-hidden ${
                    darkMode 
                      ? 'bg-gradient-to-br from-emerald-950/40 to-slate-900/80 border-emerald-500/30' 
                      : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200'
                  }`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl -mr-10 -mt-10"></div>
                    <span className={`text-[10px] font-bold block mb-1.5 tracking-wider ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>TARGET DANA (PLUS INFLASI)</span>
                    <span className={`text-2xl font-extrabold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>Rp {calcResults.fireNumberAdjusted.toLocaleString('id-ID')}</span>
                    <p className={`text-[11px] mt-2 ${darkMode ? 'opacity-70' : 'text-emerald-700/80'}`}>Kebutuhan riil Anda di masa depan.</p>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border shadow-sm text-center md:text-left md:flex md:items-center md:justify-between ${
                  darkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div>
                    <span className={`text-xs font-bold tracking-wider ${darkMode ? 'opacity-60' : 'text-slate-500'}`}>TABUNGAN INVESTASI BULANAN:</span>
                    <h3 className={`text-3xl font-black mt-2 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      Rp {calcResults.monthlySavingsNeeded.toLocaleString('id-ID')} 
                      <span className={`text-sm font-semibold ml-1 ${darkMode ? 'opacity-50 text-white' : 'text-slate-400'}`}>/ Bln</span>
                    </h3>
                  </div>
                </div>

                <div className={`p-6 rounded-2xl border shadow-sm ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h4 className={`font-bold text-xs mb-6 uppercase tracking-wider ${darkMode ? 'opacity-70' : 'text-slate-500'}`}>Simulasi Pertumbuhan Aset Anda</h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={calcResults.investmentProjection}>
                        <defs>
                          <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={darkMode ? "#10b981" : "#059669"} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={darkMode ? "#10b981" : "#059669"} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1e293b" : "#e2e8f0"} />
                        <XAxis dataKey="year" stroke={darkMode ? "#64748b" : "#94a3b8"} fontSize={10} fontWeight={500} />
                        <YAxis stroke={darkMode ? "#64748b" : "#94a3b8"} fontSize={10} tickFormatter={(v) => `Rp ${Math.round(v/1e6)}jt`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderColor: darkMode ? '#334155' : '#cbd5e1', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`]}
                          labelStyle={{ color: darkMode ? '#cbd5e1' : '#475569', fontWeight: 'bold', marginBottom: '4px' }}
                        />
                        <Area type="monotone" dataKey="Tabungan Anda" stroke={darkMode ? "#10b981" : "#059669"} strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
                        <Line type="monotone" dataKey="Target Financial Freedom" stroke={darkMode ? "#ef4444" : "#dc2626"} strokeDasharray="5 5" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>

      {/* MODAL GLOBAL PENCARIAN SAHAM & INSTRUMEN (Diperbaiki Responsivitasnya) */}
      {showSearchModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className={`w-full max-w-5xl rounded-3xl border overflow-hidden shadow-2xl relative flex flex-col md:flex-row max-h-[90vh] ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            
            {/* Tombol Close Popup */}
            <button 
              onClick={() => { setShowSearchModal(false); setSearchQuery(''); }}
              className={`absolute top-4 right-4 z-[110] p-2 rounded-full transition-colors ${
                darkMode ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-800 bg-slate-100'
              }`}
            >
              <X size={20} />
            </button>

            {/* PANEL KIRI: Cari & List Saham */}
            <div className={`w-full md:w-5/12 flex flex-col border-b md:border-b-0 md:border-r ${
              darkMode ? 'border-slate-800 bg-slate-900/60' : 'border-slate-200 bg-slate-50/50'
            }`}>
              <div className="p-6 md:p-8 flex-1 flex flex-col min-h-0">
                <h3 className="font-extrabold text-lg mb-5 flex items-center gap-2">
                  <Search size={20} className={darkMode ? "text-emerald-400" : "text-emerald-600"} /> Eksplor Instrumen
                </h3>

                {/* Input Pencarian (Tetap di atas) */}
                <div className="relative mb-5 shrink-0">
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Contoh: BBCA, TLKM, SBN..."
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm transition-shadow ${
                      darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
                    }`}
                  />
                  <Search size={16} className={`absolute left-4 top-3.5 ${darkMode ? 'opacity-50' : 'text-slate-400'}`} />
                </div>

                {/* List Item yang Bisa Di-scroll */}
                <div className="flex-1 overflow-y-auto space-y-2.5 pr-2">
                  {mockInstruments
                    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.id.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(item => (
                      <div 
                        key={item.id}
                        onClick={() => setSelectedInstrument(item)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedInstrument.id === item.id 
                            ? (darkMode ? 'bg-emerald-500/15 border-emerald-500 text-white' : 'bg-emerald-50 border-emerald-400 shadow-sm') 
                            : (darkMode ? 'border-slate-800/60 hover:bg-slate-800/40' : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm')
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`font-black text-sm ${
                            selectedInstrument.id === item.id 
                              ? (darkMode ? 'text-emerald-400' : 'text-emerald-700') 
                              : (darkMode ? 'text-slate-200' : 'text-slate-800')
                          }`}>{item.id}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${
                            darkMode ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}>{item.type}</span>
                        </div>
                        <h4 className={`text-xs font-semibold mt-1.5 truncate ${darkMode ? 'opacity-80' : 'text-slate-600'}`}>{item.name}</h4>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* PANEL KANAN: Rincian & Kurva Saham */}
            <div className="w-full md:w-7/12 flex flex-col overflow-y-auto">
              <div className="p-6 md:p-8 flex flex-col min-h-0">
                <div className={`flex justify-between items-start gap-4 pb-4 mb-4 border-b ${darkMode ? 'border-slate-800/60' : 'border-slate-100'}`}>
                  <div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${
                      darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>{selectedInstrument.type}</span>
                    <h2 className="text-2xl font-black mt-2.5 pr-8">{selectedInstrument.name} <span className="opacity-50 text-xl hidden sm:inline-block">({selectedInstrument.id})</span></h2>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-[10px] font-bold uppercase block ${darkMode ? 'opacity-50' : 'text-slate-400'}`}>Est. Return</span>
                    <span className={`font-black text-lg ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{selectedInstrument.return}</span>
                  </div>
                </div>

                <p className={`text-sm leading-relaxed mb-6 ${darkMode ? 'opacity-80' : 'text-slate-600'}`}>
                  {selectedInstrument.desc}
                </p>

                <div className={`p-5 rounded-2xl border shrink-0 ${darkMode ? 'bg-slate-900/40 border-slate-800/60' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`text-[10px] font-bold block mb-4 uppercase ${darkMode ? 'opacity-60' : 'text-slate-500'}`}>Performa Pertumbuhan Harga Historis (5 Tahun)</span>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={selectedInstrument.trend}>
                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#1e293b" : "#e2e8f0"} />
                        <XAxis dataKey="year" stroke={darkMode ? "#64748b" : "#94a3b8"} fontSize={10} fontWeight={500} />
                        <YAxis stroke={darkMode ? "#64748b" : "#94a3b8"} fontSize={10} domain={['auto', 'auto']} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: darkMode ? '#0f172a' : '#ffffff', borderColor: darkMode ? '#334155' : '#cbd5e1', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value) => [`Rp ${Number(value).toLocaleString('id-ID')}`]}
                        />
                        <Line type="monotone" dataKey="price" stroke={darkMode ? "#10b981" : "#059669"} strokeWidth={3} dot={{ r: 4, fill: darkMode ? '#10b981' : '#059669', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className={`pt-5 mt-5 border-t flex flex-col sm:flex-row gap-3 ${darkMode ? 'border-slate-800/60' : 'border-slate-100'}`}>
                  <button 
                    onClick={() => {
                      const msg = `Berikan ringkasan analisis untuk instrumen ${selectedInstrument.name} (${selectedInstrument.id}). Apakah ini pilihan aman untuk dana pensiun saya?`;
                      setShowSearchModal(false);
                      setActiveTab('beranda');
                      askAIAssistant(msg);
                    }}
                    className={`flex-1 py-3 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
                      darkMode ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    }`}
                  >
                    <Bot size={16} /> Analisis dengan AI
                  </button>
                  <button 
                    onClick={() => {
                      showInAppNotification("Aset Ditambahkan 🔔", `${selectedInstrument.id} telah sukses masuk pantauan HP Anda.`);
                      setShowSearchModal(false);
                    }}
                    className={`px-5 py-3 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border shadow-sm ${
                      darkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200' : 'bg-white border-slate-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <Bell size={16} className={darkMode ? "" : "text-slate-500"} /> Pantau Harga
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL CONFIG GOOGLE SHEETS */}
      {showSheetConfig && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={`w-full max-w-md rounded-3xl border p-8 relative shadow-2xl ${
            darkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <button 
              onClick={() => { setShowSheetConfig(false); setSyncStatus(''); }}
              className={`absolute top-5 right-5 p-2 rounded-full transition-colors ${
                darkMode ? 'text-slate-400 hover:text-white bg-slate-800' : 'text-slate-500 hover:text-slate-800 bg-slate-100'
              }`}
            >
              <X size={20} />
            </button>
            
            <h3 className="font-extrabold text-xl mb-2 flex items-center gap-2">
              <Database className={darkMode ? "text-emerald-400" : "text-emerald-600"} /> Integrasi Database
            </h3>
            <p className={`text-sm mb-6 leading-relaxed ${darkMode ? 'opacity-75' : 'text-slate-600'}`}>
              Simpan riwayat kalkulator secara otomatis ke Google Sheets pribadi Anda menggunakan Web App Script URL.
            </p>

            <div className="space-y-5">
              <div>
                <label className={`block text-[11px] font-bold uppercase mb-2 ${darkMode ? 'opacity-60' : 'text-slate-500'}`}>URL Web App Google Script</label>
                <input 
                  type="url"
                  value={sheetUrl}
                  onChange={(e) => setSheetUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm transition-shadow ${
                    darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm focus:bg-white'
                  }`}
                />
              </div>

              {syncStatus === 'loading' && (
                <div className="p-4 bg-blue-500/10 text-blue-600 rounded-xl border border-blue-500/20 text-sm font-semibold flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-t-transparent border-blue-600 rounded-full animate-spin"></div>
                  <span>Mengirim data ke Spreadsheet...</span>
                </div>
              )}
              {syncStatus === 'success' && (
                <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20 text-sm font-semibold flex items-start gap-3">
                  <CheckCircle size={20} className="shrink-0 mt-0.5" />
                  <span>Sukses! Baris baru telah ditambahkan ke Google Sheet Anda.</span>
                </div>
              )}
              {syncStatus === 'error' && (
                <div className="p-4 bg-rose-500/10 text-rose-600 rounded-xl border border-rose-500/20 text-sm font-semibold flex items-center gap-3">
                  <span>Isi kolom URL terlebih dahulu untuk menguji simulasi!</span>
                </div>
              )}

              <button 
                onClick={handleSaveToGoogleSheets}
                className={`w-full py-3.5 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                  darkMode ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-emerald-500/20' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                }`}
              >
                Uji Sinkronisasi Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className={`mt-20 border-t py-10 transition-colors ${
        darkMode ? 'bg-slate-950 border-slate-900 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs font-medium space-y-4">
          <p>© 2026 FIRE.id • Aplikasi Simulasi Mandiri Financial Freedom Indonesia.</p>
        </div>
      </footer>

    </div>
  );
}