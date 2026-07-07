const E_BASE = 0.00045;
const W_BASE = 0.004;
const C_BASE = 0.0002;
const M_BOTTLE = 500.0;

// New equivalency baselines
const IPHONE_17_WH = 14.5;
const SEDAN_CO2_PER_MILE = 200; // grams

// Global baseline: 2.5 billion daily prompts
const GLOBAL_PROMPTS_PER_DAY = 2_500_000_000;
const GLOBAL_PROMPTS_PER_SECOND = GLOBAL_PROMPTS_PER_DAY / 86400;
const GLOBAL_TOKENS_PER_PROMPT = 1.33;

const regions = {
  global: {
    label: 'Global Grid Average',
    electricityMultiplier: 1.0,
    carbonMultiplier: 1.0,
    waterMultiplier: 1.0,
    description: 'Global standard operational baseline.'
  },
  'us-east': {
    label: 'US East (Northern Virginia)',
    electricityMultiplier: 1.25,
    carbonMultiplier: 1.25,
    waterMultiplier: 1.20,
    description: 'High data center density; fossil-fuel reliant infrastructure.'
  },
  'us-west': {
    label: 'US West (Oregon)',
    electricityMultiplier: 0.50,
    carbonMultiplier: 0.50,
    waterMultiplier: 0.80,
    description: 'Optimized via renewable and hydro-intensive public grid mixes.'
  },
  'eu-france': {
    label: 'Europe (France)',
    electricityMultiplier: 0.15,
    carbonMultiplier: 0.15,
    waterMultiplier: 1.10,
    description: 'Nuclear-dominant generation profiles yielding low direct carbon output.'
  },
  'eu-ireland': {
    label: 'Europe (Ireland)',
    electricityMultiplier: 0.85,
    carbonMultiplier: 0.85,
    waterMultiplier: 0.90,
    description: 'Variable grid dynamically balancing wind fields with gas assets.'
  }
};

