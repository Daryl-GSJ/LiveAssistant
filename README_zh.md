<div align="center">

# 🎥 LiveAssistant

### 面向真实直播的主动式 Omni 原生理解框架

<p align="center">
  <em>让模型学会 <b>什么时候该闭嘴</b>、<b>什么时候该记住</b>,以及 <b>该把话说给谁</b>。</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/论文-arXiv-b31b1b?style=flat-square&logo=arxiv" alt="Paper"></a>
  <a href="#"><img src="https://img.shields.io/badge/项目主页-Page-4c8bf5?style=flat-square&logo=googlechrome&logoColor=white" alt="Project Page"></a>
  <a href="#"><img src="https://img.shields.io/badge/🤗-HuggingFace-yellow?style=flat-square" alt="HuggingFace"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"></a>
</p>

<p align="center">
  复旦大学可信具身智能研究院 · TikTok 直播内容理解团队 · 上海创智学院 联合出品
</p>

[English](./README.md) | **中文**

<img src="./docs/static/images/teaser_placeholder.png" alt="LiveAssistant teaser" width="820"/>

<sub>📌 占位图 — 替换为整体示意图 / 图 1(交互协议)。</sub>

</div>

---

## 📄 一句话概括

> 现有的视频大模型大多默认了一个隐含前提:**模型的任务就是不停地说**——要么边看边解说,要么用户问一句、模型答一句。
> **LiveAssistant** 想挑战的正是这个前提。它把直播理解重新定义为**在共享社交现场中的"选择性参与"**:在每一个直播片段,模型都要判断——**该不该说、说给谁、说什么类型**,其中也包括"保持沉默"这个合法动作。

<div align="center">

| LiveAssistant 每 10 秒回答的三个问题 | 状态 |
|:--|:--:|
| 现在该出手,还是继续观察? | `<obs>` |
| 要不要把这条线索悄悄记下来? | `<mem>` |
| 要不要开口——说给谁、说什么? | `<ans>` |

</div>

---

## ✨ 核心亮点

- 🧭 **定义真问题,而非再刷一个分数。** 在很多 AI 工作正变得 trivial 的今天,LiveAssistant 没有去刷更高的视频问答分数,而是回到直播场景本身,定义了一个原生的直播决策任务:异构、长时、多方互动、混合驱动的多模态信号流。
- 🗣️ **"说给谁"是一等公民决策。** 模型根据内容理解,决定把反馈发给**观众、主播还是审核人员**——这一步恰恰是过去几乎所有在线视频模型都略过的一环。
- 🎧 **真正的 Omni 原生。** 直接建模视频 **+** 音频 **+** 弹幕 **+** 礼物 **+** 在线人数 **+** 房间 meta 信息,而不是"图像帧 + ASR 文本"。
- 🤫 **"不说话"也是一个动作。** `<obs>` 与 `<mem>` 被当作深思熟虑的决策来监督,让模型学会克制,而不是一味多说。
- 🏗️ **轨迹数据引擎。** 从 HLS 切片重建直播回放时间线,对齐异构信号,切成 10 秒决策轨迹,并配有自动校验与人工复核。
- 🎯 **两阶段训练。** 标记感知多轮 SFT(**MA-MSFT**)→ 流式多轮 GSPO(**SM-GSPO**),辅以 agent-in-the-loop reward 优化,以及有界缓存的长程流式推理。

---

## 🧩 行动语法

LiveAssistant 把每个直播片段的输出压缩成三个核心动作:

```text
<obs>                                  → 沉默也是合法输出,不打扰直播节奏
<mem> ... </mem>                       → 记住关键线索,而不是重复说出来
<ans> <viewer|host> [task] ... </ans>  → 面向指定对象,输出具体类型的反馈
```

其中 `task` 覆盖真实直播需求,例如:
`narration` · `key event` · `highlight moment` · `viewer QA` · `entity pinning` · `pacing alert` · `newcomer recap` · `FAQ gap` · `safety alert`。

> 同一个事件可以路由到不同对象。*"评论区大量询问尺码"* → 对观众是 **FAQ 回答**,对主播是 **提醒补充说明**。*"直播突然冷场"* → 对观众可能无需输出,但对主播是一次 **pacing alert**。

<div align="center">
<img src="./docs/static/images/protocol_placeholder.png" alt="决策协议" width="720"/>
<br><sub>📌 占位图 — 替换为图 1:obs/mem/ans 决策骨架与状态回流循环。</sub>
</div>

---

## 🔬 技术方案

整套设计可拆成六层,贯穿信号、训练与推理:

<div align="center">
<img src="./docs/static/images/pipeline_placeholder.png" alt="流程图" width="820"/>
<br><sub>📌 占位图 — 替换为图 2:数据与训练流程。</sub>
</div>

**1. Omni 原生多模态直播信号。** 直接建模视频、音频、文本与平台外部信号——主播语气、背景音、弹幕密度、礼物事件、实时人数波动,都会共同决定模型是否应该输出。

**2. 内容理解驱动状态机 × 多方反馈。** 多方路由不是简单的后处理,而是状态机的一部分。单次自回归即可从共享的因果表示中产出"激活 + 对象 + 内容"。

