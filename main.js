const isLocalHost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const localApiOrigin = "http://127.0.0.1:5001";
const API_BASE_URL = isLocalHost
    ? `${localApiOrigin}/api`
    : `${window.location.origin}/api`;

const RECENT_SEARCHES_KEY = "recentSearches";
const FAVORITE_IDS_KEY = "favoriteCafes";
const FAVORITE_DATA_KEY = "favoriteCafesData";
const FAVORITE_COLLECTIONS_KEY = "favoriteCollections";

const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const nearMeBtn = document.getElementById("nearMeBtn");
const topRatedBtn = document.getElementById("topRatedBtn");
const openNowBtn = document.getElementById("openNowBtn");
const quickSearches = document.getElementById("quickSearches");
const recentSearches = document.getElementById("recentSearches");
const onboardingPanel = document.getElementById("onboardingPanel");
const signatureGrid = document.getElementById("signatureGrid");
const cafeGrid = document.getElementById("cafeGrid");
const resultsCount = document.getElementById("resultsCount");
const resultsTitle = document.getElementById("resultsTitle");
const resultsSubtitle = document.getElementById("resultsSubtitle");
const activeViewLabel = document.getElementById("activeViewLabel");
const activeCollectionPills = document.getElementById("activeCollectionPills");
const sortSelect = document.getElementById("sortSelect");
const filterModal = document.getElementById("filterModal");
const filterToggleBtn = document.getElementById("filterToggleBtn");
const closeFilterBtn = document.getElementById("closeFilterBtn");
const applyFiltersBtn = document.getElementById("applyFiltersBtn");
const distanceSlider = document.getElementById("distanceSlider");
const distanceValue = document.getElementById("distanceValue");
const favoritesBtn = document.getElementById("favoritesBtn");
const shareShortlistBtn = document.getElementById("shareShortlistBtn");
const backBtn = document.getElementById("backBtn");
const exploreCafesBtn = document.getElementById("exploreCafesBtn");
const favoritesSection = document.getElementById("favoritesSection");
const resultsSection = document.getElementById("resultsSection");
const favoritesGrid = document.getElementById("favoritesGrid");
const emptyFavorites = document.getElementById("emptyFavorites");
const favoritesCount = document.getElementById("favoritesCount");
const collectionTabs = document.getElementById("collectionTabs");
const darkModeBtn = document.getElementById("darkModeBtn");
const detailDrawer = document.getElementById("detailDrawer");
const detailScrim = document.getElementById("detailScrim");
const detailCloseBtn = document.getElementById("detailCloseBtn");
const detailMedia = document.getElementById("detailMedia");
const detailContent = document.getElementById("detailContent");
const toast = document.getElementById("toast");
const introLoader = document.getElementById("introLoader");

let currentFilters = {
    rating: "any",
    price: [],
    distance: 10,
    ambience: [],
    diet: [],
    experience: []
};

let allCafes = [];
let displayedCafes = [];
let currentSearchLabel = "Mumbai, India";
let userLocation = null;
let favoriteCafes = JSON.parse(localStorage.getItem(FAVORITE_IDS_KEY) || "[]");
let favoriteCollections = JSON.parse(localStorage.getItem(FAVORITE_COLLECTIONS_KEY) || "{}");
let currentSignature = "recommended";
let currentFavoritesCollection = "All";
let openNowQuickFilter = false;
let currentDetailPlaceId = null;

const baseCollections = ["All", "Work Spots", "Weekend", "Date Night", "Must Try"];

const signatureCatalog = [
    {
        id: "recommended",
        title: "Recommended",
        kicker: "Editors' default",
        copy: "The strongest overall mix of rating, atmosphere, and practicality.",
        apply: (cafes) => cafes.slice()
    },
    {
        id: "quiet-work",
        title: "Quiet Work Cafes",
        kicker: "Productive",
        copy: "Better for long sessions, solo visits, and a steady work vibe.",
        apply: (cafes) => cafes.filter((cafe) => cafe.insightProfile.workFriendly)
    },
    {
        id: "date-night",
        title: "Date Night",
        kicker: "Evening mood",
        copy: "Ambience-forward picks with stronger atmosphere and a more polished feel.",
        apply: (cafes) => cafes.filter((cafe) => cafe.insightProfile.dateNight)
    },
    {
        id: "budget-gems",
        title: "Budget Gems",
        kicker: "Value",
        copy: "Good ratings without the heavier spend.",
        apply: (cafes) => cafes.filter((cafe) => (cafe.price_level || 2) <= 2)
    },
    {
        id: "outdoor",
        title: "Best Outdoor",
        kicker: "Fresh air",
        copy: "Ideal when you want open-air or breezier seating vibes.",
        apply: (cafes) => cafes.filter((cafe) => cafe.generatedTags.some((tag) => tag.class === "outdoor" || tag.class === "open-air"))
    },
    {
        id: "late-night",
        title: "Late Night",
        kicker: "After hours",
        copy: "Places that stay open later and work well for evening plans.",
        apply: (cafes) => cafes.filter((cafe) => cafe.insightProfile.lateNight)
    }
];

function wait(ms) {
    return new Promise((resolve) => {
        window.setTimeout(resolve, ms);
    });
}

async function dismissIntroLoader() {
    if (!introLoader) {
        document.body.classList.remove("is-loading");
        document.body.classList.add("is-ready");
        return;
    }

    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    introLoader.classList.add("is-exiting");
    await wait(720);
    introLoader.setAttribute("hidden", "hidden");
}

