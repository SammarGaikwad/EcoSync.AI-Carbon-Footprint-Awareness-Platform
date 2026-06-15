# EcoSync.AI - Carbon Footprint Awareness Platform

An intelligent, real-time tracking platform designed to parse unstructured lifestyle logs and normalize them into multi-variable environmental impact telemetry data. Built specifically for **[Challenge 3] Carbon Footprint Awareness Platform** under the Hack2skill evaluation framework.

---

## 📐 Chosen Vertical & Project Overview
EcoSync.AI bridges the gap between complex climate science and daily human behavior. The platform processes raw, natural language descriptions of daily activities (e.g., commuting, eating habits, appliance usage), extracts the core metrics, and runs them through a dynamic calculation engine to provide immediate feedback via an interactive dashboard and an adaptive **Eco Avatar State**.

## 🧠 Core Engineering Approach & Architecture
The application implements a decoupled, dual-engine processing framework optimized for high efficiency, strict data parsing, and zero-state security:

1. **Dual Parsing Layer:**
   - **Offline Regex Engine:** A lightweight, local processing tokenized string matcher that runs entirely client-side with minimal computing overhead.
   - **Gemini 2.5 AI Engine:** A structured natural language processing engine that enforces strict schema compliance to isolate unstructured data into uniform data objects without code block syntax formatting wrappers.
2. **Deterministic Calculation Core:** A centralized logic layer that maps the structured data objects against real-time, user-adjustable **Carbon Coefficients** (custom slider states), eliminating rendering lag and multi-pass state recalculations.
3. **Optimized Client-Side Caching:** Caches the parsed telemetry payload. Moving the coefficient sliders triggers instant client-side recalculations on the cached payload, completely eliminating redundant, expensive API calls.
4. **Vercel Serverless Function Deployment:** Features Zero Config deployment via `api/parse.js`, mapping the Express proxy server onto Vercel serverless functions for edge API hosting.
5. **Input Sanitization & Validation:** Enforces strict parameter type checks, maximum input limits (2,000 characters), and HTML tag stripping on the backend server to defend against XSS and DoS attacks.
6. **Inclusive Accessible UI (WCAG 2.1):** Integrates semantic `aria-label` tags on all sliders/controls and wraps the Eco Avatar SVG with screen reader attributes. Features robust `focus-visible` focus rings for keyboard-only users.

```text
  [Raw User Text Log] ---> [Parsing Engine Selector] 
                                    |
                                    v
                       [Normalized Data Contract]
                                    |
                                    v
  [UI Slider Constants] ---> [Calculation Engine] ---> [Dashboard Telemetry Updates]
                                                      └──> Total Emitted / Saved
                                                      └──> Dynamic Avatar Health
```

## 📊 Calculation Logic & Mathematical Formulas
Emissions are calculated dynamically based on input parameters and dynamic coefficients:

* **Mobility Emissions:** $$E_{\text{mobility}} = \text{distance (km)} \times C_{\text{mode}}$$
* **Transit Carbon Offset Delta (Total Saved):** If a cleaner mode of transit (e.g., Metro Transit) is chosen over a standard personal car baseline, the system logs avoided emissions:
  $$\text{Savings} = (\text{distance} \times C_{\text{automobile}}) - E_{\text{mobility}}$$
* **Dietary Thresholds:** Maps meal selections directly to categorical factors ($C_{\text{low}}$, $C_{\text{medium}}$, $C_{\text{high}}$) and tracks savings relative to high-impact baselines.
* **Appliance Consumption:** Calculates runtime durations against high-draw load factors:
  $$E_{\text{appliances}} = \text{duration (hrs)} \times C_{\text{appliance}}$$
* **Avatar State Calibration:** Translates aggregate metrics into a linear health index:
  $$\text{Avatar Health} = \max(0, \min(100, 100 - (\text{Total Emitted} \times 4)))$$

## 🔍 Key Engineering Assumptions
- **Baseline Car Travel:** A standard private automobile coefficient represents the baseline comparison value used to compute transportation offset metrics.
- **High-Draw Appliances:** Common heavy residential equipment (e.g., standard air conditioners or space heaters) is assumed to have a uniform average power draw baseline matching the client-side constant configurations.
- **Daily Scaling:** Logs are processed and contextualized within an isolated 24-hour window to maintain high dashboard responsiveness.

## 🚀 Local Deployment & Verification

### Installation
```bash
# Clone the repository
git clone <your-repository-url>

# Install optimized dependencies
npm install
```

### Run the Application

```bash
npm start
```

### Run Automated Validation Tests

To verify calculation accuracy and data edge cases independently of the UI:

```bash
npm test
```
