export type UserRole = 'MASTER_OWNER' | 'COMPANY_ADMIN' | 'OPERATOR';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId?: string;
  createdAt: string;
  lastLogin?: string;
}

export type PlanTier = 'Astral Starter' | 'Cosmic Growth' | 'Infinity Enterprise';

export type SubscriptionStatus = 
  | 'PENDING_PAYMENT' 
  | 'ACTIVE' 
  | 'TRIAL' 
  | 'EXPIRED' 
  | 'CANCELED' 
  | 'SUSPENDED' 
  | 'REFUNDED';

export interface PlanLimits {
  maxUsers: number;
  monthlyMissions: number;
  maxAgents: number;
  maxKnowledgeDocs: number;
  customAIPersona: boolean;
  prioritySupport: boolean;
  dedicatedAccountManager?: boolean;
}

export interface PlanDefinition {
  id: string;
  tier: PlanTier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  description: string;
  targetAudience: string;
  features: string[];
  trialDays: number;
  limits: PlanLimits;
}

export interface Subscription {
  id: string;
  companyId: string;
  companyName: string;
  customerEmail: string;
  planTier: PlanTier;
  billingCycle: 'monthly' | 'annual';
  status: SubscriptionStatus;
  price: number;
  startDate: string;
  expiresAt: string;
  trialEndsAt?: string;
  pixChargeId?: string;
  autoRenew: boolean;
  featuresUnlocked: string[];
  lastPaymentConfirmedAt?: string;
  canceledAt?: string;
}

export type PixChargeStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED';

export interface PixCharge {
  id: string;
  orderId: string;
  companyId: string;
  customerName: string;
  customerEmail: string;
  customerCpfOrCnpj: string;
  planTier?: PlanTier;
  serviceId?: string;
  amount: number;
  pixKey: string;
  pixKeyType: string;
  recipientName: string;
  copyPasteCode: string;
  qrCodeSvg?: string;
  status: PixChargeStatus;
  createdAt: string;
  expiresAt: string;
  confirmedAt?: string;
  txId: string;
  endToEndId?: string;
  failureReason?: string;
}

export type ServiceCode = 'DIAGNOSTIC' | 'DEPLOYMENT' | 'CUSTOM_AUTOMATION' | 'CONSULTING';

export interface EnterpriseService {
  id: string;
  code: ServiceCode;
  name: string;
  tagline: string;
  description: string;
  basePrice: number;
  deliveryTimelineDays: number;
  deliverables: string[];
  recommendedFor: string;
  isActive: boolean;
}

export type ServiceContractStatus = 'PROPOSAL' | 'APPROVED' | 'IN_PROGRESS' | 'DELIVERED' | 'CANCELLED';

