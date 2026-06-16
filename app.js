const E_BASE = 0.00045;
const W_BASE = 0.004;
const C_BASE = 0.0002;
const M_DROPS = 20.0;
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

const elements = {
  impactForm: document.getElementById('impact-form'),
  promptInput: document.getElementById('prompt-input'),
  promptSubmit: document.getElementById('prompt-submit'),
  regionSelect: document.getElementById('region-select'),
  regionDescription: document.getElementById('region-description'),
  dailyVolume: document.getElementById('daily-volume'),
  volumeValue: document.getElementById('volume-value'),
  tokenCount: document.getElementById('token-count'),
  
  // Micro impact
  electricityWh: document.getElementById('electricity-wh'),
  waterMl: document.getElementById('water-ml'),
  carbonG: document.getElementById('carbon-g'),
  
  // Annual impact (new emoji-based cards)
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
  annualImpactSection: document.getElementById('annual-impact-section')
};

let globalPromptsTotal = 0;
let globalWaterMlTotal = 0;
let globalElectricityWhTotal = 0;
let globalCarbonKgTotal = 0;
let globalTokensTotal = 0;
let hasSubmitted = false;
let placeholderActive = true;

function getWordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateTokens(wordCount) {
  return Math.max(1, Math.round(wordCount * 1.33));
}

function formatNumber(value, digits = 2) {
  return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function updateRegionDescription(regionKey) {
  const region = regions[regionKey];
  elements.regionDescription.textContent = region.description;
}

function computeMetrics() {
  const text = elements.promptInput.value;
  const selectedRegion = regions[elements.regionSelect.value];
  const dailyVolume = Number(elements.dailyVolume.value);
  const wordCount = getWordCount(text);
  const estimatedTokens = estimateTokens(wordCount);

  const promptElectricityWh = estimatedTokens * E_BASE * selectedRegion.electricityMultiplier;
  const promptWaterMl = estimatedTokens * W_BASE * selectedRegion.waterMultiplier;
  const promptCarbonG = estimatedTokens * C_BASE * selectedRegion.carbonMultiplier;

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
  elements.tokenCount.textContent = estimatedTokens;
  elements.electricityWh.textContent = formatNumber(promptElectricityWh, 4);
  elements.waterMl.textContent = formatNumber(promptWaterMl, 3);
  elements.carbonG.textContent = formatNumber(promptCarbonG, 4);

  // Update annual impact display (emoji cards)
  elements.annualIphoneCharges.textContent = formatNumber(iPhoneCharges, 1);
  elements.annualElectricityKwh.textContent = formatNumber(annualElectricityKwh, 2);
  elements.annualWaterBottles.textContent = formatNumber(annualWaterBottles, 1);
  elements.annualWaterLiters.textContent = formatNumber(annualWaterLiters, 2);
  elements.annualSedanMiles.textContent = formatNumber(sedanMiles, 1);
  elements.annualCarbonKg.textContent = formatNumber(annualCarbonKg, 2);
}

function updateSubmitButtonVisibility() {
  const hasText = !placeholderActive && elements.promptInput.value.trim().length > 0;
  elements.promptSubmit.classList.toggle('hidden', !hasText);
}

function clearPlaceholderText() {
  if (!placeholderActive) return;
  placeholderActive = false;
  elements.promptInput.value = '';
  elements.promptInput.classList.remove('placeholder-active');
  updateSubmitButtonVisibility();
}

function handlePromptSubmit(event) {
  if (event) event.preventDefault();
  if (placeholderActive) {
    clearPlaceholderText();
    elements.promptInput.focus();
    return;
  }

  const text = elements.promptInput.value.trim();
  if (!text) {
    elements.promptInput.focus();
    return;
  }

  hasSubmitted = true;
  computeMetrics();
  elements.annualImpactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateGlobalDebtClock() {
  const promptsThisTick = GLOBAL_PROMPTS_PER_SECOND * 0.1; // 100ms tick
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
  elements.promptInput.addEventListener('focus', clearPlaceholderText);
  elements.promptInput.addEventListener('click', clearPlaceholderText);
  elements.promptInput.addEventListener('input', () => {
    if (placeholderActive) return;
    updateSubmitButtonVisibility();
    computeMetrics();
  });

  elements.promptInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      handlePromptSubmit(event);
    }
  });

  elements.promptSubmit.addEventListener('click', handlePromptSubmit);
  elements.impactForm.addEventListener('submit', handlePromptSubmit);

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

function init() {
  updateRegionDescription(elements.regionSelect.value);
  attachListeners();
  updateSubmitButtonVisibility();
  
  // Initialize and start global debt clock
  initializeGlobalDebtClock();
  setInterval(updateGlobalDebtClock, 100);
}

init();