**3. MA-MSFT——先学会直播行为语法。** 结构化目标长度高度不对称(`OBS` 只有一个 token,`ANS`/`MEM` 则很长)。**标记加权词表损失** + 额外的**状态候选标记损失**,让稀有但关键的结构决策不被回复文本淹没,同时保留开放词表生成能力。

**4. SM-GSPO——优化直播行动策略。** 逐轮因果 rollout,每一次生成都进入下一轮上下文(修正 exposure mismatch)。**分层奖励**强制"先结构、后语义",并同时建模 **turn-level** 与 **trajectory-level** credit,兼顾局部正确性与长程克制。

**5. 面向长时直播的长程推理。** 两级缓存:近期窗口保留高密度原始上下文,更早历史进入压缩记忆;记忆按直播轮次对齐,让一个事件的画面/声音/弹幕不被打散。

**6. 训推一致性。** 数据标注、SFT、RL 全都围绕**同一条**连续直播轨迹构造,最大限度减少流式训练的训推偏差。

---

## 📊 基准与结果

一个**三方、人工复核**的基准,在严格因果输入下评测(原生音频 + 视频 + 弹幕 + 礼物),并**按房间**切分以消除泄漏。

<div align="center">

| 统计项 | 优化语料 | 基准集 |
|:--|--:|--:|
| 直播间数量 | 123 | 14 |
| 连续片段 | 2,049 | 275 |
| 唯一 chunk | 115,938 | 13,812 |
| 时长(小时) | 320.80 | 38.17 |
| 弹幕 | 4,124,223 | 625,119 |
| 礼物 | 104,146 | 19,217 |
| 内容类别 / 语言组 | 9 / 2 | 9 / 2 |

<sub>基准的状态分布刻意保持非平凡:**48.2% OBS · 25.9% MEM · 25.9% ANS**,同时惩罚"一直说"和"一直沉默"两种退化策略。</sub>

</div>

### 主结果(完整直播输入 A+V+C+G,单位 %)

<div align="center">

| 方法 | State(All) | OBS | MEM | ANS | Recip. | Task | Count | Gemini | Hard |
|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Qwen3-Omni polling | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| MA-MSFT | 70.05 | **87.06** | 36.50 | 72.00 | 66.42 | 52.55 | 72.00 | **83.90** | 81.56 |
| **MA-MSFT + SM-GSPO** ★ | **71.14** | 83.31 | **44.50** | **75.17** | **69.23** | **55.61** | **75.14** | 81.78 | **82.32** |

</div>

> **如何解读。** 未经训练的 base 模型得分为 **0**——因为这个任务在其参数分布之外,甚至无法做到指令跟随,印证了这是一项全新的能力。SM-GSPO 提升了最关键的决策(MEM +8.0,ANS +3.2,对象 +2.8,任务 +3.1,数量 +3.1,Hard +0.8),并**如实报告**了 OBS(−3.75)与内容分(−2.12)上的权衡——这是真实的"激活 vs 内容质量"张力,而非一味的全面提升。

<div align="center">
<img src="./docs/static/images/case_placeholder.png" alt="真实案例" width="820"/>
<br><sub>📌 占位图 — 替换为图 3:真实直播案例,展示 obs/mem/ans 时间线。</sub>
</div>

---

## 💡 项目价值

LiveAssistant 服务的从来不是一个人,而是整个直播现场里的所有角色:

- 👥 **对观众**——实时讲解、新人 recap、高光提示、直接答疑。
- 🎙️ **对主播**——提醒评论区问题、节奏变化、商品/游戏关键节点与观众反馈。
- 🛡️ **对审核人员**——在长时直播中标注潜在风险、异常事件与待复核片段。

它把直播理解从"**被动回答**"推进到"**内容驱动的主动协同**"——这可能正是直播大模型走向真实生产系统时必须补上的一环:**不是更会说,而是更知道何时该说、该对谁说。**

---

## 🗂️ 仓库结构

```text
LiveAssistant/
├── README.md              # 英文版
├── README_zh.md           # 本文件
├── LICENSE
├── CITATION.cff
├── docs/                  # GitHub Pages 项目主页
│   ├── index.html
│   └── static/            # css / js / images
└── assets/                # 图片与媒体资源
```

---

## 🚧 进展与规划

当前仓库主要包含**项目叙述、基准介绍与主页**。代码、模型权重与数据将陆续开放。

- [x] 项目主页与文档
- [ ] 论文(arXiv)链接
- [ ] 基准数据与评测脚本
- [ ] 训练代码(MA-MSFT / SM-GSPO)
- [ ] 模型权重(HuggingFace)

---

## 📖 引用

```bibtex
@article{gao2025liveassistant,
  title   = {Live Assistant: Towards Proactive Omni-Modal Reasoning over Real-World Livestream},
  author  = {Gao, Shujian and Yan, Jiamei and Zhou, Penghao and Wang, Qinglei and Wu, Zuxuan and Jiang, Yu-Gang},
  journal = {arXiv preprint},
  year    = {2025}
}
```

---

## 🙏 致谢

本项目由**复旦大学可信具身智能研究院**、**TikTok 直播内容理解团队**与**上海创智学院**联合完成,面向真实 TikTok 直播场景,使用真实直播数据,探索真实世界直播理解、记忆与反馈建模。

<div align="center">
<sub>为真实直播现场而作 ❤️ · 欢迎 Issue 与 PR。</sub>
</div>
