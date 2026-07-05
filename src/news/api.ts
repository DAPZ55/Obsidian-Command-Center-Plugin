// src/news/api.ts
import { requestUrl } from 'obsidian';
import type { NewsArticle } from './types';

export async function fetchNews(topic: string): Promise<NewsArticle[]> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(topic)}&hl=en-US&gl=US&ceid=US:en`;
  const res = await requestUrl({ url });
  const doc = new DOMParser().parseFromString(res.text, 'text/xml');
  const items = Array.from(doc.querySelectorAll('item'));
  return items.slice(0, 10).map((item) => ({
    title: item.querySelector('title')?.textContent ?? '',
    link: item.querySelector('link')?.textContent ?? '',
    source: item.querySelector('source')?.textContent ?? 'Unknown source',
    pubDate: item.querySelector('pubDate')?.textContent ?? null,
  }));
}
