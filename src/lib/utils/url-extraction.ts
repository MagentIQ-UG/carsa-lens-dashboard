/**
 * URL and Social Media Extraction Utilities
 * Functions to extract various URLs and social media profiles from candidate CVs and text
 */

// URL patterns for common platforms
export const URL_PATTERNS = {
  linkedin: /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9-_]+)/gi,
  github: /(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9-_]+)/gi,
  twitter: /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9-_]+)/gi,
  stackoverflow: /(?:https?:\/\/)?(?:www\.)?stackoverflow\.com\/users\/([0-9]+)/gi,
  behance: /(?:https?:\/\/)?(?:www\.)?behance\.net\/([a-zA-Z0-9-_]+)/gi,
  dribbble: /(?:https?:\/\/)?(?:www\.)?dribbble\.com\/([a-zA-Z0-9-_]+)/gi,
  portfolio: /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-_.]+\.(?:dev|com|net|org|io|me|xyz|tech|design|portfolio|work))/gi,
  generalUrl: /(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-_.]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?)/gi,
};

// Common portfolio/website keywords
const PORTFOLIO_KEYWORDS = [
  'portfolio', 'website', 'personal site', 'blog', 'homepage', 'dev site',
  'my site', 'web portfolio', 'online portfolio', 'project showcase'
];

export interface ExtractedUrls {
  linkedin?: string;
  github?: string;
  twitter?: string;
  stackoverflow?: string;
  behance?: string;
  dribbble?: string;
  portfolio_url?: string;
  website?: string;
  other_urls?: string[];
}

/**
 * Extract URLs and social media profiles from text
 */
export function extractUrlsFromText(text: string): ExtractedUrls {
  if (!text) return {};

  const extracted: ExtractedUrls = {
    other_urls: []
  };

  // Clean text for better matching
  const cleanText = text.toLowerCase().replace(/\s+/g, ' ');

  // Extract LinkedIn
  const linkedinMatches = text.match(URL_PATTERNS.linkedin);
  if (linkedinMatches && linkedinMatches.length > 0) {
    extracted.linkedin = normalizeUrl(linkedinMatches[0]);
  }

  // Extract GitHub
  const githubMatches = text.match(URL_PATTERNS.github);
  if (githubMatches && githubMatches.length > 0) {
    extracted.github = normalizeUrl(githubMatches[0]);
  }

  // Extract Twitter/X
  const twitterMatches = text.match(URL_PATTERNS.twitter);
  if (twitterMatches && twitterMatches.length > 0) {
    extracted.twitter = normalizeUrl(twitterMatches[0]);
  }

  // Extract StackOverflow
  const stackoverflowMatches = text.match(URL_PATTERNS.stackoverflow);
  if (stackoverflowMatches && stackoverflowMatches.length > 0) {
    extracted.stackoverflow = normalizeUrl(stackoverflowMatches[0]);
  }

  // Extract Behance
  const behanceMatches = text.match(URL_PATTERNS.behance);
  if (behanceMatches && behanceMatches.length > 0) {
    extracted.behance = normalizeUrl(behanceMatches[0]);
  }

  // Extract Dribbble
  const dribbbleMatches = text.match(URL_PATTERNS.dribbble);
  if (dribbbleMatches && dribbbleMatches.length > 0) {
    extracted.dribbble = normalizeUrl(dribbbleMatches[0]);
  }

  // Extract portfolio/website URLs
  const portfolioMatches = text.match(URL_PATTERNS.portfolio);
  if (portfolioMatches && portfolioMatches.length > 0) {
    const portfolioUrls = portfolioMatches
      .map(url => normalizeUrl(url))
      .filter(url => !isKnownPlatform(url));

    // Try to identify portfolio vs personal website
    for (const url of portfolioUrls) {
      const urlLower = url.toLowerCase();
      const contextIndex = cleanText.indexOf(urlLower.replace('https://', '').replace('www.', ''));
      const contextBefore = cleanText.substring(Math.max(0, contextIndex - 50), contextIndex);
      const contextAfter = cleanText.substring(contextIndex, Math.min(cleanText.length, contextIndex + 50));
      const context = (contextBefore + ' ' + contextAfter).toLowerCase();

      if (PORTFOLIO_KEYWORDS.some(keyword => context.includes(keyword))) {
        if (!extracted.portfolio_url) {
          extracted.portfolio_url = url;
          continue;
        }
      }
      
      if (!extracted.website) {
        extracted.website = url;
      } else if (extracted.other_urls) {
        extracted.other_urls.push(url);
      }
    }
  }

  // Extract other URLs that might be relevant
  const allUrls = text.match(URL_PATTERNS.generalUrl);
  if (allUrls && allUrls.length > 0) {
    const otherUrls = allUrls
      .map(url => normalizeUrl(url))
      .filter(url => 
        !isKnownPlatform(url) && 
        url !== extracted.portfolio_url && 
        url !== extracted.website &&
        isValidUrl(url)
      );

    if (extracted.other_urls) {
      extracted.other_urls.push(...otherUrls);
      // Remove duplicates
      extracted.other_urls = [...new Set(extracted.other_urls)];
    }
  }

  // Clean up empty other_urls array
  if (extracted.other_urls && extracted.other_urls.length === 0) {
    delete extracted.other_urls;
  }

  return extracted;
}

/**
 * Normalize URL format
 */
function normalizeUrl(url: string): string {
  if (!url) return '';
  
  // Remove leading/trailing whitespace
  url = url.trim();
  
  // Add https:// if no protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  
  // Remove trailing slash
  url = url.replace(/\/$/, '');
  
  return url;
}

/**
 * Check if URL belongs to a known platform we already extracted
 */
function isKnownPlatform(url: string): boolean {
  const urlLower = url.toLowerCase();
  return (
    urlLower.includes('linkedin.com') ||
    urlLower.includes('github.com') ||
    urlLower.includes('twitter.com') ||
    urlLower.includes('x.com') ||
    urlLower.includes('stackoverflow.com') ||
    urlLower.includes('behance.net') ||
    urlLower.includes('dribbble.com') ||
    urlLower.includes('facebook.com') ||
    urlLower.includes('instagram.com') ||
    urlLower.includes('youtube.com') ||
    urlLower.includes('medium.com') ||
    urlLower.includes('gmail.com') ||
    urlLower.includes('outlook.com') ||
    urlLower.includes('yahoo.com')
  );
}

/**
 * Basic URL validation
 */
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extract email addresses from text
 */
export function extractEmailsFromText(text: string): string[] {
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = text.match(emailPattern);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Extract phone numbers from text (basic pattern)
 */
export function extractPhonesFromText(text: string): string[] {
  const phonePatterns = [
    /\+?[\d\s\-\(\)]{10,}/g,
    /\(\d{3}\)\s?\d{3}-?\d{4}/g,
    /\d{3}-?\d{3}-?\d{4}/g,
  ];
  
  const phones: string[] = [];
  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      phones.push(...matches.map(phone => phone.trim()));
    }
  }
  
  return [...new Set(phones)];
}

/**
 * Comprehensive profile data extraction from CV text
 */
export function extractProfileDataFromText(text: string): {
  urls: ExtractedUrls;
  emails: string[];
  phones: string[];
} {
  return {
    urls: extractUrlsFromText(text),
    emails: extractEmailsFromText(text),
    phones: extractPhonesFromText(text),
  };
}