function setTheme(theme) {
    const isLight = theme === "light";
    document.body.classList.toggle("light", isLight);
    localStorage.setItem("theme", isLight ? "light" : "dark");

    if (darkModeBtn) {
        darkModeBtn.setAttribute("aria-pressed", String(isLight));
        darkModeBtn.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    }

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        metaTheme.setAttribute("content", isLight ? "#b96b2f" : "#d88a3b");
    }
}

function initializeAmbientEffects() {
    const canvas = document.getElementById("particle-canvas");
    if (!canvas) {
        return;
    }

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    const mouse = { x: -9999, y: -9999 };
    const amber = [216, 138, 59];
    const particles = [];
    const particleCount = window.matchMedia("(max-width: 720px)").matches ? 36 : 68;
    const maxDistance = 150;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    function randomBetween(min, max) {
        return min + Math.random() * (max - min);
    }

    function createParticle() {
        return {
            x: randomBetween(0, width),
            y: randomBetween(0, height),
            vx: randomBetween(-0.22, 0.22),
            vy: randomBetween(-0.22, 0.22),
            r: randomBetween(1, 2.4),
            opacity: randomBetween(0.2, 0.7)
        };
    }

    function setupParticles() {
        particles.length = 0;
        for (let index = 0; index < particleCount; index += 1) {
            particles.push(createParticle());
        }
    }

    function draw() {
        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i += 1) {
            for (let j = i + 1; j < particles.length; j += 1) {
                const distance = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
                if (distance < maxDistance) {
                    const alpha = (1 - distance / maxDistance) * 0.28;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(${amber[0]}, ${amber[1]}, ${amber[2]}, ${alpha})`;
                    ctx.lineWidth = 0.65;
                    ctx.stroke();
                }
            }

            const mouseDistance = Math.hypot(particles[i].x - mouse.x, particles[i].y - mouse.y);
            if (mouseDistance < maxDistance * 1.3) {
                const alpha = (1 - mouseDistance / (maxDistance * 1.3)) * 0.35;
                ctx.beginPath();
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.strokeStyle = `rgba(${amber[0]}, ${amber[1]}, ${amber[2]}, ${alpha})`;
                ctx.lineWidth = 0.8;
                ctx.stroke();
            }
        }

        particles.forEach((particle) => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${amber[0]}, ${amber[1]}, ${amber[2]}, ${particle.opacity})`;
            ctx.fill();
        });
    }

    function update() {
        particles.forEach((particle) => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > width) {
                particle.vx *= -1;
            }

            if (particle.y < 0 || particle.y > height) {
                particle.vy *= -1;
            }
        });
    }

    function tick() {
        update();
        draw();
        window.requestAnimationFrame(tick);
    }

    resize();
    setupParticles();
    tick();

    window.addEventListener("resize", () => {
        resize();
        setupParticles();
    });
    window.addEventListener("mousemove", (event) => {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });
    window.addEventListener("touchmove", (event) => {
        if (event.touches[0]) {
            mouse.x = event.touches[0].clientX;
            mouse.y = event.touches[0].clientY;
        }
    }, { passive: true });
    window.addEventListener("touchend", () => {
        mouse.x = -9999;
        mouse.y = -9999;
    }, { passive: true });
}

function initializeScrollLine() {
    const scrollLine = document.getElementById("scrollLine");
    if (!scrollLine) {
        return;
    }

    function updateScrollProgress() {
        const scrollTop = window.scrollY;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = totalHeight > 0 ? scrollTop / totalHeight : 0;
        scrollLine.style.transform = `scaleX(${progress})`;
    }

    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
}

function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
        toast.classList.remove("is-visible");
    }, 2200);
}

function getRecentSearches() {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
}

function saveRecentSearch(query) {
    const trimmed = query.trim();
    if (!trimmed) {
        return;
    }
    const items = getRecentSearches().filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
    items.unshift(trimmed);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(items.slice(0, 6)));
    renderRecentSearches();
}

function renderRecentSearches() {
    const items = getRecentSearches();
    if (!items.length) {
        recentSearches.innerHTML = '<span class="meta-pill is-empty">No recent searches yet</span>';
        return;
    }
    recentSearches.innerHTML = items.map((item) => `<button class="meta-pill" data-query="${escapeHtml(item)}" type="button">${escapeHtml(item)}</button>`).join("");
}

function setChipActive(button, active) {
    if (button) {
        button.classList.toggle("is-active", active);
    }
}

function showLoadingSkeletons(count = 6) {
    cafeGrid.innerHTML = Array.from({ length: count }, () => `
        <div class="loading-card">
            <div class="loading-img"></div>
            <div class="loading-body">
                <div class="loading-line"></div>
                <div class="loading-line w60"></div>
                <div class="loading-line w40"></div>
            </div>
        </div>
    `).join("");
}

