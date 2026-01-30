// DOM Elements
const addressInput = document.getElementById('address-input');
const scanBtn = document.getElementById('scan-btn');
const resultCard = document.getElementById('result-card');
const errorMessage = document.getElementById('error-message');

// Token Display Elements
const tokenName = document.getElementById('token-name');
const tokenSymbol = document.getElementById('token-symbol');
const tokenImage = document.getElementById('token-image');
const tokenInitial = document.getElementById('token-initial');
const tokenPrice = document.getElementById('token-price');
const priceChange = document.getElementById('price-change');
const tokenLiquidity = document.getElementById('token-liquidity');
const tokenVolume = document.getElementById('token-volume');
const tokenAddressDisplay = document.getElementById('token-address-display');
const dexLink = document.getElementById('dex-link');

// Event Listeners
scanBtn.addEventListener('click', handleScan);
addressInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleScan();
});

async function handleScan() {
    const address = addressInput.value.trim();

    if (!address) {
        showError('Please enter a contract address');
        return;
    }

    setLoading(true);
    resetUI();

    try {
        const data = await fetchTokenData(address);
        
        if (!data || !data.pairs || data.pairs.length === 0) {
            throw new Error('Token not found on Solana chain');
        }

        // Filter for Solana pairs only
        const solanaPairs = data.pairs.filter(pair => pair.chainId === 'solana');
        
        if (solanaPairs.length === 0) {
            throw new Error('No Solana pairs found for this token');
        }

        // Get the most liquid pair
        const bestPair = solanaPairs.sort((a, b) => b.liquidity.usd - a.liquidity.usd)[0];
        
        displayTokenData(bestPair);
    } catch (error) {
        showError(error.message || 'Failed to fetch token data');
    } finally {
        setLoading(false);
    }
}

async function fetchTokenData(address) {
    try {
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
        if (!response.ok) throw new Error('Network response was not ok');
        return await response.json();
    } catch (err) {
        console.error('Fetch error:', err);
        throw new Error('Failed to connect to price API');
    }
}

function displayTokenData(pair) {
    const { baseToken, priceUsd, priceChange: change, liquidity, volume, url } = pair;
    
    // Basic Info
    tokenName.textContent = baseToken.name;
    tokenSymbol.textContent = baseToken.symbol;
    
    // Image handling
    // Note: DexScreener doesn't always provide an image in the pair data directly in the same way for all tokens,
    // but usually baseToken.logoURI or we fallback. 
    // Sometimes the API returns info object. Let's try to handle image if available.
    // For now, if no image, we show initial.
    // NOTE: DexScreener API 'pairs' response sometimes has info.imageUrl inside info section if widely known, 
    // but standard pairs object might not have it deep in baseToken. 
    // We will use a placeholder or check specific fields if available.
    // Actually, DexScreener often includes `info` object in the pair if verified.
    
    const imageUrl = pair.info?.imageUrl;
    
    if (imageUrl) {
        tokenImage.src = imageUrl;
        tokenImage.classList.remove('hidden');
        tokenInitial.classList.add('hidden');
    } else {
        tokenImage.classList.add('hidden');
        tokenInitial.textContent = baseToken.symbol.charAt(0).toUpperCase();
        tokenInitial.classList.remove('hidden');
    }

    // Numbers
    tokenPrice.textContent = formatCurrency(parseFloat(priceUsd));
    
    // Price Change
    const change24h = change.h24;
    priceChange.innerHTML = formatChange(change24h);
    priceChange.className = `text-xs font-medium flex items-center justify-end gap-1 ${change24h >= 0 ? 'text-green-600' : 'text-red-600'}`;

    // Stats
    tokenLiquidity.textContent = formatCompactNumber(liquidity.usd);
    tokenVolume.textContent = formatCompactNumber(volume.h24);

    // Address & Link
    tokenAddressDisplay.textContent = `${baseToken.address.slice(0, 6)}...${baseToken.address.slice(-4)}`;
    dexLink.href = url;

    // Show Card
    resultCard.classList.remove('hidden');
}

function resetUI() {
    resultCard.classList.add('hidden');
    errorMessage.classList.add('hidden');
}

function setLoading(isLoading) {
    if (isLoading) {
        scanBtn.disabled = true;
        scanBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Scanning...
        `;
    } else {
        scanBtn.disabled = false;
        scanBtn.innerHTML = '<span>Scan Token</span>';
    }
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.classList.remove('hidden');
}

function formatCurrency(value) {
    if (value < 0.000001) {
        return `$${value.toExponential(4)}`;
    }
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
    }).format(value);
}

function formatCompactNumber(number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(number);
}

function formatChange(value) {
    const arrow = value >= 0 ? '↑' : '↓';
    return `${arrow} ${Math.abs(value).toFixed(2)}%`;
}