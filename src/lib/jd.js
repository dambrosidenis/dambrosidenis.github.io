export async function fetchJD(url) {
  try {
    // Validate URL
    new URL(url);
    
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; CoverLetterApp/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const html = await response.text();
    return stripHTMLToText(html);
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('CORS_ERROR');
    }
    throw error;
  }
}

export function stripHTMLToText(html) {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Remove script and style elements
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    // Get text content from body
    const textContent = doc.body?.textContent || '';
    
    // Clean up whitespace
    return textContent
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
  } catch (error) {
    console.error('Failed to parse HTML:', error);
    throw new Error('Failed to parse HTML content');
  }
}

export function validateURL(urlString) {
  try {
    new URL(urlString);
    return true;
  } catch {
    return false;
  }
}
