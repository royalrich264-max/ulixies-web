'use client';
import { useState } from 'react';

export default function AddressesPage() {
  const [address] = useState({
    street: '1 Bowerman Drive',
    city: 'Beaverton',
    state: 'OR',
    zip: '97005',
  });

  return (
    <div className="max-w-[700px] mx-auto px-6 py-12">
      <h1 className="text-3xl font-black uppercase mb-8">Saved Addresses</h1>
      <div className="border border-[#E5E5E5] rounded-2xl p-6 bg-[#F5F5F5] flex justify-between items-start">
        <div>
          <span className="text-[10px] font-bold font-mono uppercase bg-white border border-[#E5E5E5] px-2 py-0.5 rounded">Default Shipping</span>
          <p className="font-bold text-sm mt-3">{address.street}</p>
          <p className="text-xs text-gray-500 mt-1">{address.city}, {address.state} {address.zip}</p>
        </div>
      </div>
    </div>
  );
}