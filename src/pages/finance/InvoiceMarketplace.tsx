import { useCallback, useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, DollarSign, Filter, Calendar, Building, ArrowUpDown } from 'lucide-react';
import { TokenizedInvoice } from '../../types';
import BlockchainHash from '../../components/common/BlockchainHash';
import { medfinetInvoiceApi } from '../../services/medfinetInvoiceApi';
import UserContext from '../../contexts/UserContext';

const InvoiceMarketplace = () => {
  const { organizationId } = useContext(UserContext);
  const [invoices, setInvoices] = useState<TokenizedInvoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('dueDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organizationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await medfinetInvoiceApi.listMarketplace(organizationId);
      setInvoices(data as TokenizedInvoice[]);
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Unable to load marketplace invoices',
      );
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterStatus(e.target.value);
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredInvoices = invoices
    .filter(invoice => {
      const matchesSearch =
        invoice.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.patientName && invoice.patientName.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus =
        filterStatus === 'all' ||
        invoice.status === filterStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const fieldA = a[sortField as keyof TokenizedInvoice];
      const fieldB = b[sortField as keyof TokenizedInvoice];

      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc'
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      } else if (typeof fieldA === 'number' && typeof fieldB === 'number') {
        return sortDirection === 'asc'
          ? fieldA - fieldB
          : fieldB - fieldA;
      }

      return 0;
    });

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Invoice Marketplace</h1>
          <p className="text-neutral-600">Browse and fund tokenized medical invoices</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Invoice Marketplace</h1>
          <p className="text-neutral-600">Browse and fund tokenized medical invoices</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <DollarSign className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">Unable to load invoices</h3>
          <p className="text-neutral-600 mb-4">{error}</p>
          <button onClick={load} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-neutral-900">Invoice Marketplace</h1>
        <p className="text-neutral-600">Browse and fund tokenized medical invoices</p>
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-neutral-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-neutral-400" />
            </div>
            <select
              className="input pl-10 appearance-none"
              value={filterStatus}
              onChange={handleStatusFilter}
            >
              <option value="all">All Statuses</option>
              <option value="tokenized">Tokenized</option>
              <option value="funded">Funded</option>
            </select>
          </div>

          <div className="text-right">
            <span className="text-sm text-neutral-600">
              Showing {filteredInvoices.length} invoices
            </span>
          </div>
        </div>
      </div>

      {/* Invoice list */}
      {filteredInvoices.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200">
              <thead>
                <tr className="bg-neutral-50">
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('providerName')}
                  >
                    <div className="flex items-center">
                      <span>Provider</span>
                      {sortField === 'providerName' && (
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('service')}
                  >
                    <div className="flex items-center">
                      <span>Service</span>
                      {sortField === 'service' && (
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center">
                      <span>Amount</span>
                      {sortField === 'amount' && (
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('dueDate')}
                  >
                    <div className="flex items-center">
                      <span>Due Date</span>
                      {sortField === 'dueDate' && (
                        <ArrowUpDown className="h-4 w-4 ml-1" />
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <Building className="h-5 w-5 text-primary-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-neutral-900">{invoice.providerName}</div>
                          <div className="text-xs text-neutral-500 truncate max-w-[150px]">
                            {invoice.tokenId && (
                              <BlockchainHash hash={invoice.tokenId} label="Token ID" />
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-neutral-900">{invoice.service}</div>
                      {invoice.patientName && (
                        <div className="text-xs text-neutral-500">Patient: {invoice.patientName}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-neutral-900">
                        ${invoice.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-neutral-500">
                        Min: ${invoice.fundingOptions.minFundingAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-neutral-500 mr-1" />
                        <div className="text-sm text-neutral-900">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">
                        {invoice.fundingOptions.fundingPeriod} day term
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${invoice.status === 'tokenized' ? 'bg-primary-100 text-primary-800' :
                          invoice.status === 'funded' ? 'bg-success-100 text-success-800' :
                          'bg-neutral-100 text-neutral-800'}`}
                      >
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {invoice.status === 'tokenized' ? (
                        <Link
                          to={`/invoice/${invoice.id}`}
                          className="btn-primary text-xs py-1 px-3"
                        >
                          Fund Invoice
                        </Link>
                      ) : (
                        <Link
                          to={`/invoice/${invoice.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View Details
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <DollarSign className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900 mb-2">No invoices found</h3>
          <p className="text-neutral-600 mb-4">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'No tokenized invoices are available in the marketplace'}
          </p>
        </div>
      )}
    </div>
  );
};

export default InvoiceMarketplace;
