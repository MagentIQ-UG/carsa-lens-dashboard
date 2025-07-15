/**
 * Profile URL Enhancement Utility
 * Enhances candidate profile data by extracting URLs from available text content
 */

import { extractUrlsFromText } from './url-extraction';
import type { CandidateProfileData } from '@/types/api';

/**
 * Enhances candidate profile data with extracted URLs
 * @param profileData - The candidate profile data to enhance
 * @param sourceText - Optional source text (CV content, description, etc.) to extract URLs from
 * @returns Enhanced profile data with populated URL fields
 */
export function enhanceProfileWithUrls(
  profileData: CandidateProfileData,
  sourceText?: string
): CandidateProfileData {
  // Start with existing profile data
  const enhanced = { ...profileData };

  // Collect all available text content for URL extraction
  const textSources = [
    sourceText,
    profileData.summary,
    ...(profileData.work_experience?.map(exp => exp.description) || []),
    ...(profileData.education?.map(edu => edu.description) || []),
    ...(profileData.achievements || []),
  ].filter(Boolean);

  // Combine all text sources
  const combinedText = textSources.join('\n');

  // Extract URLs if we have text content
  if (combinedText.trim()) {
    const extractedUrls = extractUrlsFromText(combinedText);

    // Enhance personal_info with extracted URLs (only if not already present)
    enhanced.personal_info = {
      ...enhanced.personal_info,
      linkedin: enhanced.personal_info.linkedin || extractedUrls.linkedin,
      github: enhanced.personal_info.github || extractedUrls.github,
      portfolio_url: enhanced.personal_info.portfolio_url || extractedUrls.portfolio_url,
      website: enhanced.personal_info.website || extractedUrls.website,
      twitter: enhanced.personal_info.twitter || extractedUrls.twitter,
      stackoverflow: enhanced.personal_info.stackoverflow || extractedUrls.stackoverflow,
      behance: enhanced.personal_info.behance || extractedUrls.behance,
      dribbble: enhanced.personal_info.dribbble || extractedUrls.dribbble,
      other_urls: [
        ...(enhanced.personal_info.other_urls || []),
        ...(extractedUrls.other_urls || []),
      ].filter((url, index, arr) => arr.indexOf(url) === index), // Remove duplicates
    };
  }

  return enhanced;
}

/**
 * Validates and normalizes a URL
 * @param url - The URL to validate
 * @returns Normalized URL or null if invalid
 */
export function validateAndNormalizeUrl(url: string | undefined): string | undefined {
  if (!url || typeof url !== 'string') return undefined;

  try {
    // Remove any URL encoding
    const decoded = decodeURIComponent(url);
    
    // Check if it's already a valid URL
    if (decoded.startsWith('http://') || decoded.startsWith('https://')) {
      new URL(decoded); // Validate URL format
      return decoded;
    }

    // If it doesn't have a protocol, assume https
    const withProtocol = `https://${decoded}`;
    new URL(withProtocol); // Validate URL format
    return withProtocol;
  } catch {
    // If URL is invalid, return undefined
    return undefined;
  }
}

/**
 * Cleans and validates all URLs in a profile
 * @param profileData - The candidate profile data to clean
 * @returns Profile data with validated URLs
 */
export function cleanProfileUrls(profileData: CandidateProfileData): CandidateProfileData {
  const cleaned = { ...profileData };

  if (cleaned.personal_info) {
    cleaned.personal_info = {
      ...cleaned.personal_info,
      linkedin: validateAndNormalizeUrl(cleaned.personal_info.linkedin),
      github: validateAndNormalizeUrl(cleaned.personal_info.github),
      portfolio_url: validateAndNormalizeUrl(cleaned.personal_info.portfolio_url),
      website: validateAndNormalizeUrl(cleaned.personal_info.website),
      twitter: validateAndNormalizeUrl(cleaned.personal_info.twitter),
      stackoverflow: validateAndNormalizeUrl(cleaned.personal_info.stackoverflow),
      behance: validateAndNormalizeUrl(cleaned.personal_info.behance),
      dribbble: validateAndNormalizeUrl(cleaned.personal_info.dribbble),
      other_urls: (cleaned.personal_info.other_urls || [])
        .map(validateAndNormalizeUrl)
        .filter(Boolean) as string[],
    };
  }

  return cleaned;
}

/**
 * Enhances existing candidate profile with missing URL data
 * This function can be called to retroactively extract URLs from profile text
 */
export function enhanceExistingProfile(profileData: CandidateProfileData): CandidateProfileData {
  // Collect text from various profile sections
  const textSources = [
    profileData.summary,
    ...(profileData.work_experience?.map(exp => `${exp.description || ''} ${exp.company || ''}`).filter(Boolean) || []),
    ...(profileData.education?.map(edu => `${edu.description || ''} ${edu.institution || ''}`).filter(Boolean) || []),
    ...(profileData.achievements || []),
  ].filter(Boolean);

  const combinedText = textSources.join(' ');

  // Only enhance if we have text to work with and some URLs are missing
  if (combinedText.trim() && isProfileMissingUrls(profileData)) {
    return enhanceProfileWithUrls(profileData, combinedText);
  }

  return profileData;
}

/**
 * Checks if a profile is missing common URL fields
 */
function isProfileMissingUrls(profileData: CandidateProfileData): boolean {
  const info = profileData.personal_info || {};
  return !info.linkedin || !info.github || !info.portfolio_url || !info.website;
}