async function fetchCafes(location = "Mumbai, India", options = {}) {
    showLoadingSkeletons();
    resultsCount.textContent = "Searching...";
    resultsTitle.textContent = "Cafe Results";
    currentSearchLabel = location;
    if (!options.skipRecent) {
        saveRecentSearch(location);
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cafes?location=${encodeURIComponent(location)}&radius=5000`);
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error);
        }

        if (data.coordinates) {
            userLocation = data.coordinates;
        }

        allCafes = (data.cafes || []).map((cafe, index) => enrichCafe(cafe, index));
        onboardingPanel.classList.add("hidden");
        currentSignature = "recommended";
        openNowQuickFilter = false;
        sortSelect.value = "recommended";
        setChipActive(topRatedBtn, false);
        setChipActive(openNowBtn, false);
        renderSignaturePicks();
        applyCurrentView();
    } catch (error) {
        console.error("Error fetching cafes:", error);
        cafeGrid.innerHTML = `
            <div class="error-message">
                <strong>Could not load cafes.</strong><br><br>
                Please make sure the backend is running and your SerpApi key is valid.<br><br>
                Error: ${escapeHtml(error.message)}
            </div>
        `;
        resultsCount.textContent = "Error loading cafes";
        activeViewLabel.textContent = "Search is temporarily unavailable.";
    }
}

async function fetchNearbyCafes() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser");
        return;
    }

    showLoadingSkeletons();
    resultsCount.textContent = "Locating...";
    setChipActive(nearMeBtn, true);

    navigator.geolocation.getCurrentPosition(async (position) => {
        try {
            const response = await fetch(`${API_BASE_URL}/cafes/nearby`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    radius: 5000
                })
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) {
                throw new Error(data.error);
            }

            userLocation = data.coordinates || userLocation;
            currentSearchLabel = "Near me";
            allCafes = (data.cafes || []).map((cafe, index) => enrichCafe(cafe, index));
            onboardingPanel.classList.add("hidden");
            currentSignature = "recommended";
            renderSignaturePicks();
            applyCurrentView();
        } catch (error) {
            console.error("Error fetching nearby cafes:", error);
            cafeGrid.innerHTML = `<div class="error-message">Failed to load nearby cafes.<br><br>Error: ${escapeHtml(error.message)}</div>`;
            resultsCount.textContent = "Location error";
        } finally {
            window.setTimeout(() => setChipActive(nearMeBtn, false), 900);
        }
    }, (error) => {
        console.error("Geolocation error:", error);
        cafeGrid.innerHTML = "<div class='error-message'>Unable to get your location. Please search manually.</div>";
        resultsCount.textContent = "Location error";
        setChipActive(nearMeBtn, false);
    });
}

function enrichCafe(cafe, index) {
    const seeded = Math.abs(hashString(`${cafe.place_id || cafe.name}-${index}`));
    const ambiencePool = [
        { label: "Indoor", class: "indoor" },
        { label: "Outdoor", class: "outdoor" },
        { label: "Open Air", class: "open-air" }
    ];
    const dietPool = [
        { label: "Veg", class: "veg" },
        { label: "Non-Veg", class: "non-veg" },
        { label: "Vegan", class: "vegan" }
    ];
    const ambienceTag = ambiencePool[seeded % ambiencePool.length];
    const dietTag = dietPool[(seeded >> 2) % dietPool.length];
    const rating = cafe.rating || 0;
    const reviewCount = cafe.user_ratings_total || 0;
    const priceLevel = cafe.price_level || 2;
    const lateNight = closesLate(cafe.hours);
    const workFriendly = reviewCount > 500 && priceLevel <= 2;
    const dateNight = rating >= 4.3 && priceLevel >= 2;
    const generatedTags = [];

    if (rating >= 4.5) {
        generatedTags.push({ label: "Fine Dining", class: "fine-dining" });
    } else if (rating >= 3.8) {
        generatedTags.push({ label: "Casual", class: "casual" });
    }
    generatedTags.push(ambienceTag, dietTag);

    const insightCandidates = [
        workFriendly ? "Great for work sessions with solid value and staying power." : null,
        dateNight ? "A more polished pick for slow evenings and conversation." : null,
        lateNight ? "A dependable later-hour option when most cafes start winding down." : null,
        rating >= 4.6 ? "Exceptionally loved by visitors and strong on first impressions." : null,
        reviewCount > 5000 ? "Heavily reviewed and battle-tested by a large crowd." : null,
        priceLevel <= 1 ? "A budget-friendly stop without giving up personality." : null,
        ambienceTag.class === "outdoor" || ambienceTag.class === "open-air" ? "Best when you want a lighter, airier atmosphere." : null
    ].filter(Boolean);

    return {
        ...cafe,
        generatedTags,
        insightProfile: {
            workFriendly,
            dateNight,
            lateNight
        },
        insightHeadline: insightCandidates[0] || "Balanced on ambience, practicality, and strong everyday appeal.",
        quickLook: workFriendly ? "Work pick" : (dateNight ? "Evening pick" : "Editor's pick"),
        closeSummary: getCloseSummary(cafe.hours),
        searchContext: currentSearchLabel
    };
}

function closesLate(hours) {
    if (!hours || !hours.length) {
        return false;
    }
    return hours.some((line) => /11|12|1|2/.test(line) && /(PM|AM)/.test(line));
}

function getCloseSummary(hours) {
    if (!hours || !hours.length) {
        return "Hours unavailable";
    }
    const todayLine = hours[0];
    const parts = todayLine.split(": ");
    return parts[1] || todayLine;
}

function applyCurrentView() {
    let cafes = allCafes.slice();
    cafes = applyFiltersToCafes(cafes);

    const signature = signatureCatalog.find((item) => item.id === currentSignature) || signatureCatalog[0];
    const signatureFiltered = signature.apply(cafes);
    cafes = signatureFiltered.length ? signatureFiltered : cafes;

    if (openNowQuickFilter) {
        cafes = cafes.filter((cafe) => cafe.is_open === true);
    }

    cafes = sortCafes(cafes, sortSelect.value);
    displayedCafes = cafes;

    renderResults();
    renderActiveState();
    renderSignaturePicks();
}

function applyFiltersToCafes(cafes) {
    let filtered = cafes.slice();

    if (currentFilters.rating !== "any") {
        filtered = filtered.filter((cafe) => (cafe.rating || 0) >= parseFloat(currentFilters.rating));
    }

    if (currentFilters.price.length > 0) {
        filtered = filtered.filter((cafe) => currentFilters.price.includes(String(cafe.price_level || 2)));
    }

    if (userLocation) {
        filtered = filtered.filter((cafe) => calculateDistanceInKm(cafe.lat, cafe.lng) <= currentFilters.distance);
    }

    if (currentFilters.ambience.length > 0) {
        filtered = filtered.filter((cafe) => currentFilters.ambience.some((value) => cafe.generatedTags.some((tag) => tag.class === value)));
    }

    if (currentFilters.diet.length > 0) {
        filtered = filtered.filter((cafe) => currentFilters.diet.some((value) => cafe.generatedTags.some((tag) => tag.class === value)));
    }

    if (currentFilters.experience.length > 0) {
        filtered = filtered.filter((cafe) => currentFilters.experience.some((value) => {
            if (value === "fine-dining") {
                return cafe.rating >= 4.5;
            }
            if (value === "casual") {
                return cafe.rating >= 3.6 && cafe.rating < 4.5;
            }
            if (value === "clubbing") {
                return cafe.insightProfile.lateNight;
            }
            return false;
        }));
    }

    return filtered;
}

function sortCafes(cafes, mode) {
    const copy = cafes.slice();
    switch (mode) {
        case "nearest":
            return copy.sort((a, b) => calculateDistanceInKm(a.lat, a.lng) - calculateDistanceInKm(b.lat, b.lng));
        case "highest-rated":
            return copy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        case "most-reviewed":
            return copy.sort((a, b) => (b.user_ratings_total || 0) - (a.user_ratings_total || 0));
        case "budget-friendly":
            return copy.sort((a, b) => (a.price_level || 2) - (b.price_level || 2) || (b.rating || 0) - (a.rating || 0));
        case "open-now":
            return copy.sort((a, b) => Number(b.is_open === true) - Number(a.is_open === true) || (b.rating || 0) - (a.rating || 0));
        case "recommended":
        default:
            return copy.sort((a, b) => scoreCafe(b) - scoreCafe(a));
    }
}

function scoreCafe(cafe) {
    const ratingScore = (cafe.rating || 0) * 30;
    const reviewsScore = Math.min((cafe.user_ratings_total || 0) / 40, 40);
    const distanceScore = userLocation ? Math.max(20 - calculateDistanceInKm(cafe.lat, cafe.lng), 0) : 10;
    const priceScore = (4 - (cafe.price_level || 2)) * 4;
    const openScore = cafe.is_open ? 12 : 0;
    return ratingScore + reviewsScore + distanceScore + priceScore + openScore;
}

function renderResults() {
    if (!displayedCafes.length) {
        cafeGrid.innerHTML = "<div class='no-results'>No cafes match this combination right now. Try loosening filters, changing sort, or switching to another signature pick.</div>";
        resultsCount.textContent = "0 spots found";
        return;
    }

    cafeGrid.innerHTML = displayedCafes.map((cafe) => createCafeCard(cafe)).join("");
    resultsCount.textContent = `${displayedCafes.length} spot${displayedCafes.length !== 1 ? "s" : ""} found`;
}

function createCafeCard(cafe) {
    const rating = cafe.rating ? cafe.rating.toFixed(1) : "N/A";
    const ratingsCount = cafe.user_ratings_total ? `${formatNumber(cafe.user_ratings_total)} reviews` : "No review count";
    const priceLevel = "₹".repeat(cafe.price_level || 2);
    const distance = calculateDistance(cafe.lat, cafe.lng);
    const isFavorite = favoriteCafes.includes(cafe.place_id);
    const cardCollection = getCollectionForCafe(cafe.place_id);

    return `
        <article class="cafe-card" data-place-id="${escapeHtml(cafe.place_id)}" tabindex="0">
            <div class="cafe-image" style="background-image: url('${escapeAttribute(cafe.photo_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop")}');">
                <div class="card-quicklook">${escapeHtml(cafe.quickLook)}</div>
                <button class="favorite-btn ${isFavorite ? "is-favorite" : ""}" data-action="favorite" data-place-id="${escapeHtml(cafe.place_id)}" type="button" aria-label="Save cafe">
                    <svg viewBox="0 0 24 24" fill="${isFavorite ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <div class="cafe-rating">⭐ ${rating}</div>
                <div class="cafe-price">${priceLevel}</div>
            </div>
            <div class="cafe-info">
                <div class="card-headline">
                    <div class="card-namewrap">
                        <h3 class="cafe-name">${escapeHtml(cafe.name)}</h3>
                        ${distance ? `<div class="cafe-distance">${escapeHtml(distance)}</div>` : ""}
                    </div>
                </div>
                <p class="cafe-address">${escapeHtml(cafe.address || "Address unavailable")}</p>
                <div class="card-statline">
                    <span class="card-stat">${ratingsCount}</span>
                    <span class="card-stat">${escapeHtml(cafe.closeSummary)}</span>
                    ${cardCollection !== "All" ? `<span class="card-stat">${escapeHtml(cardCollection)}</span>` : ""}
                </div>
                ${cafe.is_open !== null ? `<p class="cafe-status ${cafe.is_open ? "open" : "closed"}"><span class="status-dot"></span>${cafe.is_open ? "Open now" : "Currently closed"}</p>` : ""}
                <div class="insight-line">
                    <div class="insight-pill">Insight</div>
                    <p class="insight-copy">${escapeHtml(cafe.insightHeadline)}</p>
                </div>
                <div class="cafe-tags">
                    ${cafe.generatedTags.map((tag) => `<span class="cafe-tag ${escapeHtml(tag.class)}">${escapeHtml(tag.label)}</span>`).join("")}
                </div>
                <div class="card-actions">
                    <button class="directions-btn" data-action="directions" data-place-id="${escapeHtml(cafe.place_id)}" type="button">Directions</button>
                    <button class="secondary-btn" data-action="details" data-place-id="${escapeHtml(cafe.place_id)}" type="button">Details</button>
                </div>
            </div>
        </article>
    `;
}

function renderSignaturePicks() {
    const cards = signatureCatalog.map((item) => {
        const candidateCount = item.apply(applyFiltersToCafes(allCafes)).length;
        return `
            <button class="signature-card ${item.id === currentSignature ? "is-active" : ""}" data-signature="${item.id}" type="button">
                <div class="signature-kicker">${escapeHtml(item.kicker)}</div>
                <h3 class="signature-title">${escapeHtml(item.title)}</h3>
                <p class="signature-copy">${escapeHtml(item.copy)}</p>
                <div class="signature-meta">
                    <span>${candidateCount} matches</span>
                    <span>${item.id === currentSignature ? "Active" : "Explore"}</span>
                </div>
            </button>
        `;
    }).join("");
    signatureGrid.innerHTML = cards;
}

function renderActiveState() {
    const currentSignatureItem = signatureCatalog.find((item) => item.id === currentSignature) || signatureCatalog[0];
    const parts = [
        `Showing ${currentSignatureItem.title.toLowerCase()} for ${currentSearchLabel}.`,
        sortSelect.value === "recommended" ? "Sorted by overall fit." : `Sorted by ${sortSelect.options[sortSelect.selectedIndex].text.toLowerCase()}.`
    ];
    if (openNowQuickFilter) {
        parts.push("Open now only.");
    }
    activeViewLabel.textContent = parts.join(" ");

    const pills = [];
    if (currentSignature !== "recommended") {
        pills.push(`<button class="meta-pill is-active" data-clear="signature" type="button">${escapeHtml(currentSignatureItem.title)}</button>`);
    }
    if (openNowQuickFilter) {
        pills.push('<button class="meta-pill is-active" data-clear="open" type="button">Open now</button>');
    }
    if (currentFilters.rating !== "any") {
        pills.push(`<button class="meta-pill is-active" data-clear="rating" type="button">${escapeHtml(currentFilters.rating)}+ rating</button>`);
    }
    if (currentFilters.price.length) {
        pills.push('<button class="meta-pill is-active" data-clear="price" type="button">Price filter</button>');
    }
    activeCollectionPills.innerHTML = pills.join("");
}

function openFilterModal() {
    filterModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeFilterModal() {
    filterModal.classList.remove("active");
    document.body.style.overflow = "";
}

function applyFilters() {
    applyCurrentView();
    closeFilterModal();
}

function showFavoritesPage() {
    resultsSection.classList.add("hidden");
    document.getElementById("signatureSection").classList.add("hidden");
    favoritesSection.classList.remove("hidden");
    renderCollectionTabs();
    renderFavoritesView();
}

function showExplorePage() {
    favoritesSection.classList.add("hidden");
    resultsSection.classList.remove("hidden");
    document.getElementById("signatureSection").classList.remove("hidden");
}

function renderFavoritesView() {
    const stored = JSON.parse(localStorage.getItem(FAVORITE_DATA_KEY) || "[]").map((cafe, index) => enrichCafe(cafe, index));
    const filtered = currentFavoritesCollection === "All"
        ? stored
        : stored.filter((cafe) => getCollectionForCafe(cafe.place_id) === currentFavoritesCollection);

    favoritesCount.textContent = `${stored.length} saved spot${stored.length !== 1 ? "s" : ""}`;

    if (!stored.length) {
        emptyFavorites.classList.remove("hidden");
        favoritesGrid.classList.add("hidden");
        favoritesGrid.innerHTML = "";
        return;
    }

    if (!filtered.length) {
        emptyFavorites.classList.remove("hidden");
        favoritesGrid.classList.add("hidden");
        emptyFavorites.querySelector(".empty-description").textContent = `No saved cafes yet in ${currentFavoritesCollection}. Try assigning a collection from a cafe detail panel.`;
        return;
    }

    emptyFavorites.classList.add("hidden");
    favoritesGrid.classList.remove("hidden");
    favoritesGrid.innerHTML = filtered.map((cafe) => createCafeCard(cafe)).join("");
}

function renderCollectionTabs() {
    const stored = JSON.parse(localStorage.getItem(FAVORITE_DATA_KEY) || "[]");
    const dynamic = Array.from(new Set(stored.map((cafe) => getCollectionForCafe(cafe.place_id)).filter((value) => value && value !== "All")));
    const collections = ["All", ...Array.from(new Set([...baseCollections.filter((value) => value !== "All"), ...dynamic]))];
    collectionTabs.innerHTML = collections.map((name) => `
        <button class="collection-tab ${name === currentFavoritesCollection ? "is-active" : ""}" data-collection="${escapeHtml(name)}" type="button">${escapeHtml(name)}</button>
    `).join("");
}

function toggleFavorite(placeId) {
    const cafe = allCafes.find((item) => item.place_id === placeId) ||
        JSON.parse(localStorage.getItem(FAVORITE_DATA_KEY) || "[]").find((item) => item.place_id === placeId);
    const index = favoriteCafes.indexOf(placeId);
    const stored = JSON.parse(localStorage.getItem(FAVORITE_DATA_KEY) || "[]");

    if (index > -1) {
        favoriteCafes.splice(index, 1);
        localStorage.setItem(FAVORITE_DATA_KEY, JSON.stringify(stored.filter((item) => item.place_id !== placeId)));
    } else if (cafe) {
        favoriteCafes.push(placeId);
        if (!stored.some((item) => item.place_id === placeId)) {
            stored.push(cafe);
            localStorage.setItem(FAVORITE_DATA_KEY, JSON.stringify(stored));
        }
    }

    localStorage.setItem(FAVORITE_IDS_KEY, JSON.stringify(favoriteCafes));
    renderResults();
    renderFavoritesView();
    showToast(favoriteCafes.includes(placeId) ? "Saved to favorites" : "Removed from favorites");
}

function openDirections(placeId) {
    const cafe = findCafeByPlaceId(placeId);
    if (!cafe) {
        return;
    }

    if (userLocation) {
        window.open(`https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${cafe.lat},${cafe.lng}&travelmode=driving`, "_blank");
    } else {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${cafe.lat},${cafe.lng}`, "_blank");
    }
}