const models = {
  generic: {
    label: 'Generic / Unknown',
    electricityMultiplier: 1.0,
    waterMultiplier: 1.0,
    carbonMultiplier: 1.0,
    description: 'Averaged baseline across model classes (Luccioni et al., 2023).'
  },
  // OpenAI
  'gpt-4o': {
    label: 'GPT-4o',
    electricityMultiplier: 1.5,
    waterMultiplier: 1.5,
    carbonMultiplier: 1.5,
    description: 'OpenAI flagship multimodal model. Dense architecture; estimated ~1.5× baseline.'
  },
  'gpt-4o-mini': {
    label: 'GPT-4o mini',
    electricityMultiplier: 0.25,
    waterMultiplier: 0.25,
    carbonMultiplier: 0.25,
    description: 'Lightweight OpenAI model optimised for speed and lower-cost tasks.'
  },
  'o1': {
    label: 'o1 (reasoning)',
    electricityMultiplier: 6.0,
    waterMultiplier: 6.0,
    carbonMultiplier: 6.0,
    description: 'Extended chain-of-thought reasoning generates thousands of internal tokens per response.'
  },
  'o3': {
    label: 'o3 (reasoning)',
    electricityMultiplier: 20.0,
    waterMultiplier: 20.0,
    carbonMultiplier: 20.0,
    description: 'Most intensive reasoning model. Internal "thinking" can span tens of thousands of tokens.'
  },
  // Anthropic
  'claude-opus-4': {
    label: 'Claude Opus 4',
    electricityMultiplier: 2.0,
    waterMultiplier: 2.0,
    carbonMultiplier: 2.0,
    description: 'Anthropic\'s most capable model. Larger architecture for complex, multi-step tasks.'
  },
  'claude-sonnet-4': {
    label: 'Claude Sonnet 4',
    electricityMultiplier: 1.0,
    waterMultiplier: 1.0,
    carbonMultiplier: 1.0,
    description: 'Anthropic\'s balanced performance model. Used as our baseline reference point.'
  },
  'claude-haiku-4': {
    label: 'Claude Haiku 4',
    electricityMultiplier: 0.15,
    waterMultiplier: 0.15,
    carbonMultiplier: 0.15,
    description: 'Fastest and most efficient Anthropic model. Minimal compute and energy footprint.'
  },
  // Google
  'gemini-2-5-pro': {
    label: 'Gemini 2.5 Pro',
    electricityMultiplier: 1.3,
    waterMultiplier: 1.3,
    carbonMultiplier: 1.3,
    description: 'Google flagship. Google published ~0.24 Wh/avg query vs. ~0.34 Wh for GPT-4 class.'
  },
  'gemini-2-0-flash': {
    label: 'Gemini 2.0 Flash',
    electricityMultiplier: 0.2,
    waterMultiplier: 0.2,
    carbonMultiplier: 0.2,
    description: 'Google\'s speed-optimised model. Low latency and minimal energy overhead.'
  },
  // Meta
  'llama-3-3-70b': {
    label: 'Llama 3.3 70B',
    electricityMultiplier: 0.9,
    waterMultiplier: 0.9,
    carbonMultiplier: 0.9,
    description: 'Meta\'s open-source 70B model. Actual impact varies by hosting provider and hardware.'
  },
  'llama-3-2-3b': {
    label: 'Llama 3.2 3B',
    electricityMultiplier: 0.05,
    waterMultiplier: 0.05,
    carbonMultiplier: 0.05,
    description: 'Meta\'s lightweight edge model, designed for on-device or local deployment.'
  },
  // Mistral AI
  'mistral-large': {
    label: 'Mistral Large 2',
    electricityMultiplier: 1.2,
    waterMultiplier: 1.2,
    carbonMultiplier: 1.2,
    description: 'Mistral\'s ~123B parameter dense model from this European AI lab.'
  },
  'mistral-7b': {
    label: 'Mistral 7B',
    electricityMultiplier: 0.08,
    waterMultiplier: 0.08,
    carbonMultiplier: 0.08,
    description: 'Highly efficient 7B open-source model. Very low compute footprint per token.'
  },
  // DeepSeek
  'deepseek-r1': {
    label: 'DeepSeek R1',
    electricityMultiplier: 0.9,
    waterMultiplier: 0.9,
    carbonMultiplier: 0.9,
    description: 'Reasoning model with sparse MoE — only ~37B active of 671B total parameters.'
  },
  'deepseek-v3': {
    label: 'DeepSeek V3',
    electricityMultiplier: 0.6,
    waterMultiplier: 0.6,
    carbonMultiplier: 0.6,
    description: 'Dense MoE architecture from DeepSeek. Efficient relative to its capability class.'
  },
  // xAI
  'grok-3': {
    label: 'Grok 3',
    electricityMultiplier: 2.0,
    waterMultiplier: 2.0,
    carbonMultiplier: 2.0,
    description: 'xAI\'s flagship model. Large-scale architecture trained on the Colossus cluster.'
  }
};

const elements = {
  impactForm: document.getElementById('impact-form'),
  promptInput: document.getElementById('prompt-input'),
  promptSubmit: document.getElementById('prompt-submit'),
  modelSelect: document.getElementById('model-select'),
  modelDescription: document.getElementById('model-description'),
  regionSelect: document.getElementById('region-select'),
  regionDescription: document.getElementById('region-description'),
  dailyVolume: document.getElementById('daily-volume'),
  volumeValue: document.getElementById('volume-value'),
  tokenCount: document.getElementById('token-count'),
  
  // Micro impact
  promptIphoneCharges: document.getElementById('prompt-iphone-charges'),
  promptElectricityWh: document.getElementById('prompt-electricity-wh'),
  promptWaterBottles: document.getElementById('prompt-water-bottles'),
  promptWaterMl: document.getElementById('prompt-water-ml'),
  promptSedanMiles: document.getElementById('prompt-sedan-miles'),
  promptCarbonG: document.getElementById('prompt-carbon-g'),
  
  // Annual impact
  annualIphoneCharges: document.getElementById('annual-iphone-charges'),
  annualElectricityKwh: document.getElementById('annual-electricity-kwh'),
  annualWaterBottles: document.getElementById('annual-water-bottles'),
  annualWaterLiters: document.getElementById('annual-water-liters'),
  annualSedanMiles: document.getElementById('annual-sedan-miles'),
  annualCarbonKg: document.getElementById('annual-carbon-kg'),
  
  // Global debt clock
  globalPrompts: document.getElementById('global-prompts'),
  globalWater: document.getElementById('global-water'),
  globalElectricity: document.getElementById('global-electricity'),
  globalCarbon: document.getElementById('global-carbon'),
  
  // Sections
  microImpactSection: document.getElementById('micro-impact-section'),
  annualImpactSection: document.getElementById('annual-impact-section')
};

