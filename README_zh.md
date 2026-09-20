<div align="center">

# 🎥 LiveAssistant

### 面向真实直播的主动式 Omni 原生推理框架

*让模型学会 **什么时候保持沉默**、**该记住什么**，以及 **该把话说给谁**。*

<p>
  <img src="https://img.shields.io/badge/论文-即将发布-8b95a5?style=flat-square" alt="论文即将发布">
  <a href="https://daryl-gsj.github.io/LiveAssistant/"><img src="https://img.shields.io/badge/项目主页-Page-4c8bf5?style=flat-square&logo=googlechrome&logoColor=white" alt="项目主页"></a>
  <img src="https://img.shields.io/badge/HuggingFace-即将发布-8b95a5?style=flat-square" alt="HuggingFace 即将发布">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/License-MIT-4f9d75?style=flat-square" alt="License"></a>
</p>

<p>
  <b>高书剑</b><sup>1,2,3</sup>&nbsp;&nbsp; 闫佳美<sup>2</sup>&nbsp;&nbsp; 杨宇辰<sup>2</sup>&nbsp;&nbsp;
  周鹏昊<sup>2,†</sup>&nbsp;&nbsp; 王庆雷<sup>2,†</sup>&nbsp;&nbsp; 范铁寒<sup>2</sup><br>
  王媛<sup>4</sup>&nbsp;&nbsp; 吴祖煊<sup>1,3,*</sup>&nbsp;&nbsp; 姜育刚<sup>1,*</sup>
</p>

<sub><sup>1</sup> 复旦大学 &nbsp; <sup>2</sup> ByteDance TikTok &nbsp; <sup>3</sup> 上海创智学院 &nbsp; <sup>4</sup> 浙江大学</sub><br>
<sub><sup>*</sup> 通讯作者 &nbsp;·&nbsp; <sup>†</sup> 项目负责人</sub>

