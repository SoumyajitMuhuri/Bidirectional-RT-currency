// API URL
const BASE_URL = "https://v6.exchangerate-api.com/v6/ec5900f310af38e31d0a2585/latest/";

// DOM elements
const dropdowns = document.querySelectorAll(".dropdown select");
const fromCurr = document.getElementById("fromCurr");
const toCurr = document.getElementById("toCurr");
const upperTextBox = document.getElementById("upperTextBox");
const lowerTextBox = document.getElementById("lowerTextBox");

const ratesCache = new Map();
const ratesRequests = new Map();

const updateFlag = (select) => {
    const countryCode = countryList[select.value];
    const flagImg = select.parentElement.querySelector("img");
    if (countryCode && flagImg) {
        flagImg.src = `https://flagsapi.com/${countryCode}/flat/64.png`;
        flagImg.alt = `${select.value} flag`;
    }
};

async function loadRates(baseCurrency) {
    if (ratesCache.has(baseCurrency)) return ratesCache.get(baseCurrency);
    if (ratesRequests.has(baseCurrency)) return ratesRequests.get(baseCurrency);

    const request = (async () => {
        const response = await fetch(`${BASE_URL}${encodeURIComponent(baseCurrency)}`);
        if (!response.ok) throw new Error(`Rate service returned ${response.status}`);
        const data = await response.json();
        if (data.result !== "success" || !data.conversion_rates) {
            throw new Error(data["error-type"] || "Rate service returned invalid data");
        }
        ratesCache.set(baseCurrency, data.conversion_rates);
        return data.conversion_rates;
    })();
    ratesRequests.set(baseCurrency, request);
    try {
        return await request;
    } catch (error) {
        if (fromCurr.value === baseCurrency) {
            lowerTextBox.value = "";
            lowerTextBox.placeholder = "Rates unavailable";
            console.error("Unable to load exchange rates:", error);
        }
        return null;
    } finally {
        if (ratesRequests.get(baseCurrency) === request) {
            ratesRequests.delete(baseCurrency);
        }
    }
}

function clearResult(message = "0.00") {
    lowerTextBox.value = "";
    lowerTextBox.placeholder = message;
}

async function convertFromUpper() {
    const rawAmount = upperTextBox.value.trim();
    if (rawAmount === "") {
        clearResult();
        return;
    }

    const amount = Number(rawAmount);
    if (!Number.isFinite(amount) || amount < 0) {
        clearResult("Enter a valid amount");
        return;
    }

    const baseCurrency = fromCurr.value;
    const targetCurrency = toCurr.value;
    const currentRates = await loadRates(baseCurrency);
    if (!currentRates) return;
    if (baseCurrency !== fromCurr.value || targetCurrency !== toCurr.value || rawAmount !== upperTextBox.value.trim()) return;
    const rate = currentRates[targetCurrency];
    if (!Number.isFinite(rate)) {
        clearResult("Rate unavailable");
        return;
    }
    lowerTextBox.value = (amount * rate).toFixed(2);
    lowerTextBox.placeholder = "0.00";
}

async function convertFromLower() {
    const rawAmount = lowerTextBox.value.trim();
    if (rawAmount === "") {
        upperTextBox.value = "";
        upperTextBox.placeholder = "0.00";
        return;
    }

    const amount = Number(rawAmount);
    if (!Number.isFinite(amount) || amount < 0) {
        upperTextBox.value = "";
        upperTextBox.placeholder = "Enter a valid amount";
        return;
    }

    const baseCurrency = fromCurr.value;
    const targetCurrency = toCurr.value;
    const currentRates = await loadRates(baseCurrency);
    if (!currentRates) return;
    if (baseCurrency !== fromCurr.value || targetCurrency !== toCurr.value || rawAmount !== lowerTextBox.value.trim()) return;
    const rate = currentRates[targetCurrency];
    if (!Number.isFinite(rate) || rate === 0) {
        upperTextBox.value = "";
        upperTextBox.placeholder = "Rate unavailable";
        return;
    }
    upperTextBox.value = (amount / rate).toFixed(2);
    upperTextBox.placeholder = "0.00";
}

for (const select of dropdowns) {
    for (const currencyCode of Object.keys(countryList)) {
        const option = document.createElement("option");
        option.value = currencyCode;
        option.textContent = currencyCode;
        if ((select.name === "from" && currencyCode === "USD") ||
            (select.name === "to" && currencyCode === "INR")) {
            option.selected = true;
        }
        select.append(option);
    }
    updateFlag(select);
}

fromCurr.addEventListener("change", async () => {
    await loadRates(fromCurr.value);
    await convertFromUpper();
});

toCurr.addEventListener("change", convertFromUpper);
fromCurr.addEventListener("change", () => updateFlag(fromCurr));
toCurr.addEventListener("change", () => updateFlag(toCurr));
upperTextBox.addEventListener("input", convertFromUpper);
lowerTextBox.addEventListener("input", convertFromLower);

// Load rates on startup so the initial conversion works as soon as an amount is entered.
loadRates(fromCurr.value);
