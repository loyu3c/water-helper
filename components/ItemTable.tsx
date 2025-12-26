
import React from 'react';
import { EstimationItem } from '../types';

interface ItemTableProps {
  items: EstimationItem[];
  onItemsChange: (items: EstimationItem[]) => void;
  onAddItem: () => void;
  taxRate: number;
  onTaxRateChange: (rate: number) => void;
  managementRate: number;
  onManagementRateChange: (rate: number) => void;
}

const ItemTable: React.FC<ItemTableProps> = ({
  items,
  onItemsChange,
  onAddItem,
  taxRate,
  onTaxRateChange,
  managementRate,
  onManagementRateChange
}) => {
  const updateItem = (id: string, field: keyof EstimationItem, value: string | number) => {
    const updated = items.map(item => item.id === id ? { ...item, [field]: value } : item);
    onItemsChange(updated);
  };

  const removeItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === items.length - 1) return;

    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    onItemsChange(newItems);
  };

  const subtotalAmount = items.reduce((sum, item) => sum + (item.quantity * item.marketPrice), 0);
  const managementFee = Math.round(subtotalAmount * (managementRate / 100));
  const taxableSubtotal = subtotalAmount + managementFee;
  const taxAmount = Math.round(taxableSubtotal * (taxRate / 100));
  const totalAmount = taxableSubtotal + taxAmount;

  const inputCellClass = "w-full bg-transparent border-none p-1.5 focus:bg-white focus:shadow-sm outline-none transition-all rounded text-sm";

  return (
    <div className="mt-6">
      <div className="rounded-lg border border-slate-200 shadow-sm overflow-visible">
        <table className="w-full text-left border-collapse min-w-full">
          <thead>
            <tr className="bg-slate-900 text-white">
              <th className="p-3 border border-slate-700 font-bold w-16 text-center text-sm">項次</th>
              <th className="p-3 border border-slate-700 font-bold w-48 text-sm">工程品項名稱</th>
              <th className="p-3 border border-slate-700 font-bold text-sm">詳細規格 / 型號</th>
              <th className="p-3 border border-slate-700 font-bold w-20 text-center text-sm">數量</th>
              <th className="p-3 border border-slate-700 font-bold w-20 text-center text-sm">單位</th>
              <th className="p-3 border border-slate-700 font-bold w-32 text-right text-sm">市場單價</th>
              <th className="p-3 border border-slate-700 font-bold w-32 text-right text-sm">小計</th>
              <th className="p-3 border border-slate-700 font-bold w-48 text-sm">廠牌 / 備註</th>
              <th className="p-3 border border-slate-700 font-bold no-print w-24 text-center text-sm">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, index) => (
              <tr key={item.id} className="hover:bg-blue-50/20 group">
                <td className="p-1 border border-slate-200 text-center text-slate-500 font-bold text-sm">
                  {index + 1}
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="text" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} className={`${inputCellClass} font-bold`} />
                </td>
                <td className="p-1 border border-slate-200">
                  <input type="text" value={item.spec} onChange={(e) => updateItem(item.id, 'spec', e.target.value)} className={`${inputCellClass} text-slate-600`} />
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
                    <input type="number" value={item.marketPrice} onChange={(e) => updateItem(item.id, 'marketPrice', parseFloat(e.target.value) || 0)} className="bg-transparent border-none p-1.5 focus:bg-white outline-none font-bold text-blue-600 text-right w-24 font-mono" />
                  </div>
                </td>
                <td className="p-3 border border-slate-200 font-black text-right bg-slate-50/50">
                  <span className="text-xs text-slate-400 mr-1">$</span>
                  {(item.quantity * item.marketPrice).toLocaleString()}
                </td>
                <td className="p-1 border border-slate-200">
                  <div className="flex flex-col gap-1">
                    <input
                      type="text"
                      value={item.brand}
                      onChange={(e) => updateItem(item.id, 'brand', e.target.value)}
                      className={`${inputCellClass} text-blue-800 font-medium py-0.5`}
                      placeholder="廠牌"
                    />
                    <input
                      type="text"
                      value={item.remarks}
                      onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                      className={`${inputCellClass} text-xs text-slate-500 italic py-0.5`}
                      placeholder="備註"
                    />
                  </div>
                </td>
                <td className="p-1 border border-slate-200 text-center no-print">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-colors p-1"
                      title="上移"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                      className="text-slate-400 hover:text-blue-600 disabled:opacity-20 transition-colors p-1"
                      title="下移"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors p-1" title="刪除">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
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
          <tfoot className="border-t-2 border-slate-900">
            {/* 未稅合計 */}
            <tr className="bg-slate-50">
              <td colSpan={6} className="p-3 text-right font-bold text-slate-500 text-sm border-r border-slate-200">小計 (材料與工資)</td>
              <td className="p-3 text-right font-bold text-lg text-slate-700 border-r border-slate-200">
                <span className="text-xs mr-2 font-normal text-slate-400">NT$</span>
                {subtotalAmount.toLocaleString()}
              </td>
              <td colSpan={2} className="bg-white border-l border-slate-200"></td>
            </tr>
            {/* 工程管理費 */}
            <tr className="bg-slate-50">
              <td colSpan={6} className="p-3 text-right font-bold text-slate-500 text-sm border-r border-slate-200">
                <div className="flex items-center justify-end gap-2">
                  <span>工程管理費率</span>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={managementRate}
                      onChange={(e) => onManagementRateChange(parseFloat(e.target.value) || 0)}
                      className="w-16 text-center border border-slate-300 rounded bg-white p-1 text-blue-600 no-print font-bold outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="print-only font-bold text-slate-700">{managementRate}</span>
                    <span className="ml-1">%</span>
                  </div>
                </div>
              </td>
              <td className="p-3 text-right font-bold text-lg text-slate-700 border-r border-slate-200">
                <span className="text-xs mr-2 font-normal text-slate-400">NT$</span>
                {managementFee.toLocaleString()}
              </td>
              <td colSpan={2} className="bg-white border-l border-slate-200"></td>
            </tr>
            {/* 稅金 */}
            <tr className="bg-slate-50">
              <td colSpan={6} className="p-3 text-right font-bold text-slate-500 text-sm border-r border-slate-200">
                <div className="flex items-center justify-end gap-2">
                  <span>營業稅率</span>
                  <div className="flex items-center">
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => onTaxRateChange(parseFloat(e.target.value) || 0)}
                      className="w-16 text-center border border-slate-300 rounded bg-white p-1 text-blue-600 no-print font-bold outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="print-only font-bold text-slate-700">{taxRate}</span>
                    <span className="ml-1">%</span>
                  </div>
                </div>
              </td>
              <td className="p-3 text-right font-bold text-lg text-slate-700 border-r border-slate-200">
                <span className="text-xs mr-2 font-normal text-slate-400">NT$</span>
                {taxAmount.toLocaleString()}
              </td>
              <td colSpan={2} className="bg-white border-l border-slate-200"></td>
            </tr>
            {/* 總計 */}
            <tr className="bg-slate-900 text-white">
              <td colSpan={6} className="p-4 text-right font-black uppercase tracking-[0.2em] text-xs border-r border-slate-800">總計預估金額 (含稅)</td>
              <td className="p-4 text-right font-black text-2xl text-yellow-400 border-r border-slate-800">
                <span className="text-sm mr-2 font-normal text-yellow-200/50">NT$</span>
                {totalAmount.toLocaleString()}
              </td>
              <td colSpan={2} className="bg-slate-900"></td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="mt-4 text-[10px] text-slate-400 text-right no-print italic">
        * 以上單價由 AI 搜尋市場參考價生成，實際價格請與材料商確認。橫向列印可確保完整顯示所有欄位。
      </div>
    </div>
  );
};

export default ItemTable;
