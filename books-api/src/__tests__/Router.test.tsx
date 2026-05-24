import { describe, expect, it } from 'vitest';

import { router } from '@/router/Router';

describe('Router Configuration Coverage', () => {
  it('verifies the structural integrity of the defined routes array directly', () => {
    expect(router).toBeDefined();
    expect(Array.isArray(router.routes)).toBe(true);

    const rootRoute = router.routes.find((r) => r.path === '/');
    expect(rootRoute).toBeDefined();
    expect(rootRoute?.children).toBeDefined();

    const detailsRoute = rootRoute?.children?.find((c) => c.path === 'details/:id');
    expect(detailsRoute).toBeDefined();

    const aboutRoute = router.routes.find((r) => r.path === '/about');
    expect(aboutRoute).toBeDefined();

    const catchAllRoute = router.routes.find((r) => r.path === '*');
    expect(catchAllRoute).toBeDefined();
  });
});
