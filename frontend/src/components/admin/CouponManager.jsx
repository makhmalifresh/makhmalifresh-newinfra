import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Plus, Trash2, Tag, Percent, IndianRupee } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../api';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// A custom, reusable component for the discount type toggle.
const DiscountTypeToggle = ({ value, onChange }) => {
  const options = [
    { value: 'percentage', label: 'Percentage', icon: <Percent size={16} /> },
    { value: 'fixed', label: 'Fixed', icon: <IndianRupee size={16} /> },
  ];

  return (
    <div className="bg-slate-50 p-1 rounded-lg flex w-full">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`w-1/2 py-2 text-sm font-semibold rounded-md flex items-center justify-center gap-2 transition-colors duration-300 ${
            value === option.value
              ? 'text-white bg-slate-700 shadow-md'
              : 'text-slate-500 hover:bg-slate-100/50'
          }`}
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  );
};

// Main Coupon Manager Component
const CouponManager = () => {
  // --- THIS IS YOUR ORIGINAL, WORKING LOGIC ---
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/coupons');
      setCoupons(response.data);
    } catch (error) {
      toast.warn('Failed to fetch coupons.');
      console.error('Fetch coupons error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!code || !discountValue) {
      toast.warn('Please fill all fields.');
      return;
    }
    try {
      await api.post('/admin/coupons', {
        code: code.toUpperCase(),
        discount_type: discountType,
        discount_value: parseInt(discountValue, 10),
      });
      toast.success(`Coupon "${code.toUpperCase()}" created successfully!`);
      setCode('');
      setDiscountType('percentage');
      setDiscountValue('');
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create coupon.');
      console.error('Create coupon error:', error);
    }
  };

  const openDeleteConfirmation = (coupon) => {
    setCouponToDelete(coupon);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!couponToDelete) {
      toast.error("An error occurred. Could not identify the coupon to delete.");
      return;
    }
    try {
      await api.delete(`/admin/coupons/${couponToDelete.id}`);
      toast.success(`Coupon "${couponToDelete.code}" deleted.`);
      fetchCoupons();
    } catch (error) {
      toast.error('Failed to delete coupon.');
      console.error('Delete coupon error:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setCouponToDelete(null);
    }
  };
  // --- END OF YOUR WORKING LOGIC ---

  return (
    <>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        itemName={couponToDelete?.code}
      />
      
      {/* --- THIS IS THE NEW, PREMIUM UI --- */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Card 1: Create Coupon Form */}
        <div className="lg:col-span-1">
          <div className="bg-slate-50 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-black mb-6 flex items-center gap-2" style={{fontFamily: 'var(--font-clash)'}}>
              <Tag size={22}/> Create New Coupon
            </h3>
            <form onSubmit={handleCreateCoupon} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Coupon Code</label>
                <input 
                  type="text" 
                  value={code} 
                  onChange={(e) => setCode(e.target.value.toUpperCase())} 
                  className="w-full bg-white text-slate-600 border-slate-600 rounded-lg shadow-sm px-4 py-3 focus:border-red-500 focus:ring-red-500"
                  placeholder="e.g., MAKH25"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Discount Type</label>
                <DiscountTypeToggle value={discountType} onChange={setDiscountType} />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Discount Value ({discountType === 'percentage' ? '%' : '₹'})
                </label>
                <input 
                  type="number" 
                  value={discountValue} 
                  onChange={(e) => setDiscountValue(e.target.value)} 
                  className="w-full bg-slate-50 text-slate-600 border-slate-600 rounded-lg shadow-sm px-4 py-3 focus:border-red-500 focus:ring-red-500"
                  placeholder={discountType === 'percentage' ? 'e.g., 10 for 10%' : 'e.g., 100 for ₹100'}
                />
              </div>

              <button 
                type="submit" 
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-600 transition-all transform hover:scale-105"
              >
                  <Plus size={18} /> Create Coupon
              </button>
            </form>
          </div>
        </div>

        {/* Card 2: Existing Coupons Table */}
        <div className="lg:col-span-2">
          <div className="bg-slate-50 p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-bold text-black mb-6" style={{fontFamily: 'var(--font-clash)'}}>
              Active Coupons
            </h3>
            {isLoading ? (
              <div className="space-y-2">
                <div className="h-12 bg-slate-700 rounded-md animate-pulse"></div>
                <div className="h-12 bg-slate-700 rounded-md animate-pulse"></div>
                <div className="h-12 bg-slate-700 rounded-md animate-pulse"></div>
              </div>
            ) : coupons.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <Tag size={40} className="mx-auto opacity-30"/>
                    <p className="mt-4 font-semibold">No coupons found.</p>
                    <p className="text-sm">Create your first coupon to get started!</p>
                </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="border-b">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">Discount</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-slate-700 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {coupons.map((coupon) => (
                            <tr key={coupon.id} className="hover:bg-slate-200 transition-colors">
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className="px-3 py-1 text-sm text-slate-800 bg-slate-100/50 rounded-full font-black">
                                    {coupon.code}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-700 font-bold">
                                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => openDeleteConfirmation(coupon)} className="p-2 text-slate-600 hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors" aria-label={`Delete Coupon ${coupon.code}`}>
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

export default CouponManager;