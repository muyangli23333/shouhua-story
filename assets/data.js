/* ═══════════════════════════════════════════════════════
   内容数据 —— 取自《商业逻辑拟定（细化）》
   ═══════════════════════════════════════════════════════ */

/* 四条世界线（lobby 为现实基调，其余三条为记忆时空） */
export const WORLDS = [
  {
    id: 'lobby',
    skin: '原皮',
    name: '现实展厅',
    en: 'THE LOBBY',
    idx: '世界线 00',
    relic: '手提箱 · 时空锁',
    desc:
      '闭馆之后，展柜并未沉睡。博物馆的文物不只是静止展品，它们封存着一段段未完成的遗憾记忆。四位主角拥有一把可以连通记忆时空的手提箱，每当触碰承载强烈情绪的展品，就会被拉入对应的平行世界。',
    mission: '找到下一个会说话的展品',
    symbols: ['手提箱', '展柜低语', '闭馆灯'],
    // 场景视觉
    bg: 0x0b0f14, fog: 0x0b0f14, fogDensity: 0.030,
    ground: 0x141a22, groundRough: 0.72, groundMetal: 0.18,
    accent: 0x8fb8de, accent2: 0xede6da,
    keyLight: 0xdfe9f5, rimLight: 0x6d8fb5, envInt: 0.55, exposure: 1.05,
    pedestal: 0x1b232d, ring: 0x8fb8de,
    particle: 0x9fc4e8, particleCount: 260,
    props: 'lobby',
  },
  {
    id: 'tang',
    skin: '唐代',
    name: '盛唐长安',
    en: "SHANXI HISTORY MUSEUM",
    idx: '世界线 01',
    relic: '骆驼俑',
    desc:
      '陕西历史博物馆文物幻境。四人在长安时空相遇汇合，依托骆驼俑等文物线索，修补一段被掩埋的历史细节。铜锈与尘土之下，被改写的那一行史书正等待有人重新读它。',
    mission: '修补一段被掩埋的历史细节',
    symbols: ['古骆驼俑', '唐草纹'],
    bg: 0x140a07, fog: 0x140a07, fogDensity: 0.042,
    ground: 0x2a1a10, groundRough: 0.55, groundMetal: 0.32,
    accent: 0xe0a63c, accent2: 0xc8102e,
    keyLight: 0xffd591, rimLight: 0xc8102e, envInt: 0.42, exposure: 1.12,
    pedestal: 0x3a2415, ring: 0xe0a63c,
    particle: 0xe8b44a, particleCount: 300,
    props: 'tang',
  },
  {
    id: 'opera',
    skin: '歌剧',
    name: '百老汇 · 最终彩排',
    en: 'THE FINAL REHEARSAL',
    idx: '世界线 02',
    relic: '残缺乐谱',
    desc:
      '百老汇百年特展，坠入音乐剧世界。这一站的目标只有一个——帮助那位聋哑的白狐作曲家，完成那场没能上演的绝唱。灯光已经就位，缺的只是最后一个小节。',
    mission: '让那场绝唱真正响一次',
    symbols: ['残缺乐谱', '舞台聚光', '白狐面具'],
    bg: 0x120710, fog: 0x120710, fogDensity: 0.038,
    ground: 0x2a1018, groundRough: 0.48, groundMetal: 0.26,
    accent: 0xd9b65a, accent2: 0x8e1b2e,
    keyLight: 0xffe6b0, rimLight: 0x8e1b2e, envInt: 0.40, exposure: 1.10,
    pedestal: 0x38121c, ring: 0xd9b65a,
    particle: 0xf0d38a, particleCount: 280,
    props: 'opera',
  },
  {
    id: 'neon',
    skin: '亚文化',
    name: '霓虹像素 · 地下心跳',
    en: 'UNDERGROUND HEARTBEAT',
    idx: '世界线 03',
    relic: '街机',
    desc:
      '千禧地下文化展，进入赛博地下城。这里的记忆正在一格一格地消散，亚文化的心跳以 8-bit 的方式跳动着。四人的任务，是守住这段正在被格式化的地下记忆。',
    mission: '守住正在消散的亚文化记忆',
    symbols: ['街机柜', '像素心跳', '霓虹管'],
    bg: 0x07040f, fog: 0x07040f, fogDensity: 0.034,
    ground: 0x120a24, groundRough: 0.38, groundMetal: 0.55,
    accent: 0x22f0ff, accent2: 0xff2e88,
    keyLight: 0x9be9ff, rimLight: 0xff2e88, envInt: 0.46, exposure: 1.16,
    pedestal: 0x180f2e, ring: 0x22f0ff,
    particle: 0x22f0ff, particleCount: 340,
    props: 'neon',
  },
];

