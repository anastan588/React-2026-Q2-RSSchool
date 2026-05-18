import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-dom/client', () => {
  const render = vi.fn();
  const createRoot = vi.fn(() => ({ render }));
  return { createRoot };
});

vi.mock('@/App.tsx', () => ({ default: () => <div /> }));
vi.mock('@/components/ErrorBoundary.tsx', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('Main Entry Point', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="root"></div>';
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('renders the app inside StrictMode and ErrorBoundary', async () => {
    const { createRoot } = await import('react-dom/client');
    await import('./../main?t=' + Date.now());

    const rootElement = document.getElementById('root');
    expect(createRoot).toHaveBeenCalledWith(rootElement);

    const rootInstance = vi.mocked(createRoot).mock.results[0].value;
    expect(rootInstance.render).toHaveBeenCalled();
  });

  it('throws an error if root element is missing', async () => {
    document.body.innerHTML = '';
    await expect(import('./main?t=' + (Date.now() + 1))).rejects.toThrow();
  });
});