[**项目主页**](https://daryl-gsj.github.io/LiveAssistant/) · [**English**](./README.md)

</div>

---

## 一图看懂 LiveAssistant

<div align="center">
  <img src="./docs/static/images/figure2_problem.png" alt="LiveAssistant 问题定义" width="100%">
  <br><sub><b>从“给定问题再回答”走向“主动发现直播中的需求”。</b>模型需要判断是否行动、何时行动、服务谁，以及说什么。</sub>
</div>

## 动态案例

<table>
<tr>
<td width="33%" align="center"><b>唱歌 · 关键事件</b></td>
<td width="33%" align="center"><b>烹饪 · 主动保持沉默</b></td>
<td width="33%" align="center"><b>教育 · 持续跟踪上下文</b></td>
</tr>
<tr>
<td><img src="./docs/static/images/gif3.gif" alt="唱歌案例"></td>
<td><img src="./docs/static/images/gif1.gif" alt="烹饪案例"></td>
<td><img src="./docs/static/images/gif2.gif" alt="教育案例"></td>
</tr>
</table>

> 这些展示的是**连续决策轨迹**，而不是彼此独立的视频问答。面对每个新片段，模型都可以继续观察、把线索写入记忆，或仅在必要时向合适的对象输出反馈。

---

## 一句话概括

大多数流式视频模型都默认自己的任务是**不停地说**：要么逐片段解说，要么等待用户提问。**LiveAssistant** 挑战了这一前提，把直播理解重新定义为**共享社交现场中的选择性参与**。

| 每个直播片段上的决策 | 状态 |
|:--|:--:|
| 不打扰直播，继续观察 | `<obs>` |
| 保存私有线索，为后续决策保留上下文 | `<mem>` |
| 面向观众、主播或审核人员执行具体任务 | `<ans>` |

### 核心不同

- **定义新问题，而非再刷一个分数。** 面向异构、长时、多方信号流进行因果、混合驱动决策。
- **“说给谁”是一等公民决策。** 观众、主播与审核人员的路由由策略直接学习。
- **真正的 Omni 原生输入。** 直接融合视频、音频、弹幕、礼物、在线人数与房间元信息。
- **沉默也是一个合法动作。** 模型学习克制，而不是因持续输出获得奖励。
- **基于轨迹完成训练。** 标注、SFT、RL 与流式推理共享同一套连续决策结构。

---

## 行动协议

```text
<obs>                                  → 保持观察，不打扰直播节奏
<mem> ... </mem>                       → 把关键线索写入私有记忆
<ans> <viewer|host> [task] ... </ans>  → 面向指定对象执行具体任务
```

任务类型覆盖 `narration`、`key event`、`highlight moment`、`viewer QA`、`entity pinning`、`pacing alert`、`newcomer recap`、`FAQ gap` 与 `safety alert` 等真实直播需求。

<div align="center">
  <img src="./docs/static/images/protocol_placeholder.png" alt="LiveAssistant 行动协议" width="82%">
  <br><sub>OBS / MEM / ANS 构成连续决策循环，而非彼此孤立的回答。</sub>
</div>

---

## 技术方案

<div align="center">
  <img src="./docs/static/images/pipeline_placeholder.png" alt="LiveAssistant 训练与推理流程" width="100%">
</div>

1. **Omni 原生信号。** 按因果顺序编码并对齐视频、音频、互动、礼物、动态与元信息。
2. **状态机 × 多方路由。** 从统一的因果表示中联合生成激活状态、接收对象、任务与内容。
3. **MA-MSFT。** 通过标记感知多轮 SFT，避免稀有但关键的结构决策被长回复文本淹没。
4. **SM-GSPO。** 使用结构/内容分层奖励，以及轮次级与轨迹级 credit，优化流式行动策略。
5. **长时直播推理。** 高密度近期窗口与压缩长期记忆结合，在有限缓存中保留有效上下文。
6. **训推一致性。** 标注、训练与部署始终围绕同一条连续决策轨迹展开。

---

## 基准与结果

我们构建了一个**三方、人工复核**的严格因果评测基准，并按**直播房间**切分以避免泄漏。

| 统计项 | 优化语料 | 基准集 |
|:--|--:|--:|
| 直播间数量 | 123 | 14 |
| 连续片段 | 2,049 | 275 |
| 唯一 chunk | 115,938 | 13,812 |
| 时长（小时） | 320.80 | 38.17 |
| 弹幕 | 4,124,223 | 625,119 |
| 礼物 | 104,146 | 19,217 |
| 内容类别 / 语言组 | 9 / 2 | 9 / 2 |

基准刻意保持非平凡的状态分布：**48.2% OBS · 25.9% MEM · 25.9% ANS**，同时惩罚“一直说”和“一直沉默”。

### 主结果——完整直播输入（A+V+C+G，%）

| 方法 | State | OBS | MEM | ANS | Recip. | Task | Count | Gemini | Hard |
|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Qwen3-Omni polling | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| MA-MSFT | 70.05 | **87.06** | 36.50 | 72.00 | 66.42 | 52.55 | 72.00 | **83.90** | 81.56 |
| **MA-MSFT + SM-GSPO** ★ | **71.14** | 83.31 | **44.50** | **75.17** | **69.23** | **55.61** | **75.14** | 81.78 | **82.32** |

SM-GSPO 提升了 MEM（+8.0）、ANS（+3.2）、接收对象（+2.8）、任务（+3.1）、数量（+3.1）与 Hard（+0.8），同时如实呈现激活率与内容质量之间的权衡。

---

## 项目价值

- **对观众：** 实时讲解、新人回顾、高光提示与直接答疑。
- **对主播：** 聚合评论区问题、提醒节奏变化、关键节点与观众反馈。
- **对审核人员：** 标注潜在风险、异常事件与需要复核的精确片段。

LiveAssistant 把直播理解从被动回答推进到内容驱动的主动协同：**不是说得更多，而是知道何时该说、该帮助谁。**

## 发布进度

- [x] 项目主页与文档
- [ ] 论文 / arXiv
- [ ] 基准数据与评测脚本
- [ ] MA-MSFT / SM-GSPO 训练代码
- [ ] 模型权重

## 引用

arXiv 页面尚未发布。可暂时使用以下引用，论文发布后本仓库会同步更新。

```bibtex
@article{gao2025liveassistant,
  title   = {Live Assistant: Towards Proactive Omni-Modal Reasoning over Real-World Livestream},
  author  = {Gao, Shujian and Yan, Jiamei and Yang, Yuchen and Zhou, Penghao and Wang, Qinglei and Fan, Tiehan and Wang, Yuan and Wu, Zuxuan and Jiang, Yu-Gang},
  journal = {arXiv preprint},
  year    = {2025}
}
```

## 致谢

本项目由**复旦大学可信具身智能研究院**、**TikTok 直播内容理解团队**与**上海创智学院**联合完成。
