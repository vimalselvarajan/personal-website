---
title: "MTP Lite"
slug: "mtp-lite"
summary: "A targeted metagenomic read-selection workflow that condensed 1.31 million PacBio HiFi reads into a 14,176-read assembly input while preserving 99.993% genome fraction for C. elegans chromosome I."
order: 1
stack:
  - "Python"
  - "NumPy"
  - "Jellyfish"
  - "hifiasm"
  - "QUAST"
  - "Bioinformatics"
github: "https://github.com/vselv001/mtp-lite"
image: "/assets/images/projects/originals/mtp-lite-genome-assembly-poster.jpg"
imageAlt: "Genome assembly poster summarizing the MTP Lite read-selection pipeline and C. elegans chromosome I results"
imageWidth: 2500
imageHeight: 1875
---

## Project overview

MTP Lite is a targeted metagenomic read-selection pipeline for assembling a specific genomic region from deep PacBio HiFi sequencing data. It selects a compact, information-rich subset of reads with single-copy k-mers, then assembles that subset with hifiasm.

## Method

The workflow counts canonical 21-mers with Jellyfish, identifies frequency-filtered unikmers, and encodes each read as an ordered barcode of unikmer identifiers. A lazy greedy set-cover stage selects anchor reads, while direct bridge detection and bounded barcode-index searches recover reads that connect those anchors. The final selected reads are assembled with hifiasm and evaluated with QUAST.

## Results

For the v1.1 C. elegans chromosome I experiment, MTP Lite selected 14,176 reads from 1.31 million input reads at roughly 1,000× coverage. The resulting three-contig assembly covered 99.993% of the reference with no reported misassemblies.