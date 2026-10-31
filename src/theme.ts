import { getSchoolConfiguration } from './config/schoolConfig';

const configured = getSchoolConfiguration().theme.light;
export const C = {
  bg: configured.pageBackground,
  surface: configured.cardBackground,
  primary: configured.primary,
  primaryDark: configured.primaryDark,
  accent: configured.accent,
  text: configured.text,
  muted: configured.mutedText,
  border: configured.border,
  success: configured.success,
  successSoft: configured.successSoft,
  danger: configured.danger,
  dangerSoft: configured.dangerSoft,
  warning: configured.warning,
  warningSoft: configured.warningSoft,
  blueSoft: configured.blueSoft,
  purple: configured.purple,
  purpleSoft: configured.purpleSoft,
  orange: configured.orange,
  orangeSoft: configured.orangeSoft,
  shadow: configured.shadow,
};
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;
export const radius = { sm: 10, md: 14, lg: 20, xl: 26, pill: 999 } as const;
export const typography = { title: 22, heading: 16, body: 14, caption: 12, small: 10 } as const;
