import { 
  User, 
  Company, 
  DepartmentInfo, 
  AutonomousAgent, 
  Mission, 
  KnowledgeDoc, 
  Lead, 
  ProductItem, 
  Order,
  Subscription,
  PlanDefinition,
  PixCharge,
  CommissionRecord,
  EngineGovernanceSettings,
  FinancialRecord, 
  AuditLog,
  SystemStats,
  EnterpriseService,
  ServiceContract,
  FlagshipProduct,
  CommercialProposal,
  CommercialPartner,
  LeadStage
} from '../types/index.ts';

const TOKEN_KEY = 'shefa_token';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),

  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao autenticar.');
    }
    const data = await res.json();
    api.setToken(data.token);
    return data;
  },

  async setupMaster(currentPassword?: string, newPassword?: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/setup-master', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ currentPassword, newPassword })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro na configuração do Master Owner.');
    }
    return res.json();
  },

  async getMe(): Promise<{ user: User; company?: Company }> {
    const res = await fetch('/api/auth/me', { headers: getHeaders() });
    if (!res.ok) throw new Error('Não autenticado.');
    return res.json();
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', { method: 'POST', headers: getHeaders() });
    } finally {
      api.clearToken();
    }
  },

  // Ayin Core Command & AI Assistant
  async sendCommand(prompt: string, companyId?: string): Promise<{ mission: Mission; strategicAdvice: string }> {
    const res = await fetch('/api/command', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ prompt, companyId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao processar comando AYIN CORE.');
    }
    return res.json();
  },

  async askAssistant(message: string): Promise<{ response: string }> {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro na comunicação com assistente.');
    }
    return res.json();
  },

  // Missions & Approval Gates
  async getMissions(companyId?: string): Promise<Mission[]> {
    const url = companyId ? `/api/missions?companyId=${companyId}` : '/api/missions';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao obter missões.');
    return res.json();
  },

  async approveMission(missionId: string): Promise<{ success: boolean; mission: Mission }> {
    const res = await fetch(`/api/missions/${missionId}/approve`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erro ao aprovar missão.');
    return res.json();
  },

  async rejectMission(missionId: string, reason?: string): Promise<{ success: boolean; mission: Mission }> {
    const res = await fetch(`/api/missions/${missionId}/reject`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ reason })
    });
    if (!res.ok) throw new Error('Erro ao rejeitar missão.');
    return res.json();
  },

  // Companies & Multi-Tenant Management
  async getCompanies(): Promise<Company[]> {
    const res = await fetch('/api/companies', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar empresas.');
    return res.json();
  },

  async createCompany(payload: Partial<Company>): Promise<Company> {
    const res = await fetch('/api/companies', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao criar empresa.');
    return res.json();
  },

  async updateCompany(id: string, payload: Partial<Company>): Promise<Company> {
    const res = await fetch(`/api/companies/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao atualizar empresa.');
    return res.json();
  },

  // Departments & 11 Autonomous Agents
  async getDepartments(): Promise<DepartmentInfo[]> {
    const res = await fetch('/api/departments', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar departamentos.');
    return res.json();
  },

  async getAgents(): Promise<AutonomousAgent[]> {
    const res = await fetch('/api/agents', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar agentes.');
    return res.json();
  },

  async toggleAgent24h(agentId: string): Promise<{ success: boolean; agent: AutonomousAgent }> {
    const res = await fetch(`/api/agents/${agentId}/toggle-24h`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erro ao alterar status 24h do agente.');
    return res.json();
  },

  // Knowledge Base & Leads & Products
  async getKnowledge(companyId?: string): Promise<KnowledgeDoc[]> {
    const url = companyId ? `/api/knowledge?companyId=${companyId}` : '/api/knowledge';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar documentos.');
    return res.json();
  },

  async addKnowledgeDoc(payload: { title: string; category?: string; content: string; companyId?: string }): Promise<KnowledgeDoc> {
    const res = await fetch('/api/knowledge', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao salvar documento.');
    return res.json();
  },

  async createKnowledge(payload: { title: string; category?: string; content: string; companyId?: string }): Promise<KnowledgeDoc> {
    return this.addKnowledgeDoc(payload);
  },

  async getLeads(): Promise<Lead[]> {
    const res = await fetch('/api/leads', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar leads.');
    return res.json();
  },

  async getProducts(): Promise<ProductItem[]> {
    const res = await fetch('/api/products', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar produtos.');
    return res.json();
  },

  // Flagship Products (AYIN SALES, CUSTOMER, FINANCE, CORE)
  async getFlagshipProducts(): Promise<FlagshipProduct[]> {
    const res = await fetch('/api/flagship-products');
    if (!res.ok) throw new Error('Erro ao listar produtos emblemáticos.');
    return res.json();
  },

  // Enterprise Services (Diagnóstico, Implantação, Automações, Consultoria)
  async getServices(): Promise<EnterpriseService[]> {
    const res = await fetch('/api/services');
    if (!res.ok) throw new Error('Erro ao listar serviços empresariais.');
    return res.json();
  },

  async createService(payload: Partial<EnterpriseService>): Promise<EnterpriseService> {
    const res = await fetch('/api/services', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao criar serviço.');
    return res.json();
  },

  async updateService(id: string, payload: Partial<EnterpriseService>): Promise<{ success: boolean; service: EnterpriseService }> {
    const res = await fetch(`/api/services/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao atualizar serviço.');
    return res.json();
  },

  async getServiceContracts(): Promise<ServiceContract[]> {
    const res = await fetch('/api/service-contracts', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar contratos de serviços.');
    return res.json();
  },

  async createServiceContract(payload: { serviceId: string; scopeNotes?: string; requestedPrice?: number; generatePix?: boolean; companyId?: string; companyName?: string }): Promise<{ contract: ServiceContract; pixCharge?: PixCharge }> {
    const res = await fetch('/api/service-contracts', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao solicitar serviço.');
    return res.json();
  },

  async updateServiceContractStatus(id: string, status: string, notes?: string): Promise<{ success: boolean; contract: ServiceContract }> {
    const res = await fetch(`/api/service-contracts/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, notes })
    });
    if (!res.ok) throw new Error('Erro ao atualizar status do contrato.');
    return res.json();
  },

  // Commercial CRM & Proposals & Partners
  async getProposals(): Promise<CommercialProposal[]> {
    const res = await fetch('/api/crm/proposals', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar propostas.');
    return res.json();
  },

  async createProposal(payload: any): Promise<CommercialProposal> {
    const res = await fetch('/api/crm/proposals', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao criar proposta.');
    return res.json();
  },

  async updateProposal(id: string, payload: any): Promise<{ success: boolean; proposal: CommercialProposal }> {
    const res = await fetch(`/api/crm/proposals/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao atualizar proposta.');
    return res.json();
  },

  async getPartners(): Promise<CommercialPartner[]> {
    const res = await fetch('/api/crm/partners', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar parceiros.');
    return res.json();
  },

  async createPartner(payload: any): Promise<CommercialPartner> {
    const res = await fetch('/api/crm/partners', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao cadastrar parceiro.');
    return res.json();
  },

  async createLead(payload: any): Promise<Lead> {
    const res = await fetch('/api/crm/leads', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao cadastrar lead.');
    return res.json();
  },

  async updateLeadStage(id: string, stage: LeadStage, notes?: string, value?: number): Promise<{ success: boolean; lead: Lead }> {
    const res = await fetch(`/api/crm/leads/${id}/stage`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ stage, notes, value })
    });
    if (!res.ok) throw new Error('Erro ao atualizar estágio do lead.');
    return res.json();
  },

  // Subscriptions & Plans
  async getPlans(): Promise<PlanDefinition[]> {
    const res = await fetch('/api/subscriptions/plans');
    if (!res.ok) throw new Error('Erro ao obter planos.');
    return res.json();
  },

  async updatePlan(id: string, payload: Partial<PlanDefinition>): Promise<{ success: boolean; plan: PlanDefinition }> {
    const res = await fetch(`/api/subscriptions/plans/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao atualizar plano.');
    return res.json();
  },

  async getSubscriptions(): Promise<Subscription[]> {
    const res = await fetch('/api/subscriptions', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar assinaturas.');
    return res.json();
  },

  async checkoutSubscription(payload: {
    planTier: string;
    billingCycle: 'monthly' | 'annual';
    customerName: string;
    customerEmail: string;
    customerCpfOrCnpj?: string;
    companyName?: string;
  }): Promise<{ subscription: Subscription; pixCharge: PixCharge }> {
    const res = await fetch('/api/subscriptions/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro ao processar checkout Pix.');
    }
    return res.json();
  },

  async cancelSubscription(id: string): Promise<{ success: boolean; subscription: Subscription }> {
    const res = await fetch(`/api/subscriptions/${id}/cancel`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erro ao cancelar assinatura.');
    return res.json();
  },

  async suspendSubscription(id: string): Promise<{ success: boolean; subscription: Subscription }> {
    const res = await fetch(`/api/subscriptions/${id}/suspend`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erro ao suspender assinatura.');
    return res.json();
  },

  async reactivateSubscription(id: string): Promise<{ success: boolean; subscription: Subscription }> {
    const res = await fetch(`/api/subscriptions/${id}/reactivate`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erro ao reativar assinatura.');
    return res.json();
  },

  async renewSubscription(id: string): Promise<{ subscription: Subscription; pixCharge: PixCharge }> {
    const res = await fetch(`/api/subscriptions/${id}/renew`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erro ao renovar assinatura.');
    return res.json();
  },

  // Pix Payments Engine
  async getPixCharge(id: string): Promise<PixCharge> {
    const res = await fetch(`/api/payments/pix/${id}`);
    if (!res.ok) throw new Error('Cobrança Pix não localizada.');
    return res.json();
  },

  async simulatePixWebhook(chargeId: string): Promise<{ success: boolean; message: string; charge: PixCharge; subscription: Subscription }> {
    const res = await fetch('/api/payments/pix/simulate-webhook', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ chargeId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Erro na homologação do Pix.');
    }
    return res.json();
  },

  // Commerce Orders & Commissions
  async getOrders(): Promise<Order[]> {
    const res = await fetch('/api/orders', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar pedidos.');
    return res.json();
  },

  async createOrder(payload: { items: any[]; customerName: string; customerEmail: string }): Promise<{ order: Order; pixCharge: PixCharge }> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Erro ao criar pedido.');
    return res.json();
  },

  async getCommissions(): Promise<CommissionRecord[]> {
    const res = await fetch('/api/commissions', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar comissões.');
    return res.json();
  },

  // Governance & Emergency Controls
  async getGovernance(): Promise<EngineGovernanceSettings> {
    const res = await fetch('/api/governance', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao obter configurações de governança.');
    return res.json();
  },

  async toggleEmergencyPause(): Promise<{ success: boolean; isEmergencyPaused: boolean; message: string }> {
    const res = await fetch('/api/governance/emergency-pause', {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erro ao alternar pausa de emergência.');
    return res.json();
  },

  async updateSpendingLimit(limit: number): Promise<{ success: boolean; spendingLimit: number }> {
    const res = await fetch('/api/governance/spending-limit', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ limit })
    });
    if (!res.ok) throw new Error('Erro ao atualizar limite de gastos.');
    return res.json();
  },

  async toggleAgentPause(agentId: string): Promise<{ success: boolean; agent: AutonomousAgent }> {
    const res = await fetch(`/api/agents/${agentId}/pause`, {
      method: 'POST',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Erro ao alterar estado do agente.');
    return res.json();
  },

  // Financial Ledger & Audit
  async getFinances(): Promise<FinancialRecord[]> {
    const res = await fetch('/api/finances', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao listar lançamentos contábeis.');
    return res.json();
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    const res = await fetch('/api/audit', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao obter logs de auditoria.');
    return res.json();
  },

  async getSystemStats(): Promise<SystemStats> {
    const res = await fetch('/api/system/stats', { headers: getHeaders() });
    if (!res.ok) throw new Error('Erro ao obter estatísticas do observatório.');
    return res.json();
  }
};
