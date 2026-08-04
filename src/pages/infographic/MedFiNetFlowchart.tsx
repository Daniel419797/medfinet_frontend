import React from 'react';
import { ArrowRight, Users, Building2, Smartphone, Shield, Coins, Database, Lock, TrendingUp, FileText, Activity } from 'lucide-react';

const MedFiNetFlowchart: React.FC = () => {
  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">MedFiNet DeFi Ecosystem</h1>
          <p className="text-lg text-gray-600">Powered by Algorand Blockchain</p>
        </div>

        <svg viewBox="0 0 1200 1400" className="w-full" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#000" />
            </marker>
          </defs>

          <rect x="400" y="50" width="400" height="1300" fill="#f8f9fa" stroke="#000" strokeWidth="2" rx="10" />
          <text x="600" y="90" fontSize="20" fontWeight="bold" textAnchor="middle" fill="#000">
            Algorand Blockchain
          </text>
          <text x="600" y="115" fontSize="14" textAnchor="middle" fill="#666">
            Secure Backbone Layer
          </text>

          <rect x="50" y="200" width="200" height="120" fill="#fff" stroke="#000" strokeWidth="2" rx="8" />
          <text x="150" y="235" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#000">Donors & Sponsors</text>
          <circle cx="150" cy="275" r="25" fill="none" stroke="#000" strokeWidth="2" />
          <circle cx="140" cy="270" r="3" fill="#000" />
          <circle cx="160" cy="270" r="3" fill="#000" />
          <path d="M 140 285 Q 150 290 160 285" fill="none" stroke="#000" strokeWidth="2" />
          <text x="150" y="315" fontSize="12" textAnchor="middle" fill="#666">Fund via USDCa/Algo</text>

          <line x1="250" y1="260" x2="420" y2="260" stroke="#000" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <text x="335" y="250" fontSize="12" textAnchor="middle" fill="#000">Donate</text>

          <rect x="440" y="220" width="320" height="100" fill="#fff" stroke="#000" strokeWidth="2" rx="8" />
          <text x="600" y="250" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#000">Crowdfunding Smart Contract</text>
          <rect x="490" y="265" width="40" height="35" fill="none" stroke="#000" strokeWidth="2" rx="3" />
          <path d="M 500 270 L 520 270 M 510 270 L 510 295 M 505 285 L 510 290 L 515 285" stroke="#000" strokeWidth="2" fill="none" />
          <text x="600" y="290" fontSize="12" textAnchor="middle" fill="#666">Holds & disburses funds</text>
          <text x="600" y="305" fontSize="12" textAnchor="middle" fill="#666">on milestone verification</text>

          <line x1="600" y1="320" x2="600" y2="390" stroke="#000" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <text x="620" y="360" fontSize="12" fill="#000">Release</text>
          <text x="620" y="375" fontSize="12" fill="#000">Funds</text>

          <rect x="440" y="410" width="320" height="120" fill="#fff" stroke="#000" strokeWidth="2" rx="8" />
          <text x="600" y="440" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#000">Clinics & Health Workers</text>
          <rect x="565" y="455" width="70" height="50" fill="none" stroke="#000" strokeWidth="2" />
          <path d="M 575 475 L 575 490 M 625 475 L 625 490 M 570 475 L 630 475" stroke="#000" strokeWidth="2" fill="none" />
          <circle cx="590" cy="465" r="3" fill="#000" />
          <circle cx="610" cy="465" r="3" fill="#000" />
          <text x="600" y="525" fontSize="12" textAnchor="middle" fill="#666">Deliver vaccinations</text>

          <line x1="760" y1="470" x2="870" y2="470" stroke="#000" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <text x="815" y="460" fontSize="12" textAnchor="middle" fill="#000">Issue</text>

          <rect x="890" y="410" width="260" height="120" fill="#fff" stroke="#000" strokeWidth="2" rx="8" />
          <text x="1020" y="440" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#000">NFT Vouchers</text>
          <text x="1020" y="460" fontSize="13" textAnchor="middle" fill="#666">(ARC-3 Tokens)</text>
          <rect x="985" y="470" width="70" height="50" fill="none" stroke="#000" strokeWidth="2" rx="4" />
          <text x="1020" y="495" fontSize="11" textAnchor="middle" fill="#000">NFT</text>
          <text x="1020" y="508" fontSize="9" textAnchor="middle" fill="#666">Proof of</text>
          <text x="1020" y="518" fontSize="9" textAnchor="middle" fill="#666">Vaccination</text>

          <line x1="1020" y1="530" x2="1020" y2="590" stroke="#000" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <text x="1040" y="565" fontSize="12" fill="#000">Transfer</text>

          <rect x="890" y="610" width="260" height="140" fill="#fff" stroke="#000" strokeWidth="2" rx="8" />
          <text x="1020" y="640" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#000">Parents / Beneficiaries</text>
          <rect x="995" y="655" width="50" height="70" fill="none" stroke="#000" strokeWidth="2" rx="5" />
          <circle cx="1020" cy="670" r="3" fill="#000" />
          <rect x="1005" y="680" width="30" height="35" fill="none" stroke="#000" strokeWidth="1.5" rx="2" />
          <text x="1020" y="710" fontSize="11" textAnchor="middle" fill="#666">Access via</text>
          <text x="1020" y="725" fontSize="11" textAnchor="middle" fill="#666">App/SMS/USSD</text>

          <line x1="890" y1="680" x2="760" y2="680" stroke="#000" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <text x="825" y="670" fontSize="12" textAnchor="middle" fill="#000">Redeem for</text>
          <text x="825" y="685" fontSize="12" textAnchor="middle" fill="#000">services</text>

          <rect x="440" y="800" width="320" height="100" fill="#fff" stroke="#000" strokeWidth="2" rx="8" />
          <text x="600" y="830" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#000">MedFi Token (ASA)</text>
          <circle cx="565" cy="865" r="20" fill="none" stroke="#000" strokeWidth="2" />
          <text x="565" y="872" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#000">M</text>
          <text x="640" y="860" fontSize="12" textAnchor="middle" fill="#666">Governance • Staking</text>
          <text x="640" y="878" fontSize="12" textAnchor="middle" fill="#666">Transaction Discounts</text>

          <line x1="500" y1="800" x2="350" y2="700" stroke="#000" strokeWidth="2" markerEnd="url(#arrowhead)" />

          <rect x="50" y="950" width="280" height="380" fill="#e8f5e9" stroke="#000" strokeWidth="2" rx="8" />
          <text x="190" y="985" fontSize="18" fontWeight="bold" textAnchor="middle" fill="#000">DeFi Layer Features</text>

          <rect x="70" y="1010" width="240" height="90" fill="#fff" stroke="#000" strokeWidth="1.5" rx="6" />
          <text x="190" y="1035" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#000">Staking Pool</text>
          <circle cx="160" cy="1060" r="15" fill="none" stroke="#000" strokeWidth="2" />
          <path d="M 160 1050 L 160 1070 M 155 1055 L 160 1050 L 165 1055" stroke="#000" strokeWidth="2" fill="none" />
          <text x="220" y="1070" fontSize="11" textAnchor="middle" fill="#666">Earn yield while</text>
          <text x="220" y="1085" fontSize="11" textAnchor="middle" fill="#666">supporting liquidity</text>

          <rect x="70" y="1115" width="240" height="90" fill="#fff" stroke="#000" strokeWidth="1.5" rx="6" />
          <text x="190" y="1140" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#000">Health Savings Vault</text>
          <rect x="150" y="1155" width="30" height="25" fill="none" stroke="#000" strokeWidth="2" />
          <rect x="157" y="1162" width="16" height="10" fill="none" stroke="#000" strokeWidth="1.5" />
          <circle cx="165" cy="1167" r="2" fill="#000" />
          <text x="215" y="1175" fontSize="11" textAnchor="middle" fill="#666">Lock funds for</text>
          <text x="215" y="1190" fontSize="11" textAnchor="middle" fill="#666">future medical use</text>

          <rect x="70" y="1220" width="240" height="90" fill="#fff" stroke="#000" strokeWidth="1.5" rx="6" />
          <text x="190" y="1245" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#000">Insurance Pool</text>
          <circle cx="165" cy="1270" r="18" fill="none" stroke="#000" strokeWidth="2" />
          <path d="M 155 1270 L 160 1275 L 175 1260" stroke="#000" strokeWidth="2" fill="none" />
          <text x="220" y="1275" fontSize="11" textAnchor="middle" fill="#666">NFT micro-insurance</text>
          <text x="220" y="1290" fontSize="11" textAnchor="middle" fill="#666">auto-release coverage</text>

          <line x1="330" y1="1050" x2="440" y2="850" stroke="#000" strokeWidth="2" markerEnd="url(#arrowhead)" />

          <rect x="440" y="950" width="320" height="100" fill="#fff" stroke="#000" strokeWidth="2" rx="8" />
          <text x="600" y="980" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#000">Verification Layer</text>
          <rect x="565" y="995" width="70" height="45" fill="none" stroke="#000" strokeWidth="2" rx="4" />
          <path d="M 575 1010 L 585 1020 L 625 1000 M 585 1020 L 585 1030" stroke="#000" strokeWidth="2" fill="none" />
          <text x="600" y="1028" fontSize="11" textAnchor="middle" fill="#666">On-chain validation</text>

          <rect x="870" y="950" width="280" height="100" fill="#fff" stroke="#000" strokeWidth="2" rx="8" />
          <text x="1010" y="980" fontSize="16" fontWeight="bold" textAnchor="middle" fill="#000">Data Access</text>
          <rect x="975" y="995" width="70" height="45" fill="none" stroke="#000" strokeWidth="2" rx="4" />
          <rect x="982" y="1002" width="56" height="3" fill="#000" />
          <rect x="982" y="1012" width="40" height="2" fill="#000" />
          <rect x="982" y="1018" width="50" height="2" fill="#000" />
          <rect x="982" y="1024" width="35" height="2" fill="#000" />
          <rect x="982" y="1030" width="45" height="2" fill="#000" />
          <text x="1010" y="1028" fontSize="11" textAnchor="middle" fill="#666">Public dashboard</text>

          <line x1="600" y1="950" x2="600" y2="900" stroke="#000" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <line x1="760" y1="1000" x2="870" y2="1000" stroke="#000" strokeWidth="2" markerEnd="url(#arrowhead)" />

          <rect x="440" y="1100" width="320" height="80" fill="#fffacd" stroke="#000" strokeWidth="2" rx="8" />
          <text x="600" y="1130" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#000">Key Benefits</text>
          <text x="600" y="1150" fontSize="11" textAnchor="middle" fill="#333">✓ Transparent fund tracking</text>
          <text x="600" y="1165" fontSize="11" textAnchor="middle" fill="#333">✓ Tamper-proof records</text>

          <text x="50" y="1370" fontSize="12" fill="#666">Legend:</text>
          <line x1="120" y1="1365" x2="170" y2="1365" stroke="#000" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <text x="180" y="1370" fontSize="11" fill="#666">Flow of funds/data</text>
          <rect x="310" y="1355" width="30" height="20" fill="#f8f9fa" stroke="#000" strokeWidth="1" />
          <text x="350" y="1370" fontSize="11" fill="#666">On-chain process</text>
        </svg>

        <div className="mt-12 bg-gray-50 border-2 border-gray-900 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How It Works</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold mr-3 text-gray-900">1.</span>
              <span><strong>Donors</strong> contribute stablecoins (USDCa) or Algo to fund healthcare campaigns.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-3 text-gray-900">2.</span>
              <span><strong>Smart Contract</strong> securely holds funds and releases them when milestones are verified.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-3 text-gray-900">3.</span>
              <span><strong>Clinics</strong> receive funding, administer vaccinations, and issue ARC-3 NFT vouchers.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-3 text-gray-900">4.</span>
              <span><strong>NFT Vouchers</strong> serve as proof of vaccination or prepaid micro-insurance.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-3 text-gray-900">5.</span>
              <span><strong>Parents</strong> access vouchers via mobile app, SMS, or USSD and redeem for services.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-3 text-gray-900">6.</span>
              <span><strong>MedFi Token</strong> powers governance, staking rewards, and transaction discounts.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-3 text-gray-900">7.</span>
              <span><strong>DeFi Features</strong> enable staking, health savings, and automated insurance payouts.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-3 text-gray-900">8.</span>
              <span><strong>Verification</strong> happens on-chain for full transparency and tamper-proof tracking.</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold mr-3 text-gray-900">9.</span>
              <span><strong>Public Dashboard</strong> displays real-time campaign progress and fund disbursements.</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default MedFiNetFlowchart;