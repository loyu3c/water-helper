
import React from 'react';
import { EstimationItem } from '../types';

interface ItemTableProps {
  items: EstimationItem[];
  onItemsChange: (items: EstimationItem[]) => void;
  onAddItem: () => void;
}

const ItemTable: React.FC<ItemTableProps> = ({ items, onItemsChange, onAddItem }) => {
  const updateItem = (id: string, field: keyof EstimationItem, value: string | number) => {
    const updated = items.map(item => item.id === id ? { ...item, [field]: value } : item);
    onItemsChange(updated);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.marketPrice), 0);

  const inputCellClass = "w-full bg-transparent border-none p-1.5 focus:bg-white focus:shadow-sm outline-none transition-all rounded text-sm";

  return (
    <div className="mt-6">
      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-3 border border-slate-700 font-bold w-40">品項名稱</th>
              <th className="p-3 border border-slate-700 font-bold">規格</th>
              <th className="p-3 border border-slate-700 font-bold w-32">廠牌</th>
              <th className="p-3 border border-slate-700 font-bold w-16 text-center">數量</th>
              <th className="p-3 border border-slate-700 font-bold w-16 text-center">單位</th>
              <th className="p-3 border border-slate-700 font-bold w-32 text-right">單價</th>
              <th className="p-3 border border-slate-700 font-bold w-32 text-right">小計</th>
              <th className="p-3 border border-slate-700 font-bold">備註</th>
              <th className="p-3 border border-slate-700 font-bold no-print w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/20 group">
                <td className="p-1 border border-slate-200">
                  <input type="text" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} className={`${inputCellClass} font-bold`} />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="text" value={item.spec} onChange={(e) => updateItem(item.id, 'spec', e.target.value)} className={`${inputCellClass} text-slate-600`} />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="text" value={item.brand} onChange={(e) => updateItem(item.id, 'brand', e.target.value)} className={`${inputCellClass} text-blue-800 font-medium`} placeholder="如：大亞、松下" />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="number" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className={`${inputCellClass} text-center font-mono`} />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="text" value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} className={`${inputCellClass} text-center text-slate-500`} />
                </td>
                <td className="p-1 border border-slate-200">
                  <div className="flex items-center justify-end px-2">
                    <span className="text-slate-400 text-xs mr-1">$</span>
                    <input type="number" value={item.marketPrice} onChange={(e) => updateItem(item.id, 'marketPrice', parseFloat(e.target.value) || 0)} className="bg-transparent border-none p-1.5 focus:bg-white outline-none font-bold text-blue-600 text-right w-20 font-mono" />
                  </div>
                </td>
                <td className="p-3 border border-slate-200 font-black text-right bg-slate-50/50">
                  <span className="text-xs text-slate-400 mr-1">$</span>
                  {(item.quantity * item.marketPrice).toLocaleString()}
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="text" value={item.remarks} onChange={(e) => updateItem(item.id, 'remarks', e.target.value)} className={`${inputCellClass} text-xs text-slate-500 italic`} placeholder="備註事項" />
                </td>
                <td className="p-1 border border-slate-200 text-center no-print">
                  <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-2 opacity-0 group-hover:opacity-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </td>
              </tr>
            ))}
            <tr className="no-print">
              <td colSpan={9} className="p-4 text-center border bg-slate-50">
                <button onClick={onAddItem} className="bg-white hover:bg-slate-100 text-blue-600 px-6 py-2 rounded-lg text-xs font-black border border-blue-200 shadow-sm transition-all flex items-center gap-2 mx-auto active:scale-95">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  手動新增工程品項
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr className="bg-slate-900 text-white">
              <td colSpan={6} className="p-5 text-right font-black uppercase tracking-[0.2em] text-xs border border-slate-900">總計預估金額 (TWD)</td>
              <td className="p-5 text-right font-black text-2xl text-yellow-400 border border-slate-900" colSpan={3}>
                <span className="text-sm mr-2 font-normal text-yellow-200/50">NT$</span>
                {totalAmount.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mt-4 text-[10px] text-slate-400 text-right no-print italic">
        * 以上單價由 AI 搜尋市場參考價生成，實際價格請與材料商確認。
      </div>
    </div>
  );
};

export default ItemTable;
