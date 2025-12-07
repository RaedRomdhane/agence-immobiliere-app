"use client";
import dynamic from 'next/dynamic';
import React, { useState } from 'react';

// Dynamically import the PropertiesMap to avoid SSR issues
const PropertiesMap = dynamic(() => import('../../properties/map'), { ssr: false });

export default function AdminPropertiesMapSection({
  selectLocationMode = false,
  onSelectLocation,
  selectedPropertyId,
  properties
}: {
  selectLocationMode?: boolean;
  onSelectLocation?: (lat: number, lng: number) => void;
  selectedPropertyId?: string | null;
  properties?: any[];
} = {}) {
  // Adjust this value to match your header height (e.g., 64px or 80px)
  const headerHeight = 72;
  return (
    <section className="py-20 bg-gray-100" style={{ marginTop: headerHeight }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
          Carte interactive des biens
        </h2>
        <div className="mt-8">
          <PropertiesMap 
            adminMode={true}
            selectLocationMode={selectLocationMode}
            onSelectLocation={onSelectLocation}
            selectedPropertyId={selectedPropertyId}
            properties={properties}
          />
        </div>
      </div>
    </section>
  );
}