/* 主角团（浣熊为隐藏款，只存在于霓虹地下城） */
export const CAST = [
  { id: '兔', code: '听忆者', trait: '最先听见文物低语的人，负责捕捉记忆的频率。' },
  { id: '狗', code: '引路者', trait: '团队里的行动派，手提箱的时空锁由他开启。' },
  { id: '猫', code: '拾遗者', trait: '考据型选手，负责解读铭文、残卷与展签。' },
  { id: '虎', code: '执符者', trait: '与文物共鸣最深，冲动，但绝对可靠。' },
  {
    id: '浣熊', code: '守夜人', only: 'neon', hidden: true,
    trait: '不在主角名单上的第五个人。地下城断电之前，他是最后一个还记得那段旋律的人——他守着的不是记忆，是记忆还没凉透的那点温度。',
  },
];

/* 记忆碎片：三条记忆世界线各 3 枚 */
export const FRAGMENTS = {
  tang: [
    { at: [-1.00, 0.88, 0.86], title: '骆驼俑 · 眼', text: '它驮着丝绸走了三千里，却没有人记得它出发那天，是谁替它系上的铃。' },
    { at: [0.34, 1.52, -0.92], title: '长安 · 夜鼓', text: '第一百零八声鼓响之后城门关闭。有人留在了城里，从此再没出现在这段史书里。' },
  ],
  opera: [
    { at: [1.05, 1.02, 0.74], title: '总谱 · 第 47 小节', text: '这一小节是空的。那是他听不见的地方，也是整部剧唯一没有声音的瞬间。' },
    { at: [-0.98, 1.34, 0.88], title: '白狐 · 手语', text: '她说：音乐不是用耳朵听的，是用骨头听的。于是他把谱架贴在胸口上写完了全曲。' },
    { at: [0.42, 0.74, -0.95], title: '首演 · 落下的幕', text: '那晚灯亮了，观众坐满了，但没有人走上台。幕布落下时，掌声留给了空气。' },
  ],
  neon: [
    { at: [1.02, 1.20, 0.76], title: '街机 · 排行榜', text: '最高分的那个 ID，在 2003 年的某个下午之后再没出现过。机器还留着他的记录。' },
    { at: [-1.02, 0.92, 0.88], title: '地下城 · 心跳', text: '这里的心跳是 8-bit 的，一格一格地在消失。谁先忘记，谁就先断电。' },
    { at: [0.30, 1.50, -0.90], title: '墙面 · 千禧贴纸', text: '贴纸一层压一层，最底下那张写着「这里永不拆迁」。墨水褪了，字还认得出。' },
  ],
};

/* 三条世界线的结局文本：某条线碎片集齐时解锁 */
export const ENDINGS = {
  tang: {
    title: '盛唐 · 那一行字回来了',
    sub: '世界线 01 · 记忆已完整',
    text:
      '骆驼俑颈上的铃重新系好，第一百零八声鼓响过，城门没有关上。史书里缺失的那一行重新浮现——那支没能发出的援兵，终于有人记录了他们的名字。历史没有被改写，只是不再沉默。',
  },
  opera: {
    title: '最终彩排 · 掌声落地',
    sub: '世界线 02 · 记忆已完整',
    text:
      '第四十七小节被补上了。白狐作曲家把谱架贴在胸口，听完了自己写的全曲——台上没有人，但灯亮了、幕落了，掌声第一次落到了地面上。那场没能上演的绝唱，终于响了一次。',
  },
  neon: {
    title: '地下城 · 心跳续上',
    sub: '世界线 03 · 记忆已完整',
    text:
      '最底下那张写着「这里永不拆迁」的贴纸被重新压了回去，排行榜上那个 2003 年之后再没出现的 ID，重新亮起一格。8-bit 的心跳没有停。守夜人还坐在街机前，等下一个人投币。',
  },
};