function openDetailDrawer(placeId) {
    const cafe = findCafeByPlaceId(placeId);
    if (!cafe) {
        return;
    }

    currentDetailPlaceId = placeId;
    detailMedia.style.backgroundImage = `url('${escapeAttribute(cafe.photo_url || "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&auto=format&fit=crop")}')`;
    detailContent.innerHTML = createDetailContent(cafe);
    detailDrawer.classList.remove("hidden");
    document.body.style.overflow = "hidden";
}

function closeDetailDrawer() {
    detailDrawer.classList.add("hidden");
    detailContent.innerHTML = "";
    currentDetailPlaceId = null;
    document.body.style.overflow = filterModal.classList.contains("active") ? "hidden" : "";
}

function createDetailContent(cafe) {
    const isFavorite = favoriteCafes.includes(cafe.place_id);
    const collections = Array.from(new Set([...baseCollections.filter((item) => item !== "All"), ...Object.values(favoriteCollections)]));
    const currentCollection = getCollectionForCafe(cafe.place_id);
    const hoursMarkup = cafe.hours && cafe.hours.length
        ? `<ul class="detail-list">${cafe.hours.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`
        : "<p>Opening hours are not available for this cafe.</p>";

    return `
        <h2 class="detail-title">${escapeHtml(cafe.name)}</h2>
        <p class="detail-address">${escapeHtml(cafe.address || "Address unavailable")}</p>
        <div class="detail-stats">
            <div class="detail-stat">
                <div class="stat-label">Rating</div>
                <div class="stat-value">${cafe.rating ? cafe.rating.toFixed(1) : "N/A"}</div>
            </div>
            <div class="detail-stat">
                <div class="stat-label">Reviews</div>
                <div class="stat-value">${formatNumber(cafe.user_ratings_total || 0)}</div>
            </div>
            <div class="detail-stat">
                <div class="stat-label">Price</div>
                <div class="stat-value">${"₹".repeat(cafe.price_level || 2)}</div>
            </div>
            <div class="detail-stat">
                <div class="stat-label">Distance</div>
                <div class="stat-value">${escapeHtml(calculateDistance(cafe.lat, cafe.lng) || "Unknown")}</div>
            </div>
        </div>
        <div class="detail-section">
            <h3>Why it stands out</h3>
            <p>${escapeHtml(cafe.insightHeadline)}</p>
        </div>
        <div class="detail-section">
            <h3>Ideal for</h3>
            <div class="cafe-tags">
                ${cafe.generatedTags.map((tag) => `<span class="cafe-tag ${escapeHtml(tag.class)}">${escapeHtml(tag.label)}</span>`).join("")}
                ${cafe.insightProfile.workFriendly ? '<span class="cafe-tag">Work sessions</span>' : ""}
                ${cafe.insightProfile.dateNight ? '<span class="cafe-tag">Date night</span>' : ""}
                ${cafe.insightProfile.lateNight ? '<span class="cafe-tag">Late night</span>' : ""}
            </div>
        </div>
        <div class="detail-section">
            <h3>Opening hours</h3>
            ${hoursMarkup}
        </div>
        <div class="detail-section">
            <h3>Quick actions</h3>
            <div class="detail-actions">
                <button class="detail-action-btn" data-detail-action="favorite" type="button">${isFavorite ? "Unsave cafe" : "Save cafe"}</button>
                <button class="detail-action-btn" data-detail-action="directions" type="button">Get directions</button>
                <button class="detail-action-btn" data-detail-action="share" type="button">Share cafe</button>
                <button class="detail-action-btn" data-detail-action="copy-address" type="button">Copy address</button>
            </div>
        </div>
        <div class="detail-divider"></div>
        <div class="detail-section">
            <h3>Collection</h3>
            <p>Organize this cafe into a personal list so your saved page feels more editorial and purposeful.</p>
            <div class="detail-form">
                <select class="detail-collection-select" id="detailCollectionSelect">
                    ${collections.map((name) => `<option value="${escapeHtml(name)}" ${name === currentCollection ? "selected" : ""}>${escapeHtml(name)}</option>`).join("")}
                </select>
                <button class="detail-action-btn" data-detail-action="save-collection" type="button">Assign</button>
            </div>
            <div class="detail-form">
                <input class="detail-input" id="newCollectionInput" type="text" placeholder="Create a new collection">
                <button class="detail-action-btn" data-detail-action="new-collection" type="button">Create</button>
            </div>
        </div>
    `;
}

