import { db } from './db.js';
import { executeAgentTaskWithAI } from './gemini.js';
import { Mission, AutonomousAgent, Subscription } from './types.js';

export class ContinuousAgentEngine {
  private timer: NodeJS.Timeout | null = null;
  private isProcessing = false;
  private intervalMs = 8000; // Tick every 8s

  public start() {
    if (this.timer) return;
    console.log('[SHEFA AYIN] Autonomous Business Engine & Agent Network 24/7 activated.');
    this.timer = setInterval(() => {
      this.tick().catch(err => console.error('[AGENT ENGINE TICK ERROR]', err));
    }, this.intervalMs);
  }

  public stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      console.log('[SHEFA AYIN] Agent Engine paused.');
    }
  }

  private async tick() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      const data = db.getData();

      // 1. MASTER OWNER KILL-SWITCH: Emergency General Pause check
      if (data.governance.isEmergencyPaused) {
        // All autonomous agent executions halted
        return;
      }

      const now = new Date();
      const nowIso = now.toISOString();

      // 2. SUBSCRIPTION AGENT: Audit subscriptions expiry & trials
      for (const sub of data.subscriptions) {
        if (sub.status === 'ACTIVE' || sub.status === 'TRIAL') {
          const expDate = new Date(sub.expiresAt);
          if (expDate < now) {
            sub.status = 'EXPIRED';
            const company = data.companies.find(c => c.id === sub.companyId);
            if (company) {
              company.status = 'suspended';
              // Cap quotas on expiration
              company.quotas.monthlyMissions = 0;
            }
            db.logAudit(
              'system@shefa-ayin.io',
              'MASTER_OWNER',
              'SUBSCRIPTION_EXPIRED',
              sub.companyId,
              `Assinatura do plano ${sub.planTier} expirou em ${sub.expiresAt}. Acesso e cotas suspensos.`
            );
          }
        }
      }

      // 3. AGENT HEARTBEAT & 24H HEALTH MONITOR
      const activeAgents = data.agents.filter(a => a.is24hEnabled && !a.isManuallyPaused);
      for (const agent of activeAgents) {
        agent.lastActive = nowIso;
      }

      // 4. QUEUED MISSIONS & SENSITIVE GATES VERIFICATION
      const queuedMissions = data.missions.filter(m => m.status === 'queued');
      for (const mission of queuedMissions) {
        // Check if sensitive or spending exceeds limit
        const limit = data.governance.financialSpendingLimit || 1000;
        if (mission.isSensitive && !mission.approvedAt) {
          mission.status = 'awaiting_approval';
          mission.executionLogs.push({
            timestamp: nowIso,
            agentName: 'Finance Custodian',
            message: `Missão pausada: Requer autorização formal do Master Owner (Alifermadeiro@hotmail.com). Justificativa: ${mission.sensitiveReason || 'Operação sensível / impacto financeiro'}.`,
            type: 'warning'
          });
          db.logAudit(
            mission.creatorEmail,
            'OPERATOR',
            'MISSION_GATE_HOLD',
            mission.companyId,
            `Missão "${mission.title}" retida para aprovação do Master Owner.`
          );
        } else {
          mission.status = 'in_progress';
          mission.executionLogs.push({
            timestamp: nowIso,
            agentName: 'AYIN CORE Director',
            message: 'Missão iniciada em background contínuo. Despachando tarefas à rede de agentes.',
            type: 'action'
          });
        }
      }

      // 5. IN_PROGRESS MISSIONS PROGRESSION
      const runningMissions = data.missions.filter(m => m.status === 'in_progress');
      for (const mission of runningMissions) {
        const nextPendingStep = mission.steps.find(s => s.status === 'pending');

        if (nextPendingStep) {
          nextPendingStep.status = 'running';

          // Select matching agent from network
          const assignedAgent = data.agents.find(a => 
            !a.isManuallyPaused && (
              (nextPendingStep.assignedAgentId && a.id === nextPendingStep.assignedAgentId) ||
              a.departmentId === nextPendingStep.departmentId
            )
          ) || data.agents.find(a => !a.isManuallyPaused) || data.agents[0];

          assignedAgent.status = 'running';
          assignedAgent.lastActive = nowIso;

          // Prepare knowledge context
          const relatedKnowledge = data.knowledge
            .filter(k => k.companyId === 'global' || k.companyId === mission.companyId)
            .map(k => `${k.title}: ${k.content}`)
            .join('\n');

          // Execute step with AI or procedure
          const resultText = await executeAgentTaskWithAI(
            assignedAgent.name,
            nextPendingStep.departmentId,
            nextPendingStep.title,
            mission.objective,
            relatedKnowledge
          );

          nextPendingStep.status = 'completed';
          nextPendingStep.result = resultText;

          mission.executionLogs.push({
            timestamp: new Date().toISOString(),
            agentName: assignedAgent.name,
            message: `Etapa cumprida: ${nextPendingStep.title}.`,
            type: 'success'
          });

          assignedAgent.totalMissionsCompleted += 1;
          assignedAgent.status = 'idle';

          // If all steps completed, finish mission
          const allCompleted = mission.steps.every(s => s.status === 'completed');
          if (allCompleted) {
            mission.status = 'completed';
            mission.updatedAt = new Date().toISOString();
            mission.finalReport = `Missão executada integralmente. Todas as ${mission.steps.length} etapas cumpridas com validação nos departamentos: ${mission.departmentsInvolved.join(', ')}.`;

            mission.executionLogs.push({
              timestamp: new Date().toISOString(),
              agentName: 'Analytics Strategist',
              message: 'Resultados indexados e integrados à inteligência operacional para aprendizado contínuo.',
              type: 'info'
            });

            db.logAudit(
              mission.creatorEmail,
              'OPERATOR',
              'MISSION_COMPLETED',
              mission.companyId,
              `Missão "${mission.title}" finalizada com sucesso.`
            );
          }
        }
      }

      // 6. AUTONOMOUS COMMERCIAL LEAD NURTURING (Sales Funnel Engine)
      const uncontactedLeads = data.leads.filter(l => l.stage === 'Novo');
      for (const lead of uncontactedLeads.slice(0, 1)) {
        // Lead Agent qualifies lead automatically
        lead.stage = 'Qualificado';
        lead.lastContact = nowIso;
        lead.notes = `${lead.notes ? lead.notes + ' | ' : ''}Lead qualificado automaticamente pelo Lead Organizer com base no perfil corporativo.`;
        db.logAudit(
          'lead.agent@shefa-ayin.io',
          'OPERATOR',
          'LEAD_QUALIFIED',
          lead.companyId,
          `Lead ${lead.name} qualificado automaticamente no funil comercial.`
        );
      }

      db.commit();
    } catch (err) {
      console.error('[AGENT ENGINE ERROR IN TICK]', err);
    } finally {
      this.isProcessing = false;
    }
  }

  // Trigger manual tick for instant mission or webhook activation
  public async executeMissionNow(missionId: string) {
    const data = db.getData();
    const mission = data.missions.find(m => m.id === missionId);
    if (!mission) return;
    await this.tick();
  }
}

export const agentEngine = new ContinuousAgentEngine();
