const E_BASE = 0.00045;
const W_BASE = 0.004;
const C_BASE = 0.0002;
const M_PHONE = 44.1;
const M_DROPS = 20.0;
const M_BOTTLE = 500.0;
const M_CAR = 2.3;
const GLOBAL_PROMPTS_PER_SECOND = 1_000_000_000 / 86400;
const GLOBAL_TOKENS_PER_PROMPT = 1.33;

const regions = {
  global: {
    label: 'Global Grid Average',
    carbonMultiplier: 1.0,
    waterMultiplier: 1.0,
    description: 'Global standard operational baseline.'
  },
  'us-east': {
    label: 'US East (Northern Virginia)',
    carbonMultiplier: 1.25,
    waterMultiplier: 1.20,
    description: 'High data center density; fossil-fuel reliant infrastructure.'
  },
  'us-west': {
    label: 'US West (Oregon)',
    carbonMultiplier: 0.50,
    waterMultiplier: 0.80,
    description: 'Optimized via renewable and hydro-intensive public grid mixes.'
  },
  'eu-france': {
    label: 'Europe (France)',
    carbonMultiplier: 0.15,
    waterMultiplier: 1.10,
    description: 'Nuclear-dominant generation profiles yielding low direct carbon output.'
  },
  'eu-ireland': {
    label: 'Europe (Ireland)',
    carbonMultiplier: 0.85,
    waterMultiplier: 0.90,
    description: 'Variable grid dynamically balancing wind fields with gas assets.'
  }
};

const elements = {
  promptInput: document.getElementById('prompt-input'),
  regionSelect: document.getElementById('region-select'),
  regionDescription: document.getElementById('region-description'),
  dailyVolume: document.getElementById('daily-volume'),
  volumeValue: document.getElementById('volume-value'),
  tokenCount: document.getElementById('token-count'),
  electricityWh: document.getElementById('electricity-wh'),
  phoneMinutes: document.getElementById('phone-minutes'),
  waterMl: document.getElementById('water-ml'),
  waterDrops: document.getElementById('water-drops'),
  carbonG: document.getElementById('carbon-g'),
  carMeters: document.getElementById('car-meters'),
  annualElectricity: document.getElementById('annual-electricity'),
  annualBottles: document.getElementById('annual-bottles'),
  annualCarbon: document.getElementById('annual-carbon'),
  globalPrompts: document.getElementById('global-prompts'),
  globalWater: document.getElementById('global-water'),
  globalElectricity: document.getElementById('global-electricity')
};

let globalPromptsTotal = 0;
let globalWaterMlTotal = 0;
let globalElectricityWhTotal = 0;
let globalTokensTotal = 0;

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

  const promptElectricityWh = estimatedTokens * E_BASE;
  const promptWaterMl = estimatedTokens * W_BASE * selectedRegion.waterMultiplier;
  const promptCarbonG = estimatedTokens * C_BASE * selectedRegion.carbonMultiplier;

  const phoneMinutes = promptElectricityWh * M_PHONE;
  const waterDrops = promptWaterMl * M_DROPS;
  const carMeters = promptCarbonG * M_CAR;

  const annualElectricityKwh = (promptElectricityWh * dailyVolume * 365) / 1000;
  const annualWaterBottles = (promptWaterMl * dailyVolume * 365) / M_BOTTLE;
  const annualCarbonKg = (promptCarbonG * dailyVolume * 365) / 1000;

  elements.tokenCount.textContent = estimatedTokens;
  elements.electricityWh.textContent = formatNumber(promptElectricityWh, 4);
  elements.phoneMinutes.textContent = formatNumber(phoneMinutes, 2);
  elements.waterMl.textContent = formatNumber(promptWaterMl, 3);
  elements.waterDrops.textContent = formatNumber(waterDrops, 1);
  elements.carbonG.textContent = formatNumber(promptCarbonG, 4);
  elements.carMeters.textContent = formatNumber(carMeters, 2);
  elements.annualElectricity.textContent = formatNumber(annualElectricityKwh, 2);
  elements.annualBottles.textContent = formatNumber(annualWaterBottles, 2);
  elements.annualCarbon.textContent = formatNumber(annualCarbonKg, 2);
}

function updateGlobalDebtClock() {
  const promptsThisTick = GLOBAL_PROMPTS_PER_SECOND * 0.1;
  const tokenCount = promptsThisTick * GLOBAL_TOKENS_PER_PROMPT;
  globalPromptsTotal += promptsThisTick;
  globalTokensTotal += tokenCount;
  globalWaterMlTotal += tokenCount * W_BASE;
  globalElectricityWhTotal += tokenCount * E_BASE;

  elements.globalPrompts.textContent = Math.floor(globalPromptsTotal).toLocaleString('en-US');
  elements.globalWater.textContent = formatNumber(globalWaterMlTotal / 1000, 2);
  elements.globalElectricity.textContent = formatNumber(globalElectricityWhTotal / 1000, 2);
}

function attachListeners() {
  elements.promptInput.addEventListener('input', computeMetrics);
  elements.regionSelect.addEventListener('change', (event) => {
    updateRegionDescription(event.target.value);
    computeMetrics();
  });
  elements.dailyVolume.addEventListener('input', (event) => {
    const volume = event.target.value;
    elements.volumeValue.textContent = volume;
    elements.dailyVolume.setAttribute('aria-valuenow', volume);
    computeMetrics();
  });
}

function init() {
  updateRegionDescription(elements.regionSelect.value);
  attachListeners();
  computeMetrics();
  updateGlobalDebtClock();
  setInterval(updateGlobalDebtClock, 100);
}

init();