function getCollectionForCafe(placeId) {
    return favoriteCollections[placeId] || "All";
}

function assignCollection(placeId, collectionName) {
    const normalized = collectionName.trim();
    if (!normalized) {
        return;
    }
    favoriteCollections[placeId] = normalized;
    localStorage.setItem(FAVORITE_COLLECTIONS_KEY, JSON.stringify(favoriteCollections));
    renderCollectionTabs();
    renderFavoritesView();
    renderResults();
    showToast(`Added to ${normalized}`);
}

function findCafeByPlaceId(placeId) {
    return allCafes.find((item) => item.place_id === placeId)
        || displayedCafes.find((item) => item.place_id === placeId)
        || JSON.parse(localStorage.getItem(FAVORITE_DATA_KEY) || "[]").find((item) => item.place_id === placeId);
}

async function shareCafe(placeId) {
    const cafe = findCafeByPlaceId(placeId);
    if (!cafe) {
        return;
    }

    const text = `${cafe.name}\n${cafe.address}\nhttps://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cafe.name)}&query_place_id=${encodeURIComponent(cafe.place_id)}`;

    if (navigator.share) {
        try {
            await navigator.share({
                title: cafe.name,
                text
            });
            return;
        } catch (error) {
            // Fall back to clipboard.
        }
    }

    await navigator.clipboard.writeText(text);
    showToast("Cafe details copied to clipboard");
}

