---
title: "Empowering Molecule Discovery for Molecule-Caption Translation with Large Language Models: A ChatGPT Perspective"
collection: publications
permalink: /publication/2023-molregpt
excerpt: 'Molecule Discovery, Large Language Models'
date: 2023-06-13
venue: 'arXiv preprint'
paperurl: 'https://arxiv.org/abs/2306.06615'
citation: 'Li, J., Liu, Y.*, Fan, W., Wei, X., Liu, H., Tang, J., Li, Q. (2023) Empowering Molecule Discovery for Molecule-Caption Translation with Large Language Models: A ChatGPT Perspective. arXiv preprint arXiv:2306.06615.'
---

Molecule discovery plays a crucial role in various scientific fields, advancing the design of tailored materials and drugs. Traditional methods for molecule discovery follow a trial-and-error process, which are both time-consuming and costly, while computational approaches such as artificial intelligence (AI) have emerged as revolutionary tools to expedite various tasks, like molecule-caption translation. Despite the importance of molecule-caption translation for molecule discovery, most of the existing methods heavily rely on domain experts, require excessive computational cost, and suffer from poor performance. On the other hand, Large Language Models (LLMs), like ChatGPT, have shown remarkable performance in various cross-modal tasks due to their great powerful capabilities in natural language understanding, generalization, and reasoning, which provides unprecedented opportunities to advance molecule discovery. To address the above limitations, in this work, we propose a novel LLMs-based framework (MolReGPT) for molecule-caption translation, where a retrieval-based prompt paradigm is introduced to empower molecule discovery with LLMs like ChatGPT without fine-tuning. More specifically, MolReGPT leverages the principle of molecular similarity to retrieve similar molecules and their text descriptions from a local database to ground the generation of LLMs through in-context few-shot molecule learning. We evaluate the effectiveness of MolReGPT via molecule-caption translation, which includes molecule understanding and text-based molecule generation. Experimental results show that MolReGPT outperforms fine-tuned models like MolT5-base without any additional training. To the best of our knowledge, MolReGPT is the first work to leverage LLMs in molecule-caption translation for advancing molecule discovery.

Our codes are available here:
[codes are available here](https://github.com/phenixace/molregpt)