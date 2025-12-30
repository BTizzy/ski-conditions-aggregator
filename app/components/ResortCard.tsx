import React from 'react';
import { Conditions } from '../../lib/types';
import { format } from 'date-fns';

interface ResortCardProps {
  conditions: Conditions;
  resortName: string;
  logoUrl?: string;
  onAlertClick?: () => void;
}

const ResortCard: React.FC<ResortCardProps> = ({ conditions, resortName, logoUrl, onAlertClick }) => {
  const percentOpen = conditions.trailStatus.total > 0 ? Math.round((conditions.trailStatus.open / conditions.trailStatus.total) * 100) : 0;
  const isDeepSnow = conditions.snowDepth > 12;

  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg shadow-lg border border-gray-700 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center mb-3">
        {logoUrl && <img src={logoUrl} alt={`${resortName} logo`} className="w-8 h-8 mr-3 rounded" />}
        <h3 className="text-lg font-bold">{resortName}</h3>
      </div>
      <div className="space-y-2">
        <div className={`text-sm ${isDeepSnow ? 'text-blue-400 font-semibold' : ''}`}>
          Snow Depth: {conditions.snowDepth}"
        </div>
        <div className="text-sm">24hr Snowfall: {conditions.recentSnowfall}"</div>
        <div className="text-sm">Trails Open: {percentOpen}% ({conditions.trailStatus.open}/{conditions.trailStatus.total})</div>
        <div className="text-xs text-gray-400">
          Updated: {format(conditions.timestamp, 'MMM dd, HH:mm')}
        </div>
      </div>
      <button
        onClick={onAlertClick}
        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition-colors duration-200"
      >
        Alert Me
      </button>
    </div>
  );
};

export default ResortCard;