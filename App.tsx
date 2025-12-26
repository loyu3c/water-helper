
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
  const [taxRate, setTaxRate] = useState(5);
  const [managementRate, setManagementRate] = useState(10);

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

  const generateTestData = () => {
    setHeaderInfo({
      projectName: '台北大安區住宅水電翻修工程',
      vendorName: '誠信水電工程有限公司',
      vendorContact: '陳大文',
      vendorPhone: '0912-345-678',
      clientContact: '林小姐',
      clientPhone: '0988-776-554',
      clientTaxId: '12345678'
    });

    const testItems: EstimationItem[] = [
      {
        id: 'test-1',
        name: '2.0mm 二芯電纜線',
        spec: '50M/卷',
        quantity: 2,
        unit: '卷',
        marketPrice: 1250,
        brand: '太平洋',
        remarks: '客廳與廚房專用迴路',
        supplier: '市場行情',
        sourceUrl: ''
      },
      {
        id: 'test-2',
        name: '1/2" PVC 電線管',
        spec: '4M/支 (厚管)',
        quantity: 20,
        unit: '支',
        marketPrice: 55,
        brand: '南亞',
        remarks: '預埋管材',
        supplier: '市場行情',
        sourceUrl: ''
      },
      {
        id: 'test-3',
        name: '20A 單極無熔絲開關',
        spec: '1P 20A',
        quantity: 5,
        unit: '個',
        marketPrice: 135,
        brand: '士林電機',
        remarks: '配電箱更換',
        supplier: '市場行情',
        sourceUrl: ''
      },
      {
        id: 'test-4',
        name: 'Panasonic 星光系列雙插座',
        spec: '110V / 15A',
        quantity: 8,
        unit: '組',
        marketPrice: 280,
        brand: 'Panasonic',
        remarks: '含蓋板、含安裝',
        supplier: '市場行情',
        sourceUrl: ''
      },
      {
        id: 'test-5',
        name: '五金另料',
        spec: '',
        quantity: 1,
        unit: '式',
        marketPrice: 500,
        brand: '廠商',
        remarks: '雜項',
        supplier: '市場行情',
        sourceUrl: ''
      },
      {
        id: 'test-6',
        name: '工資',
        spec: '',
        quantity: 2,
        unit: '式',
        marketPrice: 3000,
        brand: '廠商',
        remarks: '備註',
        supplier: '市場行情',
        sourceUrl: ''
      }
    ];

    setItems(testItems);
    setSources([
      { title: '特力屋水電材料', uri: 'https://www.trplus.com.tw/' },
      { title: '水電材料行行情參考', uri: 'https://www.google.com/search?q=水電材料報價' }
    ]);
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
      console.error(err);
      let errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('429') || errorMessage.includes('ResourceExhausted') || errorMessage.includes('current quota')) {
        errorMessage = '⚠️ 系統繁忙或已達免費額度上限，正在嘗試重試，請稍後再試。';
      } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        errorMessage = '⚠️ 找不到指定的 AI 模型，可能該模型暫時無法使用。';
      }
      setError(`分析失敗: ${errorMessage}`);
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
      console.error(err);
      let errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('429') || errorMessage.includes('ResourceExhausted') || errorMessage.includes('current quota')) {
        errorMessage = '⚠️ 系統繁忙或已達免費額度上限，請稍後再試。';
      } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        errorMessage = '⚠️ 找不到指定的 AI 模型，可能該模型暫時無法使用。';
      }
      setError(`解析文字失敗: ${errorMessage}`);
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

  const exportToExcel = () => {
    if (items.length === 0) return;

    const bom = "\uFEFF";
    let csv = bom;

    const f = (val: any) => {
      const str = String(val ?? "").replace(/"/g, '""');
      return `"${str}"`;
    };

    csv += `${f("水電工程估價單")}\n`;
    csv += `${f("工程名稱")},${f(headerInfo.projectName)}\n`;
    csv += `${f("報價日期")},${f(new Date().toLocaleDateString())}\n\n`;

    csv += `${f("【承包廠商資訊】")}\n`;
    csv += `${f("廠商名稱")},${f(headerInfo.vendorName)},${f("聯絡人")},${f(headerInfo.vendorContact)},${f("聯絡電話")},${f(headerInfo.vendorPhone)}\n\n`;

    csv += `${f("【業主客戶資訊】")}\n`;
    csv += `${f("客戶姓名")},${f(headerInfo.clientContact)},${f("聯絡電話")},${f(headerInfo.clientPhone)},${f("統一編號")},${f(headerInfo.clientTaxId)}\n\n`;

    csv += `${f("項次")},${f("名稱")},${f("規格/型號")},${f("數量")},${f("單位")},${f("單價 (TWD)")},${f("小計 (TWD)")},${f("廠牌")},${f("備註")}\n`;

    let subtotalSum = 0;
    items.forEach((item, index) => {
      const subtotal = item.quantity * item.marketPrice;
      subtotalSum += subtotal;
      csv += `${index + 1},${f(item.name)},${f(item.spec)},${item.quantity},${f(item.unit)},${item.marketPrice},${subtotal},${f(item.brand)},${f(item.remarks)}\n`;
    });

    const mgmtFee = Math.round(subtotalSum * (managementRate / 100));
    const taxableTotal = subtotalSum + mgmtFee;
    const tax = Math.round(taxableTotal * (taxRate / 100));
    const grandTotal = taxableTotal + tax;

    csv += `\n,,,,,${f("小計 (材料與工資)")},${subtotalSum}\n`;
    csv += `,,,,,${f(`工程管理費 (${managementRate}%)`)},${mgmtFee}\n`;
    csv += `,,,,,${f(`營業稅 (${taxRate}%)`)},${tax}\n`;
    csv += `,,,,,${f("總計預估金額 (含稅)")},${grandTotal}\n\n`;

    csv += `${f("【注意事項】")}\n`;
    csv += `${f("1. 本報價單由 AI 搜尋市場行情生成，僅供參考，實際價格以合約或材料商現貨報價為準。")}\n`;
    csv += `${f("2. 報價有效期限為發布日起 7 天內。")}\n`;
    csv += `${f("3. 若工程內容有異動，單價將另行調整。")}\n`;
    csv += `\n${f("產出工具：AI 水電智能估價助手")}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${headerInfo.projectName || '水電估價單'}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const element = quoteRef.current;
    if (!element) return;

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `${headerInfo.projectName || '水電估價單'}_${dateStr}.pdf`;

    const opt = {
      margin: 5,
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        letterRendering: true,
        windowWidth: 1400 // 增加視窗寬度以改善橫向版面渲染
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' },
      pagebreak: { mode: ['css'] } // 只保留 css 模式，避免 legacy 造成的異常空白
    };

    // @ts-ignore
    html2pdf().from(element).set(opt).save();
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
          <div className="flex gap-2 items-center">
            <button onClick={generateTestData} className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg transition-all active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              生成測試資料
            </button>
            {items.length > 0 && (
              <>
                <button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg transition-all active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  匯出 Excel
                </button>
                <button onClick={exportPDF} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 text-sm font-bold shadow-lg transition-all active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  匯出 PDF
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 no-print">
        <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">基本工程資訊</h2>
          </div>
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
              </div>
            ) : (
              <div className="space-y-4">
                <textarea className="w-full h-40 p-5 bg-black text-white rounded-2xl outline-none shadow-inner text-lg placeholder:text-slate-600 leading-relaxed font-mono" placeholder="請直接貼上或輸入清單..." value={textInput} onChange={(e) => setTextInput(e.target.value)} />
                <button onClick={handleTextSubmit} disabled={loading || !textInput.trim()} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all disabled:bg-slate-200 disabled:text-slate-400 active:scale-95">
                  {loading ? "正在解析並搜尋市場價格..." : "開始智慧估價"}
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2 animate-pulse">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mb-20">
        <div ref={quoteRef} className="bg-white p-6 md:p-8 rounded-lg shadow-2xl border border-slate-300 pdf-container mx-auto">
          <div className="flex justify-between items-start border-b-4 border-slate-900 pb-6 mb-8">
            <div className="flex-1">
              <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tighter">{headerInfo.projectName || "水電工程估價單"}</h1>
              <div className="space-y-1">
                <p className="text-sm"><strong>承包商：</strong>{headerInfo.vendorName}</p>
                <p className="text-sm"><strong>負責人/聯絡：</strong>{headerInfo.vendorContact} {headerInfo.vendorPhone ? `(${headerInfo.vendorPhone})` : ''}</p>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="bg-slate-100 p-3 rounded-md mb-2 inline-block text-left min-w-[220px]">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1 border-b border-slate-200">業主資料</p>
                <p className="text-sm font-bold">{headerInfo.clientContact || '尚未輸入'}</p>
                <p className="text-sm">{headerInfo.clientPhone}</p>
                {headerInfo.clientTaxId && <p className="text-sm">統編：{headerInfo.clientTaxId}</p>}
              </div>
              <p className="text-xs text-slate-400">報價日期：{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <ItemTable
            items={items}
            onItemsChange={setItems}
            onAddItem={addItem}
            taxRate={taxRate}
            onTaxRateChange={setTaxRate}
            managementRate={managementRate}
            onManagementRateChange={setManagementRate}
          />

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">市場搜尋參考來源</h3>
              <div className="flex flex-wrap gap-2">
                {sources.length > 0 ? sources.map((s, i) => (
                  <a key={i} href={s.uri} target="_blank" rel="noreferrer" className="bg-white border px-3 py-1.5 rounded-lg text-[10px] text-slate-600 hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm flex items-center gap-1.5 truncate max-w-[200px]">
                    {s.title}
                  </a>
                )) : <span className="text-[10px] text-slate-400 italic">暫無參考來源</span>}
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">注意事項</h3>
              <ul className="text-xs text-slate-500 space-y-2 list-disc pl-4">
                <li>本估價單內容僅供參考，實際工程項目以合約為準。</li>
                <li>市場價格變動頻繁，建議報價效期為 7 天。</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;