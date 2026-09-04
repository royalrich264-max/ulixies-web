'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getUserOrders, getCurrentUser, submitProductReturn, uploadReturnPhoto, getUserReturns } from '@/services/storeService';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  FileText,
  ArrowRight,
  Layers,
  Crown,
  RotateCcw,
  X,
  Upload,
  Check,
  ImageOff
} from 'lucide-react';

const RETURN_REASONS = [
  'Changed my mind',
  'Wrong size',
  'Don\'t like the product',
  'Damaged when received',
  'Defective product',
  'Wrong product received',
  'Other'
];

function getItemImage(item) {
  return item?.product_variants?.products?.product_images?.[0]?.url || null;
}

function getItemVariantLabel(item) {
  if (!item) return 'OS';
  const color = item.color || item.product_variants?.color;
  const size = item.size || item.product_variants?.size || 'OS';
  return color ? `${color} / ${size}` : size;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [myReturns, setMyReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Return Modal State
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);
  const [selectedReason, setSelectedReason] = useState('Wrong size');
  const [returnDetails, setReturnDetails] = useState('');
  const [returnPhotos, setReturnPhotos] = useState([]);
  const [returnMethod, setReturnMethod] = useState('Mail return');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);

  useEffect(() => {
    async function loadOrders() {
      try {
        const u = await getCurrentUser();
        setUser(u);
        const data = await getUserOrders();
        setOrders(data || []);
        const returnsData = await getUserReturns();
        setMyReturns(returnsData || []);
      } catch (err) {
        console.error('Failed to load orders:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const openReturnDialog = (order) => {
    setActiveOrder(order);
    setSelectedReason('Wrong size');
    setReturnDetails('');
    setReturnPhotos([]);
    setReturnSuccess(false);
    setReturnModalOpen(true);
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    try {
      const urls = [];
      for (const f of files) {
        if (typeof uploadReturnPhoto === 'function') {
          const url = await uploadReturnPhoto(f);
          urls.push(url);
        }
      }
      setReturnPhotos((prev) => [...prev, ...urls]);
    } catch {
      alert('Photo upload failed. You can proceed with text details.');
    }
  };

  const handleSubmitReturn = async () => {
    if (!activeOrder) return;
    setSubmittingReturn(true);

    try {
      const firstItem = activeOrder.order_items?.[0] || {};
      if (typeof submitProductReturn === 'function') {
        await submitProductReturn({
          order_id: activeOrder.id,
          order_number: activeOrder.order_number,
          customer_name: activeOrder.shipping_address?.recipient_name || user?.email || 'Customer',
          customer_email: user?.email || activeOrder.guest_email || null,
          customer_phone: activeOrder.shipping_address?.phone || null,
          product_name: firstItem.product_name || 'Item',
          variant_size: getItemVariantLabel(firstItem),
          quantity: firstItem.quantity || 1,
          refund_amount: activeOrder.total_amount ?? activeOrder.total ?? 0,
          reason: selectedReason,
          details: returnDetails,
          photos: returnPhotos,
          return_method: returnMethod,
          shipping_payer: (selectedReason === 'Damaged when received' || selectedReason === 'Wrong product received') ? 'Store pays' : 'Customer pays'
        });
      }

      setReturnSuccess(true);
      const returnsData = await getUserReturns();
      setMyReturns(returnsData || []);
    } catch (err) {
      alert(err.message || 'Error submitting return.');
    } finally {
      setSubmittingReturn(false);
    }
  };

  return (
    <div className="max-w-[1440px] mx-auto px-6 py-8">
      
      {/* HEADER SECTION */}
      <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-gray-400 mb-1">
        <Crown className="w-4 h-4 text-black" /> ATHLETE PASSPORT // LOGISTICS
      </div>
      <div className="flex justify-between items-baseline mb-6 border-b border-[#E5E5E5] pb-4">
        <h1 className="text-2xl font-black uppercase tracking-tight">My Orders</h1>
        <span className="text-xs font-mono font-bold text-gray-500">{orders.length} DELIVERIES</span>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs font-mono text-gray-400">LOADING LOGISTICS PIPELINE...</div>
      ) : orders.length === 0 ? (
        <div className="p-16 bg-[#F5F5F5] rounded-3xl text-center border border-[#E5E5E5]">
          <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-bold uppercase">No Deliveries Found</h2>
          <p className="text-xs text-gray-500 mt-1 mb-6">You have not placed any athlete gear orders yet.</p>
          <Link href="/" className="px-6 py-3 bg-black text-white text-xs font-bold uppercase rounded-full">
            Explore Releases
          </Link>
        </div>
      ) : (
        /* SHORT, COMPACT CARDS (3 PER ROW) */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => {
            const firstItem = order.order_items?.[0];
            const itemCount = order.order_items?.reduce((acc, i) => acc + (i.quantity || 1), 0) || 1;
            const isDelivered = order.status === 'delivered';
            const orderReturns = myReturns.filter((r) => r.order_id === order.id);

            return (
              <div 
                key={order.id} 
                className="bg-white border border-[#E5E5E5] rounded-2xl p-4 flex flex-col justify-between hover:border-black hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-mono font-black text-xs text-black">{order.order_number}</span>
                    
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status === 'delivered' && <CheckCircle2 className="w-2.5 h-2.5" />}
                      {order.status === 'shipped' && <Truck className="w-2.5 h-2.5" />}
                      {order.status === 'processing' && <Clock className="w-2.5 h-2.5" />}
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-2 bg-[#F9F9F9] rounded-xl mb-3 border border-[#E5E5E5]">
                    <div className="w-12 h-12 bg-white rounded-lg p-1 flex items-center justify-center shrink-0 border border-black/5">
                      {getItemImage(firstItem) ? (
                        <img
                          src={getItemImage(firstItem)}
                          alt={firstItem?.product_name || 'Gear'}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <ImageOff className="w-5 h-5 text-gray-300" />
                      )}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <div className="font-bold text-xs text-black truncate">{firstItem?.product_name || 'Gear Item'}</div>
                      <div className="text-[10px] text-gray-500 font-mono mt-0.5">
                        {itemCount} {itemCount === 1 ? 'item' : 'items'} • Size: {getItemVariantLabel(firstItem)}
                      </div>
      <div className="text-[9px] text-gray-400 font-mono">
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* RETURN STATUS + ADMIN RESPONSE — previously the customer had no way to
                      ever see this again after submitting a claim. */}
                  {orderReturns.map((ret) => {
                    const stageStyles = {
                      requested: 'bg-gray-100 text-gray-700 border-gray-200',
                      approved: 'bg-blue-50 text-blue-700 border-blue-200',
                      return_shipped: 'bg-blue-50 text-blue-700 border-blue-200',
                      received: 'bg-amber-50 text-amber-700 border-amber-200',
                      inspection: 'bg-amber-50 text-amber-700 border-amber-200',
                      refund_approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      refunded: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                      rejected: 'bg-red-50 text-red-700 border-red-200',
                    };
                    const stage = ret.status || 'requested';
                    return (
                      <div key={ret.id} className="mb-3 p-2.5 bg-[#F9F9F9] rounded-xl border border-[#E5E5E5] text-[10px] space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase text-gray-500">Return Status</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${stageStyles[stage] || stageStyles.requested}`}>
                            {stage.replace(/_/g, ' ')}
                          </span>
                        </div>
                        {ret.inspection_notes && (
                          <div className="text-gray-600">
                            <span className="font-bold text-gray-500">Message from our team: </span>
                            {ret.inspection_notes}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2.5 border-t border-[#E5E5E5] flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[9px] font-mono text-gray-400 block font-bold">TOTAL</span>
                    <span className="font-mono font-black text-xs text-black">${order.total_amount ?? order.total}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* RETURN ACTION BUTTON */}
                    <button
                      onClick={() => openReturnDialog(order)}
                      className="px-2.5 py-1.5 border border-[#E5E5E5] text-gray-700 hover:text-black hover:border-black text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-3 h-3" /> Return
                    </button>

                    {/* INVOICE LOCKED UNTIL DELIVERED */}
                    {isDelivered ? (
                      <Link
                        href={`/order-detail?number=${order.order_number}`}
                        className="px-3 py-1.5 bg-black text-white text-[10px] font-bold uppercase rounded-lg flex items-center gap-1 hover:bg-gray-800 transition-colors shadow-sm"
                      >
                        <FileText className="w-3 h-3" /> Invoice <ArrowRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-[9px] font-mono font-bold text-gray-400 uppercase bg-gray-100 px-2 py-1 rounded">
                        Pending Delivery
                      </span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* ================= EXACT ASCII 'RETURN AN ITEM' MODAL SHEET ================= */}
      {returnModalOpen && activeOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white max-w-lg w-full rounded-2xl border-2 border-black p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b-2 border-black pb-3 mb-4">
              <span className="font-black text-base uppercase tracking-tight font-mono">
                RETURN AN ITEM
              </span>
              <button 
                onClick={() => setReturnModalOpen(false)}
                className="p-1 text-gray-400 hover:text-black rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {returnSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg uppercase">Return Claim Initiated</h3>
                <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                  Your return request for Order #{activeOrder.order_number} has been logged in the system.
                </p>
                <button
                  onClick={() => setReturnModalOpen(false)}
                  className="px-6 py-2.5 bg-black text-white text-xs font-bold uppercase rounded-full"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                
                <div className="font-mono">
                  <div className="font-bold text-black text-sm">Order #{activeOrder.order_number}</div>
                  <div className="text-gray-500 text-[11px]">Purchased {new Date(activeOrder.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div className="w-12 h-12 bg-white rounded-lg p-1 border flex items-center justify-center shrink-0">
                    {getItemImage(activeOrder.order_items?.[0]) ? (
                      <img
                        src={getItemImage(activeOrder.order_items?.[0])}
                        alt=""
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <ImageOff className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div>
                    <div className="font-black text-xs text-black">{activeOrder.order_items?.[0]?.product_name || 'Item'}</div>
                    <div className="text-gray-500 font-mono text-[11px]">{getItemVariantLabel(activeOrder.order_items?.[0])}</div>
                    <div className="text-gray-400 font-mono text-[10px]">Qty: {activeOrder.order_items?.[0]?.quantity || 1}</div>
                  </div>
                </div>

                <div>
                  <label className="font-bold uppercase text-black block mb-2 font-mono">Why are you returning this?</label>
                  <div className="space-y-1.5 pl-1">
                    {RETURN_REASONS.map((r) => (
                      <label key={r} className="flex items-center gap-2 cursor-pointer text-gray-800 hover:text-black">
                        <input
                          type="radio"
                          name="return_reason"
                          value={r}
                          checked={selectedReason === r}
                          onChange={(e) => setSelectedReason(e.target.value)}
                          className="accent-black w-4 h-4 cursor-pointer"
                        />
                        <span>{r}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold uppercase text-black block mb-1 font-mono">Tell us more</label>
                  <textarea
                    rows={3}
                    value={returnDetails}
                    onChange={(e) => setReturnDetails(e.target.value)}
                    placeholder="Provide additional details regarding item condition..."
                    className="w-full p-2.5 border border-gray-300 rounded-xl text-xs outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg font-bold uppercase text-[11px] cursor-pointer hover:border-black bg-gray-50">
                    <Upload className="w-3.5 h-3.5" /> Upload Photos
                    <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  {returnPhotos.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {returnPhotos.map((url, i) => (
                        <img key={i} src={url} alt="" className="w-10 h-10 object-cover rounded-lg border" />
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold uppercase text-black block mb-1 font-mono">Return method</label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={returnMethod === 'Mail return'}
                      onChange={() => setReturnMethod('Mail return')}
                      className="accent-black w-4 h-4"
                    />
                    <span>Mail return (Prepaid Drop-off)</span>
                  </label>
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-1 font-mono text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Return shipping:</span>
                    <span className="font-bold text-black">
                      {(selectedReason === 'Damaged when received' || selectedReason === 'Wrong product received') 
                        ? 'Store pays (Free)' 
                        : 'Customer pays'}
                    </span>
                  </div>
                  <div className="flex justify-between text-black font-black text-sm pt-1">
                    <span>Estimated refund:</span>
                    <span>${activeOrder.total_amount ?? activeOrder.total}</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmitReturn}
                  disabled={submittingReturn}
                  className="w-full py-3.5 bg-black text-white font-black uppercase text-xs tracking-wider rounded-xl hover:bg-gray-800 transition-colors shadow-lg disabled:opacity-50 mt-2"
                >
                  {submittingReturn ? 'Submitting Return...' : '[ REQUEST RETURN ]'}
                </button>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}