async function shareShortlist() {
    const stored = JSON.parse(localStorage.getItem(FAVORITE_DATA_KEY) || "[]");
    if (!stored.length) {
        showToast("Save a few cafes first");
        return;
    }
    const text = [
        "NoirBrew shortlist",
        "",
        ...stored.map((cafe, index) => `${index + 1}. ${cafe.name} - ${cafe.address}`)
    ].join("\n");

    if (navigator.share) {
        try {
            await navigator.share({
                title: "NoirBrew shortlist",
                text
            });
            return;
        } catch (error) {
            // Fall back to clipboard.
        }
    }

    await navigator.clipboard.writeText(text);
    showToast("Shortlist copied to clipboard");
}

async function copyAddress(placeId) {
    const cafe = findCafeByPlaceId(placeId);
    if (!cafe) {
        return;
    }
    await navigator.clipboard.writeText(cafe.address || "");
    showToast("Address copied");
}

function calculateDistance(lat, lng) {
    if (!userLocation) {
        return null;
    }

    const distance = calculateDistanceInKm(lat, lng);
    return distance < 1 ? `${(distance * 1000).toFixed(0)} m away` : `${distance.toFixed(1)} km away`;
}

function calculateDistanceInKm(lat, lng) {
    if (!userLocation) {
        return Number.POSITIVE_INFINITY;
    }

    const radius = 6371;
    const dLat = toRadians(lat - userLocation.lat);
    const dLng = toRadians(lng - userLocation.lng);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(userLocation.lat)) * Math.cos(toRadians(lat)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value) {
    return value * (Math.PI / 180);
}

