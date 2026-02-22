import { useState, useEffect } from 'react';
import type { SAYCConventions, BidMeaning, LeadConvention, DefensiveSignal, BidCategory } from '@bridge/shared';
import { BidCategory as BidCat } from '@bridge/shared';

interface SAYCReferenceProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'bidding' | 'leads' | 'signals';
type BiddingSubTab = 'opening' | 'response' | 'conventional';

function SAYCReference({ isOpen, onClose }: SAYCReferenceProps) {
  const [conventions, setConventions] = useState<SAYCConventions | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('bidding');
  const [biddingSubTab, setBiddingSubTab] = useState<BiddingSubTab>('opening');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchConventions();
    }
  }, [isOpen]);

  const fetchConventions = async () => {
    try {
      const API_URL = import.meta.env.VITE_SOCKET_URL || (import.meta.env.PROD ? '' : 'http://localhost:3001');
      const response = await fetch(`${API_URL}/api/conventions/sayc`);
      const data = await response.json();
      setConventions(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch SAYC conventions:', error);
      setLoading(false);
    }
  };

  const filterBids = (bids: BidMeaning[], category?: BidCategory) => {
    let filtered = bids;

    if (category) {
      filtered = filtered.filter((bid) => bid.category === category);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (bid) =>
          bid.bidSequence.toLowerCase().includes(term) ||
          bid.description.toLowerCase().includes(term) ||
          (bid.notes && bid.notes.toLowerCase().includes(term))
      );
    }

    return filtered;
  };

  const filterLeads = (leads: LeadConvention[]) => {
    if (!searchTerm) return leads;
    const term = searchTerm.toLowerCase();
    return leads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(term) ||
        lead.description.toLowerCase().includes(term) ||
        lead.situation.toLowerCase().includes(term)
    );
  };

  const filterSignals = (signals: DefensiveSignal[]) => {
    if (!searchTerm) return signals;
    const term = searchTerm.toLowerCase();
    return signals.filter(
      (signal) =>
        signal.name.toLowerCase().includes(term) ||
        signal.description.toLowerCase().includes(term) ||
        signal.type.toLowerCase().includes(term)
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b px-6 py-4 flex items-centre justify-between">
          <h2 className="text-2xl font-bold text-green-800">SAYC Convention Card</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-900 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-6 py-4 border-b">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search conventions..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Tabs */}
        <div className="border-b px-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('bidding')}
              className={`py-3 px-4 font-semibold transition-colors ${
                activeTab === 'bidding'
                  ? 'text-green-700 border-b-2 border-green-700'
                  : 'text-gray-600 hover:text-green-700'
              }`}
            >
              Bidding
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`py-3 px-4 font-semibold transition-colors ${
                activeTab === 'leads'
                  ? 'text-green-700 border-b-2 border-green-700'
                  : 'text-gray-600 hover:text-green-700'
              }`}
            >
              Opening Leads
            </button>
            <button
              onClick={() => setActiveTab('signals')}
              className={`py-3 px-4 font-semibold transition-colors ${
                activeTab === 'signals'
                  ? 'text-green-700 border-b-2 border-green-700'
                  : 'text-gray-600 hover:text-green-700'
              }`}
            >
              Defensive Signals
            </button>
          </div>
        </div>

        {/* Bidding Sub-tabs */}
        {activeTab === 'bidding' && (
          <div className="border-b px-6 bg-gray-50">
            <div className="flex space-x-2">
              <button
                onClick={() => setBiddingSubTab('opening')}
                className={`py-2 px-3 text-sm font-medium rounded-t transition-colors ${
                  biddingSubTab === 'opening'
                    ? 'bg-white text-green-700'
                    : 'text-gray-600 hover:text-green-700'
                }`}
              >
                Opening Bids
              </button>
              <button
                onClick={() => setBiddingSubTab('response')}
                className={`py-2 px-3 text-sm font-medium rounded-t transition-colors ${
                  biddingSubTab === 'response'
                    ? 'bg-white text-green-700'
                    : 'text-gray-600 hover:text-green-700'
                }`}
              >
                Responses
              </button>
              <button
                onClick={() => setBiddingSubTab('conventional')}
                className={`py-2 px-3 text-sm font-medium rounded-t transition-colors ${
                  biddingSubTab === 'conventional'
                    ? 'bg-white text-green-700'
                    : 'text-gray-600 hover:text-green-700'
                }`}
              >
                Conventions
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && (
            <div className="flex items-centre justify-centre h-64">
              <p className="text-gray-600">Loading conventions...</p>
            </div>
          )}

          {!loading && conventions && activeTab === 'bidding' && (
            <div className="space-y-4">
              {biddingSubTab === 'opening' &&
                filterBids(conventions.openingBids, BidCat.OPENING).map((bid, index) => (
                  <BidCard key={index} bid={bid} />
                ))}
              {biddingSubTab === 'response' &&
                filterBids(conventions.responses, BidCat.RESPONSE).map((bid, index) => (
                  <BidCard key={index} bid={bid} />
                ))}
              {biddingSubTab === 'conventional' &&
                filterBids(conventions.responses, BidCat.CONVENTIONAL).map((bid, index) => (
                  <BidCard key={index} bid={bid} />
                ))}
            </div>
          )}

          {!loading && conventions && activeTab === 'leads' && (
            <div className="space-y-4">
              {filterLeads(conventions.leadConventions).map((lead, index) => (
                <LeadCard key={index} lead={lead} />
              ))}
            </div>
          )}

          {!loading && conventions && activeTab === 'signals' && (
            <div className="space-y-4">
              {filterSignals(conventions.defensiveSignals).map((signal, index) => (
                <SignalCard key={index} signal={signal} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <p className="text-sm text-gray-600">
            Standard American Yellow Card (SAYC) is a commonly used bidding system in bridge.
            This reference is for educational purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}

function BidCard({ bid }: { bid: BidMeaning }) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-centre space-x-3">
          <span className="text-2xl font-bold text-green-700">{bid.bidSequence}</span>
          {bid.alertable && (
            <span className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
              ALERT
            </span>
          )}
          {bid.forcing && (
            <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">
              {bid.gameForcing ? 'GF' : 'F1'}
            </span>
          )}
        </div>
      </div>
      <p className="text-gray-900 mb-2">{bid.description}</p>
      <div className="space-y-1 text-sm">
        <div className="flex items-centre space-x-2">
          <span className="font-semibold text-gray-700">HCP:</span>
          <span className="text-gray-600">
            {bid.requirements.hcp.min}-{bid.requirements.hcp.max}
          </span>
        </div>
        {bid.requirements.suits && bid.requirements.suits.length > 0 && (
          <div className="flex items-centre space-x-2">
            <span className="font-semibold text-gray-700">Suits:</span>
            <span className="text-gray-600">
              {bid.requirements.suits
                .map((s) => `${s.suit}: ${s.minLength}+ cards`)
                .join(', ')}
            </span>
          </div>
        )}
        {bid.requirements.shape && (
          <div className="flex items-centre space-x-2">
            <span className="font-semibold text-gray-700">Shape:</span>
            <span className="text-gray-600">
              {bid.requirements.shape.balanced && 'Balanced'}
              {bid.requirements.shape.semiBalanced && 'Semi-balanced'}
              {bid.requirements.shape.unbalanced && 'Unbalanced'}
              {bid.requirements.shape.pattern && bid.requirements.shape.pattern}
            </span>
          </div>
        )}
      </div>
      {bid.notes && (
        <p className="mt-2 text-sm text-gray-600 italic border-t pt-2">{bid.notes}</p>
      )}
    </div>
  );
}

function LeadCard({ lead }: { lead: LeadConvention }) {
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <h3 className="text-lg font-bold text-green-700 mb-2">{lead.name}</h3>
      <p className="text-gray-900 mb-2">{lead.description}</p>
      <div className="mb-2">
        <span className="text-sm font-semibold text-gray-700">Situation: </span>
        <span className="text-sm text-gray-600">{lead.situation}</span>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-700">Rules:</p>
        <ul className="list-disc list-inside space-y-1">
          {lead.rules.map((rule, index) => (
            <li key={index} className="text-sm text-gray-600">
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SignalCard({ signal }: { signal: DefensiveSignal }) {
  const typeColors = {
    attitude: 'bg-blue-100 text-blue-700',
    count: 'bg-green-100 text-green-700',
    'suit-preference': 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-centre justify-between mb-2">
        <h3 className="text-lg font-bold text-green-700">{signal.name}</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded ${typeColors[signal.type]}`}>
          {signal.type.toUpperCase()}
        </span>
      </div>
      <p className="text-gray-900 mb-3">{signal.description}</p>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-gray-700">Rules:</p>
        <ul className="list-disc list-inside space-y-1">
          {signal.rules.map((rule, index) => (
            <li key={index} className="text-sm text-gray-600">
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default SAYCReference;
