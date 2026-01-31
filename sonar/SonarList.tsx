
import React from 'react';
import type { RadarProfile } from '../radar/types';
import RadarList from '../radar/RadarList';

interface SonarListProps {
  profiles: RadarProfile[];
  loading: boolean;
  bannerText?: string;
}

export default function SonarList({ profiles, loading, bannerText }: SonarListProps) {
  // We reuse the RadarList but customize the container for the Sonar specific vibe.
  // We also render bannerText here as RadarList does not support it.
  return (
    <div className="w-full">
      {/* Display banner text if provided to give feedback when results are sparse or in discovery mode */}
      {bannerText && (
        <div className="p-4 mb-4 text-[10px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/5 border border-amber-500/10 rounded-2xl text-center">
          {bannerText}
        </div>
      )}
      <RadarList profiles={profiles} loading={loading} />
    </div>
  );
}
