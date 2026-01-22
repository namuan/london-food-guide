// Data
const countries = [
    { file: 'Australia.md', name: 'Australia', flag: 'au' },
    { file: 'Austria.md', name: 'Austria', flag: 'at' },
    { file: 'Bangladesh.md', name: 'Bangladesh', flag: 'bd' },
    { file: 'Brazil.md', name: 'Brazil', flag: 'br' },
    { file: 'Burma_Myanmar.md', name: 'Burma / Myanmar', flag: 'mm' },
    { file: 'Canada.md', name: 'Canada', flag: 'ca' },
    { file: 'Colombia.md', name: 'Colombia', flag: 'co' },
    { file: 'Cyprus.md', name: 'Cyprus', flag: 'cy' },
    { file: 'Denmark.md', name: 'Denmark', flag: 'dk' },
    { file: 'France.md', name: 'France', flag: 'fr' },
    { file: 'Georgia.md', name: 'Georgia', flag: 'ge' },
    { file: 'Germany.md', name: 'Germany', flag: 'de' },
    { file: 'Greece.md', name: 'Greece', flag: 'gr' },
    { file: 'Hong_Kong.md', name: 'Hong Kong', flag: 'hk' },
    { file: 'Hungary.md', name: 'Hungary', flag: 'hu' },
    { file: 'India.md', name: 'India', flag: 'in' },
    { file: 'Indonesia.md', name: 'Indonesia', flag: 'id' },
    { file: 'Iran.md', name: 'Iran', flag: 'ir' },
    { file: 'Ireland.md', name: 'Ireland', flag: 'ie' },
    { file: 'Israel.md', name: 'Israel', flag: 'il' },
    { file: 'Italy.md', name: 'Italy', flag: 'it' },
    { file: 'Korea.md', name: 'Korea', flag: 'kr' },
    { file: 'Kuwait.md', name: 'Kuwait', flag: 'kw' },
    { file: 'Lebanese.md', name: 'Lebanese', flag: 'lb' },
    { file: 'Lithuania.md', name: 'Lithuania', flag: 'lt' },
    { file: 'Malaysia.md', name: 'Malaysia', flag: 'my' },
    { file: 'Mexico.md', name: 'Mexico', flag: 'mx' },
    { file: 'Netherlands.md', name: 'Netherlands', flag: 'nl' },
    { file: 'Nigeria.md', name: 'Nigeria', flag: 'ng' },
    { file: 'Pakistan.md', name: 'Pakistan', flag: 'pk' },
    { file: 'Palestine.md', name: 'Palestine', flag: 'ps' },
    { file: 'Peru.md', name: 'Peru', flag: 'pe' },
    { file: 'Philippines.md', name: 'Philippines', flag: 'ph' },
    { file: 'Poland.md', name: 'Poland', flag: 'pl' },
    { file: 'Portugal.md', name: 'Portugal', flag: 'pt' },
    { file: 'Puerto_Rico_Dominican.md', name: 'Puerto Rico / Dominican', flag: 'pr' },
    { file: 'Russia_Eastern_Europe.md', name: 'Russia / Eastern Europe', flag: 'ru' },
    { file: 'Scotland.md', name: 'Scotland', flag: 'gb-sct' },
    { file: 'Singapore.md', name: 'Singapore', flag: 'sg' },
    { file: 'Slovakia.md', name: 'Slovakia', flag: 'sk' },
    { file: 'Somalia.md', name: 'Somalia', flag: 'so' },
    { file: 'South_Africa.md', name: 'South Africa', flag: 'za' },
    { file: 'Spain.md', name: 'Spain', flag: 'es' },
    { file: 'Sri_Lanka.md', name: 'Sri Lanka', flag: 'lk' },
    { file: 'Sweden.md', name: 'Sweden', flag: 'se' },
    { file: 'Thailand.md', name: 'Thailand', flag: 'th' },
    { file: 'Turkey.md', name: 'Turkey', flag: 'tr' },
    { file: 'Ukraine.md', name: 'Ukraine', flag: 'ua' },
    { file: 'USA.md', name: 'USA', flag: 'us' },
    { file: 'Venezuela.md', name: 'Venezuela', flag: 've' },
    { file: 'Vietnam.md', name: 'Vietnam', flag: 'vn' }
].sort((a, b) => a.name.localeCompare(b.name));

