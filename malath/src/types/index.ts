export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ConfidenceLevel = 'low' | 'medium' | 'high'

export interface AnalysisResult {
  category: string
  risk_level: RiskLevel
  confidence: ConfidenceLevel
  signals: string[]
  explanation: string
  recommended_actions: string[]
  uncertainty?: string
}

export interface UrlScanResult {
  risk_level: RiskLevel
  confidence: ConfidenceLevel
  domain: string
  normalized_url: string
  redirects: string[]
  signals: string[]
  threat_intelligence: string[]
  explanation: string
  limitations?: string
}

export interface Case {
  id: string
  user_id: string
  title: string
  category?: string
  risk_level?: RiskLevel
  status: 'open' | 'closed'
  created_at: string
  updated_at: string
}

export interface CaseItem {
  id: string
  case_id: string
  type: 'evidence' | 'analysis' | 'url_scan' | 'note'
  content: unknown // Using unknown for safer handling of polymorphic JSON content
  created_at: string
}

export interface OfficialChannel {
  id: string
  jurisdiction: string
  incident_type: string
  channel_name: string
  official_source: string
  action_url?: string
  phone?: string
  availability: string
}

