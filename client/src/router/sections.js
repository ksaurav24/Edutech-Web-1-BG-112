export const SECTIONS = ['dashboard', 'progress', 'goals', 'planner', 'practice', 'quotes', 'profile'];

export function ensureValidSection(currentSection) {
  if (SECTIONS.includes(currentSection)) {
    return currentSection;
  }
  return 'dashboard';
}

