import { FileCheck } from 'lucide-react';

interface BlockchainHashProps {
  hash: string;
  label?: string;
  verified?: boolean;
}

const BlockchainHash = ({ hash, label = 'Blockchain Hash', verified = true }: BlockchainHashProps) => {
  // Format hash to show only beginning and end
  const formattedHash = hash.length > 16 
    ? `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`
    : hash;

  return (
    <div className="flex flex-col">
      <span className="text-xs text-neutral-500 mb-1">{label}</span>
      <div className="flex items-center">
        <span className="blockchain-hash mr-2">{formattedHash}</span>
        {verified && (
          <span className="inline-flex items-center text-success-600" title="Verified on blockchain">
            <FileCheck className="h-4 w-4" />
          </span>
        )}
      </div>
    </div>
  );
};

export default BlockchainHash;