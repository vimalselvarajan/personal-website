---
title: "Adaptive Cache Warming for Microarchitecture Simulation"
slug: "adaptive-cache-warming"
summary: "Researching a Simics-to-MacSim integration pipeline and an adaptive cache-warming strategy intended to reduce sampled microarchitecture simulation overhead."
order: 1
status: "Ongoing"
researchArea: "Computer Architecture"
tools:
  - "C/C++"
  - "Intel XED"
  - "Intel Simics"
  - "MacSim"
  - "Python"
  - "CPI / IPC Analysis"
  - "Multicore Instruction Tracing"
affiliation: "Brisk Lab · University of California, Riverside"
---

## Research focus

This work documents an Intel Simics and MacSim integration pipeline for multicore instruction tracing, binary trace generation, and sampled warm-up and detailed execution. The workflow combines C/C++, Intel XED, and Python with compatibility checks between simulator stages.

## Adaptive cache warming

The proposed strategy uses last-level-cache cold-set tracking together with optimistic and pessimistic IPC bounds to determine when a sampled simulation has warmed sufficiently. The goal is to reduce warm-up overhead without weakening the validity of the detailed execution interval.

## Experimental workflow

The work includes reproducible cycle-level microarchitecture experiments, simulator configuration, CPI and IPC analysis, and validation of checkpoints, traces, and sampled results.
