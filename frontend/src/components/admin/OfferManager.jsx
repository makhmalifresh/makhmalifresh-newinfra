import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Plus, Trash2, Megaphone, Tag } from 'lucide-react';
import api from '../../api';
import DeleteConfirmationModal from './DeleteConfirmationModal';

export default function OfferManager() {
  // --- All of your existing, working logic is preserved ---
  const [offers, setOffers] = useState([]);
  const [unassignedCoupons, setUnassignedCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState('');
  const [offerToDelete, setOfferToDelete] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [offersRes, couponsRes] = await Promise.all([
        api.get('/admin/offers'),
        api.get('/admin/unassigned-coupons')
      ]);
      setOffers(offersRes.data);
      setUnassignedCoupons(couponsRes.data);
      if (couponsRes.data.length > 0) {
        setSelectedCoupon(couponsRes.data[0].code);
      }
    } catch (error) {
      toast.error('Failed to fetch offer data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    if (!name || !description || !selectedCoupon) {
      toast.warn("Please fill all fields.");
      return;
    }
    try {
      await api.post('/admin/offers', { name, description, coupon_code: selectedCoupon });
      toast.success('Offer created successfully!');
      setName('');
      setDescription('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create offer.');
    }
  };

  const confirmDelete = async () => {
    if (!offerToDelete) return;
    try {
      await api.delete(`/admin/offers/${offerToDelete.id}`);
      toast.success(`Offer "${offerToDelete.name}" deleted.`);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete offer.');
    } finally {
      setOfferToDelete(null);
    }
  };
  // --- End of your working logic ---

  return (
    <>
      <DeleteConfirmationModal isOpen={!!offerToDelete} onClose={() => setOfferToDelete(null)} onConfirm={confirmDelete} itemName={offerToDelete?.name} />
      
      {/* --- THIS IS THE NEW, CONSISTENT WHITE THEME UI --- */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Card 1: Create Offer Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2" style={{ fontFamily: 'var(--font-clash)' }}>
              <Megaphone size={22} /> Create New Offer
            </h3>
            <form onSubmit={handleCreateOffer} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Offer Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g., Welcome Discount" 
                  className="w-full bg-gray-50 text-gray-800 border-gray-300 rounded-lg shadow-sm px-4 py-3 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Benefit / Description</label>
                <input 
                  type="text" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="e.g., Flat ₹100 Off" 
                  className="w-full bg-gray-50 text-gray-800 border-gray-300 rounded-lg shadow-sm px-4 py-3 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Link to Coupon</label>
                <select 
                  value={selectedCoupon} 
                  onChange={(e) => setSelectedCoupon(e.target.value)} 
                  className="w-full bg-gray-50 text-gray-800 border-gray-300 rounded-lg shadow-sm px-4 py-3 focus:border-red-500 focus:ring-red-500"
                >
                  {unassignedCoupons.length === 0 ? (
                    <option disabled>No available coupons</option>
                  ) : (
                    unassignedCoupons.map(c => <option key={c.code} value={c.code}>{c.code}</option>)
                  )}
                </select>
              </div>
              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 transition-all transform hover:scale-105"
              >
                <Plus size={18} /> Create Offer
              </button>
            </form>
          </div>
        </div>

        {/* Card 2: Active Offers Table */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-gray-800 mb-6" style={{ fontFamily: 'var(--font-clash)' }}>
              Active Offers
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-12 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-12 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            ) : offers.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Megaphone size={40} className="mx-auto opacity-50"/>
                <p className="mt-4 font-semibold">No offers found.</p>
                <p className="text-sm">Create your first offer to display in the marquee!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Offer</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Linked Coupon</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {offers.map((offer) => (
                        <tr key={offer.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-4">
                            <div className="font-semibold text-gray-800">{offer.name}</div>
                            <div className="text-sm text-gray-500">{offer.description}</div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="px-3 py-1 text-sm font-semibold text-sky-800 bg-sky-100 rounded-full">
                              {offer.coupon_code}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button onClick={() => setOfferToDelete(offer)} className="p-2 text-gray-500 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};