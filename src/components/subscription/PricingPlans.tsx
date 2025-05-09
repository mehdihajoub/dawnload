import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useStripe } from '../../hooks/useStripe';
import { products } from '../../stripe-config';

interface PlanFeature {
  name: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: number;
  interval: string;
  features: PlanFeature[];
  popular?: boolean;
  priceId: string;
}

const plans: Plan[] = [
  {
    name: 'Free',
    price: 0,
    interval: 'month',
    priceId: '',
    features: [
      { name: 'Upload up to 3 projects', included: true },
      { name: '100MB storage', included: true },
      { name: 'Basic support', included: true },
      { name: 'Sell projects', included: false },
      { name: 'Premium support', included: false },
      { name: 'Unlimited projects', included: false },
    ],
  },
  {
    name: products.proPlan.name,
    price: 4.99,
    interval: 'month',
    priceId: products.proPlan.priceId,
    popular: true,
    features: [
      { name: 'Upload up to 10 projects', included: true },
      { name: '500MB storage', included: true },
      { name: 'Basic support', included: true },
      { name: 'Sell projects', included: true },
      { name: 'Premium support', included: false },
      { name: 'Unlimited projects', included: false },
    ],
  },
  {
    name: products.maxPlan.name,
    price: 19.99,
    interval: 'month',
    priceId: products.maxPlan.priceId,
    features: [
      { name: 'Unlimited projects', included: true },
      { name: 'Unlimited storage', included: true },
      { name: 'Basic support', included: true },
      { name: 'Sell projects', included: true },
      { name: 'Premium support', included: true },
      { name: 'Early access to new features', included: true },
    ],
  },
];

export function PricingPlans() {
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month');
  const { user } = useAuthStore();
  const { createCheckoutSession, loading, error } = useStripe();
  
  const getYearlyPrice = (monthlyPrice: number) => {
    const yearlyPrice = monthlyPrice * 12 * 0.8; // 20% discount
    return yearlyPrice.toFixed(2);
  };

  const handleSubscribe = async (plan: Plan) => {
    if (plan.priceId) {
      const product = Object.values(products).find(p => p.priceId === plan.priceId);
      if (product) {
        await createCheckoutSession(product);
      }
    }
  };

  return (
    <div className="py-12">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get access to premium features and grow your music production business
          </p>
          
          <div className="flex justify-center mt-8">
            <div className="bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setBillingInterval('month')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingInterval === 'month'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('year')}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
                  billingInterval === 'year'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                Yearly
                <span className="ml-1 text-xs text-green-600">Save 20%</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-lg inline-block">
              {error}
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white rounded-2xl shadow-sm ${
                plan.popular ? 'ring-2 ring-black' : 'ring-1 ring-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 mx-auto w-32 rounded-full bg-black text-white text-sm text-center py-1 font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-xl font-bold mb-4">{plan.name}</h3>
                
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">
                    ${billingInterval === 'month' ? plan.price : getYearlyPrice(plan.price)}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{billingInterval}
                  </span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300 flex-shrink-0" />
                      )}
                      <span className={feature.included ? 'text-gray-900' : 'text-gray-500'}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
                
                {user ? (
                  <button 
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading || !plan.priceId}
                    className={`w-full btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      plan.price === 0 ? 'Current Plan' : `Upgrade to ${plan.name}`
                    )}
                  </button>
                ) : (
                  <Link to="/register" className={`w-full btn ${plan.popular ? 'btn-primary' : 'btn-secondary'}`}>
                    Get Started
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}