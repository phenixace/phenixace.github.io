---
title: "MolViBench: Evaluating LLMs on Molecular Vibe Coding"
collection: publications
permalink: /publication/2026-molvibench
excerpt: 'Molecule Discovery, Large Language Models'
date: 2026-05-01
venue: 'arXiv preprint'
paperurl: https://arxiv.org/abs/2605.02351
citation: 'Jiatong Li*, Yuxuan Ren, Weida Wang, Changmeng Zheng, Xiao-yong Wei, Qing Li, and Yatao Bian. (2026). MolViBench: Evaluating LLMs on Molecular Vibe Coding. arXiv preprint arXiv:2605.02351.'
---

Molecular Vibe Coding, a paradigm where chemists interact with LLMs to generate executable programs for molecular tasks, has emerged as a flexible alternative to chemical agents with predefined tools, enabling chemists to express arbitrarily complex, customized workflows. Unlike general coding tasks, molecular coding imposes a distinctive challenge that LLMs should jointly equip programming, molecular understanding, and domain-specific reasoning capabilities. However, existing benchmarks remain disconnected. General code generation benchmarks such as HumanEval and SWE-bench require no chemistry knowledge, while chemistry-focused benchmarks such as S^2-Bench and ChemCoTBench evaluate knowledge recall or property prediction rather than executable code generation. To bridge this gap, we introduce MolViBench, the first benchmark tailored for Molecular Vibe Coding. MolViBench comprises 358 curated tasks across five cognitive levels, ranging from single-API recall to end-to-end virtual screening pipeline design, spanning 12 real-world drug discovery workflows. To rigorously assess generated code, we also propose a multi-layered evaluation framework that combines type-aware output comparison and AST-based API-semantic fallback analysis, which jointly measures executability and chemical correctness. We systematically evaluate 9 frontier coding LLMs and compare three real-world Molecular Vibe Coding paradigms, providing a practical and fine-grained testbed for diagnosing LLMs' coding capabilities in AI-accelerated molecular discovery.

Code: [here](https://github.com/phenixace/MolViBench-open)

[Download paper here](https://arxiv.org/abs/2605.02351)
