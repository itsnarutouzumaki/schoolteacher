import config from './data/school-config.json';
const configured = (config as any).school.theme || {};
export const C = {
  bg: configured.background || '#F4F7FC',
  surface: configured.surface || '#FFFFFF',
  primary: configured.primary || '#075DCE',
  primaryDark: configured.primaryDark || '#073C88',
  accent: configured.accent || '#20A4F3',
  text: configured.text || '#16233A',
  muted: configured.muted || '#687892',
  border: configured.border || '#E3EAF3',
  success: configured.success || '#18A66A',
  successSoft: configured.successSoft || '#E7F8EF',
  danger: configured.danger || '#E34D59',
  dangerSoft: configured.dangerSoft || '#FFF0F0',
  warning: configured.warning || '#E99B25',
  warningSoft: configured.warningSoft || '#FFF6E8',
  blueSoft: configured.blueSoft || '#EAF3FF',
  purple: configured.purple || '#7456D8',
  purpleSoft: configured.purpleSoft || '#F1ECFF',
  orange: configured.orange || '#E98A34',
  orangeSoft: configured.orangeSoft || '#FFF0E5',
  shadow: '#19375A',
};
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;
export const radius = { sm: 10, md: 14, lg: 20, xl: 26, pill: 999 } as const;
export const typography = { title: 22, heading: 16, body: 14, caption: 12, small: 10 } as const;
