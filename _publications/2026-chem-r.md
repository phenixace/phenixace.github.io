---
title: "Chem-R: Learning to Reason as a Chemist"
collection: publications
permalink: /publication/2026-chem-r
excerpt: 'Molecule Discovery, Large Language Models, Reasoning'
date: 2026-05-01
venue: 'KDD 2026'
citation: 'Weida Wang, Benteng Chen, Di Zhang, Wanhao Liu, Shuchen Pu, Ben Gao, Jin Zeng, Xiaoyong Wei, Tianshu Yu, Shuzhou Sun, Tianfan Fu, Wanli Ouyang, Lei Bai, Jiatong Li, Zifu Wang, Yuqiang Li, Shufei Zhang. (2026). Chem-R: Learning to Reason as a Chemist. KDD 2026. (Corresponding Author)'
---

Although large language models (LLMs) have significant potential to advance chemical discovery, current LLMs lack core chemical knowledge, produce unreliable reasoning trajectories, and exhibit suboptimal performance across diverse chemical tasks. To address these challenges, we propose Chem-R, a generalizable Chemical Reasoning model designed to emulate the deliberative processes of chemists. Chem-R is trained through a three-phase framework that progressively builds advanced reasoning capabilities, including: 1) Chemical Foundation Training, which establishes core chemical knowledge. 2) Chemical Reasoning Protocol Distillation, incorporating structured, expert-like reasoning traces to guide systematic and reliable problem solving. 3) Multi-task Group Relative Policy Optimization that optimizes the model for balanced performance across diverse molecular- and reaction-level tasks. This structured pipeline enables Chem-R to achieve state-of-the-art performance on comprehensive benchmarks, surpassing leading large language models, including Gemini-2.5-Pro and DeepSeek-R1, by up to 32% on molecular tasks and 48% on reaction tasks. Meanwhile, Chem-R also consistently outperforms the existing chemical foundation models across both molecular and reaction level tasks. These results highlight Chem-R's robust generalization, interpretability, and potential as a foundation for next-generation AI-driven chemical discovery.

Code: [here](https://github.com/davidweidawang/Chem-R)
