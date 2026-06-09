import type { CoreValue, TalentEntry, PassionEntry, Hypothesis } from '@/types';

export interface ReportData {
  coreValues: CoreValue[];
  workPurpose: string;
  valueKeywords: { text: string; questionId: string }[];
  talents: TalentEntry[];
  flawTransformations: { flaw: string; transformation: string }[];
  passions: PassionEntry[];
  hypotheses: Hypothesis[];
  completedSteps: Record<string, string[]>;
}

function progressBadge(done: number, total: number): string {
  return done >= total ? '✅' : done > 0 ? '🔄' : '⬜';
}

export function generateMarkdown(data: ReportData, userName: string): string {
  const lines: string[] = [];
  const date = new Date().toLocaleDateString('zh-CN');

  lines.push(`# 🧭 自我认知报告`);
  lines.push(`**姓名**：${userName} ｜ **生成日期**：${date}`);
  lines.push(``);

  // ===== 模块一：价值观 =====
  lines.push(`---`);
  lines.push(`## 🧭 一、价值观（Why）`);
  lines.push(``);

  if (data.coreValues.length > 0) {
    lines.push(`### 价值观金字塔（按优先级排序）`);
    const sorted = [...data.coreValues].sort((a, b) => a.order - b.order);
    sorted.forEach((cv, i) => {
      const prefix = i === 0 ? '🎯 最终目的' : `   ${'  '.repeat(i)}`;
      lines.push(`${prefix} ${i + 1}. ${cv.text}${cv.isTrue ? '' : '（假价值观→' + cv.deepDesire + '）'}`);
    });
    lines.push(``);
  }

  if (data.workPurpose) {
    lines.push(`### 🎯 工作目的`);
    lines.push(`> "${data.workPurpose}"`);
    lines.push(``);
  }

  if (data.valueKeywords.length > 0) {
    lines.push(`### 📝 价值观关键词（${data.valueKeywords.length}个）`);
    lines.push(data.valueKeywords.map(k => `- ${k.text}`).join('\n'));
    lines.push(``);
  }

  // ===== 模块二：才能 =====
  lines.push(`---`);
  lines.push(`## ⚡ 二、才能（How）`);
  lines.push(``);

  if (data.talents.length > 0) {
    lines.push(`### 《自己的使用说明书》`);
    lines.push(`| # | 长处 | 等级 | 使用方式 |`);
    lines.push(`|---|------|------|---------|`);
    data.talents.forEach((t, i) => {
      lines.push(`| ${i + 1} | ${t.description} | ${t.level} | ${t.howToUse || '-'} |`);
    });
    lines.push(``);
  }

  if (data.flawTransformations.length > 0) {
    lines.push(`### 🔄 缺点→优点转换`);
    data.flawTransformations.forEach(ft => {
      lines.push(`- ❌ ${ft.flaw} → ✅ ${ft.transformation}`);
    });
    lines.push(``);
  }

  // ===== 模块三：热情 =====
  lines.push(`---`);
  lines.push(`## ❤️ 三、热情（What）`);
  lines.push(``);

  if (data.passions.length > 0) {
    lines.push(`### 兴趣领域`);
    const unique = [...new Set(data.passions.map(p => p.area))];
    unique.forEach(a => lines.push(`- ${a}`));
    lines.push(``);
  }

  // ===== 模块四：组合 =====
  lines.push(`---`);
  lines.push(`## 🔗 四、想做的事（What × How × Why）`);
  lines.push(``);

  const passed = data.hypotheses.filter(h => h.passedFilter === true);
  if (passed.length > 0) {
    lines.push(`### ✅ 通过筛选的候选`);
    passed.forEach(h => {
      lines.push(`- **${h.description}**（评分：${h.score}/10）`);
    });
    lines.push(``);
  }

  if (data.hypotheses.length > 0) {
    lines.push(`### 全部假设`);
    data.hypotheses.forEach(h => {
      const status = h.passedFilter === true ? '✅' : h.passedFilter === false ? '❌' : '⏳';
      lines.push(`- ${status} ${h.description}（❤️ ${h.passion} · ⚡ ${h.talent} · ${h.score}/10）`);
    });
    lines.push(``);
  }

  // ===== 进度 =====
  lines.push(`---`);
  lines.push(`## 📊 完成进度`);
  lines.push(``);
  const MODULE_NAMES: Record<string, string> = {
    module1: '🧭 价值观',
    module2: '⚡ 才能',
    module3: '❤️ 热情',
    module4: '🔗 组合',
  };
  const MODULE_STEPS: Record<string, number> = {
    module1: 5,
    module2: 4,
    module3: 3,
    module4: 3,
  };
  Object.entries(MODULE_STEPS).forEach(([mod, total]) => {
    const done = data.completedSteps[mod]?.length || 0;
    lines.push(`${progressBadge(done, total)} ${MODULE_NAMES[mod]}：${done}/${total}`);
  });
  lines.push(``);

  const totalSteps = Object.values(MODULE_STEPS).reduce((a, b) => a + b, 0);
  const doneSteps = Object.values(data.completedSteps).reduce((acc, arr) => acc + arr.length, 0);
  lines.push(`**总进度**：${doneSteps}/${totalSteps}`);
  lines.push(``);
  lines.push(`---`);
  lines.push(`*基于《如何找到你想做的事》八木仁平 · 交互式自我认知工具*`);

  return lines.join('\n');
}

