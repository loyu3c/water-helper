
import React, { useState, useRef } from 'react';
import { analyzeImageAndSearch, analyzeTextAndSearch } from './services/geminiService';
import { EstimationItem, GroundingSource, QuoteHeaderInfo } from './types';
import ItemTable from './components/ItemTable';

const App: React.FC = () => {
  const [items, setItems] = useState<EstimationItem[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'photo' | 'text'>('photo');
  const [textInput, setTextInput] = useState('');
  
  const [headerInfo, setHeaderInfo] = useState<QuoteHeaderInfo>({
    projectName: '',
    vendorName: '',
    vendorContact: '',
    vendorPhone: '',
    clientContact: '',
    clientPhone: '',
    clientTaxId: ''
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHeaderInfo({ ...headerInfo, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target?.result as string);
    reader.readAsDataURL(file);
    try {
      const base64 = await fileToBase64(file);
      const result = await analyzeImageAndSearch(base64);
      setItems(result.items);
      setSources(result.sources);
    } catch (err) {
      setError("分析失敗，請檢查網路或 API 設定。");
    } finally {
      setLoading(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    setError(null);
    setPreviewImage(null);
    try {
      const result = await analyzeTextAndSearch(textInput);
      setItems(result.items);
      setSources(result.sources);
    } catch (err) {
      setError("解析文字失敗。");
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const addItem = () => {
    const newItem: EstimationItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: '新項目',
      spec: '',
      quantity: 1,
      unit: '式',
      marketPrice: 0,
      brand: '',
      remarks: '',
      supplier: '',
      sourceUrl: ''
    };
    setItems([...items, newItem]);
  };

  const exportPDF = () => {
    const element = quoteRef.current;
    if (!element) return;
    const opt = {
      margin: 10,
      filename: `${headerInfo.projectName || '估價單'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
    };
    // @ts-ignore
    html2pdf().set(opt).from(element).save();
  };

  const inputClasses = "w-full bg-black text-white border-b border-slate-700 focus:border-blue-500 outline-none py-2 px-3 rounded-t-md transition-colors placeholder:text-slate-500";

  return (
    <div className="min-h-screen pb-20 bg-slate-100">
      <header className="bg-slate-900 text-white p-6 shadow-lg sticky top-0 z-50 no-print">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight">AI 水電智能估價助手</h1>
          </div>
          <div className="flex gap-2">
            {items.length > 0 && (
              <button onClick={exportPDF} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg transition-all active:scale-95">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                匯出 PDF 報表
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 no-print">
        {/* Basic Info Inputs - Updated to Black/White */}
        <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200">
          <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">基本工程資訊</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-3">
              <label className="text-xs font-bold text-slate-500 mb-1 block">工程名稱</label>
              <input name="projectName" value={headerInfo.projectName} onChange={handleHeaderChange} className={`${inputClasses} text-xl font-black`} placeholder="例如：XX 住宅水電裝修工程" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">廠商公司名稱</label>
              <input name="vendorName" value={headerInfo.vendorName} onChange={handleHeaderChange} className={inputClasses} placeholder="輸入公司名稱" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">廠商聯絡人</label>
              <input name="vendorContact" value={headerInfo.vendorContact} onChange={handleHeaderChange} className={inputClasses} placeholder="聯絡姓名" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">廠商電話</label>
              <input name="vendorPhone" value={headerInfo.vendorPhone} onChange={handleHeaderChange} className={inputClasses} placeholder="聯絡電話" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">業主聯絡人</label>
              <input name="clientContact" value={headerInfo.clientContact} onChange={handleHeaderChange} className={inputClasses} placeholder="客戶姓名" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">業主電話</label>
              <input name="clientPhone" value={headerInfo.clientPhone} onChange={handleHeaderChange} className={inputClasses} placeholder="客戶電話" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 mb-1 block">業主統編</label>
              <input name="clientTaxId" value={headerInfo.clientTaxId} onChange={handleHeaderChange} className={inputClasses} placeholder="8位數字統編" />
            </div>
          </div>
        </div>

        {/* Input Controls */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
          <div className="flex border-b">
            <button onClick={() => setInputMode('photo')} className={`flex-1 py-5 text-sm font-black flex items-center justify-center gap-3 transition-all ${inputMode === 'photo' ? 'text-blue-600 bg-blue-50/50 border-b-4 border-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>
              拍照辨識
            </button>
            <button onClick={() => setInputMode('text')} className={`flex-1 py-5 text-sm font-black flex items-center justify-center gap-3 transition-all ${inputMode === 'text' ? 'text-blue-600 bg-blue-50/50 border-b-4 border-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              文字清單
            </button>
          </div>
          <div className="p-8">
            {inputMode === 'photo' ? (
              <div className="text-center py-4">
                <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                <button onClick={() => fileInputRef.current?.click()} disabled={loading} className="bg-blue-600 text-white px-10 py-4 rounded-full font-black shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center gap-3 mx-auto">
                  {loading ? (
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ) : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /></svg>}
                  {loading ? "AI 辨識中..." : "立即開啟相機拍照"}
                </button>
                <p className="mt-4 text-xs text-slate-400">支援手寫估價單、型錄拍照解析</p>
              </div>
            ) : (
              <div className="space-y-4">
                <textarea className="w-full h-40 p-5 bg-black text-white rounded-2xl outline-none shadow-inner text-lg placeholder:text-slate-600 leading-relaxed font-mono" placeholder="請直接貼上或輸入清單，例如：&#10;3捲 大亞電線 2.0&#10;5個 中一插座&#10;2支 南亞 6分管" value={textInput} onChange={(e) => setTextInput(e.target.value)} />
                <button onClick={handleTextSubmit} disabled={loading || !textInput.trim()} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all disabled:bg-slate-200 disabled:text-slate-400 active:scale-95">
                  {loading ? "正在解析並搜尋市場價格..." : "開始智慧估價"}
                </button>
              </div>
            )}
          </div>
        </div>

        {error && <div className="bg-red-50 p-5 rounded-2xl text-red-600 text-sm border border-red-200 font-bold flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </div>}
      </main>

      {/* PDF Export Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div ref={quoteRef} className="bg-white p-10 rounded-lg shadow-2xl border border-slate-300 min-h-[842px]">
          <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">{headerInfo.projectName || "水電工程估價單"}</h1>
              <div className="space-y-1">
                <p className="text-sm"><strong>承包商：</strong>{headerInfo.vendorName}</p>
                <p className="text-sm"><strong>負責人/聯絡：</strong>{headerInfo.vendorContact} ({headerInfo.vendorPhone})</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="bg-slate-100 p-3 rounded-md mb-4 inline-block text-left">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1 border-b border-slate-200">業主資料</p>
                <p className="text-sm font-bold">{headerInfo.clientContact}</p>
                <p className="text-sm">{headerInfo.clientPhone}</p>
                {headerInfo.clientTaxId && <p className="text-sm">統編：{headerInfo.clientTaxId}</p>}
              </div>
              <p className="text-xs text-slate-400">報價日期：{new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <ItemTable items={items} onItemsChange={setItems} onAddItem={addItem} />

          <div className="mt-12 grid grid-cols-2 gap-8 no-print">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">市場搜尋參考來源</h3>
               <div className="flex flex-wrap gap-2">
                {sources.map((s, i) => (
                  <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="bg-white border px-3 py-1.5 rounded-lg text-[10px] text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm flex items-center gap-1.5 truncate max-w-[200px]">
                    <img src={`https://www.google.com/s2/favicons?domain=${new URL(s.uri).hostname}`} className="w-3 h-3" alt="" />
                    {s.title}
                  </a>
                ))}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">注意事項</h3>
              <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
                <li>本估價單內容僅供參考，實際工程項目以合約為準。</li>
                <li>市場價格變動頻繁，若距報價日超過 7 天請重新詢價。</li>
                <li>如需專業施工規劃，請聯絡上述承辦人員。</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
