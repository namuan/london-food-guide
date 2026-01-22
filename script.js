// Data
const countries = [
    { file: 'Australia.md', name: 'Australia' },
    { file: 'Bangladesh.md', name: 'Bangladesh' },
    { file: 'Brazil.md', name: 'Brazil' },
    { file: 'Burma_Myanmar.md', name: 'Burma / Myanmar' },
    { file: 'Canada.md', name: 'Canada' },
    { file: 'Colombia.md', name: 'Colombia' },
    { file: 'Cyprus.md', name: 'Cyprus' },
    { file: 'Denmark.md', name: 'Denmark' },
    { file: 'France.md', name: 'France' },
    { file: 'Georgia.md', name: 'Georgia' },
    { file: 'Germany_Austria.md', name: 'Germany / Austria' },
    { file: 'Greece.md', name: 'Greece' },
    { file: 'Hong_Kong.md', name: 'Hong Kong' },
    { file: 'Hungary.md', name: 'Hungary' },
    { file: 'India.md', name: 'India' },
    { file: 'Indonesia.md', name: 'Indonesia' },
    { file: 'Iran.md', name: 'Iran' },
    { file: 'Ireland.md', name: 'Ireland' },
    { file: 'Israel.md', name: 'Israel' },
    { file: 'Italy.md', name: 'Italy' },
    { file: 'Korea.md', name: 'Korea' },
    { file: 'Lithuania.md', name: 'Lithuania' },
    { file: 'Malaysia.md', name: 'Malaysia' },
    { file: 'Mexico.md', name: 'Mexico' },
    { file: 'Middle_East_Lebanese_Palestinian.md', name: 'Middle East / Lebanese' },
    { file: 'Netherlands.md', name: 'Netherlands' },
    { file: 'Nigeria.md', name: 'Nigeria' },
    { file: 'Pakistan.md', name: 'Pakistan' },
    { file: 'Peru.md', name: 'Peru' },
    { file: 'Philippines.md', name: 'Philippines' },
    { file: 'Poland.md', name: 'Poland' },
    { file: 'Portugal.md', name: 'Portugal' },
    { file: 'Puerto_Rico_Dominican.md', name: 'Puerto Rico / Dominican' },
    { file: 'Russia_Eastern_Europe.md', name: 'Russia / Eastern Europe' },
    { file: 'Scotland.md', name: 'Scotland' },
    { file: 'Singapore.md', name: 'Singapore' },
    { file: 'Slovakia.md', name: 'Slovakia' },
    { file: 'Somalia.md', name: 'Somalia' },
    { file: 'South_Africa.md', name: 'South Africa' },
    { file: 'Spain.md', name: 'Spain' },
    { file: 'Sri_Lanka.md', name: 'Sri Lanka' },
    { file: 'Sweden.md', name: 'Sweden' },
    { file: 'Thailand.md', name: 'Thailand' },
    { file: 'Turkey.md', name: 'Turkey' },
    { file: 'Ukraine.md', name: 'Ukraine' },
    { file: 'USA.md', name: 'USA' },
    { file: 'Venezuela.md', name: 'Venezuela' },
    { file: 'Vietnam.md', name: 'Vietnam' }
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
        item.textContent = country.name;
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
        renderContent(country.name, parsed);
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
function renderContent(title, restaurants) {
    let html = `
        <div class="country-header">
            <h2>${title}</h2>
            <p>${restaurants.length} place${restaurants.length === 1 ? '' : 's'} found</p>
        </div>
        <div class="restaurant-grid">
    `;

    if (restaurants.length === 0) {
        html += `<p style="grid-column: 1/-1; color: var(--color-text-secondary)">No listings found in this file.</p>`;
    }

    restaurants.forEach(r => {
        const locationHtml = r.location 
            ? `<div class="restaurant-location">
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
                <h3 class="restaurant-name">${r.name}</h3>
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
