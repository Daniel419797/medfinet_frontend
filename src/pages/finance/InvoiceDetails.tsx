import { useCallback, useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DollarSign,
  Building,
  Calendar,
  User,
  Clock,
  FileText,
  Shield,
  Download,
  ArrowRight,
  ExternalLink,
  Loader2,
  CheckCircle
} from 'lucide-react';
import { TokenizedInvoice } from '../../types';
import BlockchainHash from '../../components/common/BlockchainHash';
import { medfinetInvoiceApi } from '../../services/medfinetInvoiceApi';
import UserContext from '../../contexts/UserContext';

const InvoiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { organizationId } = useContext(UserContext);
  const [invoice, setInvoice] = useState<TokenizedInvoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fundingAmount, setFundingAmount] = useState('');
  const [isFunding, setIsFunding] = useState(false);

  const load = useCallback(async () => {
    if (!organizationId || !id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await medfinetInvoiceApi.getInvoice(organizationId, id);
      const inv = data as TokenizedInvoice;
      setInvoice(inv);
      setFundingAmount(inv.fundingOptions.minFundingAmount.toString());
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Unable to load invoice details',
      );
    } finally {
      setIsLoading(false);
    }
  }, [organizationId, id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleFundInvoice = async () => {
    if (!invoice || !organizationId) return;

    setIsFunding(true);
    setError(null);
    try {
      await medfinetInvoiceApi.fundInvoice(organizationId, invoice.id, {
        amount: Number(fundingAmount),
        funderWallet: '',
      });
      navigate('/funding/success');
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Unable to fund invoice',
      );
    } finally {
      setIsFunding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">Invoice not found</h3>
        <p className="text-neutral-600 mb-4">{error}</p>
        <button onClick={load} className="btn-primary">
          Retry
        </button>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-neutral-900 mb-2">Invoice not found</h3>
        <p className="text-neutral-600 mb-6">The requested invoice does not exist or has been removed</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Medical Invoice Details</h1>
          <p className="text-neutral-600">Review and fund this tokenized invoice</p>
        </div>

        <div className="mt-4 md:mt-0 flex items-center">
          <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full
            ${invoice.status === 'tokenized' ? 'bg-primary-100 text-primary-800' :
              invoice.status === 'funded' ? 'bg-success-100 text-success-800' :
              'bg-neutral-100 text-neutral-800'}`}
          >
            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-error-50 border border-error-200 rounded-lg p-4">
          <p className="text-error-800 text-sm">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Invoice details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">Invoice Information</h2>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Building className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-neutral-500">Healthcare Provider</h3>
                      <p className="text-base font-semibold text-neutral-900">{invoice.providerName}</p>
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-10 w-10 bg-secondary-100 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-secondary-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-neutral-500">Service Rendered</h3>
                      <p className="text-base font-semibold text-neutral-900">{invoice.service}</p>
                    </div>
                  </div>

                  {invoice.patientName && (
                    <div className="flex items-center mb-4">
                      <div className="flex-shrink-0 h-10 w-10 bg-neutral-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-neutral-600" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-sm font-medium text-neutral-500">Patient</h3>
                        <p className="text-base font-semibold text-neutral-900">{invoice.patientName}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-10 w-10 bg-accent-100 rounded-full flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-accent-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-neutral-500">Invoice Amount</h3>
                      <p className="text-base font-semibold text-neutral-900">
                        ${invoice.amount.toLocaleString()} {invoice.currency}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-10 w-10 bg-warning-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-warning-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-neutral-500">Issue Date</h3>
                      <p className="text-base font-semibold text-neutral-900">
                        {new Date(invoice.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 h-10 w-10 bg-error-100 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-error-600" />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-neutral-500">Due Date</h3>
                      <p className="text-base font-semibold text-neutral-900">
                        {new Date(invoice.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-neutral-200 pt-6">
                <h3 className="text-sm font-medium text-neutral-900 mb-3">Blockchain Information</h3>
                <div className="bg-neutral-50 p-4 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <BlockchainHash hash={invoice.tokenId} label="Token ID" />
                    </div>
                    <div>
                      <BlockchainHash hash={invoice.blockchainHash || ''} label="Transaction Hash" />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button className="text-primary-600 text-sm font-medium flex items-center hover:text-primary-800">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View on Blockchain Explorer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Funding panel */}
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden sticky top-20">
            <div className="border-b border-neutral-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-neutral-900">Fund This Invoice</h2>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-neutral-700">Invoice Amount</span>
                  <span className="text-lg font-bold text-neutral-900">${invoice.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-neutral-700">Minimum Funding</span>
                  <span className="text-neutral-900">${invoice.fundingOptions.minFundingAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-neutral-700">Interest Rate</span>
                  <span className="text-neutral-900">{invoice.fundingOptions.interestRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-neutral-700">Funding Period</span>
                  <span className="text-neutral-900">{invoice.fundingOptions.fundingPeriod} days</span>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-6">
                <label htmlFor="fundingAmount" className="block text-sm font-medium text-neutral-700 mb-2">
                  Funding Amount
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    name="fundingAmount"
                    id="fundingAmount"
                    className="input pl-10"
                    value={fundingAmount}
                    onChange={(e) => setFundingAmount(e.target.value)}
                    disabled={invoice.status !== 'tokenized' || isFunding}
                  />
                </div>

                <div className="mt-8">
                  {invoice.status === 'tokenized' ? (
                    <button
                      onClick={handleFundInvoice}
                      disabled={isFunding}
                      className="btn-primary w-full flex justify-center items-center"
                    >
                      {isFunding ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing Blockchain Transaction...
                        </>
                      ) : (
                        <>
                          Fund Invoice
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="bg-success-50 text-success-800 p-4 rounded-md text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                      <p className="font-medium">This invoice has been funded</p>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-xs text-neutral-500">
                  <p className="mb-1">
                    By funding this invoice, you agree to the terms and conditions of the funding agreement.
                  </p>
                  <p>
                    Your funds will be securely held in an escrow account until the invoice is paid by the original payer.
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-200">
                <div className="flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary-600 mr-2" />
                  <span className="text-sm font-medium text-primary-800">Secured by Blockchain Technology</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceDetails;
