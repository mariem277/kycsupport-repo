import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';

import { AccountMenu } from './account';

describe('AccountMenu', () => {
  let mountedWrapper;

  const authenticatedWrapper = () => {
    if (!mountedWrapper) {
      const { container } = render(
        <MemoryRouter>
          <AccountMenu isAuthenticated />
        </MemoryRouter>,
      );
      mountedWrapper = container.innerHTML;
    }
    return mountedWrapper;
  };
  const guestWrapper = () => {
    if (!mountedWrapper) {
      const { container } = (mountedWrapper = render(
        <MemoryRouter>
          <AccountMenu isAuthenticated={false} />
        </MemoryRouter>,
      ));
      mountedWrapper = container.innerHTML;
    }
    return mountedWrapper;
  };

  beforeEach(() => {
    mountedWrapper = undefined;
  });

  // All tests will go here

  it('Renders a authenticated AccountMenu component', () => {
    const html = authenticatedWrapper();

    expect(html).not.toContain('/login');
    expect(html).toContain('/logout');
  });

  it('Renders a guest AccountMenu component', () => {
    const html = guestWrapper();

    expect(html).not.toContain('/logout');
  });
});
