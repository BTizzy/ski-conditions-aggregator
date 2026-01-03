import type { Meta, StoryObj } from '@storybook/react';
import ResortMap from '../../../app/components/ResortMap';

const meta: Meta<typeof ResortMap> = {
  title: 'Components/ResortMap',
  component: ResortMap,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Interactive map component displaying ski resorts with weather radar overlay and conditions data.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    resorts: {
      description: 'Array of resort data to display on the map',
      control: { type: 'object' },
    },
    conditions: {
      description: 'Weather conditions data for each resort',
      control: { type: 'object' },
    },
    loading: {
      description: 'Loading states for resort data fetching',
      control: { type: 'object' },
    },
    errors: {
      description: 'Error states for resort data fetching',
      control: { type: 'object' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ResortMap>;

// Mock data for stories
const mockResorts = [
  {
    id: 'loon-mountain',
    name: 'Loon Mountain',
    state: 'NH',
    lat: 44.0356,
    lon: -71.6217,
    elevationFt: 3120,
  },
  {
    id: 'stowe-mountain',
    name: 'Stowe Mountain Resort',
    state: 'VT',
    lat: 44.5303,
    lon: -72.7813,
    elevationFt: 3560,
  },
  {
    id: 'sugarloaf',
    name: 'Sugarloaf',
    state: 'ME',
    lat: 45.0317,
    lon: -70.3131,
    elevationFt: 4237,
  },
];

const mockConditions = {
  'loon-mountain': {
    resortId: 'loon-mountain',
    snowDepth: 48,
    recentSnowfall: 12,
    recentRainfall: 0,
    weeklySnowfall: 24,
    weeklyRainfall: 0.5,
    baseTemp: 25,
    windSpeed: 15,
    visibility: 'Good',
    timestamp: new Date().toISOString(),
  },
  'stowe-mountain': {
    resortId: 'stowe-mountain',
    snowDepth: 62,
    recentSnowfall: 8,
    recentRainfall: 0,
    weeklySnowfall: 18,
    weeklyRainfall: 0.2,
    baseTemp: 22,
    windSpeed: 12,
    visibility: 'Excellent',
    timestamp: new Date().toISOString(),
  },
  'sugarloaf': {
    resortId: 'sugarloaf',
    snowDepth: 78,
    recentSnowfall: 15,
    recentRainfall: 0,
    weeklySnowfall: 32,
    weeklyRainfall: 0,
    baseTemp: 18,
    windSpeed: 20,
    visibility: 'Good',
    timestamp: new Date().toISOString(),
  },
};

export const Default: Story = {
  args: {
    resorts: mockResorts,
    conditions: mockConditions,
    loading: {},
    errors: {},
  },
};

export const Loading: Story = {
  args: {
    resorts: mockResorts,
    conditions: {},
    loading: {
      'loon-mountain': true,
      'stowe-mountain': true,
      'sugarloaf': true,
    },
    errors: {},
  },
};

export const WithErrors: Story = {
  args: {
    resorts: mockResorts,
    conditions: {
      'loon-mountain': mockConditions['loon-mountain'],
    },
    loading: {},
    errors: {
      'stowe-mountain': 'Failed to load conditions',
      'sugarloaf': 'Network error',
    },
  },
};

export const Empty: Story = {
  args: {
    resorts: [],
    conditions: {},
    loading: {},
    errors: {},
  },
};

export const SingleResort: Story = {
  args: {
    resorts: [mockResorts[0]],
    conditions: {
      'loon-mountain': mockConditions['loon-mountain'],
    },
    loading: {},
    errors: {},
  },
};