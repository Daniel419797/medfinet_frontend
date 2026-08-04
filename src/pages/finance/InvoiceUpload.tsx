import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, DollarSign, User, Calendar, FileText, Loader2 } from 'lucide-react';

const InvoiceUpload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    service: '',
    amount: '',
    payer: '',
    dueDate: '',
    notes: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isTokenizing, setIsTokenizing] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsUploading(true);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsUploading(false);
    setIsTokenizing(true);
    
    // Simulate tokenization delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Navigate to success page
    navigate('/invoice/1');
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Upload & Tokenize Medical Invoice</h1>
        <p className="text-neutral-600">Convert your medical invoices into blockchain-verified tokens</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Invoice Document
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-neutral-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-neutral-400" />
                    <div className="flex text-sm text-neutral-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-neutral-500">
                      PDF, JPG, or PNG up to 10MB
                    </p>
                    {file && (
                      <p className="text-sm text-primary-600 font-medium mt-2">
                        Selected: {file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              <div>
                <label htmlFor="service" className="block text-sm font-medium text-neutral-700 mb-1">
                  Service Rendered
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    name="service"
                    id="service"
                    required
                    className="input pl-10"
                    placeholder="e.g. Annual Check-up, Dental Cleaning"
                    value={formData.service}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-neutral-700 mb-1">
                  Amount
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    name="amount"
                    id="amount"
                    required
                    className="input pl-10"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="payer" className="block text-sm font-medium text-neutral-700 mb-1">
                  Payer
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="text"
                    name="payer"
                    id="payer"
                    className="input pl-10"
                    placeholder="Insurance company or self-pay"
                    value={formData.payer}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-neutral-700 mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    type="date"
                    name="dueDate"
                    id="dueDate"
                    required
                    className="input pl-10"
                    value={formData.dueDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="notes" className="block text-sm font-medium text-neutral-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  id="notes"
                  rows={3}
                  className="input"
                  placeholder="Any additional information about this invoice"
                  value={formData.notes}
                  onChange={handleChange}
                ></textarea>
              </div>
              
              <div className="md:col-span-2">
                <div className="bg-primary-50 rounded-md p-4">
                  <h3 className="text-sm font-medium text-primary-800 mb-2">Blockchain Tokenization Benefits</h3>
                  <ul className="text-sm text-primary-700 space-y-1">
                    <li>• Secure, immutable record of your medical invoice</li>
                    <li>• Opportunity for early payment through invoice financing</li>
                    <li>• Transparent tracking of payment status</li>
                    <li>• Verifiable proof of healthcare services rendered</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={isUploading || isTokenizing}
                className="btn-primary flex items-center"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : isTokenizing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Tokenizing on Blockchain...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Tokenize Invoice
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InvoiceUpload;