/* 三条世界线分镜（官网需要放置的"分镜故事"） */
export const STORYBOARD = [
  {
    world: 'tang', name: '盛唐长安 · 陕历博线', en: 'ACT 01 — CHANG\'AN',
    beats: [
      { t: '01 · 入馆', s: '闭馆之后', d: '陕历博闭馆，四人误触骆驼俑展柜的玻璃。锁芯咔哒一声，展厅的灯全灭，再亮起时窗外是长安的月。' },
      { t: '02 · 汇合', s: '西市相遇', d: '四人在长安西市以不同身份重逢：兔成了乐师，狗是驿卒，猫在抄书，虎进了府兵。彼此认不出，只对得上频率。' },
      { t: '03 · 裂缝', s: '合不上的信物', d: '那件信物两半始终对不上。缺的不是铜，是一行被删掉的史书——那支援兵，从来没有发出去。' },
      { t: '04 · 修补', s: '铃与鼓', d: '把铃系回骆驼俑颈上，鼓声响起时，那一行人终于被写回了纸上。遗憾被看见，时空没有被动。' },
    ],
  },
  {
    world: 'opera', name: '百老汇 · 最终彩排', en: 'ACT 02 — THE FINAL REHEARSAL',
    beats: [
      { t: '01 · 坠入', s: '百年特展', d: '百老汇百年特展的乐谱展柜前，四人被一段没有声音的旋律拽进了音乐剧世界。' },
      { t: '02 · 相遇', s: '白狐与手语', d: '聋哑的白狐作曲家用手语说：音乐不是用耳朵听的，是用骨头听的。于是他把谱架贴在胸口上写完了全曲。' },
      { t: '03 · 空缺', s: '第 47 小节', d: '全剧唯一一处空白，正是他听不见的地方。也是整部剧没人敢补的一小节。' },
      { t: '04 · 绝唱', s: '灯亮，幕落', d: '四人替他站上台，把最后一小节写完。观众席空着，但幕布落下时，掌声还是响了一次。' },
    ],
  },
  {
    world: 'neon', name: '霓虹像素 · 地下心跳', en: 'ACT 03 — UNDERGROUND HEARTBEAT',
    beats: [
      { t: '01 · 进入', s: '千禧展的街机', d: '千禧地下文化展，四人把手放在街机柜的摇杆上，屏幕一黑，再亮起时他们站在赛博地下城的入口。' },
      { t: '02 · 消散', s: '8-bit 的心跳', d: '这里的记忆一格一格地消失，心跳是方波。谁先忘记，谁就先断电。' },
      { t: '03 · 守夜', s: '排行榜上的 ID', d: '最高分的那个 ID，2003 年之后再没出现过。守夜人浣熊说：他不是走了，是被格式化了。' },
      { t: '04 · 守护', s: '永不拆迁', d: '把最底层那张贴纸重新压上去，墨水褪了，字还认得出。地下城的心跳续上了。' },
    ],
  },
];

/* 前期用户调研结论（官网需放置"调研成果"） */
export const RESEARCH = [
  { q: '年轻人为什么愿意靠近文博内容？', a: '访谈中被反复提到的不是年代与断代，而是「人物」和「遗憾」。有名字、有未完成的事，文物才从展柜里走出来。', k: '人物 > 年代' },
  { q: '亚文化群体真正在意什么？', a: '不是被主流接纳，而是「被记录」。受访者普遍愿意为身份认同付费，但拒绝被简化成标签。', k: '被记录的需求' },
  { q: '线下快闪的转化关键是什么？', a: '可拍照的装置负责传播，可带走的低价小件负责转化。高价收藏款只服务核心粉丝，不承担拉新。', k: '装置引流 + 小件转化' },
  { q: '对三条世界线的接受度？', a: '三线并行反而降低了进入门槛——观众可以先只追一条线。多数人因为「百老汇那条线」第一次点进来。', k: '单线入坑' },
];

