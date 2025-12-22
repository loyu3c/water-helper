
export interface EstimationItem {
  id: string;
  name: string;
  spec: string;
  quantity: number;
  unit: string;
  marketPrice: number;
  brand: string;      // 廠牌
  remarks: string;    // 備註
  supplier: string;
  sourceUrl?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  items: EstimationItem[];
  sources: GroundingSource[];
}

export interface QuoteHeaderInfo {
  projectName: string;
  vendorName: string;
  vendorContact: string;
  vendorPhone: string;
  clientContact: string;
  clientPhone: string;
  clientTaxId: string;
}
