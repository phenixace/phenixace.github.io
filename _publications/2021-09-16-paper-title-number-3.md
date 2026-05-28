---
title: "MFE-NER: Multi-feature Fusion Embedding for Chinese Named Entity Recognition"
collection: publications
permalink: /publication/2021-09-16-paper-title-number-3
excerpt: 'TIn this paper, we propose a new method, Multi-Feature Fusion Embedding for Chinese Named Entity Recognition (MFE-NER), to strengthen the language pattern of Chinese and handle the character substitution problem in Chinese Named Entity Recognition.'
date: 2024-01-01
venue: 'CCL 2024'
paperurl: 'https://arxiv.org/abs/2109.07877'
citation: 'Jiatong Li, Kui Meng. (2024). MFE-NER: Multi-feature Fusion Embedding for Chinese Named Entity Recognition. In Proceedings of the 23rd Chinese National Conference on Computational Linguistics (Volume 1: Main Conference) (pp. 1112-1122). CCL 2024.'
---

In Chinese Named Entity Recognition, character substitution is a complicated linguistic phenomenon. Some Chinese characters are quite similar as they share the same components or have similar pronunciations. People replace characters in a named entity with similar characters to generate a new collocation but referring to the same object. As a result, it always leads to unrecognizable or mislabeling errors in the NER task. In this paper, we propose a lightweight method, MFE-NER, which fuses glyph and phonetic features, to help pre-trained language models handle the character substitution problem in the NER task with limited extra cost. Basically, in the glyph domain, we disassemble Chinese characters into Five-Stroke components to represent structure features. In the phonetic domain, an improved phonetic system is proposed in our work, making it reasonable to describe phonetic similarity among Chinese characters. Experiments demonstrate that our method performs especially well in detecting character substitutions while slightly improving the overall performance of Chinese NER.

[Download paper here](https://arxiv.org/abs/2109.07877)