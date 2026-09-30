import React, { useState, useEffect } from 'react';
import { agreementsService } from '../services/api';
import { onSocketEvent } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import AgreementList from '../components/agreements/AgreementList';
import AgreementDetails from '../components/agreements/AgreementDetails';
import AgreementForm from '../components/agreements/AgreementForm';
import { FileText, Plus, Sparkles } from 'lucide-react';

export default function AgreementsPage({ onNavigate }) {
  const { user } = useAuth();
  const [agreements, setAgreements] = useState([]);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const currentUserId = user?._id?.toString();
  const currentUserRole = user?.role;

  const fetchAgreements = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (selectedStatusFilter !== 'all') filters.status = selectedStatusFilter;
      if (searchTerm.trim()) filters.search = searchTerm.trim();

      const res = await agreementsService.getAgreements(filters);
      if (res.success && Array.isArray(res.data)) {
        setAgreements(res.data);

        // Check URL parameter ?agreement=<id>
        const searchParams = new URLSearchParams(window.location.search);
        const urlAgreementId = searchParams.get('agreement');
        if (urlAgreementId) {
          const found = res.data.find(
            a => a._id === urlAgreementId || a.collaborationId?._id === urlAgreementId || a.collaborationId === urlAgreementId
          );
          if (found) {
            setSelectedAgreement(found);
          } else {
            // Fetch single agreement if not in current paginated list
            try {
              const singleRes = await agreementsService.getAgreement(urlAgreementId);
              if (singleRes.success && singleRes.data) {
                setSelectedAgreement(singleRes.data);
              }
            } catch (err) {
              console.warn('[Fetch agreement by URL failed]', err.message);
            }
          }
        }
      }
    } catch (err) {
      console.warn('[Fetch Agreements Error]', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgreements();
  }, [selectedStatusFilter]);

  // Subscribe to real-time agreement socket events
  useEffect(() => {
    const handleSocketUpdate = (data) => {
      fetchAgreements();
      if (selectedAgreement && (selectedAgreement._id === data._id || selectedAgreement._id === data.agreementId)) {
        agreementsService.getAgreement(selectedAgreement._id).then(res => {
          if (res.success && res.data) setSelectedAgreement(res.data);
        }).catch(() => {});
      }
    };

    const clean1 = onSocketEvent('agreement:created', handleSocketUpdate);
    const clean2 = onSocketEvent('agreement:updated', handleSocketUpdate);
    const clean3 = onSocketEvent('agreement:accepted', handleSocketUpdate);
    const clean4 = onSocketEvent('agreement:activated', handleSocketUpdate);
    const clean5 = onSocketEvent('agreement:rejected', handleSocketUpdate);
    const clean6 = onSocketEvent('agreement:cancelled', handleSocketUpdate);

    return () => {
      clean1();
      clean2();
      clean3();
      clean4();
      clean5();
      clean6();
    };
  }, [selectedAgreement]);

  const handleSelectAgreement = (agreement) => {
    setSelectedAgreement(agreement);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pt-24 pb-16 bg-[#FAF8FF] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold mb-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Digital Collaboration Governance</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight font-sans">
              Collaboration <span className="text-gradient-purple">Agreements</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Record, review, and sign-off on commercial deliverables and terms.
            </p>
          </div>
        </div>

        {/* Content View */}
        {selectedAgreement ? (
          <AgreementDetails
            agreement={selectedAgreement}
            onBack={() => setSelectedAgreement(null)}
            onRefresh={fetchAgreements}
            currentUserId={currentUserId}
            currentUserRole={currentUserRole}
          />
        ) : (
          <AgreementList
            agreements={agreements}
            loading={loading}
            onSelectAgreement={handleSelectAgreement}
            selectedStatusFilter={selectedStatusFilter}
            onStatusFilterChange={setSelectedStatusFilter}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            currentUserId={currentUserId}
          />
        )}

      </div>
    </div>
  );
}
