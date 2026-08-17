---
title: "MTP Lite: Long-Read Genome Assembly Optimization"
slug: "optimal-read-selection"
summary: "Optimized a k-mer-based long-read selection pipeline that decreased genome assembly fragmentation by 91% while preserving a 99.9% genome fraction and 99.9% sequence identity."
order: 3
status: "Ongoing"
researchArea: "Computational Genomics"
tools:
  - "Python"
  - "NumPy"
  - "Jellyfish"
  - "Minimap2"
  - "BWA"
  - "Samtools"
  - "Pysam"
  - "Hifiasm"
  - "Seqkit"
affiliation: "Lonardi Lab · Dr. Stefano Lonardi"
image: "/assets/images/research/originals/mtp-lite-genome-assembly-poster.jpg"
imageAlt: "Poster summarizing MTP Lite long-read genome assembly optimization methods and results"
imageWidth: 2500
imageHeight: 1875
---

## Research focus

MTP Lite is an internal bioinformatics pipeline for selecting informative long reads for targeted genome assembly. The work focuses on scalable read selection, overlap analysis, and assembly preparation using Python, NumPy, Bash, and Linux tools.

## Results

Optimizing AWinK into MTP Lite decreased genome assembly fragmentation by 91% without reducing accuracy: internal evaluation retained a 99.9% genome fraction and 99.9% sequence identity while substantially reducing sequencing input.

## Research environment

This research is conducted in the Lonardi Lab at the University of California, Riverside under Dr. Stefano Lonardi. Technical details, benchmark data, and source code are confidential to the lab.
