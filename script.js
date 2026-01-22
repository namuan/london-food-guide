// Country data mapping
const countries = [
    { file: 'Australia.md', name: 'Australia' },
    { file: 'Bangladesh.md', name: 'Bangladesh' },
    { file: 'Brazil.md', name: 'Brazil' },
    { file: 'Burma_Myanmar.md', name: 'Burma/Myanmar' },
    { file: 'Canada.md', name: 'Canada' },
    { file: 'Colombia.md', name: 'Colombia' },
    { file: 'Cyprus.md', name: 'Cyprus' },
    { file: 'Denmark.md', name: 'Denmark' },
    { file: 'France.md', name: 'France' },
    { file: 'Georgia.md', name: 'Georgia' },
    { file: 'Germany_Austria.md', name: 'Germany/Austria' },
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
    { file: 'Middle_East_Lebanese_Palestinian.md', name: 'Middle East' },
    { file: 'Netherlands.md', name: 'Netherlands' },
    { file: 'Nigeria.md', name: 'Nigeria' },
    { file: 'Pakistan.md', name: 'Pakistan' },
    { file: 'Peru.md', name: 'Peru' },
    { file: 'Philippines.md', name: 'Philippines' },
    { file: 'Poland.md', name: 'Poland' },
    { file: 'Portugal.md', name: 'Portugal' },
    { file: 'Puerto_Rico_Dominican.md', name: 'Puerto Rico/Dominican' },
    { file: 'Russia_Eastern_Europe.md', name: 'Russia/Eastern Europe' },
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
];

// Initialize the page
function init() {
    renderCountryTags();
}

// Render country tags
function renderCountryTags() {
    const tagsContainer = document.getElementById('country-tags');
    
    countries.forEach(country => {
        const tag = document.createElement('button');
        tag.className = 'country-tag';
        tag.textContent = country.name;
        tag.onclick = () => loadCountry(country);
        tagsContainer.appendChild(tag);
    });
}

// Load and display country restaurants
async function loadCountry(country) {
    // Update active state
    document.querySelectorAll('.country-tag').forEach(tag => {
        tag.classList.remove('active');
        if (tag.textContent === country.name) {
            tag.classList.add('active');
        }
    });

    const contentDiv = document.getElementById('restaurant-content');
    contentDiv.innerHTML = '<div class="loading">Loading...</div>';

    try {
        const response = await fetch(`restaurants-by-country/${country.file}`);
        const markdown = await response.text();
        
        const html = parseMarkdown(markdown, country.name);
        contentDiv.innerHTML = html;
    } catch (error) {
        contentDiv.innerHTML = '<div class="empty-state"><p>❌ Error loading data</p></div>';
        console.error('Error loading country data:', error);
    }
}

// Parse markdown to HTML
function parseMarkdown(markdown, countryName) {
    const lines = markdown.split('\n');
    let html = '';
    let currentRestaurant = null;
    let inComments = false;
    
    // Extract title from first line
    const title = lines[0].replace(/^#\s*/, '');
    html += `<h2>${title}</h2>`;
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line.startsWith('## ')) {
            // Save previous restaurant
            if (currentRestaurant) {
                html += renderRestaurant(currentRestaurant);
            }
            
            // Start new restaurant
            currentRestaurant = {
                name: line.replace(/^##\s*/, ''),
                location: '',
                comments: []
            };
            inComments = false;
        } else if (line.startsWith('**Location:**')) {
            if (currentRestaurant) {
                currentRestaurant.location = line.replace(/\*\*Location:\*\*\s*/, '');
            }
        } else if (line.startsWith('**Comments:**')) {
            inComments = true;
        } else if (line.startsWith('- "') && currentRestaurant) {
            const comment = line.replace(/^-\s*"/, '').replace(/"$/, '');
            currentRestaurant.comments.push(comment);
        }
    }
    
    // Save last restaurant
    if (currentRestaurant) {
        html += renderRestaurant(currentRestaurant);
    }
    
    return html;
}

// Render restaurant HTML
function renderRestaurant(restaurant) {
    let html = '<div class="restaurant">';
    html += `<h3>${restaurant.name}</h3>`;
    
    if (restaurant.location) {
        html += `<div class="location"><strong>Location:</strong> ${restaurant.location}</div>`;
    }
    
    if (restaurant.comments.length > 0) {
        html += '<div class="comments">';
        html += '<h4>Comments:</h4>';
        restaurant.comments.forEach(comment => {
            html += `<div class="comment">${comment}</div>`;
        });
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

// Initialize on page load
init();