let globalPromptsTotal = 0;
let globalWaterMlTotal = 0;
let globalElectricityWhTotal = 0;
let globalCarbonKgTotal = 0;
let globalTokensTotal = 0;
let hasSubmitted = false;

function getWordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateTokens(wordCount) {
  return Math.max(1, Math.round(wordCount * 1.33));
}

function formatNumber(value, digits = 2) {
  return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function updateModelDescription(modelKey) {
  const model = models[modelKey];
  elements.modelDescription.textContent = model.description;
}

function updateRegionDescription(regionKey) {
  const region = regions[regionKey];
  elements.regionDescription.textContent = region.description;
}

function computeMetrics() {
  const text = elements.promptInput.value;
  const selectedModel = models[elements.modelSelect.value];
  const selectedRegion = regions[elements.regionSelect.value];
  const dailyVolume = Number(elements.dailyVolume.value);
  const wordCount = getWordCount(text);
  const estimatedTokens = estimateTokens(wordCount);

  const promptElectricityWh = estimatedTokens * E_BASE * selectedModel.electricityMultiplier * selectedRegion.electricityMultiplier;
  const promptWaterMl = estimatedTokens * W_BASE * selectedModel.waterMultiplier * selectedRegion.waterMultiplier;
  const promptCarbonG = estimatedTokens * C_BASE * selectedModel.carbonMultiplier * selectedRegion.carbonMultiplier;

  // Annual calculations
  const annualElectricityWh = promptElectricityWh * dailyVolume * 365;
  const annualElectricityKwh = annualElectricityWh / 1000;
  const annualWaterMl = promptWaterMl * dailyVolume * 365;
  const annualWaterLiters = annualWaterMl / 1000;
  const annualWaterBottles = annualWaterMl / M_BOTTLE;
  const annualCarbonG = promptCarbonG * dailyVolume * 365;
  const annualCarbonKg = annualCarbonG / 1000;

  // New tangible metrics
  const iPhoneCharges = annualElectricityWh / IPHONE_17_WH;
  const sedanMiles = annualCarbonG / SEDAN_CO2_PER_MILE;

  // Update micro impact display
  const promptIphoneCharges = promptElectricityWh / IPHONE_17_WH;
  const promptWaterBottles = promptWaterMl / M_BOTTLE;
  const promptSedanMiles = promptCarbonG / SEDAN_CO2_PER_MILE;

  elements.tokenCount.textContent = estimatedTokens;
  elements.promptIphoneCharges.textContent = formatNumber(promptIphoneCharges, 2);
  elements.promptElectricityWh.textContent = formatNumber(promptElectricityWh, 4);
  elements.promptWaterBottles.textContent = formatNumber(promptWaterBottles, 2);
  elements.promptWaterMl.textContent = formatNumber(promptWaterMl, 3);
  elements.promptSedanMiles.textContent = formatNumber(promptSedanMiles, 2);
  elements.promptCarbonG.textContent = formatNumber(promptCarbonG, 4);

  // Update annual impact display (emoji cards)
  elements.annualIphoneCharges.textContent = formatNumber(iPhoneCharges, 2);
  elements.annualElectricityKwh.textContent = formatNumber(annualElectricityKwh, 2);
  elements.annualWaterBottles.textContent = formatNumber(annualWaterBottles, 2);
  elements.annualWaterLiters.textContent = formatNumber(annualWaterLiters, 2);
  elements.annualSedanMiles.textContent = formatNumber(sedanMiles, 2);
  elements.annualCarbonKg.textContent = formatNumber(annualCarbonKg, 2);
}

function updateSubmitButtonVisibility() {
  const hasText = elements.promptInput.value.trim().length > 0;
  elements.promptSubmit.classList.toggle('hidden', !hasText);
}

function handlePromptSubmit(event) {
  if (event) event.preventDefault();

  const text = elements.promptInput.value.trim();
  if (!text) {
    elements.promptInput.focus();
    return;
  }

  hasSubmitted = true;
  computeMetrics();
  updateSubmitButtonVisibility();
  elements.microImpactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const TICK_MS = 250;

function updateGlobalDebtClock() {
  const promptsThisTick = GLOBAL_PROMPTS_PER_SECOND * (TICK_MS / 1000);
  const tokenCount = promptsThisTick * GLOBAL_TOKENS_PER_PROMPT;
  globalPromptsTotal += promptsThisTick;
  globalTokensTotal += tokenCount;
  globalWaterMlTotal += tokenCount * W_BASE;
  globalElectricityWhTotal += tokenCount * E_BASE;
  globalCarbonKgTotal += tokenCount * C_BASE / 1000;

  elements.globalPrompts.textContent = Math.floor(globalPromptsTotal).toLocaleString('en-US');
  elements.globalElectricity.textContent = formatNumber(globalElectricityWhTotal / 1000, 2);
  elements.globalWater.textContent = formatNumber(globalWaterMlTotal / 1000, 2);
  elements.globalCarbon.textContent = formatNumber(globalCarbonKgTotal, 2);
}

function initializeGlobalDebtClock() {
  // Seed the debt clock based on current time of day
  const now = new Date();
  const secondsIntoDay = (now.getHours() * 3600) + (now.getMinutes() * 60) + now.getSeconds();
  const fractionOfDayElapsed = secondsIntoDay / 86400;
  
  globalPromptsTotal = GLOBAL_PROMPTS_PER_DAY * fractionOfDayElapsed;
  globalTokensTotal = globalPromptsTotal * GLOBAL_TOKENS_PER_PROMPT;
  globalWaterMlTotal = globalTokensTotal * W_BASE;
  globalElectricityWhTotal = globalTokensTotal * E_BASE;
  globalCarbonKgTotal = globalTokensTotal * C_BASE / 1000;
  
  // Display initial values
  updateGlobalDebtClock();
}

function attachListeners() {
  elements.promptInput.addEventListener('input', () => {
    updateSubmitButtonVisibility();
    if (hasSubmitted) {
      computeMetrics();
    }
  });

  elements.promptInput.addEventListener('keydown', (event) => {
    const isEnter = event.key === 'Enter' || event.keyCode === 13;
    if (isEnter && !event.shiftKey) {
      event.preventDefault();
      handlePromptSubmit(event);
    }
  });

  elements.promptSubmit.addEventListener('click', handlePromptSubmit);
  elements.impactForm.addEventListener('submit', handlePromptSubmit);

  elements.modelSelect.addEventListener('change', (event) => {
    updateModelDescription(event.target.value);
    if (hasSubmitted) computeMetrics();
  });

  elements.regionSelect.addEventListener('change', (event) => {
    updateRegionDescription(event.target.value);
    if (hasSubmitted) computeMetrics();
  });

  elements.dailyVolume.addEventListener('input', (event) => {
    const volume = event.target.value;
    elements.volumeValue.textContent = volume;
    elements.dailyVolume.setAttribute('aria-valuenow', volume);
    if (hasSubmitted) computeMetrics();
  });
}

let clockInterval = null;

function startClock() {
  if (!clockInterval) {
    clockInterval = setInterval(updateGlobalDebtClock, TICK_MS);
  }
}

function stopClock() {
  clearInterval(clockInterval);
  clockInterval = null;
}

function init() {
  updateModelDescription(elements.modelSelect.value);
  updateRegionDescription(elements.regionSelect.value);
  attachListeners();
  updateSubmitButtonVisibility();

  initializeGlobalDebtClock();
  startClock();

  document.addEventListener('visibilitychange', () => {
    document.hidden ? stopClock() : startClock();
  });
}

init();