export interface ServiceContract {
  id: string;
  companyId: string;
  companyName: string;
  customerEmail: string;
  serviceId: string;
  serviceCode: ServiceCode;
  serviceName: string;
  status: ServiceContractStatus;
  price: number;
  scopeNotes?: string;
  timelineDays: number;
  assignedAgentCodename?: string;
  pixChargeId?: string;
  startDate?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type FlagshipProductCode = 'AYIN_SALES' | 'AYIN_CUSTOMER' | 'AYIN_FINANCE' | 'AYIN_CORE';

export interface FlagshipProduct {
  id: string;
  code: FlagshipProductCode;
  name: string;
  hebrewName: string;
  tagline: string;
  description: string;
  capabilities: string[];
  associatedAgents: string[];
  departmentId: DepartmentId;
  includedInPlans: PlanTier[];
  standalonePriceMonthly: number;
}

export type ProposalStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface CommercialProposal {
  id: string;
  leadId?: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  planTier?: PlanTier;
  servicesIncluded: string[];
  totalValue: number;
  discountPercent: number;
  finalValue: number;
  status: ProposalStatus;
  validUntil: string;
  notes?: string;
  createdAt: string;
  acceptedAt?: string;
}

export interface CommercialPartner {
  id: string;
  name: string;
  email: string;
  companyName?: string;
  referralCode: string;
  commissionRate: number;
  totalReferredLeads: number;
  totalDealsClosed: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  tradeName: string;
  cnpjOrTaxId: string;
  plan: PlanTier;
  status: 'active' | 'suspended';
  createdAt: string;
  subscriptionId?: string;
  onboardingStep?: 'DIAGNOSTIC' | 'AGENT_SETUP' | 'KNOWLEDGE_BASE' | 'LIVE_247';
  aiPersona: {
    assistantName: string;
    tone: string;
    welcomeMessage: string;
    instructions: string;
  };
  quotas: {
    maxUsers: number;
    monthlyMissions: number;
    usedMissions: number;
    maxAgents: number;
    maxKnowledgeDocs: number;
  };
}

export type DepartmentId = 
  | 'AYIN_RADAR'
  | 'AYIN_STRATEGY'
  | 'AYIN_AGENTS'
  | 'AYIN_CREATIVE'
  | 'AYIN_SALES'
  | 'AYIN_MARKET'
  | 'AYIN_FINANCE'
  | 'AYIN_INTELLIGENCE';

export interface DepartmentInfo {
  id: DepartmentId;
  name: string;
  hebrewName: string;
  roleDescription: string;
  icon: string;
  color: string;
  activeAgentsCount: number;
  pendingTasks: number;
}

export type AgentRoleType =
  | 'RADAR AGENT'
  | 'LEAD AGENT'
  | 'SALES AGENT'
  | 'CUSTOMER AGENT'
  | 'MARKETING AGENT'
  | 'CREATIVE AGENT'
  | 'MARKET AGENT'
  | 'FINANCE AGENT'
  | 'SUBSCRIPTION AGENT'
  | 'ANALYTICS AGENT'
  | 'REPORT AGENT';

export type AgentStatus = 'idle' | 'running' | 'analyzing' | 'paused' | 'error';

export interface AutonomousAgent {
  id: string;
  companyId: string;
  name: string;
  hebrewCodename: string;
  departmentId: DepartmentId;
  agentRoleType: AgentRoleType;
  role: string;
  specialty: string;
  autonomyLevel: 'supervised' | 'autonomous_safe' | 'full_autonomous';
  status: AgentStatus;
  is24hEnabled: boolean;
  isManuallyPaused: boolean;
  totalMissionsCompleted: number;
  accuracyScore: number;
  lastActive: string;
}

export type MissionPriority = 'low' | 'medium' | 'high' | 'critical';
export type MissionStatus = 'queued' | 'in_progress' | 'awaiting_approval' | 'completed' | 'failed' | 'rejected';

export interface MissionStep {
  id: string;
  title: string;
  departmentId: DepartmentId;
  assignedAgentId?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: string;
}

export interface Mission {
  id: string;
  companyId: string;
  creatorEmail: string;
  title: string;
  objective: string;
  priority: MissionPriority;
  status: MissionStatus;
  departmentsInvolved: DepartmentId[];
  steps: MissionStep[];
  isSensitive: boolean;
  sensitiveReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  executionLogs: {
    timestamp: string;
    agentName: string;
    message: string;
    type: 'info' | 'action' | 'warning' | 'success';
  }[];
  finalReport?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeDoc {
  id: string;
  companyId: string;
  title: string;
  category: 'policy' | 'product' | 'faq' | 'market_report' | 'guide';
  content: string;
  updatedAt: string;
}

export type LeadStage = 'Novo' | 'Qualificado' | 'Proposta' | 'Negociação' | 'Fechado' | 'Perdido';

export interface Lead {
  id: string;
  companyId: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  source: string;
  stage: LeadStage;
  value: number;
  notes: string;
  assignedAgent: string;
  partnerReferralCode?: string;
  createdAt: string;
  lastContact: string;
}

export interface ProductItem {
  id: string;
  companyId: string;
  title: string;
  category: string;
  price: number;
  commissionRate: number;
  type: 'proprio' | 'parceiro' | 'infoproduto';
  status: 'active' | 'draft';
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  companyId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED';
  paymentMethod: 'PIX';
  pixChargeId?: string;
  createdAt: string;
  confirmedAt?: string;
}

export interface CommissionRecord {
  id: string;
  orderId?: string;
  subscriptionId?: string;
  partnerName: string;
  partnerEmail: string;
  rate: number;
  amount: number;
  status: 'pendente' | 'liquidado';
  date: string;
}

export interface FinancialRecord {
  id: string;
  companyId: string;
  title: string;
  type: 'receita' | 'custo' | 'comissao' | 'assinatura';
  amount: number;
  date: string;
  status: 'liquidado' | 'pendente' | 'aprovacao_necessaria';
}

export interface EngineGovernanceSettings {
  isEmergencyPaused: boolean;
  financialSpendingLimit: number;
  maxConcurrentTasks: number;
  autoRetryCount: number;
  pixKey: string;
  pixKeyType: string;
  masterRecipient: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action: string;
  companyId: string;
  details: string;
  hash: string;
}

export interface SystemStats {
  totalCompanies: number;
  totalAgents: number;
  active24hAgents: number;
  totalMissions: number;
  completedMissions: number;
  awaitingApproval: number;
  auditEntries: number;
  grossRevenue: number;
  mrr: number;
  totalCosts: number;
  netResult: number;
  netMarginPercent: number;
  totalReceivedRevenue: number;
  realVerifiedPixRevenue: number;
  seedDemoRevenue: number;
  estimatedTaxes: number;
  estimatedAiTokenCost: number;
  infrastructureCost: number;
  gatewayFees: number;
  partnerCommissionsCost: number;
  realOperatingCosts: number;
  realNetOperatingResult: number;
  realNetMarginPercent: number;
  defaultRate: number;
  defaultAmount: number;
  activeSubscriptions: number;
  churnedSubscriptions: number;
  pendingPixCharges: number;
  totalContracts: number;
  activeContracts: number;
  isEmergencyPaused: boolean;
}

export type LivingCoreVisualState = 
  | 'INICIALIZANDO'
  | 'ONLINE'
  | 'ANALISANDO'
  | 'PROCESSANDO'
  | 'EXECUTANDO'
  | 'AGUARDANDO_APROVACAO'
  | 'PAUSADO'
  | 'ALERTA'
  | 'ERRO'
  | 'DESCONECTADO';