function formatNumber(value) {
    return new Intl.NumberFormat("en-IN", { notation: value > 9999 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function hashString(input) {
    let hash = 0;
    for (let index = 0; index < input.length; index += 1) {
        hash = ((hash << 5) - hash) + input.charCodeAt(index);
        hash |= 0;
    }
    return hash;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function escapeAttribute(value) {
    return String(value).replaceAll("'", "%27");
}

function resetFilter(key) {
    if (key === "signature") {
        currentSignature = "recommended";
    } else if (key === "open") {
        openNowQuickFilter = false;
        setChipActive(openNowBtn, false);
    } else if (key === "rating") {
        currentFilters.rating = "any";
        document.querySelectorAll('[data-filter="rating"]').forEach((button) => {
            button.classList.toggle("active", button.dataset.value === "any");
        });
    } else if (key === "price") {
        currentFilters.price = [];
        document.querySelectorAll('[data-filter="price"]').forEach((button) => button.classList.remove("active"));
    }
    applyCurrentView();
}

function wireEventListeners() {
    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            const query = searchInput.value.trim();
            if (query) {
                fetchCafes(query);
            }
        }
    });

    searchBtn.addEventListener("click", () => {
        const query = searchInput.value.trim();
        if (query) {
            fetchCafes(query);
        }
    });

    nearMeBtn.addEventListener("click", fetchNearbyCafes);

    topRatedBtn.addEventListener("click", () => {
        currentSignature = "recommended";
        sortSelect.value = "highest-rated";
        setChipActive(topRatedBtn, true);
        window.setTimeout(() => setChipActive(topRatedBtn, false), 1200);
        applyCurrentView();
    });

    openNowBtn.addEventListener("click", () => {
        openNowQuickFilter = !openNowQuickFilter;
        setChipActive(openNowBtn, openNowQuickFilter);
        applyCurrentView();
    });

    quickSearches.addEventListener("click", (event) => {
        const button = event.target.closest("[data-query]");
        if (button) {
            const query = button.dataset.query;
            searchInput.value = query;
            fetchCafes(query);
        }
    });

    recentSearches.addEventListener("click", (event) => {
        const button = event.target.closest("[data-query]");
        if (button) {
            const query = button.dataset.query;
            searchInput.value = query;
            fetchCafes(query, { skipRecent: true });
        }
    });

    sortSelect.addEventListener("change", applyCurrentView);

    filterToggleBtn.addEventListener("click", openFilterModal);
    closeFilterBtn.addEventListener("click", closeFilterModal);
    applyFiltersBtn.addEventListener("click", applyFilters);

    filterModal.addEventListener("click", (event) => {
        if (event.target === filterModal) {
            closeFilterModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && filterModal.classList.contains("active")) {
            closeFilterModal();
        } else if (event.key === "Escape" && !detailDrawer.classList.contains("hidden")) {
            closeDetailDrawer();
        }
    });

    distanceSlider.addEventListener("input", () => {
        distanceValue.textContent = `${distanceSlider.value} km`;
        currentFilters.distance = parseInt(distanceSlider.value, 10);
    });

    document.querySelectorAll(".filter-option").forEach((option) => {
        option.addEventListener("click", () => {
            const filterType = option.dataset.filter;
            const filterValue = option.dataset.value;

            if (filterType === "rating") {
                document.querySelectorAll('[data-filter="rating"]').forEach((button) => {
                    button.classList.remove("active");
                });
                option.classList.add("active");
                currentFilters.rating = filterValue;
                return;
            }

            option.classList.toggle("active");
            if (option.classList.contains("active")) {
                if (!currentFilters[filterType].includes(filterValue)) {
                    currentFilters[filterType].push(filterValue);
                }
            } else {
                currentFilters[filterType] = currentFilters[filterType].filter((value) => value !== filterValue);
            }
        });
    });

    signatureGrid.addEventListener("click", (event) => {
        const card = event.target.closest("[data-signature]");
        if (!card) {
            return;
        }
        currentSignature = card.dataset.signature;
        applyCurrentView();
    });

    activeCollectionPills.addEventListener("click", (event) => {
        const button = event.target.closest("[data-clear]");
        if (button) {
            resetFilter(button.dataset.clear);
        }
    });

    cafeGrid.addEventListener("click", (event) => {
        const actionButton = event.target.closest("[data-action]");
        const card = event.target.closest(".cafe-card");

        if (actionButton) {
            const { action, placeId } = actionButton.dataset;
            if (action === "favorite") {
                toggleFavorite(placeId);
            } else if (action === "directions") {
                openDirections(placeId);
            } else if (action === "details") {
                openDetailDrawer(placeId);
            }
            event.stopPropagation();
            return;
        }

        if (card) {
            openDetailDrawer(card.dataset.placeId);
        }
    });

    cafeGrid.addEventListener("keydown", (event) => {
        const card = event.target.closest(".cafe-card");
        if (card && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            openDetailDrawer(card.dataset.placeId);
        }
    });

    favoritesGrid.addEventListener("click", (event) => {
        const actionButton = event.target.closest("[data-action]");
        const card = event.target.closest(".cafe-card");

        if (actionButton) {
            const { action, placeId } = actionButton.dataset;
            if (action === "favorite") {
                toggleFavorite(placeId);
            } else if (action === "directions") {
                openDirections(placeId);
            } else if (action === "details") {
                openDetailDrawer(placeId);
            }
            event.stopPropagation();
            return;
        }

        if (card) {
            openDetailDrawer(card.dataset.placeId);
        }
    });

    favoritesBtn.addEventListener("click", showFavoritesPage);
    backBtn.addEventListener("click", showExplorePage);
    exploreCafesBtn.addEventListener("click", showExplorePage);
    shareShortlistBtn.addEventListener("click", shareShortlist);

    collectionTabs.addEventListener("click", (event) => {
        const tab = event.target.closest("[data-collection]");
        if (!tab) {
            return;
        }
        currentFavoritesCollection = tab.dataset.collection;
        renderCollectionTabs();
        renderFavoritesView();
    });

    if (darkModeBtn) {
        darkModeBtn.addEventListener("click", () => {
            setTheme(document.body.classList.contains("light") ? "dark" : "light");
        });
    }

    detailScrim.addEventListener("click", closeDetailDrawer);
    detailCloseBtn.addEventListener("click", closeDetailDrawer);

    detailContent.addEventListener("click", async (event) => {
        const button = event.target.closest("[data-detail-action]");
        if (!button || !currentDetailPlaceId) {
            return;
        }

        const action = button.dataset.detailAction;
        if (action === "favorite") {
            toggleFavorite(currentDetailPlaceId);
            openDetailDrawer(currentDetailPlaceId);
        } else if (action === "directions") {
            openDirections(currentDetailPlaceId);
        } else if (action === "share") {
            await shareCafe(currentDetailPlaceId);
        } else if (action === "copy-address") {
            await copyAddress(currentDetailPlaceId);
        } else if (action === "save-collection") {
            const select = document.getElementById("detailCollectionSelect");
            assignCollection(currentDetailPlaceId, select.value);
        } else if (action === "new-collection") {
            const input = document.getElementById("newCollectionInput");
            if (input.value.trim()) {
                assignCollection(currentDetailPlaceId, input.value.trim());
                openDetailDrawer(currentDetailPlaceId);
            }
        }
    });
}

async function initializeApp() {
    const minimumLoaderTime = wait(2900);
    initializeAmbientEffects();
    initializeScrollLine();
    wireEventListeners();
    renderRecentSearches();
    setTheme(localStorage.getItem("theme") || "dark");
    renderCollectionTabs();
    showLoadingSkeletons();
    await Promise.all([
        fetchCafes("Mumbai, India", { skipRecent: true }),
        minimumLoaderTime
    ]);
    await dismissIntroLoader();
}

window.addEventListener("DOMContentLoaded", initializeApp);
