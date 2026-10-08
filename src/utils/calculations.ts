import { MacroTask, MicroTask, ClientAuditData, AuditArea, AuditChecklistItem } from '../types';

export interface DashboardMetrics {
  totalMicroTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  notStartedTasks: number;
  waitingTasks: number;
  globalProgressPercentage: number;
  
  // Resource 1: Commerciale & Operations
  r1TotalTasks: number;
  r1CompletedTasks: number;
  r1InProgressTasks: number;
  r1ProgressPercentage: number;
  
  // Resource 2: Brand & Digital
  r2TotalTasks: number;
  r2CompletedTasks: number;
  r2InProgressTasks: number;
  r2ProgressPercentage: number;

  // Imminent deadlines
  upcomingDeadlines: MicroTask[];
}

export function calculateDashboardMetrics(
  macroTasks: MacroTask[],
  clientIdFilter?: string
): DashboardMetrics {
  const filteredMacros = clientIdFilter && clientIdFilter !== 'all'
    ? macroTasks.filter(m => m.clientId === clientIdFilter)
    : macroTasks;

  const allMicroTasks: MicroTask[] = [];
  filteredMacros.forEach(macro => {
    if (macro.microTasks && Array.isArray(macro.microTasks)) {
      allMicroTasks.push(...macro.microTasks);
    }
  });

  const total = allMicroTasks.length;
  if (total === 0) {
    return {
      totalMicroTasks: 0,
      completedTasks: 0,
      inProgressTasks: 0,
      notStartedTasks: 0,
      waitingTasks: 0,
      globalProgressPercentage: 0,
      r1TotalTasks: 0,
      r1CompletedTasks: 0,
      r1InProgressTasks: 0,
      r1ProgressPercentage: 0,
      r2TotalTasks: 0,
      r2CompletedTasks: 0,
      r2InProgressTasks: 0,
      r2ProgressPercentage: 0,
      upcomingDeadlines: [],
    };
  }

  let completed = 0;
  let inProgress = 0;
  let notStarted = 0;
  let waiting = 0;
  let totalProgressPoints = 0;

  // R1 metrics (includes 'both')
  let r1Tasks = 0;
  let r1Completed = 0;
  let r1InProgress = 0;
  let r1ProgressPoints = 0;

  // R2 metrics (includes 'both')
  let r2Tasks = 0;
  let r2Completed = 0;
  let r2InProgress = 0;
  let r2ProgressPoints = 0;

  allMicroTasks.forEach(task => {
    totalProgressPoints += task.progress || 0;
    
    if (task.status === 'completato') completed++;
    else if (task.status === 'in_corso') inProgress++;
    else if (task.status === 'in_attesa') waiting++;
    else notStarted++;

    if (task.resource === 'resource_1' || task.resource === 'both') {
      r1Tasks++;
      r1ProgressPoints += task.progress || 0;
      if (task.status === 'completato') r1Completed++;
      if (task.status === 'in_corso') r1InProgress++;
    }

    if (task.resource === 'resource_2' || task.resource === 'both') {
      r2Tasks++;
      r2ProgressPoints += task.progress || 0;
      if (task.status === 'completato') r2Completed++;
      if (task.status === 'in_corso') r2InProgress++;
    }
  });

  const globalProgress = Math.round(totalProgressPoints / total);
  const r1Progress = r1Tasks > 0 ? Math.round(r1ProgressPoints / r1Tasks) : 0;
  const r2Progress = r2Tasks > 0 ? Math.round(r2ProgressPoints / r2Tasks) : 0;

  // Sort upcoming deadlines (tasks not yet completed, ordered by due date)
  const upcoming = [...allMicroTasks]
    .filter(t => t.status !== 'completato' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 6);

  return {
    totalMicroTasks: total,
    completedTasks: completed,
    inProgressTasks: inProgress,
    notStartedTasks: notStarted,
    waitingTasks: waiting,
    globalProgressPercentage: globalProgress,
    r1TotalTasks: r1Tasks,
    r1CompletedTasks: r1Completed,
    r1InProgressTasks: r1InProgress,
    r1ProgressPercentage: r1Progress,
    r2TotalTasks: r2Tasks,
    r2CompletedTasks: r2Completed,
    r2InProgressTasks: r2InProgress,
    r2ProgressPercentage: r2Progress,
    upcomingDeadlines: upcoming,
  };
}

