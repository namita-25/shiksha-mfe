import { render } from '@testing-library/react';

import SharedLibV2 from './shared-lib-v2';

describe('SharedLibV2', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SharedLibV2 />);
    expect(baseElement).toBeTruthy();
  });
});
