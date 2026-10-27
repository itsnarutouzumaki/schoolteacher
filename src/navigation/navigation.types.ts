import type { Route, ScreenName } from '../types';
export type Navigate = (name: ScreenName, params?: Record<string, unknown>) => void;
export type Replace = (name: ScreenName, params?: Record<string, unknown>) => void;
export type NavigateBack = () => void;
export type ScreenRoute = Route;
