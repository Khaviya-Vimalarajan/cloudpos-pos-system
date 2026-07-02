import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../store/authSlice';
import { 
  Building, Settings as SettingsIcon, CreditCard, Shield, 
  MapPin, Clock, BadgePercent, Landmark, Check
} from 'lucide-react';
import api from '../../utils/api';

export default function Settings() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // States
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('profile'); // profile, subscription, taxes

  // Profile fields
  const [businessName, setBusinessName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');

  // Tax settings
  const [taxRate, setTaxRate] = useState('10');
  const [taxType, setTaxType] = useState('VAT');
  const [subscriptionPlan, setSubscriptionPlan] = useState('Free');

  // Load business settings on mount
  useEffect(() => {
    const fetchBusiness = async () => {
      if (user && user.role !== 'SuperAdmin' && user.businessId) {
        try {
          const { data } = await api.get('/reports/business');
          if (data) {
            setBusinessName(data.name || '');
            setCurrency(data.currency || 'USD');
            setTimezone(data.timeZone || 'UTC');
            setStreet(data.address?.street || '');
            setCity(data.address?.city || '');
            setCountry(data.address?.country || '');
            setTaxRate(String(data.taxSettings?.rate ?? '0'));
            setTaxType(data.taxSettings?.type || 'VAT');
            setSubscriptionPlan(data.subscriptionPlan || 'Free');
          }
        } catch (e) {
          console.error(e);
        }
      }
    };
    fetchBusiness();
  }, [user]);

  // Handle updates
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/reports/business', {
        name: businessName,
        currency,
        timeZone: timezone,
        address: { street, city, country },
        taxSettings: { rate: parseFloat(taxRate) || 0, type: taxType }
      });
      alert('Business configurations saved successfully!');
    } catch (e) {
      console.error(e);
      alert('Failed to save settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    setLoading(true);
    try {
      await api.put('/reports/business', {
        subscriptionPlan: plan
      });
      setSubscriptionPlan(plan);
      alert(`Thank you for choosing the ${plan} Plan! This subscription is now active.`);
    } catch (e) {
      console.error(e);
      alert('Failed to update subscription.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="border-b pb-4 dark:border-slate-800">
        <h1 className="text-lg font-bold tracking-tight text-slate-850 dark:text-slate-100">System Settings</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage company metadata, configure taxes, and audit subscription levels</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* SETTINGS MENU */}
        <div className="glass-card p-4 h-fit shadow-sm space-y-1">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border ${
              activeSubTab === 'profile' 
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20' 
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <Building className="h-4.5 w-4.5" />
            Company Profile
          </button>
          
          <button
            onClick={() => setActiveSubTab('taxes')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border ${
              activeSubTab === 'taxes' 
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20' 
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <BadgePercent className="h-4.5 w-4.5" />
            Tax & Currency
          </button>

          <button
            onClick={() => setActiveSubTab('subscription')}
            className={`flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all border ${
              activeSubTab === 'subscription' 
                ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border-brand-500/20' 
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="h-4.5 w-4.5" />
            SaaS Subscriptions
          </button>
        </div>

        {/* SETTINGS PANELS */}
        <div className="md:col-span-3">
          
          {/* PROFILE PANEL */}
          {activeSubTab === 'profile' && (
            <div className="glass-card p-6 shadow-sm">
              <h4 className="text-sm font-semibold mb-4 border-b pb-2 dark:border-slate-800 flex items-center gap-2">
                <Building className="h-4.5 w-4.5 text-brand-500" />
                Store details
              </h4>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Business / Trade Name</label>
                    <input
                      type="text"
                      required
                      value={businessName || 'My Outlet Store'}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="E.g. Acme Corp"
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Store Time Zone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                    >
                      <option value="UTC">UTC (Universal Coordinated)</option>
                      <option value="EST">EST (Eastern Standard Time)</option>
                      <option value="GMT">GMT (London Standard)</option>
                      <option value="IST">IST (Indian Standard Time)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Street Address</label>
                    <input
                      type="text"
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      placeholder="123 Retail Plaza"
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="New York"
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="United States"
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-500 text-white font-semibold text-xs px-5 py-2.5 hover:bg-brand-600 shadow-md"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAXES PANEL */}
          {activeSubTab === 'taxes' && (
            <div className="glass-card p-6 shadow-sm">
              <h4 className="text-sm font-semibold mb-4 border-b pb-2 dark:border-slate-800 flex items-center gap-2">
                <BadgePercent className="h-4.5 w-4.5 text-brand-500" />
                Tax Configurations
              </h4>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Tax Code / Type</label>
                    <select
                      value={taxType}
                      onChange={(e) => setTaxType(e.target.value)}
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                    >
                      <option value="VAT">VAT (Value Added Tax)</option>
                      <option value="GST">GST (Goods and Services)</option>
                      <option value="SalesTax">Standard Sales Tax</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Tax Rate (%)</label>
                    <input
                      type="number"
                      required
                      value={taxRate}
                      onChange={(e) => setTaxRate(e.target.value)}
                      placeholder="10"
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase">Base Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-xl bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 text-xs outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="INR">INR (₹)</option>
                    </select>
                  </div>
                </div>

                <div className="border-t pt-4 dark:border-slate-800 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-brand-500 text-white font-semibold text-xs px-5 py-2.5 hover:bg-brand-600 shadow-md"
                  >
                    Save Tax Rates
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SUBSCRIPTION PANEL */}
          {activeSubTab === 'subscription' && (
            <div className="space-y-6">
                        <div className="glass-card p-6 shadow-sm">
                <h4 className="text-sm font-semibold mb-2">Active Subscription Level</h4>
                <p className="text-xs text-slate-450 mb-4">You are currently on the **{subscriptionPlan} Plan**.</p>
                <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-2xl p-4 flex justify-between items-center text-xs">
                  <div>
                    <span className="block font-bold">{subscriptionPlan} Plan Billing Tier</span>
                    <span className="block text-[10px] text-slate-400">
                      {subscriptionPlan === 'Free' && 'Limited to 1 store location, 2 staff accounts, and 500 items'}
                      {subscriptionPlan === 'Professional' && 'Unlimited products, employees, branches, and advanced reports'}
                      {subscriptionPlan === 'Enterprise' && 'Unlimited everything, 24/7 dedicated support, priority server bandwidth'}
                    </span>
                  </div>
                  <span className="text-xs font-extrabold text-brand-500">Active</span>
                </div>
              </div>

              {/* Plans Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Free */}
                <div className="glass-card p-5 shadow-sm border border-slate-200/60 dark:border-slate-800/50 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="block font-bold text-xs uppercase text-slate-400">Free starter</span>
                    <h3 className="text-2xl font-extrabold">$0 <span className="text-xs font-normal text-slate-400">/mo</span></h3>
                    <ul className="text-[10px] space-y-1.5 text-slate-500 pt-3">
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> 1 Store Outlet</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> 2 Staff Accounts</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> 500 Products</li>
                    </ul>
                  </div>
                  <button
                    disabled={subscriptionPlan === 'Free'}
                    onClick={() => handleUpgrade('Free')}
                    className={`w-full mt-6 rounded-xl py-2 text-xs font-bold transition-all ${
                      subscriptionPlan === 'Free'
                        ? 'border border-slate-250 dark:border-slate-750 text-slate-400 pointer-events-none'
                        : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {subscriptionPlan === 'Free' ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>

                {/* Professional */}
                <div className="glass-card p-5 shadow-sm border-2 border-brand-500 flex flex-col justify-between relative">
                  <span className="absolute -top-3 right-4 px-2 py-0.5 rounded-full bg-brand-500 text-[8px] font-bold text-white uppercase tracking-wider">
                    Popular
                  </span>
                  <div className="space-y-2">
                    <span className="block font-bold text-xs uppercase text-brand-500">Professional</span>
                    <h3 className="text-2xl font-extrabold">$49 <span className="text-xs font-normal text-slate-400">/mo</span></h3>
                    <ul className="text-[10px] space-y-1.5 text-slate-500 pt-3">
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Unlimited Products</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Unlimited Employees</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Multi-Branch Support</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Advanced Reports</li>
                    </ul>
                  </div>
                  <button
                    disabled={subscriptionPlan === 'Professional'}
                    onClick={() => handleUpgrade('Professional')}
                    className={`w-full mt-6 rounded-xl py-2 text-xs font-bold transition-all ${
                      subscriptionPlan === 'Professional'
                        ? 'border border-slate-250 dark:border-slate-750 text-slate-400 pointer-events-none'
                        : 'bg-brand-500 hover:bg-brand-600 text-white py-2 text-xs font-bold shadow-md shadow-brand-500/20'
                    }`}
                  >
                    {subscriptionPlan === 'Professional' ? 'Current Plan' : 'Upgrade Now'}
                  </button>
                </div>

                {/* Enterprise */}
                <div className="glass-card p-5 shadow-sm border border-slate-200/60 dark:border-slate-800/50 flex flex-col justify-between">
                  <div className="space-y-2">
                    <span className="block font-bold text-xs uppercase text-slate-400">Enterprise custom</span>
                    <h3 className="text-2xl font-extrabold">$199 <span className="text-xs font-normal text-slate-400">/mo</span></h3>
                    <ul className="text-[10px] space-y-1.5 text-slate-500 pt-3">
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Unlimited Everything</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> API Access Keys</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> 24/7 Dedicated Support</li>
                      <li className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-500" /> Priority Server Bandwidth</li>
                    </ul>
                  </div>
                  <button
                    disabled={subscriptionPlan === 'Enterprise'}
                    onClick={() => handleUpgrade('Enterprise')}
                    className={`w-full mt-6 rounded-xl py-2 text-xs font-bold transition-all ${
                      subscriptionPlan === 'Enterprise'
                        ? 'border border-slate-250 dark:border-slate-750 text-slate-400 pointer-events-none'
                        : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {subscriptionPlan === 'Enterprise' ? 'Current Plan' : 'Select Plan'}
                  </button>
                </div>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
