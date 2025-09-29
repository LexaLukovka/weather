import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockRender = vi.fn();
const mockCreateRoot = vi.fn((element: Element | DocumentFragment) => {
  expect(element).toBeDefined();
  return {
    render: mockRender,
  };
});

vi.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot,
}));

vi.mock('../App.tsx', () => ({
  default: () => 'App',
}));

describe('main.tsx', () => {
  let originalGetElementById: typeof document.getElementById;
  const mockRootElement = document.createElement('div');

  beforeEach(() => {
    vi.clearAllMocks();
    originalGetElementById = document.getElementById;
    document.getElementById = vi.fn(() => mockRootElement);
  });

  afterEach(() => {
    document.getElementById = originalGetElementById;
  });

  it('renders the app with StrictMode', async () => {
    await import('../main.tsx');

    expect(document.getElementById).toHaveBeenCalledWith('root');
    expect(mockCreateRoot).toHaveBeenCalledWith(mockRootElement);
    expect(mockRender).toHaveBeenCalledTimes(1);

    const renderCall = mockRender.mock.calls[0][0];
    expect(renderCall).toBeDefined();
  });

  it('handles missing root element gracefully', () => {
    document.getElementById = vi.fn(() => null);

    expect(() => {
      mockCreateRoot.mockImplementation(() => {
        throw new TypeError(
          "Cannot read properties of null (reading 'render')"
        );
      });

      const rootElement = document.getElementById('root');
      mockCreateRoot(rootElement!);
    }).toThrow();
  });
});
