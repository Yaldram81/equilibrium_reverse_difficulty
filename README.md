
# Reverse Difficulty: Equilibrium

An adaptive rhythm-reaction game designed to explore the psychological "Challenge Equilibrium." Unlike traditional games that start easy and get harder, **Equilibrium** flips the script to reward persistence and manage player frustration dynamically.

## 🕹️ Gameplay Concept

- **The Reverse Loop**: You start at 100% difficulty. The game is fast, punishing, and chaotic.
- **Rewarding Failure**: Every time you fail, the "Digital Master" (powered by Gemini) intervenes. The difficulty drops, targets become larger, physics slow down, and cryptic hints are revealed to guide you.
- **Punishing Success**: If you succeed too quickly or easily, the system detects "Over-performance" and spikes the difficulty back up to keep you in a state of flow and challenge.

## 🚀 Technical Features

- **Physics-Based Canvas**: Built with a custom physics engine for ball-to-ball elastic collisions and wall interactions.
- **Dual-Input System**: Burst targets using your mouse or by typing the corresponding letter on your keyboard for maximum responsiveness.
- **AI-Powered Adaptive Hinting**: Integrates the **Gemini 3 Flash** model to provide context-aware, "Digital Master" style advice based on your current failure streak.
- **Graceful Degradation**: Robust error handling for API limits (429 errors) with a built-in circuit breaker and local fallback intelligence.
- **Live Analytics**: Real-time difficulty tracking using Recharts to visualize your performance trend vs. system adjustments.

## 🛠️ Tech Stack

- **React 19 + TypeScript**
- **Tailwind CSS** (Modern Glassmorphic UI)
- **Canvas API** (High-performance rendering)
- **@google/genai** (AI integration)
- **Recharts** (Data visualization)

## 🧠 AI Integration Details

The game uses `gemini-3-flash-preview` to generate "Forbidden Knowledge" (hints). It analyzes:
1. Current Difficulty Percentage
2. Continuous Failure Count

If the API hits a quota limit, the game automatically switches to a local knowledge base of pre-written cryptic advice to ensure the gameplay experience remains uninterrupted.

---
*Designed for Challenge Equilibrium • Powered by Gemini Intelligence*
