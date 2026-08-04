import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, DollarSign, Download } from 'lucide-react';

const FundingSuccess = () => {
  const navigate = useNavigate();
  
  return (
    <div className="animate-fade-in">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-success-100">
              <CheckCircle className="h-10 w-10 text-success-600" />
            </div>
            
            <h2 className="mt-6 text-2xl font-bold text-neutral-900">Funding Successful!</h2>
            <p className="mt-2 text-neutral-600">
              Your invoice funding transaction has been successfully processed on the blockchain.
            </p>
            
            <div className="mt-8 bg-success-50 rounded-md p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-success-800">Transaction Hash</span>
                <span className="blockchain-hash">0x7d3f8a...2e9b1c</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-success-800">Amount Funded</span>
                <span className="text-success-800 font-semibold">$300.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-success-800">Status</span>
                <span className="badge-success">Confirmed</span>
              </div>
            </div>
            
            <div className="mt-8 flex flex-col space-y-4">
              <button
                onClick={() => navigate('/invoice/marketplace')}
                className="btn-primary flex items-center justify-center"
              >
                View More Invoices
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-outline flex items-center justify-center"
              >
                Back to Dashboard
              </button>
              
              <button
                className="text-primary-600 flex items-center justify-center mt-4 hover:underline"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Transaction Receipt
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">What happens next?</h3>
          <ul className="space-y-3">
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium text-primary-800">1</span>
              </div>
              <p className="text-sm text-neutral-700">
                Your funds are held in a secure escrow smart contract
              </p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium text-primary-800">2</span>
              </div>
              <p className="text-sm text-neutral-700">
                The healthcare provider is notified of the funding
              </p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium text-primary-800">3</span>
              </div>
              <p className="text-sm text-neutral-700">
                When the invoice is paid by the original payer, you receive your principal plus interest
              </p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary-100 flex items-center justify-center mr-3 mt-0.5">
                <span className="text-xs font-medium text-primary-800">4</span>
              </div>
              <p className="text-sm text-neutral-700">
                All transactions are recorded on the blockchain for transparency and security
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default FundingSuccess;