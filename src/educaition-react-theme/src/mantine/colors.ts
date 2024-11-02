import { DEFAULT_THEME, MantineColorsTuple } from '@mantine/core';

export const EDUCAITION_LIGHT_COLORS: Record<string, MantineColorsTuple> = {
  ...DEFAULT_THEME.colors,
  dark: ['#d1d1e0', '#b3b3cc', '#9999b3', '#808099', '#666680', '#4d4d66', '#33334d', '#1a1a33', '#00001a', '#000000'],
  light: ['#f7f7fa', '#f0f0f5', '#e8e8f0', '#e0e0eb', '#d9d9e6', '#d1d1e0', '#b3b3cc', '#9999b3', '#808099', '#666680'],
  gray: ['#f2f2f2', '#e6e6e6', '#cccccc', '#b3b3b3', '#999999', '#808080', '#666666', '#4d4d4d', '#333333', '#1a1a1a'],
  red: ['#ffe6e6', '#ffcccc', '#ff9999', '#ff6666', '#ff3333', '#ff0000', '#cc0000', '#990000', '#660000', '#330000'],
  green: ['#e6ffe6', '#ccffcc', '#99ff99', '#66ff66', '#33ff33', '#00ff00', '#00cc00', '#009900', '#006600', '#003300'],
  blue: ['#e6f2ff', '#cce6ff', '#99ccff', '#66b3ff', '#3399ff', '#007fff', '#0066cc', '#0052a3', '#003d7a', '#002952'],
  yellow: ['#fff9e6', '#fff2cc', '#ffe699', '#ffdb66', '#ffd133', '#ffc700', '#cc9f00', '#997700', '#665000', '#332800'],
  orange: ['#ffece6', '#ffd9cc', '#ffb399', '#ff8c66', '#ff6633', '#ff4000', '#cc3300', '#992600', '#661a00', '#330d00'],
  teal: ['#e6ffff', '#ccffff', '#99ffff', '#66ffff', '#33ffff', '#00ffff', '#00cccc', '#009999', '#006666', '#003333'],
  purple: ['#f2e6ff', '#e6ccff', '#cc99ff', '#b366ff', '#9933ff', '#8000ff', '#6600cc', '#4d0099', '#330066', '#1a0033'],
  kindness: ['#ffe6f2', '#ffccde', '#ff99bd', '#ff669b', '#ff337a', '#ff0066', '#cc0052', '#99003d', '#660029', '#330014'],
};

export const EDUCAITION_DARK_COLORS: Record<string, MantineColorsTuple> = {
  ...DEFAULT_THEME.colors,
  dark: ['#000000', '#00001a', '#1a1a33', '#33334d', '#4d4d66', '#666680', '#808099', '#9999b3', '#b3b3cc', '#d1d1e0'],
  light: ['#666680', '#808099', '#9999b3', '#b3b3cc', '#d1d1e0', '#d9d9e6', '#e0e0eb', '#e8e8f0', '#f0f0f5', '#f7f7fa'],
  gray: ['#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#f2f2f2'],
  red: ['#330000', '#660000', '#990000', '#cc0000', '#ff0000', '#ff3333', '#ff6666', '#ff9999', '#ffcccc', '#ffe6e6'],
  green: ['#003300', '#006600', '#009900', '#00cc00', '#00ff00', '#33ff33', '#66ff66', '#99ff99', '#ccffcc', '#e6ffe6'],
  blue: ['#002952', '#003d7a', '#0052a3', '#0066cc', '#007fff', '#3399ff', '#66b3ff', '#99ccff', '#cce6ff', '#e6f2ff'],
  yellow: ['#332800', '#665000', '#997700', '#cc9f00', '#ffc700', '#ffd133', '#ffdb66', '#ffe699', '#fff2cc', '#fff9e6'],
  orange: ['#330d00', '#661a00', '#992600', '#cc3300', '#ff4000', '#ff6633', '#ff8c66', '#ffb399', '#ffd9cc', '#ffece6'],
  teal: ['#003333', '#006666', '#009999', '#00cccc', '#00ffff', '#33ffff', '#66ffff', '#99ffff', '#ccffff', '#e6ffff'],
  purple: ['#1a0033', '#330066', '#4d0099', '#6600cc', '#8000ff', '#9933ff', '#b366ff', '#cc99ff', '#e6ccff', '#f2e6ff'],
  kindness: ['#330014', '#660029', '#99003d', '#cc0052', '#ff0066', '#ff337a', '#ff669b', '#ff99bd', '#ffccde', '#ffe6f2'],
};
