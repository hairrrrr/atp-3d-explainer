/*
 * 内容层（可按书本改写）：每一步的文字、镜头、高亮部件、配图都在这里。
 * station：场景站点 id（见 app.js 中 STATIONS）
 * cam / look：相对站点中心的镜头位置与注视点
 * hl：要高亮的部件 key（空数组 = 全部正常显示）
 * figure：可选配图；src 为图片路径，或 svg 为内联 SVG 的 id（见 index.html <template>）
 */
window.STEPS = [
{
  id: 'atp', station: 'atp', cam: [-0.5, 3, 21], look: [-0.5, 0, 0],
  hl: ['adenine', 'ribose', 'pa', 'pb', 'pg'],
  title: 'ATP：细胞的“能量货币”', en: 'Adenosine triphosphate',
  body: `
<p>ATP 由三部分组成：<b>腺嘌呤</b>（含氮碱基）＋<b>核糖</b>（五碳糖）＋<b>三个磷酸基团</b>（α、β、γ，γ 在最外端）。腺嘌呤＋核糖合称腺苷。</p>
<p>肌肉收缩、离子泵、合成反应用的都是 ATP 末端磷酸水解释放的能量：</p>
<p class="eq">ATP + H₂O → ADP + Pi</p>
<ul>
<li>标准条件下 ΔG°′ ≈ <em>−30.5 kJ/mol（约 −7.3 kcal/mol）</em>；细胞内实际浓度下更大，约 −50 ~ −60 kJ/mol。</li>
<li>能量并不“藏在某根键里”，而是来自反应前后整个体系的自由能差（俗称“高能磷酸键”只是简称）。</li>
<li>肌肉里现成的 ATP 很少，约 <em>5–8 mmol/kg 湿重</em>，全力运动只够 <em>约 2–3 秒</em>。所以 ATP 必须被不停地再生，人体每天周转的 ATP 总量大致与体重相当。</li>
</ul>`,
  fit: '后面所有内容回答的都是同一个问题：ATP 用掉以后，身体靠哪几条路把它补回来？',
  figure: { svg: 'svg-atp', caption: '示意图（代码绘制）：腺嘌呤与核糖构成腺苷；α 磷酸连在核糖上，γ 磷酸在最末端。水解时断开的是 β–γ 之间的连接，生成 ADP 和无机磷酸 Pi。' }
},
{
  id: 'pcr', station: 'pcr', cam: [-1.5, 3, 20], look: [-1.5, -0.5, 0],
  hl: ['pcr', 'ck', 'adp', 'pmove'],
  title: '磷酸原系统：最快的“备用电池”', en: 'Phosphocreatine (ATP–PCr) system',
  body: `
<p>肌肉里储存着比 ATP 多 3–4 倍的<b>磷酸肌酸（PCr）</b>。<b>肌酸激酶（CK）</b>把 PCr 的磷酸直接转给 ADP，一步就重新生成 ATP：</p>
<p class="eq">PCr + ADP + H⁺ ⇌ ATP + 肌酸（Cr）</p>
<ul>
<li>不需要氧气，反应只有一步，供能<em>速率最高</em>，但总量小：最大强度下 ATP＋PCr 合计大约撑 <em>~10 秒</em>。</li>
<li>恢复靠有氧代谢：休息约 30 秒可恢复一半左右，3–5 分钟接近完全恢复。</li>
</ul>`,
  fit: '大重量低次数、冲刺起跑、跳跃主要靠它。力量训练组间休息 3–5 分钟、补充肌酸（可使肌肉肌酸/PCr 储量提高约 10–20%）都是围绕这个系统。',
  figure: null
},
{
  id: 'gly', station: 'gly', cam: [2.5, 2, 32], look: [2.5, 0, 0],
  hl: ['glucose', 'hexose', 'tracks', 'atpin', 'atpout', 'nadh', 'pyr'],
  title: '糖酵解：在细胞质里把葡萄糖一分为二', en: 'Glycolysis (cytosol)',
  body: `
<p>糖酵解在<b>细胞质</b>中进行，共 10 步酶促反应，不需要氧：</p>
<p class="eq">葡萄糖（6C）→ 2 丙酮酸（3C）</p>
<ul>
<li>前半段“投资”2 个 ATP，后半段每个 3 碳分子各产生 2 个 ATP，共 4 个 → <em>净得 2 ATP</em>（从肌糖原出发净得 3 ATP）。</li>
<li>同时产生 <em>2 NADH</em>（携带电子，之后可去线粒体换 ATP）。</li>
<li>当强度很高、氧化跟不上时，<b>乳酸脱氢酶（LDH）</b>把丙酮酸还原成<b>乳酸</b>，同时把 NADH 变回 NAD⁺，让糖酵解能继续高速运转。</li>
</ul>`,
  fit: '乳酸不是“废物”，也不是第二天肌肉酸痛（DOMS）的原因；它可被心肌和其他肌肉当燃料，或在肝脏重新合成葡萄糖（Cori 循环）。高强度时的疲劳更多与 H⁺、Pi 堆积等多种因素有关。',
  figure: null
},
{
  id: 'mito', station: 'mito', cam: [5, 7, 21], look: [0, 0, 0],
  hl: ['outer', 'inner', 'cristae', 'matrix', 'ims'],
  title: '线粒体：有氧供能的工厂', en: 'Mitochondrion cutaway',
  body: `
<p>有氧供能的后半程都在线粒体里完成。剖开来看：</p>
<ul>
<li><b>外膜</b>：有孔蛋白，小分子可以自由通过。</li>
<li><b>膜间隙</b>：外膜与内膜之间的狭窄空间，之后 H⁺ 会被泵到这里。</li>
<li><b>内膜</b>：对 H⁺ 不通透，向内折叠成<b>嵴</b>，大幅增加面积；电子传递链和 ATP 合酶都嵌在内膜上。</li>
<li><b>基质</b>：内膜包围的内部，三羧酸循环、β-氧化在这里进行，还含有线粒体自己的 DNA。</li>
</ul>`,
  fit: '耐力训练会促进线粒体生物发生（PGC-1α 等信号），让肌肉里线粒体更多、更大，有氧供能能力随之提高。',
  figure: { src: 'assets/fig-mitochondrion.jpg', caption: 'AI 生成示意图（Grok）：外膜（Outer membrane）、内膜（Inner membrane）向内折叠形成嵴（Cristae），内部为基质（Matrix）。真实线粒体形态多样，常连成网络。' }
},
{
  id: 'tca', station: 'tca', cam: [-2.5, 2, 27], look: [-2.5, 1.2, 0],
  hl: ['pyr2', 'pdh', 'acoa', 'ring', 'nodes', 'products'],
  title: '丙酮酸 → 乙酰辅酶A → 三羧酸循环', en: 'PDH & TCA (Krebs) cycle, matrix',
  body: `
<p>丙酮酸进入基质后，由<b>丙酮酸脱氢酶复合体（PDH）</b>转化：</p>
<p class="eq">丙酮酸 + CoA + NAD⁺ → 乙酰CoA + CO₂ + NADH</p>
<p>乙酰CoA（2C）与草酰乙酸（4C）合成柠檬酸（6C），绕一圈回到草酰乙酸。<b>每个乙酰CoA 转一圈</b>产生：</p>
<ul>
<li><em>3 NADH ＋ 1 FADH₂ ＋ 1 GTP（≈ATP）＋ 2 CO₂</em></li>
<li>一个葡萄糖产生 2 个乙酰CoA，所以要乘以 2。</li>
</ul>
<p>循环本身直接产生的 ATP 很少，它真正的产物是<b>装满电子的 NADH 和 FADH₂</b>。我们呼出的 CO₂ 主要就来自 PDH 和这个循环。</p>`,
  fit: '碳水、脂肪、（部分）蛋白质最终都汇入乙酰CoA 和这个循环，它是三大营养素代谢的“交汇环岛”。',
  figure: null
},
{
  id: 'etc', station: 'mem', cam: [-4, 5, 29], look: [-4, -0.5, 0],
  hl: ['c1', 'c2', 'c3', 'c4', 'q', 'cytc', 'hpump', 'electrons', 'o2'],
  title: '电子传递链：把电子交给氧，顺便泵出 H⁺', en: 'Electron transport chain (inner membrane)',
  body: `
<p>NADH 和 FADH₂ 把电子交给嵌在内膜上的一串复合体，电子一路传递，最后交给<b>氧气</b>生成水：</p>
<ul>
<li><b>复合体 I</b>（接收 NADH 的电子）：泵出 4 H⁺</li>
<li><b>复合体 II</b>（接收 FADH₂/琥珀酸的电子）：不泵 H⁺</li>
<li><b>辅酶 Q</b> 在膜内运送电子 → <b>复合体 III</b>：泵出 4 H⁺</li>
<li><b>细胞色素 c</b> 在膜外侧运送电子 → <b>复合体 IV</b>：泵出 2 H⁺，½O₂ + 2H⁺ + 2e⁻ → H₂O</li>
</ul>
<p>合计：每个 NADH 约泵出 <em>10 H⁺</em>，每个 FADH₂ 约 <em>6 H⁺</em>。H⁺ 堆在膜间隙，形成跨内膜的电化学梯度（质子动力）。</p>`,
  fit: '氧是电子的最终接收者，这就是“有氧”的含义，也是运动时呼吸加深加快、最大摄氧量（VO₂max）能反映有氧能力的原因。',
  figure: null
},
{
  id: 'syn', station: 'mem', cam: [24, -1, 23], look: [14, -3.5, 0],
  hl: ['cring', 'gamma', 'f1', 'stator', 'asub', 'hback', 'atpout2'],
  title: 'ATP 合酶：H⁺ 驱动的旋转马达', en: 'ATP synthase rotary motor',
  body: `
<p>H⁺ 顺着梯度从膜间隙流回基质，唯一的通道是 <b>ATP 合酶</b>：</p>
<ul>
<li>H⁺ 经 <b>a 亚基</b>与 <b>c 环（F₀ 转子）</b>的交界处通过，推动 c 环和中央的 <b>γ 柄</b>一起旋转。</li>
<li>伸进基质一侧的 <b>F₁ 头部</b>由 3 个 α 和 3 个 β 亚基交替组成，被<b>周边柄（定子）</b>固定不转。γ 柄在里面转动，依次改变 3 个 β 亚基的构象：结合 ADP+Pi → 合成 ATP → 释放 ATP（结合变构机制）。</li>
<li>转一圈产生 3 个 ATP。人类等哺乳动物的 c 环有 8 个 c 亚基，即约 8 H⁺/3 ATP，再加上把 Pi、ADP 运进基质的消耗，约 <em>每 4 个 H⁺ 换 1 个 ATP</em>。</li>
</ul>
<p class="eq">NADH ≈ 2.5 ATP，FADH₂ ≈ 1.5 ATP</p>
<p>汇总：1 个葡萄糖完全氧化约得 <em>30–32 ATP</em>（取决于 NADH 从细胞质进入线粒体的穿梭方式）。老教材写的 36–38 是早期理论上限。</p>`,
  fit: '有氧系统产出的 ATP 大约是糖酵解净产量的 15 倍，但步骤多、速度慢，所以只能支撑中低功率的持续运动。',
  figure: { svg: 'svg-synthase', caption: '示意图（代码绘制）：H⁺ 从膜间隙（IMS）经 a 亚基与 c8 环之间流回基质（Matrix），带动 c 环和 γ 柄旋转；α₃β₃ 头部被定子 b 固定，在 β 亚基处把 ADP + Pi 合成 ATP。' }
},
{
  id: 'fat', station: 'fat', cam: [0, 2, 25], look: [0, 0, 0],
  hl: ['droplet', 'cpt', 'chain', 'coa', 'acoa2', 'bprod'],
  title: '脂肪 β-氧化：每次切下 2 个碳', en: 'Fatty acid β-oxidation',
  body: `
<p>脂肪（甘油三酯）分解出的<b>脂肪酸</b>，在细胞质中先被“活化”成脂酰CoA（消耗相当于 2 个 ATP），再经<b>肉碱穿梭（CPT1 为限速步骤）</b>进入线粒体基质。</p>
<p>在基质里，β-氧化从<b>羧基（CoA）端</b>开始，每循环一次切下 2 个碳，生成：</p>
<p class="eq">1 乙酰CoA ＋ 1 FADH₂ ＋ 1 NADH</p>
<ul>
<li>以棕榈酸（16C）为例：7 次循环 → 8 乙酰CoA、7 FADH₂、7 NADH，最终净得约 <em>106 ATP</em>。</li>
<li>乙酰CoA 进入三羧酸循环，FADH₂/NADH 进入电子传递链，后面的路和葡萄糖一样。</li>
</ul>`,
  fit: '脂肪储量巨大但供能速度慢、每产生 1 个 ATP 需要的氧也更多，所以在低到中等强度、长时间运动中占比高；强度越高，碳水占比越大。',
  figure: null
},
{
  id: 'sum', station: 'sum', cam: [0, 5, 31], look: [0, 3.5, 0],
  hl: [],
  title: '总结：三大供能系统与运动时长', en: 'Three energy systems vs. duration',
  body: `
<ul>
<li><b>磷酸原系统</b>（ATP–PCr）：最快，约 0–10 秒为主。举重、跳跃、短跑起动。</li>
<li><b>糖酵解系统</b>（无氧）：较快，约 10 秒 – 2 分钟为主。400 米跑、高强度间歇。</li>
<li><b>有氧氧化系统</b>（糖＋脂肪）：最慢但容量几乎无限，约 2 分钟以上为主。长跑、骑行、日常活动。</li>
</ul>
<p>三个系统<b>同时工作、不是开关切换</b>，只是比例随强度和时长变化。全力运动时，有氧和无氧供能大约在 <em>~75 秒</em> 左右各占一半（Gastin 2001 综述），比很多人想的更早。</p>`,
  fit: '训练对应：短组长休息练磷酸原；30 秒–2 分钟的间歇练糖酵解能力与耐酸；长时间中低强度（如“Zone 2”）和间歇都能提升线粒体与有氧能力。营养上，高强度依赖碳水（糖原），低强度长时间更多用脂肪。',
  figure: { src: 'assets/fig-energy-systems.jpg', caption: 'AI 生成示意图（Grok）：从左到右分别对应以磷酸原为主（秒级，如举重）、以糖酵解为主（分钟级，如 400 米）、以有氧为主（小时级，如马拉松）的运动。' }
}
];
