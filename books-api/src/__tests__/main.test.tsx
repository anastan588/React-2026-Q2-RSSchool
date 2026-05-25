import React from 'react';
import { createRoot } from 'react-dom/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-dom/client', () => {
  const render = vi.fn();
  const mockCreateRoot = vi.fn(() => ({ render }));
  return { createRoot: mockCreateRoot };
});

vi.mock('@/router/Router', () => ({
  router: {},
}));

vi.mock('react-router', () => ({
  RouterProvider: () => <div data-testid="router-provider" />,
}));

vi.mock('../index.css', () => ({}));

describe('Main Entry Point', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('renders the app inside strict composition hierarchy layout', async () => {
    document.body.innerHTML = '<div id="root"></div>';

    await vi.importActual('../main');

    const rootElement = document.getElementById('root');
    expect(createRoot).toHaveBeenCalledWith(rootElement);

    const rootInstance = vi.mocked(createRoot).mock.results[0].value;
    expect(rootInstance.render).toHaveBeenCalled();

    const renderedComponent = vi.mocked(rootInstance.render).mock.calls[0][0];
    expect(renderedComponent.type).toBe(React.StrictMode);
  });
});
