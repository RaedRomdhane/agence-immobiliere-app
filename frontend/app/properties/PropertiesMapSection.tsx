"use client";
import dynamic from 'next/dynamic';
import React from 'react';
import Header from '@/components/layout/Header';
// Dynamically import the PropertiesMap to avoid SSR issues
const PropertiesMap = dynamic(() => import('./map'), { ssr: false });

export default function PropertiesMapSection() {
  // Adjust this value to match your header height (e.g., 64px or 80px)
  const headerHeight = 72;
  return (
    <section className="py-20 bg-gray-100" style={{ marginTop: headerHeight }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 text-center">
          Carte interactive des biens
        </h2>
        <div className="mt-8">
          <PropertiesMap />
        </div>
      </div>
    </section>
  );
}
