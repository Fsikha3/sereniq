import React from 'react';
import { motion } from 'motion/react';
import { Check, Lock, Crown, Users, Building, ShieldCheck } from 'lucide-react';

interface PlanProps {
  title: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  onSelect: () => void;
  badge?: string;
  icon: React.ReactNode;
}

const PlanCard = ({ title, price, features, highlighted, onSelect, badge, icon }: PlanProps) => (
  <div className={`relative p-6 rounded-3xl border-2 transition-all ${highlighted ? 'border-amber-400 bg-slate-900 text-white scale-105 shadow-2xl shadow-amber-400/20' : 'border-slate-100 bg-white text-slate-900'}`}>
    {badge && (
      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
        {badge}
      </span>
    )}
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${highlighted ? 'bg-amber-400/20 text-amber-400' : 'bg-mood-purple/10 text-mood-purple'}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold">{title}</h3>
    </div>
    <div className="mb-6">
      <span className="text-3xl font-bold">{price}</span>
      {price !== 'Free' && <span className="text-sm opacity-60">/month</span>}
    </div>
    <ul className="space-y-3 mb-8">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <Check className={`w-4 h-4 mt-0.5 shrink-0 ${highlighted ? 'text-amber-400' : 'text-mood-purple'}`} />
          <span className="opacity-80">{f}</span>
        </li>
      ))}
    </ul>
    <button 
      onClick={onSelect}
      className={`w-full py-3 rounded-xl font-bold transition-all active:scale-95 ${highlighted ? 'bg-amber-400 text-slate-900 hover:bg-amber-300' : 'bg-mood-purple text-white hover:bg-mood-purple/90'}`}
    >
      {price === 'Free' ? 'Current Plan' : 'Start 7-Day Free Trial'}
    </button>
  </div>
);

export const MonetizationScreen = ({ onUpgrade }: { onUpgrade: () => void }) => {
  return (
    <div className="space-y-8 pb-24">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900">Invest In Your Brain</h2>
        <p className="text-slate-500">Unlock full metabolic healing protocols</p>
      </div>

      <div className="space-y-6">
        <PlanCard 
          title="Free"
          price="Free"
          icon={<Check className="w-6 h-6" />}
          features={[
            'Basic mood tracking (7 days)',
            '3 food scans per day',
            'Basic panic attack tools',
            'Honey sleep hack guide'
          ]}
          onSelect={() => {}}
        />

        <PlanCard 
          title="Premium"
          price="₹299"
          highlighted
          badge="Most Popular"
          icon={<Crown className="w-6 h-6" />}
          features={[
            'Unlimited mood tracking + history',
            'Unlimited food scans & analysis',
            '90-day brain healing protocol',
            'Indian Keto meal plans',
            'Weekly brain health reports',
            'AI Brain Coach insights'
          ]}
          onSelect={onUpgrade}
        />

        <PlanCard 
          title="Family"
          price="₹799"
          icon={<Users className="w-6 h-6" />}
          features={[
            'Up to 5 family members',
            'Individual profiles',
            'Shared family dashboard',
            'Elder care features'
          ]}
          onSelect={onUpgrade}
        />
      </div>

      <div className="p-6 bg-white rounded-3xl border border-slate-100 space-y-4">
        <div className="flex items-center gap-3 text-emerald-600">
          <ShieldCheck className="w-6 h-6" />
          <span className="font-bold">Secured by Razorpay</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your payment is 256-bit encrypted. Cancel anytime. 30-day money back guarantee if you don't feel a difference in your brain energy.
        </p>
      </div>
    </div>
  );
};
