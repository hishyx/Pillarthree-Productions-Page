const API_URL = 'https://opensheet.elk.sh/1_i7bbfbY62WsWG5LaskNcI5zOBpZMpQOm-j8CdpV-to/2';

// Cache the promise so we only fetch once per page load
let blogPromise = null;

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
 * Normalizes blog data, validating required fields, generating slugs
 */
function normalizeBlogPost(rawRow, index, existingSlugs) {
    // 1. Normalize Keys
    const row = normalizeRowKeys(rawRow);

    // 2. Trim all values & apply fallbacks
    const title = (row.title || '').trim();
    const category = (row.category || '').trim() || 'Uncategorized';
    const date = (row.date || '').trim() || 'Unknown Date';
    const thumbnail = (row.image || '').trim() || '/assets/images/portfolio_1.webp'; 
    const excerpt = (row.excerpt || '').trim() || '';
    const content = (row.content || '').trim() || '';
    
    // 3. Validate Required Fields
    if (!title) {
        console.warn(`[Blog API] Skipping row ${index + 2}: Missing required 'title' field.`, rawRow);
        return null; // Invalid row
    }

    // 4. Generate Slug
    let slug = title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // Handle Duplicate Slugs
    let baseSlug = slug;
    let counter = 2;
    while (existingSlugs.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
    }
    existingSlugs.add(slug);

    // Estimate reading time from content words (approx 200 words per min)
    const wordCount = content.split(/\s+/).length;
    const readTimeMin = Math.max(1, Math.ceil(wordCount / 200));
    const readingTime = `${readTimeMin} min read`;

    return {
        title,
        category,
        date,
        thumbnail,
        excerpt,
        content,
        slug,
        readingTime,
        author: 'Pillarthree Team' // Default fallback
    };
}

/**
 * Fetches, parses, validates, and normalizes all blog posts from Google Sheets
 */
async function fetchBlogPosts() {
    if (blogPromise) return blogPromise;

    blogPromise = fetch(API_URL)
        .then(async (res) => {
            if (!res.ok) {
                throw new Error(`Failed to fetch blog posts. HTTP Status: ${res.status}`);
            }
            const data = await res.json();

            if (!Array.isArray(data)) {
                throw new Error('Malformed sheet data: Expected an array of rows.');
            }

            const validPosts = [];
            const existingSlugs = new Set();

            data.forEach((row, index) => {
                // Ignore completely empty rows
                if (Object.keys(row).length === 0) return;

                const post = normalizeBlogPost(row, index, existingSlugs);
                if (post) {
                    validPosts.push(post);
                }
            });

            return validPosts;
        })
        .catch(error => {
            console.error('[Blog API] Critical Error fetching blog posts:', error.message);
            // Return empty array to gracefully handle UI empty states
            return [];
        });

    return blogPromise;
}

export async function getAllBlogPosts() {
    return await fetchBlogPosts();
}

export async function getBlogPostBySlug(slug) {
    const posts = await fetchBlogPosts();
    return posts.find(p => p.slug === slug) || null;
}

export async function getFeaturedBlogPosts(limit = 3) {
    const posts = await fetchBlogPosts();
    return posts.slice(0, limit);
}
