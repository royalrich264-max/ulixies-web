'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { getCurrentUser } from '@/services/storeService';
import { MapPin, Plus, Trash2, CheckCircle2, Home, Building2, User, Phone } from 'lucide-react';

export default function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const [user, setUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    recipient_name: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
    is_default: true,
  });

  useEffect(() => {
    async function fetchAddresses() {
      const u = await getCurrentUser();
      setUser(u);
      if (u) {
        const { data } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', u.id)
          .order('is_default', { ascending: false });
        setAddresses(data || []);
      } else {
        // Fallback to local address for guests
        const local = localStorage.getItem('ulx_addresses');
        setAddresses(local ? JSON.parse(local) : []);
      }
    }
    fetchAddresses();
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (user) {
        if (form.is_default) {
          await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
        }

        const { data, error } = await supabase
          .from('addresses')
          .insert({ ...form, user_id: user.id })
          .select()
          .single();

        if (error) throw error;
        setAddresses([data, ...addresses.map(a => form.is_default ? { ...a, is_default: false } : a)]);
      } else {
        const newAddr = { id: Date.now().toString(), ...form };
        const updated = [newAddr, ...addresses.map(a => form.is_default ? { ...a, is_default: false } : a)];
        setAddresses(updated);
        localStorage.setItem('ulx_addresses', JSON.stringify(updated));
      }

      setShowAddForm(false);
      setForm({ recipient_name: '', street: '', apartment: '', city: '', state: '', postal_code: '', phone: '', is_default: false });
    } catch (err) {
      alert(err.message || 'Failed to save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (user) {
      await supabase.from('addresses').delete().eq('id', id);
      setAddresses(addresses.filter(a => a.id !== id));
    } else {
      const updated = addresses.filter(a => a.id !== id);
      setAddresses(updated);
      localStorage.setItem('ulx_addresses', JSON.stringify(updated));
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-gray-400 mb-1">
            <MapPin className="w-4 h-4 text-black" /> ATHLETE PASSPORT // ADDRESS BOOK
          </div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Delivery Addresses</h1>
          <p className="text-xs text-gray-500 mt-1">Manage physical delivery destinations for orders.</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-3 bg-black text-white text-xs font-bold uppercase rounded-full flex items-center gap-2 hover:bg-gray-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add New Address
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSaveAddress} className="bg-[#F9F9F9] border border-[#E5E5E5] rounded-3xl p-6 mb-8 max-w-2xl">
          <h3 className="font-bold text-sm uppercase mb-4">New Shipping Destination</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Full Recipient Name</label>
              <input
                type="text"
                required
                value={form.recipient_name}
                onChange={e => setForm({ ...form, recipient_name: e.target.value })}
                className="w-full p-3 bg-white border border-[#E5E5E5] rounded-xl text-xs font-medium outline-none"
                placeholder="John Doe"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Street Address</label>
              <input
                type="text"
                required
                value={form.street}
                onChange={e => setForm({ ...form, street: e.target.value })}
                className="w-full p-3 bg-white border border-[#E5E5E5] rounded-xl text-xs font-medium outline-none"
                placeholder="123 Athlete Way"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Apt / Suite / Unit</label>
              <input
                type="text"
                value={form.apartment}
                onChange={e => setForm({ ...form, apartment: e.target.value })}
                className="w-full p-3 bg-white border border-[#E5E5E5] rounded-xl text-xs font-medium outline-none"
                placeholder="Apt 4B"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-600 block mb-1">City</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={e => setForm({ ...form, city: e.target.value })}
                className="w-full p-3 bg-white border border-[#E5E5E5] rounded-xl text-xs font-medium outline-none"
                placeholder="Kigali"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-600 block mb-1">State / Province</label>
              <input
                type="text"
                required
                value={form.state}
                onChange={e => setForm({ ...form, state: e.target.value })}
                className="w-full p-3 bg-white border border-[#E5E5E5] rounded-xl text-xs font-medium outline-none"
                placeholder="Gasabo"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Postal Code</label>
              <input
                type="text"
                required
                value={form.postal_code}
                onChange={e => setForm({ ...form, postal_code: e.target.value })}
                className="w-full p-3 bg-white border border-[#E5E5E5] rounded-xl text-xs font-medium outline-none"
                placeholder="00000"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full p-3 bg-white border border-[#E5E5E5] rounded-xl text-xs font-medium outline-none"
                placeholder="+250 788 000 000"
              />
            </div>
            <div className="col-span-2 flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="def"
                checked={form.is_default}
                onChange={e => setForm({ ...form, is_default: e.target.checked })}
                className="w-4 h-4 accent-black"
              />
              <label htmlFor="def" className="text-xs font-bold uppercase cursor-pointer">Set as Primary Default Delivery Address</label>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-black text-white text-xs font-bold uppercase rounded-xl hover:bg-gray-800"
            >
              {saving ? 'Saving...' : 'Save Address'}
            </button>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-6 py-3 border border-gray-300 text-xs font-bold uppercase rounded-xl"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="p-16 bg-[#F5F5F5] rounded-3xl text-center border border-[#E5E5E5]">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold uppercase">No Addresses Saved Yet</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">Add a shipping destination for quick checkout.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-black text-white text-xs font-bold uppercase rounded-full"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((addr) => (
            <div key={addr.id} className={`border rounded-2xl p-5 relative flex flex-col justify-between ${
              addr.is_default ? 'border-black bg-white shadow-sm' : 'border-[#E5E5E5] bg-gray-50'
            }`}>
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-black" />
                    <span className="font-bold text-sm text-black">{addr.recipient_name}</span>
                  </div>
                  {addr.is_default && (
                    <span className="bg-black text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold">
                      DEFAULT
                    </span>
                  )}
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <div>{addr.street} {addr.apartment && `(${addr.apartment})`}</div>
                  <div>{addr.city}, {addr.state} {addr.postal_code}</div>
                  <div className="text-[11px] font-mono text-gray-500 pt-1">{addr.phone}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#E5E5E5] mt-4 flex justify-end">
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors p-1"
                  title="Delete Address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}