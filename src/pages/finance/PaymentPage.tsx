import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CreditCard,
  Lock,
  CheckCircle,
  Shield,
  DollarSign,
  Calendar,
  User,
  Loader2
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { medfinetInvoiceApi } from '../../services/medfinetInvoiceApi';
import UserContext from '../../contexts/UserContext';

const stripePromise = loadStripe('pk_test_your_publishable_key');

interface PaymentFormProps {
  amount: number;
  description: string;
  invoiceId: string;
  onSuccess: () => void;
}

const PaymentForm = ({ amount, description, invoiceId, onSuccess }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { organizationId } = useContext(UserContext);
  const [error, setError] = useState<string | null>(null);
  const [cardComplete, setCardComplete] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [billingDetails, setBillingDetails] = useState({
    email: '',
    name: '',
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (error) {
      elements.getElement('card')?.focus();
      return;
    }

    if (cardComplete) {
      setProcessing(true);
      setError(null);
    }

    try {
      if (organizationId && invoiceId) {
        await medfinetInvoiceApi.fundInvoice(organizationId, invoiceId, {
          amount,
          funderWallet: '',
        });
      }

      setPaymentMethod({
        id: 'pm_' + Math.random().toString(36).substring(2, 15),
        created: Date.now(),
        type: 'card',
        card: {
          brand: 'visa',
          last4: '4242',
        },
      });

      setTimeout(onSuccess, 1500);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Payment failed. Please try again.',
      );
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {!paymentMethod ? (
        <>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Jane Doe"
                required
                autoComplete="name"
                value={billingDetails.name}
                onChange={(e) => {
                  setBillingDetails({ ...billingDetails, name: e.target.value });
                }}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="jane.doe@example.com"
                required
                autoComplete="email"
                value={billingDetails.email}
                onChange={(e) => {
                  setBillingDetails({ ...billingDetails, email: e.target.value });
                }}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-neutral-700 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="card" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Card Information
              </label>
              <div className="border border-neutral-300 dark:border-neutral-600 rounded-md p-3 focus-within:ring-2 focus-within:ring-primary-500 dark:bg-neutral-700">
                <CardElement
                  id="card"
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#424770',
                        '::placeholder': {
                          color: '#aab7c4',
                        },
                      },
                      invalid: {
                        color: '#9e2146',
                      },
                    },
                  }}
                  onChange={(e) => {
                    setError(e.error ? e.error.message : null);
                    setCardComplete(e.complete);
                  }}
                />
              </div>
              {error && <div className="text-sm text-error-600 mt-1">{error}</div>}
            </div>
          </div>
          <button
            type="submit"
            disabled={!stripe || processing || !cardComplete}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Pay ${amount.toFixed(2)}
              </>
            )}
          </button>
        </>
      ) : (
        <div className="text-center py-6">
          <div className="mx-auto w-16 h-16 bg-success-100 dark:bg-success-900/30 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-success-600 dark:text-success-400" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
            Payment Successful!
          </h3>
          <p className="text-neutral-600 dark:text-neutral-300 mb-6">
            Your payment has been processed successfully.
          </p>
          <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Amount:</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Card:</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">
                {paymentMethod.card.brand.toUpperCase()} •••• {paymentMethod.card.last4}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-500 dark:text-neutral-400">Date:</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-white">
                {new Date(paymentMethod.created).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState({
    amount: 0,
    description: '',
    invoiceId: '',
  });

  useEffect(() => {
    const amount = parseFloat(searchParams.get('amount') || '0');
    const invoiceId = searchParams.get('itemId') || '';
    const description = searchParams.get('description') || `Medical Invoice #${invoiceId}`;

    setPaymentDetails({
      amount,
      description,
      invoiceId,
    });
  }, [searchParams]);

  const handlePaymentSuccess = () => {
    setTimeout(() => {
      navigate('/funding/success');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Secure Payment
          </h1>
          <p className="text-neutral-600 dark:text-neutral-300">
            Complete your payment securely with Stripe
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Payment Form */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
              <Elements stripe={stripePromise}>
                <PaymentForm
                  amount={paymentDetails.amount}
                  description={paymentDetails.description}
                  invoiceId={paymentDetails.invoiceId}
                  onSuccess={handlePaymentSuccess}
                />
              </Elements>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6 sticky top-20">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                Order Summary
              </h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-300">{paymentDetails.description}</span>
                  <span className="font-medium text-neutral-900 dark:text-white">${paymentDetails.amount.toFixed(2)}</span>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4 flex justify-between">
                  <span className="font-medium text-neutral-900 dark:text-white">Total</span>
                  <span className="font-bold text-neutral-900 dark:text-white">${paymentDetails.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <Lock className="h-5 w-5 text-neutral-500 dark:text-neutral-400 mt-0.5 mr-3" />
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                      Secure Payment
                    </h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Your payment information is encrypted and secure. We never store your full card details.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 text-neutral-500 dark:text-neutral-400">
                <Shield className="h-4 w-4" />
                <span className="text-xs">SSL Encrypted</span>
                <span>•</span>
                <span className="text-xs">PCI Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