export function generateHtmlReport(data: ReportData, userName: string): string {
  const date = new Date().toLocaleDateString('zh-CN');

  const sortedValues = [...data.coreValues].sort((a, b) => a.order - b.order);
  const passedHypotheses = data.hypotheses.filter(h => h.passedFilter === true);
  const uniquePassions = [...new Set(data.passions.map(p => p.area))];

  const MODULE_STEPS: Record<string, { name: string; total: number }> = {
    module1: { name: '价值观', total: 5 },
    module2: { name: '才能', total: 4 },
    module3: { name: '热情', total: 3 },
    module4: { name: '组合', total: 3 },
  };
  const totalSteps = Object.values(MODULE_STEPS).reduce((a, b) => a + b.total, 0);
  const doneSteps = Object.values(data.completedSteps).reduce((acc, arr) => acc + arr.length, 0);

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<title>自我认知报告 - ${userName}</title>
<style>
  @page { margin: 2cm; }
  body { font-family: -apple-system, 'Noto Sans SC', sans-serif; color: #1c1917; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.8; }
  h1 { font-size: 24px; border-bottom: 3px solid #d97706; padding-bottom: 8px; }
  h2 { font-size: 20px; color: #d97706; margin-top: 32px; }
  h3 { font-size: 16px; margin-top: 20px; }
  .meta { color: #78716c; font-size: 14px; margin-bottom: 24px; }
  .purpose { background: #fef3c7; padding: 12px 16px; border-radius: 8px; font-size: 18px; font-weight: bold; color: #92400e; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 14px; }
  th, td { border: 1px solid #fde68a; padding: 8px 12px; text-align: left; }
  th { background: #fef3c7; }
  .level-◎ { background: #d97706; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
  .level-〇 { background: #f59e0b; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
  .level-△ { background: #d4d4d4; color: #666; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
  .pyramid { margin: 16px 0; }
  .pyramid-item { padding: 8px 16px; margin: 4px auto; background: linear-gradient(135deg, #d97706, #ea580c); color: #fff; border-radius: 6px; text-align: center; font-weight: 500; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 12px; margin-right: 4px; }
  .badge-pass { background: #d1fae5; color: #059669; }
  .badge-fail { background: #fee2e2; color: #ef4444; }
  .badge-pending { background: #fef3c7; color: #d97706; }
  .progress-bar { background: #fef3c7; height: 20px; border-radius: 10px; overflow: hidden; margin: 8px 0; }
  .progress-fill { height: 100%; background: linear-gradient(90deg, #d97706, #ea580c); border-radius: 10px; transition: width 0.3s; }
  hr { border: none; border-top: 1px solid #fde68a; margin: 32px 0; }
  footer { text-align: center; color: #a8a29e; font-size: 12px; margin-top: 48px; }
</style>
</head>
<body>
<h1>🧭 自我认知报告</h1>
<p class="meta">${userName} ｜ ${date} ｜ 基于《如何找到你想做的事》八木仁平</p>

<h2>🧭 一、价值观（Why）</h2>
${sortedValues.length ? `
<h3>价值观金字塔</h3>
<div class="pyramid">
${sortedValues.map((cv, i, arr) => {
  const width = 100 - i * (arr.length > 1 ? 55 / arr.length : 0);
  return `<div class="pyramid-item" style="width:${Math.max(width, 30)}%">${i === 0 ? '🎯 ' : ''}${cv.text}</div>`;
}).join('')}
</div>` : '<p style="color:#999">暂未填写</p>'}

${data.workPurpose ? `<h3>工作目的</h3><div class="purpose">"${data.workPurpose}"</div>` : ''}

<h2>⚡ 二、才能（How）</h2>
${data.talents.length ? `
<table>
<tr><th>#</th><th>长处</th><th>等级</th><th>使用方式</th></tr>
${data.talents.map((t, i) =>
  `<tr><td>${i + 1}</td><td>${t.description}</td><td><span class="level-${t.level}">${t.level}</span></td><td>${t.howToUse || '-'}</td></tr>`
).join('')}
</table>` : '<p style="color:#999">暂未填写</p>'}

${data.flawTransformations.length ? `<h3>缺点→优点转换</h3><ul>${data.flawTransformations.map(ft => `<li>❌ ${ft.flaw} → ✅ ${ft.transformation}</li>`).join('')}</ul>` : ''}

<h2>❤️ 三、热情（What）</h2>
${uniquePassions.length ? `<ul>${uniquePassions.map(a => `<li>${a}</li>`).join('')}</ul>` : '<p style="color:#999">暂未填写</p>'}

<h2>🔗 四、想做的事（What × How × Why）</h2>
${passedHypotheses.length ? `
<h3>✅ 通过筛选的候选</h3>
${passedHypotheses.map(h =>
  `<div style="background:#d1fae5;padding:12px;border-radius:8px;margin:8px 0">
    <strong>${h.description}</strong> <span class="badge badge-pass">${h.score}/10</span>
  </div>`
).join('')}` : ''}

${data.hypotheses.length ? `
<h3>全部假设</h3>
${data.hypotheses.map(h => {
  const badge = h.passedFilter === true ? 'badge-pass' : h.passedFilter === false ? 'badge-fail' : 'badge-pending';
  const label = h.passedFilter === true ? '✅ 通过' : h.passedFilter === false ? '❌ 淘汰' : '⏳ 待定';
  return `<div style="padding:8px;border-bottom:1px solid #fde68a;font-size:14px">
    <span class="badge ${badge}">${label}</span> ${h.description}
    <span style="color:#999;font-size:12px">❤️ ${h.passion} · ⚡ ${h.talent}</span>
  </div>`;
}).join('')}` : '<p style="color:#999">暂未填写</p>'}

<h2>📊 完成进度</h2>
<div class="progress-bar"><div class="progress-fill" style="width:${totalSteps > 0 ? (doneSteps / totalSteps) * 100 : 0}%"></div></div>
<p style="text-align:center;font-size:14px;color:#78716c">${doneSteps}/${totalSteps} 步骤已完成</p>

<hr>
<footer>基于《如何找到你想做的事》八木仁平 · 交互式自我认知工具<br>https://github.com/leoyip/find-your-purpose</footer>
</body>
</html>`;
}
