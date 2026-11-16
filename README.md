# Echoes of History - Interactive Multi-Era Pedagogical Dialogue Engine

**Interactive Historical Simulation, Real-Time Speech Synthesis & Adaptive Persona Retrieval**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite_7-646CFF?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Speech Synthesis](https://img.shields.io/badge/Web_Speech_API-0284c7?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

---

## Overview

**Echoes of History** is an applied artificial intelligence and pedagogical simulation engine designed to explore historical figures through multi-modal dialogue. By synthesizing biographical archives, domain-specific lexical registers, and phonetic speech models, the platform reconstructs interactive personas across antiquity, the Renaissance, the Enlightenment, and the modern scientific revolution.

Live Demonstration: [https://yasmenmad.github.io/echoes-of-history/](https://yasmenmad.github.io/echoes-of-history/)

---

## Architectural Highlights

- **Multi-Persona Historical Engine:** Implements dedicated knowledge models and conversational parameters for 9 key historical figures:
  - Napoleon Bonaparte (Strategic Doctrine & Sovereign Ambition)
  - Cleopatra VII (Hellenistic Diplomacy & Ptolemaic Governance)
  - Nikola Tesla (Electromagnetic Resonance & Polyphase Power)
  - Leonardo da Vinci (Anatomical Mechanics & Renaissance Engineering)
  - Albert Einstein (Theoretical Physics, Relativity & Spacetime Curvature)
  - Frida Kahlo (Modernist Surrealism, Cultural Resilience & Expression)
  - Genghis Khan (Steppe Logistics, Nomadic Discipline & Imperial Command)
  - Marie Curie (Radioactivity, Experimental Chemistry & Atomic Physics)
  - William Shakespeare (Classical Rhetoric, Dramatic Meter & Lexicon)

- **Acoustic Phonetics & Speech Synthesis:**
  - Integrates the browser Web Speech API with regional accent routing (`fr-FR`, `en-GB`, `it-IT`, `de-DE`, `es-MX`, `ru-RU`).
  - Dynamic pitch, speech rate calibration, and utterance lifecycle management.

- **Dual-Mode Response Engine:**
  - **Online Mode:** Connects to high-throughput LLM reasoning via Groq REST endpoints (`llama-3.3-70b-versatile`) with prompt-engineered personality bounds.
  - **Offline/Resilient Mode:** Automated in-character quote progression and contextual fallback routing for disconnected or low-latency runtime environments.

- **Living World Visualization:**
  - Real-time CSS particle physics, eye-tracking portrait geometry, relic collection state machine, and interactive historical document archives.

---

## Systems Architecture

```
[ Client Application ] 
       │
       ├─► [ Persona Controller ] ──► Biographical Knowledge & Lexical Tone
       │
       ├─► [ Acoustic Engine ] ──► Web Speech API (Phonetic Modulation)
       │
       └─► [ Inference Router ]
                 ├── Primary: Groq API (Llama 3.3 70B Versatile)
                 └── Fallback: Client-Side Curated Archival Synthesis
```

---

## Deployment & Local Development

### Requirements
- Node.js (v18.0 or higher)
- npm or yarn

### Installation
```bash
git clone https://github.com/yasmenmad/echoes-of-history.git
cd echoes-of-history
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

---

## Author & Research Context

- **Author:** Yasmine Daoudi
- **Role:** Software Engineer & Applied Computer Science Researcher
- **LinkedIn:** [linkedin.com/in/yasmine-daoudi-eng](https://www.linkedin.com/in/yasmine-daoudi-eng)
- **GitHub:** [github.com/yasmenmad](https://github.com/yasmenmad)

---

## License

This project is licensed under the MIT License - see the LICENSE file for details.
