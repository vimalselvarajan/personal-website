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
image: "/projects/hastest-fixture-overview.jpg"
imageAlt: "Overhead view of the HTOL fixture with development board, FTDI interface, current-sense hardware, and connected test leads"
imageCaption: "HTOL fixture overview"
imageWidth: 1280
imageHeight: 960
gallery:
  - src: "/projects/hastest_project.jpg"
    width: 800
    height: 571
    alt: "HTOL test hardware arranged on a blue work surface, including a development board and connected electronics"
    caption: "HTOL validation hardware"
  - src: "/projects/hastest-system-architecture.jpg"
    width: 1280
    height: 1232
    alt: "System architecture diagram for the HTOL station showing the test server, FTDI interface, DACs, power supplies, DAQs, current-sense boards, and 48 devices under test"
    caption: "HTOL station architecture"
  - src: "/projects/hastest-dut-harness.jpg"
    width: 662
    height: 800
    alt: "Labeled wire harness connections for RF amplifier modules on the HTOL test fixture"
    caption: "DUT harness connections"
  - src: "/projects/hastest-daq-power.jpg"
    width: 600
    height: 800
    alt: "Keysight DAQ973A data-acquisition system stacked above a Hewlett Packard programmable power supply"
    caption: "DAQ and power instrumentation"
---

## Project overview

Developed an automated 1,000-hour High Temperature Operating Life validation platform for RF amplifier modules, collecting performance and reliability data across 48 units.

## Hardware control

Built Python hardware-control software that integrated FTDI/SPI DACs, Keysight DAQ970A instrumentation, and programmable power supplies. The software automated sequencing, gate-bias regulation, drain-current monitoring, and CSV logging.

Designed a five-layer FTDI MPSSE stack for register-level bit-field access to a 16-channel DAC/ADC and a full-duplex SPI driver with configurable chip select, three- and four-wire modes, and dual-port support.

## Test orchestration

Developed a VISA driver library and test orchestration for the DAQ and Keysight power supplies, including binary-search voltage control. Partnered with customers and hardware engineers to turn test requirements into DAC and current-sense PCBA fixtures, then brought up and operated the end-to-end station.
