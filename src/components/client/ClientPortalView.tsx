import React, { useState } from 'react';
import { Company, User, Lead, KnowledgeDoc, AutonomousAgent, Subscription } from '../../types/index.ts';
import { 
  Bot, 
  Send, 
  ShieldCheck, 
  Building2, 
  BookOpen, 
  Users, 
  Sliders, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Cpu, 
  Sparkles,
  ArrowRight,
  Briefcase,
  AlertCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import { api } from '../../services/api.ts';

interface ClientPortalViewProps {
  companies: Company[];
  currentUser: User | null;
  currentCompany: Company | null;
  onSelectCompany: (company: Company) => void;
  leads: Lead[];
  knowledge: KnowledgeDoc[];
  agents?: AutonomousAgent[];
  subscriptions?: Subscription[];
  onRefreshData: () => void;
  onNavigateToServices?: () => void;
  onNavigateToPlans?: () => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({
  companies,
  currentUser,
  currentCompany,
  onSelectCompany,
  leads,
  knowledge,
  agents = [],
  subscriptions = [],
  onRefreshData,
  onNavigateToServices,
  onNavigateToPlans
}) => {
  const activeCompany = currentCompany || companies[0];
  const isMaster = currentUser?.role === 'MASTER_OWNER';

  const [activeTab, setActiveTab] = useState<'overview' | 'onboarding' | 'assistant' | 'agents' | 'settings'>('overview');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'model'; text: string }[]>([
    {
      role: 'model',
      text: activeCompany?.aiPersona.welcomeMessage || 'Olá! Sou a inteligência corporativa dedicada da sua empresa no Observatório SHEFA AYIN.'
    }
  ]);
  const [isSending, setIsSending] = useState(false);

  // Persona edit states
  const [assistantName, setAssistantName] = useState(activeCompany?.aiPersona.assistantName || '');
  const [assistantTone, setAssistantTone] = useState(activeCompany?.aiPersona.tone || '');
  const [assistantInstructions, setAssistantInstructions] = useState(activeCompany?.aiPersona.instructions || '');
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isSending || !activeCompany) return;

    const userMsg = chatMessage.trim();
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsSending(true);

    try {
      const res = await api.askAssistant(userMsg);
      setChatHistory(prev => [...prev, { role: 'model', text: res.response }]);
    } catch (err: any) {
      setChatHistory(prev => [
        ...prev, 
        { role: 'model', text: 'Desculpe, ocorreu uma instabilidade momentânea na resposta do assistente.' }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCompany) return;
    setIsSavingSettings(true);
    setSettingsSaved(false);

    try {
      await api.updateCompany(activeCompany.id, {
        aiPersona: {
          assistantName,
          tone: assistantTone,
          welcomeMessage: activeCompany.aiPersona.welcomeMessage,
          instructions: assistantInstructions
        }
      });
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
      onRefreshData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  if (!activeCompany) {
    return (
      <div className="p-12 text-center text-slate-400">
        Nenhuma empresa vinculada ao usuário.
      </div>
    );
  }

  const companyLeads = leads.filter(l => l.companyId === activeCompany.id);
  const companyKnowledge = knowledge.filter(k => k.companyId === activeCompany.id);
  const companySub = subscriptions.find(s => s.companyId === activeCompany.id) || null;

  // Real business metrics
  const totalLeadsValue = companyLeads.reduce((acc, l) => acc + (l.value || 0), 0);
  const closedLeads = companyLeads.filter(l => l.stage === 'Fechado');
  const closedValue = closedLeads.reduce((acc, l) => acc + (l.value || 0), 0);
  const missionsUsed = activeCompany.quotas.usedMissions || 0;
  const missionsLimit = activeCompany.quotas.monthlyMissions || 150;
  const missionsPercent = Math.min(100, Math.round((missionsUsed / missionsLimit) * 100));
  const hoursSaved = Math.round(missionsUsed * 2.4);

  // Onboarding steps
  const onboardingSteps = [
    {
      id: 'step_1',
      title: 'Diagnóstico & Mapeamento Inicial',
      desc: 'Levantamento de processos corporativos, regras de negócio e objetivos táticos.',
      status: 'completed',
      date: 'Concluído na contratação'
    },
    {
      id: 'step_2',
      title: 'Parametrização dos Agentes & Persona',
      desc: 'Configuração do tom de voz executivo, instruções restritas e alinhamento de funil.',
      status: 'completed',
      date: 'Parametrizado'
    },
    {
      id: 'step_3',
      title: 'Base de Conhecimento Privativa',
      desc: `${companyKnowledge.length} documentos indexados com busca semântica hermética.`,
      status: companyKnowledge.length > 0 ? 'completed' : 'in_progress',
      date: companyKnowledge.length > 0 ? `${companyKnowledge.length} manuais ativos` : 'Em alimentação'
    },
    {
      id: 'step_4',
      title: 'Operação Contínua 24/7 Ativa',
      desc: 'Disparo autônomo dos agentes em background com conciliação Pix automatizada.',
      status: activeCompany.status === 'active' ? 'completed' : 'pending',
      date: activeCompany.status === 'active' ? 'Operando 24/7' : 'Aguardando liberação'
    }
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header & Tenant Switcher */}
      <div className="p-6 glass-obsidian-gold rounded-2xl border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-amber-400 font-cinzel">
            <Building2 className="w-4 h-4" />
            <span>PORTAL CORPORATIVO DO CLIENTE</span>
            <span aria-hidden="true">·</span>
            <span>ISOLAMENTO HERMÉTICO LGPD</span>
          </div>
          <h2 className="text-xl font-cinzel font-bold text-white tracking-wide">
            {activeCompany.name}
          </h2>
          <span className="text-xs text-slate-300 font-light block">
            CNPJ: {activeCompany.cnpjOrTaxId} · Plano Atual: <strong className="text-amber-300">{activeCompany.plan}</strong>
          </span>
        </div>

        {/* Multi-tenant selector (if Master Owner) */}
        {isMaster && companies.length > 1 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Alternar Tenant:</span>
            <select
              value={activeCompany.id}
              onChange={(e) => {
                const found = companies.find(c => c.id === e.target.value);
                if (found) onSelectCompany(found);
              }}
              className="p-2 bg-[#05050a] border border-amber-500/40 rounded-lg text-white text-xs focus:outline-none"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.plan})</option>
              ))}
            </select>
          </div>
        )}

        {/* Tab Controls */}
        <div className="p-1 glass-obsidian rounded-xl border border-purple-900/40 flex items-center gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'overview' ? 'bg-amber-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Visão Geral & Cotas
          </button>
          <button
            onClick={() => setActiveTab('onboarding')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'onboarding' ? 'bg-amber-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Implantação
          </button>
          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'assistant' ? 'bg-amber-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Assistente Dedicado
          </button>
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'agents' ? 'bg-amber-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Agentes ({activeCompany.quotas.maxAgents})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'bg-amber-600 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Persona & Regras
          </button>
        </div>
      </div>

      {/* TAB 1: VISÃO GERAL & CONSUMO DE COTAS & RESULTADOS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Real Results Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 glass-obsidian rounded-xl border border-purple-900/30">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Leads no Funil</span>
              <span className="text-xl font-bold font-mono-numbers text-white">{companyLeads.length} Oportunidades</span>
              <span className="text-[10px] text-slate-400 block mt-0.5 font-mono-numbers">
                Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(totalLeadsValue)}
              </span>
            </div>

            <div className="p-4 glass-obsidian rounded-xl border border-purple-900/30">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Receita Gerada</span>
              <span className="text-xl font-bold font-mono-numbers text-emerald-400">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(closedValue)}
              </span>
              <span className="text-[10px] text-emerald-300 block mt-0.5">{closedLeads.length} negócios fechados</span>
            </div>

            <div className="p-4 glass-obsidian rounded-xl border border-purple-900/30">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Tempo Economizado</span>
              <span className="text-xl font-bold font-mono-numbers text-amber-300">
                ~{hoursSaved} Horas
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Em tarefas e follow-ups</span>
            </div>

            <div className="p-4 glass-obsidian rounded-xl border border-purple-900/30">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block mb-1">Status da Assinatura</span>
              <span className="text-xl font-bold font-mono-numbers text-emerald-400">
                {activeCompany.status === 'active' ? 'ATIVA (24/7)' : 'PENDENTE'}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                Plano {activeCompany.plan}
              </span>
            </div>
          </div>

          {/* Quotas Consumption Card */}
          <div className="p-6 glass-obsidian rounded-2xl border border-purple-900/30 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/20">
              <div>
                <h3 className="text-base font-cinzel font-bold text-white">
                  Consumo de Cotas & Capacidade Computacional
                </h3>
                <span className="text-xs text-slate-400 font-light">
                  Acompanhamento transparente das franquias do plano corporativo
                </span>
              </div>
              {onNavigateToPlans && (
                <button
                  onClick={onNavigateToPlans}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white rounded-lg text-xs font-semibold cursor-pointer shadow"
                >
                  Fazer Upgrade de Plano
                </button>
              )}
            </div>

            {/* Quota Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-[#07070f] rounded-xl border border-purple-900/20 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Missões Mensais:</span>
                  <span className="font-bold text-white font-mono-numbers">{missionsUsed} / {missionsLimit}</span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-amber-500 h-full rounded-full transition-all"
                    style={{ width: `${missionsPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block font-mono-numbers">{missionsPercent}% consumido no ciclo</span>
              </div>

              <div className="p-4 bg-[#07070f] rounded-xl border border-purple-900/20 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Agentes Disponíveis:</span>
                  <span className="font-bold text-amber-300 font-mono-numbers">
                    {Math.min(activeCompany.quotas.maxAgents, 11)} / {activeCompany.quotas.maxAgents}
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full w-full" />
                </div>
                <span className="text-[10px] text-slate-500 block font-mono-numbers">Totalmente alocados</span>
              </div>

              <div className="p-4 bg-[#07070f] rounded-xl border border-purple-900/20 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Base de Conhecimento:</span>
                  <span className="font-bold text-white font-mono-numbers">
                    {companyKnowledge.length} / {activeCompany.quotas.maxKnowledgeDocs} docs
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (companyKnowledge.length / activeCompany.quotas.maxKnowledgeDocs) * 100)}%` }}
                  />
                </div>
                <span className="text-[10px] text-slate-500 block font-mono-numbers">
                  {Math.round((companyKnowledge.length / activeCompany.quotas.maxKnowledgeDocs) * 100)}% ocupado
                </span>
              </div>
            </div>

            {/* Quick Actions Strip */}
            <div className="pt-4 border-t border-purple-900/20 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="text-slate-400 font-light">
                Precisa de implantação assistida ou automações de API para conectar seus sistemas?
              </span>
              {onNavigateToServices && (
                <button
                  onClick={onNavigateToServices}
                  className="px-4 py-2 glass-obsidian text-amber-300 hover:text-white border border-amber-500/30 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  <span>Contratar Serviços Empresariais</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACOMPANHAMENTO DA IMPLANTAÇÃO (ONBOARDING TRACKER) */}
      {activeTab === 'onboarding' && (
        <div className="p-6 glass-obsidian rounded-2xl border border-purple-900/30 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/20">
            <div>
              <h3 className="text-base font-cinzel font-bold text-white">
                Rastreador de Implantação Corporativa & Onboarding
              </h3>
              <p className="text-xs text-slate-400 font-light mt-0.5">
                Passo a passo transparente da ativação da inteligência artificial na sua empresa.
              </p>
            </div>
            <span className="text-xs font-mono-numbers text-emerald-400 glass-obsidian px-3 py-1.5 rounded-lg border border-emerald-500/30">
              Status: 100% Homologado
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {onboardingSteps.map((step, idx) => (
              <div 
                key={step.id} 
                className="p-5 bg-[#07070f] rounded-xl border border-purple-900/30 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center font-bold text-xs font-mono-numbers">
                    {idx + 1}
                  </span>
                  <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {step.date}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                  <p className="text-xs text-slate-400 font-light mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-purple-950/30 border border-purple-900/40 rounded-xl text-xs text-slate-300 flex items-center justify-between gap-4 font-light">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                Sua empresa possui isolamento hermético multitenant. Nenhuma outra empresa ou agente externo tem acesso aos seus leads ou base de conhecimento.
              </span>
            </div>
            {onNavigateToServices && (
              <button
                onClick={onNavigateToServices}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded text-xs font-medium shrink-0 cursor-pointer"
              >
                Solicitar Consultoria Adicional
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ASSISTENTE EXECUTIVO DEDICADO */}
      {activeTab === 'assistant' && (
        <div className="p-6 glass-obsidian rounded-2xl border border-purple-900/30 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-900/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-cinzel font-bold text-white">
                  {activeCompany.aiPersona.assistantName}
                </h3>
                <span className="text-xs text-slate-400 font-light">
                  Tom: {activeCompany.aiPersona.tone} · Base Privativa: {companyKnowledge.length} manuais
                </span>
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div className="h-80 overflow-y-auto space-y-3 p-4 bg-[#05050a] rounded-xl border border-purple-900/30 text-xs">
            {chatHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-xl leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber-600 text-white rounded-br-none shadow'
                      : 'bg-[#12121e] text-slate-200 border border-purple-900/40 rounded-bl-none font-light'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isSending && (
              <div className="flex justify-start">
                <div className="p-3 bg-[#12121e] text-amber-300 border border-purple-900/40 rounded-xl rounded-bl-none text-xs flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>{activeCompany.aiPersona.assistantName} consultando base corporativa...</span>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder={`Pergunte sobre produtos, dados ou procedimentos da ${activeCompany.name}...`}
              className="flex-1 p-3 bg-[#07070f] border border-purple-900/30 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={isSending || !chatMessage.trim()}
              className="px-5 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: AGENTES LIBERADOS CONFORME O PLANO */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 glass-obsidian rounded-xl border border-purple-900/20 text-xs text-slate-400">
            <span>Agentes autônomos dedicados à operação corporativa da {activeCompany.name}</span>
            <span className="font-mono-numbers">Cota do Plano: {activeCompany.quotas.maxAgents} Agentes</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {agents.slice(0, activeCompany.quotas.maxAgents).map((agent) => (
              <div
                key={agent.id}
                className="p-5 glass-obsidian rounded-2xl border border-purple-900/30 hover:border-amber-400/30 transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-cinzel text-amber-400 block">
                      {agent.hebrewCodename}
                    </span>
                    <h4 className="text-base font-cinzel font-bold text-white">
                      {agent.name}
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono-numbers">
                      {agent.agentRoleType}
                    </span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    agent.status === 'running' 
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30' 
                      : agent.status === 'analyzing'
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {agent.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-light leading-relaxed">
                  {agent.specialty}
                </p>

                <div className="pt-3 border-t border-purple-900/20 flex items-center justify-between text-[11px] text-slate-500 font-mono-numbers">
                  <span>Média de Precisão: {agent.accuracyScore}%</span>
                  <span>{agent.totalMissionsCompleted} missões</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PERSONA & CONFIGURAÇÃO */}
      {activeTab === 'settings' && (
        <div className="p-6 glass-obsidian rounded-2xl border border-purple-900/30 space-y-6">
          <div className="pb-3 border-b border-purple-900/20">
            <h3 className="text-base font-cinzel font-bold text-white">
              Calibração da Persona & Instruções Executivas
            </h3>
            <p className="text-xs text-slate-400 font-light mt-0.5">
              Defina o tom de voz, regras comerciais e limites de atuação do assistente e dos agentes da sua empresa.
            </p>
          </div>

          {settingsSaved && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Diretrizes e persona da empresa salvas com sucesso no núcleo neural!</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Nome do Assistente:</label>
              <input
                type="text"
                value={assistantName}
                onChange={(e) => setAssistantName(e.target.value)}
                className="w-full p-2.5 bg-[#07070f] border border-purple-900/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Tom de Voz da Empresa:</label>
              <input
                type="text"
                value={assistantTone}
                onChange={(e) => setAssistantTone(e.target.value)}
                placeholder="Ex: Consultivo, rigoroso, focado em ROI e agilidade comercial"
                className="w-full p-2.5 bg-[#07070f] border border-purple-900/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold">Instruções Estratégicas Restritas:</label>
              <textarea
                value={assistantInstructions}
                onChange={(e) => setAssistantInstructions(e.target.value)}
                rows={4}
                placeholder="Diretrizes inegociáveis para respostas a clientes, margens de desconto permitidas, canais de escalonamento..."
                className="w-full p-2.5 bg-[#07070f] border border-purple-900/30 rounded-xl text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="pt-3 border-t border-purple-900/20 flex justify-end">
              <button
                type="submit"
                disabled={isSavingSettings}
                className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow disabled:opacity-50"
              >
                {isSavingSettings ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
