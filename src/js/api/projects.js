const API_URL = 'https://opensheet.elk.sh/1_i7bbfbY62WsWG5LaskNcI5zOBpZMpQOm-j8CdpV-to/Sheet1';

// Cache the promise so we only fetch once per page load
let projectsPromise = null;

/**
 * Extracts YouTube Video ID from a URL
 * Returns null if the URL is invalid or not a recognized YouTube format.
 */
function getYouTubeId(url) {
    if (!url || typeof url !== 'string') return null;
    const cleanUrl = url.trim();
    // Handles youtu.be, youtube.com/watch?v=, youtube.com/embed/ etc.
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = cleanUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

/**
 * Normalizes keys to handle "(Optional)" suffixes and case inconsistencies
 */
function normalizeRowKeys(row) {
    const normalized = {};
    for (const key in row) {
        if (Object.prototype.hasOwnProperty.call(row, key)) {
            // Remove "(Optional)" or "(optional)", trim whitespace, and lowercase
            const cleanKey = key.replace(/\(optional\)/i, '').trim().toLowerCase();
            normalized[cleanKey] = row[key];
        }
    }
    return normalized;
}

/**
 * Normalizes project data, validating required fields, generating slugs and thumbnails
 */
function normalizeProject(rawRow, index, existingSlugs) {
    // 1. Normalize Keys
    const row = normalizeRowKeys(rawRow);

    // 2. Trim all values & apply fallbacks
    const title = (row.title || '').trim();
    const youtube = (row.youtube || '').trim();
    const client = (row.client || '').trim() || 'Not specified';
    const category = (row.category || '').trim() || 'Uncategorized';
    const director = (row.director || '').trim() || 'Not specified';
    const agency = (row.agency || '').trim() || 'Not specified';
    const description = (row.description || '').trim() || 'Description coming soon.';
    let slug = (row.slug || '').trim();
    let thumbnail = (row.thumbnail || '').trim();

    // 3. Validate Required Fields
    if (!title || !youtube) {
        console.warn(`[Projects API] Skipping row ${index + 2}: Missing required 'title' or 'youtube' field.`, rawRow);
        return null; // Invalid row
    }

    const youtubeId = getYouTubeId(youtube);
    if (!youtubeId) {
        console.warn(`[Projects API] Skipping row ${index + 2}: Invalid YouTube URL provided ("${youtube}").`, rawRow);
        return null;
    }

    // 4. Generate Missing Slug
    if (!slug) {
        slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    // Handle Duplicate Slugs
    let baseSlug = slug;
    let counter = 2;
    while (existingSlugs.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    existingSlugs.add(slug);

    // 5. Generate Missing Thumbnail
    let thumbnailFallback = null;
    if (!thumbnail) {
        // Provide standard maxresdefault, and a fallback property for the UI to use if it fails to load
        thumbnail = `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
        thumbnailFallback = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    }

    return {
        title,
        client,
        category,
        director,
        agency,
        description,
        youtube,
        youtubeId,
        slug,
        thumbnail,
        thumbnailFallback
    };
}

/**
 * Fetches, parses, validates, and normalizes all projects from Google Sheets
 */
async function fetchProjects() {
    if (projectsPromise) return projectsPromise;

    projectsPromise = fetch(API_URL)
        .then(async (res) => {
            if (!res.ok) {
                throw new Error(`Failed to fetch projects. HTTP Status: ${res.status}`);
            }
            const data = await res.json();

            if (!Array.isArray(data)) {
                throw new Error('Malformed sheet data: Expected an array of rows.');
            }

            const validProjects = [];
            const existingSlugs = new Set();

            data.forEach((row, index) => {
                // Ignore completely empty rows
                if (Object.keys(row).length === 0) return;

                const project = normalizeProject(row, index, existingSlugs);
                if (project) {
                    validProjects.push(project);
                }
            });

            return validProjects;
        })
        .catch(error => {
            console.error('[Projects API] Critical Error fetching projects:', error.message);
            // Return empty array to gracefully handle UI empty states
            return [];
        });

    return projectsPromise;
}

export async function getAllProjects() {
    return await fetchProjects();
}

export async function getProjectBySlug(slug) {
    const projects = await fetchProjects();
    return projects.find(p => p.slug === slug) || null;
}

export async function getFeaturedProjects(limit = 5) {
    const projects = await fetchProjects();
    return projects.slice(0, limit);
}