/* 档案：商业逻辑 */
export const ARCHIVE = [
  {
    id: 'world',
    tab: '世界观',
    en: 'WORLDVIEW',
    render: () => `
      <h3 class="sec-h">IP 世界观与团队背景</h3>
      <p class="sec-sub">四人主角团 · 三条平行世界线</p>
      <p class="sec-lede">
        这是一套<b>文物记忆穿梭 IP</b>。现实里，博物馆的文物不只是静止展品，它们封存着一段段未完成的遗憾记忆。
        四位主角拥有一把可以连通记忆时空的手提箱，每当触碰承载强烈情绪的展品，就会被拉入对应的平行世界。
      </p>
      <div class="grid g3">
        <div class="card">
          <h4>盛唐 · 陕历博线</h4><div class="en">TANG DYNASTY</div>
          <p>四人在长安时空相遇汇合，依托骆驼俑等文物线索，修补一段被掩埋的历史细节。</p>
        </div>
        <div class="card">
          <h4>百老汇 · 最终彩排</h4><div class="en">BROADWAY</div>
          <p>坠入音乐剧世界，帮助聋哑白狐作曲家完成那场没能上演的绝唱。</p>
        </div>
        <div class="card">
          <h4>霓虹 · 地下像素</h4><div class="en">NEON PIXEL</div>
          <p>进入赛博地下城，守护正在消散的亚文化记忆。</p>
        </div>
      </div>
      <p class="sec-p">
        三条世界线独立又同源，内核一致：<b>打捞被遗忘、被边缘化的文化，完成曾经的遗憾</b>。
        时空不会被改写，但遗憾会被看见。
      </p>
      <div class="split">
        <div class="scene">
          <h4>团队背景</h4>
          <p>艺术科技与商业方向的创作小组，擅长把文博、戏剧、赛博亚文化用沉浸式叙事结合。</p>
          <p class="kv">分工覆盖：<b>剧本创作 / 视觉设计 / 交互策划 / 用户调研 / 商业落地</b></p>
        </div>
        <div class="scene">
          <h4>我们要做的</h4>
          <p>不做单纯的故事创作，而是把博物馆里静态的文物、冷门的文化故事，变成年轻人愿意沉浸式体验、愿意收藏传播的 IP 内容。</p>
          <p class="kv">打通链路：<b>展览 → 线上内容 → 衍生周边</b></p>
        </div>
      </div>`
  },
  {
    id: 'online',
    tab: '线上矩阵',
    en: 'ONLINE',
    render: () => `
      <h3 class="sec-h">线上宣传矩阵</h3>
      <p class="sec-sub">海报 / 官网 / 公众号 / 概念短片</p>
      <p class="sec-lede">
        核心目标：线上先建立 IP 辨识度，沉淀粉丝，为线下快闪、展览、衍生品蓄水。
      </p>
      <div class="grid g2">
        <div class="card">
          <h4>主题海报</h4><div class="en">POSTER SERIES</div>
          <p>唐朝长安款、百老汇音乐剧款、霓虹像素赛博款。每张海报绑定对应世界线的核心文物 / 符号，释放碎片化剧情伏笔。</p>
          <ul>
            <li>核心符号：古骆驼俑、残缺乐谱、街机</li>
            <li>投放：小红书 / IG / 朋友圈传播</li>
            <li>复用：作为线下快闪主视觉</li>
          </ul>
        </div>
        <div class="card">
          <h4>IP 官网</h4><div class="en">OFFICIAL SITE</div>
          <p>作为 IP 主阵地，放置完整世界观、三条世界线分镜故事、角色卡、调研成果、活动预告、周边预告。</p>
          <ul>
            <li>设计简约高级，搭配轻交互小动效</li>
            <li>访客可以解锁不同世界线的碎片剧情</li>
          </ul>
        </div>
        <div class="card">
          <h4>公众号长线运营</h4><div class="en">WECHAT COLUMN</div>
          <p>深度文：文物史料科普、百老汇小众作曲家故事、千禧地下亚文化溯源。</p>
          <p>连载：分篇章放出主线剧本、角色小传。</p>
          <p>活动通知：快闪开展、短片上新、周边开售、线下访谈招募。</p>
        </div>
        <div class="card">
          <h4>概念短片矩阵</h4><div class="en">SHORT FILMS</div>
          <ul>
            <li><b>氛围概念片</b>：每条世界线一支，无大量台词，用来立风格</li>
            <li><b>剧情碎片短片</b>：15–60s 小片段，放关键名场面，埋钩子吸引追更</li>
            <li><b>调研访谈短片</b>：前期用户采访、路人对文博 / 亚文化 IP 的看法，增加真实感</li>
          </ul>
        </div>
      </div>`
  },
  {
    id: 'offline',
    tab: '线下渠道',
    en: 'OFFLINE',
    render: () => `
      <h3 class="sec-h">线下商业模式</h3>
      <p class="sec-sub">博物馆 / 剧院 / 快闪 · 联动合作 + 自主快闪双路线，轻资产优先</p>
      <p class="sec-lede">
        整体逻辑：先用快闪测试热度，拿到正向反馈后，再推进博物馆、剧院的长期联动。
      </p>
      <div class="grid g3">
        <div class="card">
          <h4>博物馆合作渠道</h4><div class="en">MUSEUM</div>
          <ul>
            <li><b>合作形式</b>：配套特展做小型沉浸式分展区（陕历博类文博展馆联动「唐朝线」，潮流文化展馆联动「霓虹地下线」）</li>
            <li><b>内容投放</b>：投影、互动装置、故事展板、IP 角色立牌</li>
            <li><b>盈利</b>：展馆联合门票分成、馆内限定周边售卖</li>
            <li><b>优势</b>：自带精准文化爱好者客流，IP 背书强</li>
          </ul>
        </div>
        <div class="card">
          <h4>剧院合作渠道</h4><div class="en">THEATRE</div>
          <ul>
            <li><b>合作形式</b>：小型实验剧场、黑盒剧场联动，短剧场沉浸式微话剧 / 剧本体验，还原白狐作曲家的故事</li>
            <li><b>盈利</b>：体验场次门票、剧场限定周边</li>
            <li><b>玩法</b>：观众可拿到简易「通票道具」，与 IP 设定呼应</li>
          </ul>
        </div>
        <div class="card">
          <h4>城市快闪店</h4><div class="en">POP-UP</div>
          <ul>
            <li><b>落地</b>：商圈、文创空间短期快闪 7–14 天，三条世界线分区布置</li>
            <li><b>区域划分</b>：长安文物区、百老汇舞台区、霓虹像素打卡区</li>
            <li><b>体验项目</b>：打卡集章、小型互动解谜、限定周边售卖</li>
            <li><b>盈利</b>：门票（可选免费入场 + 付费解谜包）、周边售卖、商业拍摄场地租赁</li>
            <li><b>优势</b>：选址灵活，测试市场反馈成本低，适合前期跑数据</li>
          </ul>
        </div>
      </div>`
  },
  {
    id: 'story',
    tab: '分镜故事',
    en: 'STORYBOARD',
    render: () => `
      <h3 class="sec-h">三条世界线 · 分镜故事</h3>
      <p class="sec-sub">STORYBOARD · 每条线四幕</p>
      <p class="sec-lede">
        官网承载完整的分镜故事：三条世界线<b>独立又同源</b>，内核一致——打捞被遗忘、被边缘化的文化，完成曾经的遗憾。
        <b>时空不会被改写，但遗憾会被看见。</b>
      </p>
      ${STORYBOARD.map((sb) => `
        <div class="sb-block">
          <div class="sb-head"><h4>${sb.name}</h4><span class="en">${sb.en}</span></div>
          <ol class="sb-list">
            ${sb.beats.map((b) => `
              <li>
                <span class="sb-t">${b.t}</span>
                <b>${b.s}</b>
                <p>${b.d}</p>
              </li>`).join('')}
          </ol>
        </div>`).join('')}`
  },
  {
    id: 'goods',
    tab: '商品定价',
    en: 'MERCHANDISE',
    render: () => `
      <h3 class="sec-h">商品 · 定价 · 分成结构</h3>
      <p class="sec-sub">4 位主角 × 3 条世界线皮肤</p>
      <p class="sec-lede">
        主力盲盒走走量款，低价小件用来引流，高价款服务核心粉丝。<b>整体走文创中端路线，兼顾学生群体。</b>
      </p>
      <div class="split">
        <div class="scene">
          <h4>主力 · 角色盲盒</h4>
          <ul class="plist">
            <li><span class="nm">常规盲盒单盒<em>4 位主角 × 3 套皮肤</em></span><span class="pr">¥69–79</span></li>
            <li><span class="nm">整套端盒<em>一次性收齐</em></span><span class="pr">¥299</span></li>
          </ul>
        </div>
        <div class="scene">
          <h4>轻周边 · 引流款</h4>
          <ul class="plist">
            <li><span class="nm">金属徽章 · 街机齿轮钥匙扣</span><span class="pr">¥29–39</span></li>
            <li><span class="nm">骆驼俑迷你复刻摆件 / 乐谱镭射票</span><span class="pr">¥59–99</span></li>
            <li><span class="nm">明信片 · 海报集</span><span class="pr">¥29–39</span></li>
          </ul>
        </div>
      </div>
      <div class="scene" style="margin-bottom:20px">
        <h4>高阶周边 · 核心粉丝款</h4>
        <ul class="plist">
          <li><span class="nm">限定版画 · 故事设定集 · 原声 OST</span><span class="pr">¥129–199</span></li>
        </ul>
      </div>

      <h3 class="sec-h" style="font-size:19px">分成结构 · 三种场景</h3>
      <p class="sec-sub">REVENUE SHARE</p>
      <div class="grid g3">
        <div class="card">
          <h4>场景 A · 自主直营</h4><div class="en">DIRECT</div>
          <p>自主快闪 / 线上直营，无合作方。</p>
          <p>成本：生产制作费、物流、包装、平台服务费。<br>剩余毛利由项目团队留存，用于后续短片、装置、新剧情开发。</p>
        </div>
        <div class="card">
          <h4>场景 B · 场馆合作</h4><div class="en">VENUE</div>
          <p>博物馆 / 剧院渠道售卖。</p>
          <p><b>合作方（场馆）抽取销售额 15%–25%</b> 作为场地分成；剩余资金优先覆盖货品生产成本，利润归创作团队。</p>
          <p>场馆限定款周边版权归属我方 IP，合作方仅拥有该批次售卖权限。</p>
        </div>
        <div class="card">
          <h4>场景 C · 代工厂</h4><div class="en">OEM</div>
          <p>潮玩厂 / 文创代工厂代工。</p>
          <p>工厂只收取生产加工费，不参与销售分成；<b>IP 版权完全由我方持有</b>。</p>
        </div>
      </div>`
  },
  {
    id: 'research',
    tab: '用户调研',
    en: 'RESEARCH',
    render: () => `
      <h3 class="sec-h">前期用户调研成果</h3>
      <p class="sec-sub">USER RESEARCH · 访谈结论摘要</p>
      <p class="sec-lede">
        前期以路人访谈 + 文博 / 亚文化爱好者小样本深访为主，结论直接反哺了三条世界线的设定与衍生品定价带。
      </p>
      <div class="grid g2">
        ${RESEARCH.map((r) => `
          <div class="card">
            <h4>${r.q}</h4><div class="en">${r.k}</div>
            <p>${r.a}</p>
          </div>`).join('')}
      </div>
      <div class="scene">
        <h4>调研如何影响了这个项目</h4>
        <p>① 三条线并行而不是一条主线——降低进入门槛，允许观众单线入坑；</p>
        <p>② 衍生品主力压在 <b>¥69–79 盲盒</b> 与 <b>¥29–39 小件</b>，是访谈里学生群体明确能接受的价格带；</p>
        <p>③ 线下先做 <b>7–14 天快闪</b> 跑数据，再推进博物馆 / 剧院长期联动。</p>
      </div>`
  },
];
