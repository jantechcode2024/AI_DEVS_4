function extractIdFromUrl(url) {
    // Dopasuj hash hex lub UUID z myślnikami
    const match = url.match(/\/([a-f0-9-]{32,})(\/|$|\?)/);
    return match ? match[1] : null;
}

function extractPageFromUrl(url) {
    // Wyciąga segment ścieżki przed ID, np. "zadania" z /zadania/380792b2...
    const match = url.match(/\/([a-zA-Z0-9_-]+)\/[a-f0-9]{32,}/);
    return match ? match[1] : null;
}

export { extractIdFromUrl, extractPageFromUrl};