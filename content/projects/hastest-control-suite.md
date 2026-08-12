---
title: "Hastest DAC, DAQ, and Power Supply Control Suite"
slug: "hastest-control-suite"
summary: "Developed an automated 1,000-hour HTOL validation platform for 48 RF amplifier modules, integrating FTDI/SPI DACs, Keysight instrumentation, programmable power supplies, and Python test orchestration."
order: 4
stack:
  - "Python"
  - "Pandas"
  - "PyFTDI"
  - "PyVISA"
  - "Virtual Environment"
  - "SPI"
  - "USB"
  - "GPIB"
github: "https://github.com/vimalselvarajan/Hastest-SPI-DAC-and-Power-Control"
image: "/projects/hastest_project.jpg"
imageAlt: "HTOL test hardware arranged on a blue work surface, including a development board and connected electronics"
imageWidth: 800
imageHeight: 571
---

## Project overview

Developed an automated 1,000-hour High Temperature Operating Life validation platform for RF amplifier modules, collecting performance and reliability data across 48 units.

## Hardware control

Built Python hardware-control software that integrated FTDI/SPI DACs, Keysight DAQ970A instrumentation, and programmable power supplies. The software automated sequencing, gate-bias regulation, drain-current monitoring, and CSV logging.

Designed a five-layer FTDI MPSSE stack for register-level bit-field access to a 16-channel DAC/ADC and a full-duplex SPI driver with configurable chip select, three- and four-wire modes, and dual-port support.

## Test orchestration

Developed a VISA driver library and test orchestration for the DAQ and Keysight power supplies, including binary-search voltage control. Partnered with customers and hardware engineers to turn test requirements into DAC and current-sense PCBA fixtures, then brought up and operated the end-to-end station.