export function calculateMacroProgress(macro: MacroTask): number {
  if (!macro.microTasks || macro.microTasks.length === 0) return 0;
  const sum = macro.microTasks.reduce((acc, curr) => acc + (curr.progress || 0), 0);
  return Math.round(sum / macro.microTasks.length);
}

export interface AreaScore {
  areaId: string;
  title: string;
  subtitle: string;
  score: number; // 0 - 100
  evaluatedItemsCount: number;
  totalItemsCount: number;
  conformeCount: number;
  parzialeCount: number;
  criticoCount: number;
}

export interface AuditEvaluationSummary {
  overallHealthScore: number; // 0 - 100
  areaScores: AreaScore[];
  criticalItems: { areaTitle: string; item: AuditChecklistItem }[];
  warningItems: { areaTitle: string; item: AuditChecklistItem }[];
  actionPlan: {
    priority: string;
    area: string;
    action: string;
    itemTitle: string;
    code: string;
  }[];
}

export function evaluateAuditData(auditData?: ClientAuditData): AuditEvaluationSummary {
  if (!auditData || !auditData.areas || auditData.areas.length === 0) {
    return {
      overallHealthScore: 0,
      areaScores: [],
      criticalItems: [],
      warningItems: [],
      actionPlan: [],
    };
  }

  const areaScores: AreaScore[] = [];
  const criticalItems: { areaTitle: string; item: AuditChecklistItem }[] = [];
  const warningItems: { areaTitle: string; item: AuditChecklistItem }[] = [];
  const actionPlan: {
    priority: string;
    area: string;
    action: string;
    itemTitle: string;
    code: string;
  }[] = [];

  let totalWeightedScore = 0;
  let totalWeights = 0;

  auditData.areas.forEach((area: AuditArea) => {
    let scoreSum = 0;
    let applicableItems = 0;
    let conforme = 0;
    let parziale = 0;
    let critico = 0;

    area.items.forEach(item => {
      if (item.status === 'conforme') {
        scoreSum += 100;
        applicableItems++;
        conforme++;
      } else if (item.status === 'parziale') {
        scoreSum += 50;
        applicableItems++;
        parziale++;
        warningItems.push({ areaTitle: area.title, item });
        if (item.actionRecommendation) {
          actionPlan.push({
            priority: item.priorityAction || 'media',
            area: area.title,
            action: item.actionRecommendation,
            itemTitle: item.title,
            code: item.code,
          });
        }
      } else if (item.status === 'critico') {
        scoreSum += 0;
        applicableItems++;
        critico++;
        criticalItems.push({ areaTitle: area.title, item });
        if (item.actionRecommendation) {
          actionPlan.push({
            priority: item.priorityAction || 'immediata',
            area: area.title,
            action: item.actionRecommendation,
            itemTitle: item.title,
            code: item.code,
          });
        }
      } else if (item.status === 'na') {
        // Not counted
      } else {
        // non_valutato -> default counted as 0 or skipped
        applicableItems++;
      }
    });

    const areaScore = applicableItems > 0 ? Math.round(scoreSum / applicableItems) : 0;
    areaScores.push({
      areaId: area.id,
      title: area.title,
      subtitle: area.subtitle,
      score: areaScore,
      evaluatedItemsCount: applicableItems,
      totalItemsCount: area.items.length,
      conformeCount: conforme,
      parzialeCount: parziale,
      criticoCount: critico,
    });

    totalWeightedScore += areaScore * (area.weight || 25);
    totalWeights += (area.weight || 25);
  });

  const overallScore = totalWeights > 0 ? Math.round(totalWeightedScore / totalWeights) : 0;

  // Sort action plan by priority: immediata first, then media, then strategica
  const priorityOrder: Record<string, number> = { immediata: 1, media: 2, strategica: 3, nessuna: 4 };
  actionPlan.sort((a, b) => (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99));

  return {
    overallHealthScore: overallScore,
    areaScores,
    criticalItems,
    warningItems,
    actionPlan,
  };
}
