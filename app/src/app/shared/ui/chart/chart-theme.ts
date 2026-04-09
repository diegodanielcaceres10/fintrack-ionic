import { FINTRACK_COLORS } from '../../tokens';

export const FINTRACK_CHART_COLORS = {
  income: FINTRACK_COLORS.success,
  expense: FINTRACK_COLORS.danger,
  categories: [
    FINTRACK_COLORS.primary,
    FINTRACK_COLORS.primaryLight,
    FINTRACK_COLORS.accent,
    FINTRACK_COLORS.purple,
  ],
} as const;

export function createFinTrackChartOptions(overrides: Record<string, unknown> = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 240,
    },
    plugins: {
      legend: {
        labels: {
          color: FINTRACK_COLORS.textSecondary,
          usePointStyle: true,
          boxWidth: 10,
          boxHeight: 10,
          padding: 16,
        },
      },
      tooltip: {
        backgroundColor: FINTRACK_COLORS.surface,
        titleColor: FINTRACK_COLORS.textPrimary,
        bodyColor: FINTRACK_COLORS.textSecondary,
        borderColor: FINTRACK_COLORS.border,
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        boxPadding: 6,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: FINTRACK_COLORS.textSecondary,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawBorder: false,
        },
        ticks: {
          color: FINTRACK_COLORS.textSecondary,
        },
      },
    },
    ...overrides,
  };
}

export function createFinTrackDataset(label: string, data: number[], palette: string[]) {
  return {
    label,
    data,
    borderRadius: 8,
    borderSkipped: false,
    backgroundColor: palette,
    hoverBackgroundColor: palette,
    maxBarThickness: 28,
  };
}
