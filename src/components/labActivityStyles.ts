type LabTheme = 'modern' | 'organic' | 'minimal';

/**
 * Shared typography for activity titles in the Ideas Lab.
 * Keep family, weight, size and line-height consistent across themes.
 */
export const getLabActivityTitleClass = (theme: LabTheme): string => {
  if (theme === 'minimal') {
    return 'font-editorial font-bold text-[36px] md:text-[48px] leading-tight tracking-tight text-[#1C1510]';
  }

  if (theme === 'modern') {
    return 'display text-4xl md:text-5xl font-bold leading-tight text-indigo-600';
  }

  return 'text-4xl md:text-5xl font-bold leading-tight';
};
