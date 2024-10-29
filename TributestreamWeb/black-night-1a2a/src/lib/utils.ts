export function getPageUrl(url: string): string {
    if (!url) return '';
    return url.replace(/https?:\/\/localhost/, 'https://tributestream.com');
  }