// State
let allRestaurants = []; // Cache if needed (optional optimization)
let activeCountry = null;

// DOM Elements
const navContainer = document.getElementById('country-nav');
const contentArea = document.getElementById('content-area');
const searchInput = document.getElementById('search-input');

// Initialize
function init() {
    renderNav(countries);
    
    // Search listener
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = countries.filter(c => c.name.toLowerCase().includes(term));
        renderNav(filtered);
    });

    // Random country button listener
    const randomBtn = document.getElementById('random-country-btn');
    randomBtn.addEventListener('click', async () => {
        const randomCountry = countries[Math.floor(Math.random() * countries.length)];
        
        // Load the country first
        await loadCountry(randomCountry);
        
        // Wait a moment for content to render, then select random restaurant
        setTimeout(() => {
            const restaurantCards = document.querySelectorAll('.restaurant-card');
            if (restaurantCards.length > 0) {
                // Remove any existing highlights/dimming
                document.querySelectorAll('.restaurant-card.lucky-highlight, .restaurant-card.lucky-dimmed').forEach(card => {
                    card.classList.remove('lucky-highlight', 'lucky-dimmed');
                });
                
                // Select random restaurant
                const randomCard = restaurantCards[Math.floor(Math.random() * restaurantCards.length)];
                randomCard.classList.add('lucky-highlight');
                
                // Dim all other restaurants
                restaurantCards.forEach(card => {
                    if (card !== randomCard) {
                        card.classList.add('lucky-dimmed');
                    }
                });
                
                // Scroll to the highlighted restaurant
                randomCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 500);
    });

    // Check for hash in URL to deep link
    const hash = window.location.hash.slice(1); // remove #
    if (hash) {
        const country = countries.find(c => encodeURI(c.name) === hash);
        if (country) loadCountry(country);
    }
}

// Render Navigation
function renderNav(list) {
    navContainer.innerHTML = '';
    list.forEach(country => {
        const item = document.createElement('div');
        item.className = `nav-item ${activeCountry === country.name ? 'active' : ''}`;

        const label = document.createElement('span');
        label.className = 'nav-label';
        label.textContent = country.name;
        item.appendChild(label);

        if (country.flag) {
            const flag = document.createElement('img');
            flag.className = 'country-flag nav-flag';
            flag.src = `country-flags/${country.flag}.svg`;
            flag.alt = '';
            flag.setAttribute('aria-hidden', 'true');
            flag.loading = 'lazy';
            item.appendChild(flag);
        }

        item.onclick = () => loadCountry(country);
        navContainer.appendChild(item);
    });
}

// Load Content
async function loadCountry(country) {
    activeCountry = country.name;
    // Update active state in nav without re-rendering everything (preserves filter)
    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.textContent === country.name);
    });
    
    // Update URL hash
    window.location.hash = encodeURI(country.name);

    // Show Loading
    contentArea.innerHTML = `
        <div class="empty-state" style="height: 50vh">
            <div class="empty-icon" style="animation: spin 1s infinite linear">⏳</div>
            <p>Fetching culinary data...</p>
        </div>
    `;

    try {
        const response = await fetch(`restaurants-by-country/${country.file}`);
        if (!response.ok) throw new Error('Failed to load');
        const markdown = await response.text();
        const parsed = parseMarkdown(markdown);
        renderContent(country, parsed);
    } catch (error) {
        contentArea.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h2>Oops</h2>
                <p>Could not load data for ${country.name}.</p>
            </div>
        `;
        console.error(error);
    }
}

// Markdown Parser
function parseMarkdown(text) {
    const lines = text.split('\n');
    const restaurants = [];
    let current = null;

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        // Header 2: Restaurant Name
        if (line.startsWith('## ')) {
            if (current) restaurants.push(current);
            current = {
                name: line.replace('## ', '').trim(),
                location: '',
                comments: []
            };
        } 
        // Location
        else if (line.toLowerCase().startsWith('**location:**')) {
            if (current) {
                current.location = line.replace(/\*\*location:\*\*/i, '').trim();
            }
        }
        // Comments (simple list detection)
        else if (line.startsWith('- "') || line.startsWith('- "')) {
            if (current) {
                // Remove bullets and quotes
                let comment = line.replace(/^-\s*["']?/, '').replace(/["']?$/, '');
                if (comment) current.comments.push(comment);
            }
        }
        // Handle unformatted text as comment if we are inside a restaurant block
        // (Fallback for looser markdown)
        else if (current && !line.startsWith('#') && !line.startsWith('**') && line.length > 3) {
             // Heuristic: if it's not a header or bold key, and we have a current restaurant
             // it might be a continuation or an unformatted comment.
             // For strictness, let's only add if it looks like a sentence.
             // Ignoring "Comments:" header line
             if (!line.toLowerCase().includes('comments:')) {
                 // Maybe append to last comment or new one?
                 // Let's assume it's a new comment line
                 current.comments.push(line.replace(/^-\s*/, ''));
             }
        }
    });

    if (current) restaurants.push(current);
    return restaurants;
}

// Render Main Content
function renderContent(country, restaurants) {
    const headerFlagHtml = country.flag
        ? `<img class="country-flag" src="country-flags/${country.flag}.svg" alt="" aria-hidden="true" loading="lazy">`
        : '';

    let html = `
        <div class="country-header">
            <h2>${headerFlagHtml}${country.name}</h2>
            <p>${restaurants.length} place${restaurants.length === 1 ? '' : 's'} found</p>
        </div>
        <div class="restaurant-grid">
    `;

    if (restaurants.length === 0) {
        html += `<p style="grid-column: 1/-1; color: var(--color-text-secondary)">No listings found in this file.</p>`;
    }

    restaurants.forEach(r => {
        const mapsQuery = encodeURIComponent(`${r.name} London`);
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;
                const mapsLinkHtml = `<a class="restaurant-maps-link" href="${mapsUrl}" target="_blank" rel="noopener noreferrer" aria-label="Open ${r.name} on Google Maps" title="Open in Google Maps"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path fill="#1c9957" d="M42,39V9c0-1.657-1.343-3-3-3H9C7.343,6,6,7.343,6,9v30c0,1.657,1.343,3,3,3h30C40.657,42,42,40.657,42,39z"/><path fill="#3e7bf1" d="M9,42h30c1.657,0-15-16-15-16S7.343,42,9,42z"/><path fill="#cbccc9" d="M42,39V9c0-1.657-16,15-16,15S42,40.657,42,39z"/><path fill="#efefef" d="M39,42c1.657,0,3-1.343,3-3v-0.245L26.245,23L23,26.245L38.755,42H39z"/><path fill="#ffd73d" d="M42,9c0-1.657-1.343-3-3-3h-0.245L6,38.755V39c0,1.657,1.343,3,3,3h0.245L42,9.245V9z"/><path fill="#d73f35" d="M36,2c-5.523,0-10,4.477-10,10c0,6.813,7.666,9.295,9.333,19.851C35.44,32.531,35.448,33,36,33s0.56-0.469,0.667-1.149C38.334,21.295,46,18.813,46,12C46,6.477,41.523,2,36,2z"/><path fill="#752622" d="M36 8.5A3.5 3.5 0 1 0 36 15.5A3.5 3.5 0 1 0 36 8.5Z"/><path fill="#fff" d="M14.493,12.531v2.101h2.994c-0.392,1.274-1.455,2.185-2.994,2.185c-1.833,0-3.318-1.485-3.318-3.318s1.486-3.318,3.318-3.318c0.824,0,1.576,0.302,2.156,0.799l1.548-1.547C17.22,8.543,15.92,8,14.493,8c-3.038,0-5.501,2.463-5.501,5.5s2.463,5.5,5.501,5.5c4.81,0,5.637-4.317,5.184-6.461L14.493,12.531z"/></svg></a>`;

        const locationHtml = r.location 
            ? `<div class="restaurant-location">
                                 ${mapsLinkHtml}
                                 <span>📍</span> ${r.location}
               </div>` 
            : '';
            
        let commentsHtml = '';
        if (r.comments.length > 0) {
            commentsHtml = `<div class="restaurant-comments"><ul class="comment-list">`;
            r.comments.forEach(c => {
                commentsHtml += `<li class="comment-item">${c}</li>`;
            });
            commentsHtml += `</ul></div>`;
        }

        html += `
            <article class="restaurant-card">
                <div class="restaurant-title">
                    <h3 class="restaurant-name">${r.name}</h3>
                    ${r.location ? '' : mapsLinkHtml}
                </div>
                ${locationHtml}
                ${commentsHtml}
            </article>
        `;
    });

    html += `</div>`;
    contentArea.innerHTML = html;
}

// Start
init();
