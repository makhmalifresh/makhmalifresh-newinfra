import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { 
  Store, 
  CreditCard, 
  Zap, 
  Truck, 
  Save,
  Loader,
  ChevronDown,
  Power,
  Info
} from 'lucide-react';
import api from '../../api';

const StoreSettings = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [platformFee, setPlatformFee] = useState('');
  const [surgeFee, setSurgeFee] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [deliveryMode, setDeliveryMode] = useState('');
  const [savingStates, setSavingStates] = useState({
    status: false,
    platformFee: false,
    surgeFee: false,
    deliveryMode: false
  });

  const deliveryModes = [
    { value: 'manual', label: 'Manual Selection', description: 'You manually choose the delivery partner for every order.' },
    { value: 'borzo_only', label: 'Borzo Only', description: 'System automatically assigns Borzo to all delivery orders.' },
    { value: 'porter_only', label: 'Porter Only', description: 'System automatically assigns Porter to all delivery orders.' },
    { value: 'automatic_cheapest', label: 'Auto (Cost Optimized)', description: 'System compares prices and selects the cheapest partner automatically.' }
  ];

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      try {
        const [statusRes, feeRes, surgeRes, deliveryModeRes] = await Promise.all([
          api.get('/settings/store-status'),
          api.get('/settings/platform-fee'),
          api.get('/settings/surge-fee'),
          api.get('/settings/delivery-mode')
        ]);

        setIsOpen(statusRes.data.setting_value === 'true');
        setPlatformFee(feeRes.data.setting_value);
        setSurgeFee(surgeRes.data.setting_value);
        setDeliveryMode(deliveryModeRes.data.setting_value);

      } catch (error) {
        toast.error('Failed to fetch store settings.');
        console.error('Fetch settings error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = async () => {
    const newStatus = !isOpen;
    setIsOpen(newStatus);
    setSavingStates(prev => ({ ...prev, status: true }));

    try {
      await api.put('/admin/settings/store-status', { isOpen: newStatus });
      toast.success(`Store is now ${newStatus ? 'Online' : 'Offline'}.`);
    } catch (error) {
      toast.error('Failed to update store status.');
      setIsOpen(!newStatus);
    } finally {
      setSavingStates(prev => ({ ...prev, status: false }));
    }
  };

  const handleSaveFee = async (e, type) => {
    e.preventDefault();
    const value = parseInt(type === 'platform' ? platformFee : surgeFee, 10);

    if (isNaN(value) || value < 0) {
      toast.error("Please enter a valid non-negative number.");
      return;
    }

    setSavingStates(prev => ({ ...prev, [`${type}Fee`]: true }));

    try {
      const endpoint = type === 'platform' ? '/admin/settings/platform-fee' : '/admin/settings/surge-fee';
      const data = type === 'platform' ? { fee: value } : { surge: value };
      
      await api.put(endpoint, data);
      toast.success(`${type === 'platform' ? 'Platform' : 'Surge'} fee updated!`);
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to update ${type} fee.`);
    } finally {
      setSavingStates(prev => ({ ...prev, [`${type}Fee`]: false }));
    }
  };

  const handleDeliveryModeSave = async (e) => {
    e.preventDefault();
    setSavingStates(prev => ({ ...prev, deliveryMode: true }));

    try {
      await api.put('/admin/settings/delivery-mode', { delivery_mode: deliveryMode });
      toast.success("Delivery mode updated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update delivery mode.");
    } finally {
      setSavingStates(prev => ({ ...prev, deliveryMode: false }));
    }
  };

  // Reusable Components for UI Consistency
  const SectionHeader = ({ icon: Icon, title, subtitle }) => (
    <div className="flex items-start gap-4 mb-6">
      <div className="p-3 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-inner shrink-0">
        <Icon size={22} className="text-gray-700" />
      </div>
      <div>
        <h3 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h3>
        <p className="text-sm text-gray-500 leading-relaxed mt-0.5">{subtitle}</p>
      </div>
    </div>
  );

  const StyledButton = ({ loading, children, onClick }) => (
    <button
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
      disabled={loading}
      className="w-full group relative overflow-hidden rounded-xl bg-[#800020] py-3.5 px-4 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition-all duration-300 hover:bg-[#600018] hover:shadow-red-900/30 disabled:cursor-not-allowed disabled:opacity-70 active:scale-[0.98]"
    >
      <div className="flex items-center justify-center gap-2">
        {loading ? (
          <>
            <Loader size={16} className="animate-spin text-white/80" />
            <span>Processing...</span>
          </>
        ) : (
          children
        )}
      </div>
    </button>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader size={40} className="animate-spin text-[#800020]" />
          <p className="text-gray-500 font-medium animate-pulse">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa] p-1 md:p-1 lg:p-1 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-gray-200/60">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-gray-900">
              Store Configuration
            </h1>
            <p className="text-gray-500 mt-2 text-base">
              Manage your store's operational parameters and fees.
            </p>
          </div>
          
          {/* Quick Status Indicators */}
          <div className="flex flex-wrap gap-3">
            <div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${isOpen ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              Status: {isOpen ? 'Online' : 'Closed'}
            </div>
            <div className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border bg-white text-gray-600 border-gray-200">
              Mode: {deliveryModes.find(m => m.value === deliveryMode)?.label.split(' ')[0] || '...'}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          
          {/* 1. Store Status Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow duration-300"
          >
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${isOpen ? 'from-green-50 to-transparent' : 'from-red-50 to-transparent'} rounded-bl-full opacity-50 transition-colors duration-500`} />
            
            <SectionHeader 
              icon={Store} 
              title="Store Availability" 
              subtitle="Control the master switch for your online ordering system."
            />

            <div className="mt-8 flex items-center justify-between bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${isOpen ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'} transition-colors duration-300`}>
                  <Power size={20} />
                </div>
                <div>
                  <p className="font-bold text-gray-900">{isOpen ? 'Accepting Orders' : 'Store Closed'}</p>
                  <p className="text-xs text-gray-500 font-medium">{isOpen ? 'Visible to customers' : 'Hidden from customers'}</p>
                </div>
              </div>

              <button
                onClick={handleToggle}
                disabled={savingStates.status}
                className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#800020] focus:ring-offset-2 ${isOpen ? 'bg-[#800020]' : 'bg-gray-200'}`}
              >
                <span className="sr-only">Use setting</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${isOpen ? 'translate-x-6' : 'translate-x-0'}`}
                />
              </button>
            </div>
          </motion.div>

          {/* 2. Delivery Mode Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
          >
            <SectionHeader 
              icon={Truck} 
              title="Delivery Logic" 
              subtitle="Configure how delivery partners are assigned to orders."
            />
            
            <form onSubmit={handleDeliveryModeSave} className="mt-6 space-y-4">
              <div className="relative">
                <select
                  value={deliveryMode}
                  onChange={(e) => setDeliveryMode(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#800020] focus:border-[#800020] block w-full p-4 pr-10 font-semibold transition-all hover:border-gray-300 cursor-pointer shadow-sm"
                >
                  {deliveryModes.map(mode => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
              </div>

              {/* Description Box */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 flex gap-3">
                <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 leading-snug">
                  {deliveryModes.find(mode => mode.value === deliveryMode)?.description}
                </p>
              </div>

              <div className="pt-2">
                <StyledButton loading={savingStates.deliveryMode}>
                  <Save size={18} /> Save Configuration
                </StyledButton>
              </div>
            </form>
          </motion.div>

          {/* 3. Platform Fee Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
          >
            <SectionHeader 
              icon={CreditCard} 
              title="Platform Fee" 
              subtitle="Fixed operational fee added to every customer order."
            />

            <form onSubmit={(e) => handleSaveFee(e, 'platform')} className="mt-8 space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-medium text-lg">₹</span>
                </div>
                <input
                  type="number"
                  value={platformFee}
                  onChange={(e) => setPlatformFee(e.target.value)}
                  className="block w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-gray-100 text-gray-900 rounded-xl focus:bg-white focus:ring-0 focus:border-[#800020] transition-all text-lg font-bold placeholder-gray-300"
                  placeholder="0"
                  min="0"
                />
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-bold text-[#800020] uppercase tracking-wider">
                  Amount (INR)
                </label>
              </div>
              
              <StyledButton loading={savingStates.platformFee}>
                <Save size={18} /> Update Platform Fee
              </StyledButton>
            </form>
          </motion.div>

          {/* 4. Surge Fee Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
          >
            <SectionHeader 
              icon={Zap} 
              title="Surge Fee" 
              subtitle="Extra charge for high-demand periods or bad weather."
            />

            <form onSubmit={(e) => handleSaveFee(e, 'surge')} className="mt-8 space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-gray-400 font-medium text-lg">₹</span>
                </div>
                <input
                  type="number"
                  value={surgeFee}
                  onChange={(e) => setSurgeFee(e.target.value)}
                  className="block w-full pl-10 pr-4 py-4 bg-gray-50 border-2 border-gray-100 text-gray-900 rounded-xl focus:bg-white focus:ring-0 focus:border-[#800020] transition-all text-lg font-bold placeholder-gray-300"
                  placeholder="0"
                  min="0"
                />
                <label className="absolute -top-2.5 left-4 bg-white px-2 text-xs font-bold text-[#800020] uppercase tracking-wider">
                  Amount (INR)
                </label>
              </div>

              <StyledButton loading={savingStates.surgeFee}>
                <Save size={18} /> Update Surge Fee
              </StyledButton>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default StoreSettings;