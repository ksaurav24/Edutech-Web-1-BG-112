const AUTH_PAGES = new Set(['login', 'signup', 'forgot']);

export function applyAuthGuard(state) {
  if (!state.isAuthenticated && state.page === 'app') {
    state.page = 'login';
    return;
  }

  if (state.isAuthenticated && AUTH_PAGES.has(state.page)) {
    state.page = 'app';
  }
}

