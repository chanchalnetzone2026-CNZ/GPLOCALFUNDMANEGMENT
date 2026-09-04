import React, { useState, useEffect, useMemo } from 'react';
import { OfficeDetails, Admin } from '../types';
import ViewHeader from './ViewHeader';
import OfficialVoucherHeader from './OfficialVoucherHeader';
import { LOCATIONS } from '../utils/locations';
import { getCanonicalDistrict, getCanonicalBlock, getCanonicalPanchayat } from '../utils/locationNorm';
import { compressImage } from '../lib/storage';

interface ManageOfficeViewProps {
  officeDetails: OfficeDetails;
  onUpdateOfficeDetails: (updated: OfficeDetails) => Promise<{ success: boolean; error?: string } | void> | void;
  admin: Admin | null;
  onBack?: () => void;
  onClose?: () => void;
  isHindi?: boolean;
}

export const ManageOfficeView: React.FC<ManageOfficeViewProps> = ({
  officeDetails,
  onUpdateOfficeDetails,
  admin,
  onBack,
  onClose,
  isHindi = true,
}) => {
  const [formData, setFormData] = useState<OfficeDetails>({ ...officeDetails });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [savedSummary, setSavedSummary] = useState<OfficeDetails | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [upiIdInput, setUpiIdInput] = useState<string>('grampanchayat@sbi');

  // --- LOCATIONS HIERARCHY SUPPORT ---
  const mpLocations = useMemo(() => LOCATIONS['MADHYA PRADESH'] || {}, []);

  // District list sorted alphabetically
  const districtList = useMemo(() => {
    return Object.keys(mpLocations).sort((a, b) => a.localeCompare(b));
  }, [mpLocations]);

  // Selected district with canonical matching
  const [selectedDistrict, setSelectedDistrict] = useState<string>(() => {
    const rawDist = officeDetails.district || admin?.district || '';
    const canon = getCanonicalDistrict(rawDist);
    const matched = districtList.find((d) => d.toUpperCase() === canon || d.toLowerCase() === rawDist.toLowerCase());
    return matched || 'Narsinghpur';
  });

  // Block list computed from selected district
  const blockList = useMemo(() => {
    if (!selectedDistrict || !mpLocations[selectedDistrict]) return [];
    return Object.keys(mpLocations[selectedDistrict]).sort((a, b) => a.localeCompare(b));
  }, [mpLocations, selectedDistrict]);

  // Selected block with canonical matching
  const [selectedBlock, setSelectedBlock] = useState<string>(() => {
    const rawBlock = officeDetails.block || admin?.block || '';
    const canon = getCanonicalBlock(rawBlock);
    const matched = blockList.find((b) => b.toUpperCase() === canon || b.toLowerCase() === rawBlock.toLowerCase());
    return matched || blockList[0] || 'Kareli';
  });

  // Gram Panchayat list computed from selected block
  const panchayatList = useMemo(() => {
    if (!selectedDistrict || !selectedBlock || !mpLocations[selectedDistrict]?.[selectedBlock]) return [];
    return mpLocations[selectedDistrict][selectedBlock];
  }, [mpLocations, selectedDistrict, selectedBlock]);

  // Search filter inside Panchayat dropdown
  const [panchayatSearch, setPanchayatSearch] = useState<string>('');

  // Selected Panchayat state
  const [selectedPanchayat, setSelectedPanchayat] = useState<string>(() => {
    const rawGp = officeDetails.gramPanchayat || admin?.gramPanchayat || '';
    const canon = getCanonicalPanchayat(rawGp);
    const matched = panchayatList.find((p) => p.toUpperCase() === canon || p.toLowerCase() === rawGp.toLowerCase());
    if (matched) return matched;
    return rawGp ? 'OTHER_CUSTOM' : (panchayatList[0] || '');
  });

  const [isCustomGp, setIsCustomGp] = useState<boolean>(() => {
    const rawGp = officeDetails.gramPanchayat || admin?.gramPanchayat || '';
    if (!rawGp) return false;
    const canon = getCanonicalPanchayat(rawGp);
    const matched = panchayatList.find((p) => p.toUpperCase() === canon || p.toLowerCase() === rawGp.toLowerCase());
    return !matched;
  });

  const [customGpName, setCustomGpName] = useState<string>(() => {
    return officeDetails.gramPanchayat || admin?.gramPanchayat || '';
  });

  useEffect(() => {
    if (officeDetails) {
      setFormData({ ...officeDetails });
      const rawDist = officeDetails.district || admin?.district || '';
      const canonDist = getCanonicalDistrict(rawDist);
      const matchedDist = districtList.find((d) => d.toUpperCase() === canonDist || d.toLowerCase() === rawDist.toLowerCase());
      if (matchedDist) setSelectedDistrict(matchedDist);

      const rawBlock = officeDetails.block || admin?.block || '';
      const canonBlock = getCanonicalBlock(rawBlock);
      const matchedBlock = blockList.find((b) => b.toUpperCase() === canonBlock || b.toLowerCase() === rawBlock.toLowerCase());
      if (matchedBlock) setSelectedBlock(matchedBlock);

      const rawGp = officeDetails.gramPanchayat || admin?.gramPanchayat || '';
      const canonGp = getCanonicalPanchayat(rawGp);
      const matchedGp = panchayatList.find((p) => p.toUpperCase() === canonGp || p.toLowerCase() === rawGp.toLowerCase());
      if (matchedGp) {
        setSelectedPanchayat(matchedGp);
        setIsCustomGp(false);
      } else if (rawGp) {
        setSelectedPanchayat('OTHER_CUSTOM');
        setIsCustomGp(true);
        setCustomGpName(rawGp);
      }
    }
  }, [officeDetails, admin]);

  // Handlers for location selection
  const handleDistrictSelect = (newDist: string) => {
    setSelectedDistrict(newDist);
    const newBlocks = Object.keys(mpLocations[newDist] || {}).sort((a, b) => a.localeCompare(b));
    const firstBlock = newBlocks[0] || '';
    setSelectedBlock(firstBlock);
    const newGps = mpLocations[newDist]?.[firstBlock] || [];
    const firstGp = newGps[0] || '';
    setSelectedPanchayat(firstGp);
    setIsCustomGp(false);
    setPanchayatSearch('');

    setFormData((prev) => ({
      ...prev,
      district: newDist,
      block: firstBlock,
      gramPanchayat: firstGp,
      officeName: firstGp ? `कार्यालय ग्राम पंचायत ${firstGp}` : prev.officeName,
      address: firstGp ? `ग्राम पंचायत ${firstGp}, जनपद पंचायत ${firstBlock}, जिला ${newDist}, मध्य प्रदेश` : prev.address,
    }));
  };

  const handleBlockSelect = (newBlock: string) => {
    setSelectedBlock(newBlock);
    const newGps = mpLocations[selectedDistrict]?.[newBlock] || [];
    const firstGp = newGps[0] || '';
    setSelectedPanchayat(firstGp);
    setIsCustomGp(false);
    setPanchayatSearch('');

    setFormData((prev) => ({
      ...prev,
      block: newBlock,
      gramPanchayat: firstGp,
      officeName: firstGp ? `कार्यालय ग्राम पंचायत ${firstGp}` : prev.officeName,
      address: firstGp ? `ग्राम पंचायत ${firstGp}, जनपद पंचायत ${newBlock}, जिला ${selectedDistrict}, मध्य प्रदेश` : prev.address,
    }));
  };

  const handlePanchayatSelect = (val: string) => {
    setSelectedPanchayat(val);
    if (val === 'OTHER_CUSTOM') {
      setIsCustomGp(true);
      const defaultCustom = customGpName || (isHindi ? 'ग्राम पंचायत ' : 'Gram Panchayat ');
      setFormData((prev) => ({
        ...prev,
        gramPanchayat: defaultCustom,
        officeName: `कार्यालय ${defaultCustom}`,
        address: `${defaultCustom}, जनपद पंचायत ${selectedBlock}, जिला ${selectedDistrict}, मध्य प्रदेश`,
      }));
    } else {
      setIsCustomGp(false);
      setFormData((prev) => ({
        ...prev,
        gramPanchayat: val,
        officeName: `कार्यालय ग्राम पंचायत ${val}`,
        address: `ग्राम पंचायत ${val}, जनपद पंचायत ${selectedBlock}, जिला ${selectedDistrict}, मध्य प्रदेश`,
      }));
    }
  };

  const handleCustomGpChange = (customVal: string) => {
    setCustomGpName(customVal);
    setFormData((prev) => ({
      ...prev,
      gramPanchayat: customVal,
      officeName: customVal.startsWith('कार्यालय') ? customVal : `कार्यालय ${customVal}`,
      address: `${customVal}, जनपद पंचायत ${selectedBlock}, जिला ${selectedDistrict}, मध्य प्रदेश`,
    }));
  };

  // Sample Preset Logos for easy selection
  const PRESET_LOGOS = [
    {
      id: 'mp_govt',
      name: isHindi ? 'मध्य प्रदेश शासन प्रतीक' : 'MP Government Emblem',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Emblem_of_Madhya_Pradesh.svg/180px-Emblem_of_Madhya_Pradesh.svg.png',
    },
    {
      id: 'ashok_stambh',
      name: isHindi ? 'राष्ट्रीय प्रतीक - अशोक स्तंभ' : 'Ashoka Stambh Emblem',
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Emblem_of_India.svg/180px-Emblem_of_India.svg.png',
    },
    {
      id: 'panchayat_seal',
      name: isHindi ? 'ग्राम पंचायत डिजिटल सील' : 'Panchayat Seal Logo',
      url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle Image File Upload (Logo or Barcode QR)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'logoUrl' | 'qrCodeUrl') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(isHindi ? 'फाइल का आकार 5MB से कम होना चाहिए' : 'File size must be under 5MB');
      return;
    }

    try {
      // Compress logo/QR to max 320x320 JPEG to avoid exhausting localStorage
      const compressed = await compressImage(file, 320, 320, 0.8);
      setFormData((prev) => ({ ...prev, [fieldName]: compressed }));
    } catch (err) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [fieldName]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateUpiQr = () => {
    if (!upiIdInput.trim()) return;
    const pa = encodeURIComponent(upiIdInput.trim());
    const pn = encodeURIComponent(formData.officeName || 'Gram Panchayat Office');
    const upiUri = `upi://pay?pa=${pa}&pn=${pn}&cu=INR`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;
    
    setFormData((prev) => ({ ...prev, qrCodeUrl: qrUrl }));
    setSuccessMsg(isHindi ? 'UPI बारकोड सफलतापूर्वक जनरेट किया गया!' : 'UPI Barcode QR Code Generated!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateOfficeDetails(formData);
      setSavedSummary({ ...formData });
      setSuccessMsg(isHindi ? 'कार्यालय विवरण एवं बैंक / लोगो जानकारी Supabase डेटाबेस (office_details) में सफलतापूर्वक सुरक्षित एवं अपडेट कर दी गई!' : 'Office details & bank / logo information successfully updated and saved to Supabase database (office_details)!');
    } catch (err: any) {
      alert(isHindi ? 'डेटाबेस में सुरक्षित करने में त्रुटि आई।' : 'Error saving to database.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl animate-fade-in">
      <ViewHeader
        title={isHindi ? 'कार्यालय प्रबंधन (Manage Office & Bank Profile)' : 'Manage Office & Bank Profile'}
        subtitle={isHindi ? 'ग्राम पंचायत कार्यालय का नाम, सचिव नाम, संपर्क, बैंक खाता, लोगो एवं भुगतान बारकोड पंजीकृत करें। यह विवरण सभी रसीद एवं मांग नोटिस पर प्रदर्शित होगा।' : 'Register office name, secretary, contact, bank account, logo & QR barcode for all invoices & demand notices.'}
        onBack={onBack}
        onClose={onClose}
        isHindi={isHindi}
      />

      {successMsg && savedSummary && (
        <div className="mb-6 bg-emerald-50 border-2 border-emerald-400 text-emerald-950 p-5 rounded-2xl animate-slide-up shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">✅</span>
              <h4 className="text-sm sm:text-base font-black text-emerald-900">{successMsg}</h4>
            </div>
            <button
              onClick={() => {
                setSuccessMsg(null);
                setSavedSummary(null);
              }}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 px-2 py-1 bg-emerald-100 rounded-lg"
            >
              ✕ बंद करें
            </button>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-emerald-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-500 font-bold block">कार्यालय नाम:</span>
              <strong className="text-emerald-950 font-black">{savedSummary.officeName || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold block">सचिव का नाम:</span>
              <strong className="text-slate-900 font-bold">{savedSummary.secretaryName || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold block">संपर्क मोबाइल:</span>
              <strong className="text-slate-900 font-mono">{savedSummary.contactPhone || '-'}</strong>
            </div>
            <div>
              <span className="text-slate-500 font-bold block">बैंक खाता (A/C):</span>
              <strong className="text-slate-900 font-mono">{savedSummary.bankName} ({savedSummary.accountNumber})</strong>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-emerald-800 font-bold pt-1">
            <span>💾 डेटाबेस टेबल: <strong className="font-mono bg-emerald-100 px-2 py-0.5 rounded">office_details</strong></span>
            <span>⚡ स्थिति: <strong className="text-emerald-700">सफलतापूर्वक सिंक एवं एक्टिव</strong></span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLS: EDIT OFFICE FORM */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 space-y-6">
            <div className="border-b pb-3 border-slate-200 flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>🏛️</span> {isHindi ? '1. ग्राम पंचायत कार्यालय एवं अधिकारी विवरण' : '1. Office & Officer Details'}
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
                Official Header Setup
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'कार्यालय का नाम *' : 'Office Name *'}
                </label>
                <input
                  type="text"
                  name="officeName"
                  value={formData.officeName || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. कार्यालय ग्राम पंचायत रामपुर"
                  className="w-full px-3.5 py-2.5 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'ग्राम पंचायत अधिकारी का नाम *' : 'Officer Name *'}
                </label>
                <input
                  type="text"
                  name="secretaryName"
                  value={formData.secretaryName || ''}
                  onChange={handleInputChange}
                  placeholder={isHindi ? 'जैसे श्री दीपक जाटव' : 'e.g. Deepak Jatav'}
                  className="w-full px-3.5 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'पद / पदनाम चयन *' : 'Designation Selection *'}
                </label>
                <select
                  name="secretaryDesignation"
                  value={formData.secretaryDesignation || 'ग्राम पंचायत सचिव'}
                  onChange={(e) => setFormData(prev => ({ ...prev, secretaryDesignation: e.target.value }))}
                  className="w-full px-3.5 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary bg-white"
                >
                  <option value="ग्राम पंचायत सचिव">{isHindi ? 'ग्राम पंचायत सचिव' : 'Gram Panchayat Secretary'}</option>
                  <option value="सरपंच">{isHindi ? 'सरपंच' : 'Sarpanch'}</option>
                  <option value="सहायक सचिव">{isHindi ? 'सहायक सचिव' : 'Assistant Secretary'}</option>
                  <option value="ग्राम रोजगार सहायक">{isHindi ? 'ग्राम रोजगार सहायक' : 'Gram Rozgar Sahayak'}</option>
                  <option value="कर संग्राहक">{isHindi ? 'कर संग्राहक' : 'Tax Collector'}</option>
                  <option value="कंप्यूटर ऑपरेटर">{isHindi ? 'कंप्यूटर ऑपरेटर' : 'Computer Operator'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'ग्राम पंचायत सरपंच का नाम' : 'Sarpanch Name'}
                </label>
                <input
                  type="text"
                  name="sarpanchName"
                  value={formData.sarpanchName || ''}
                  onChange={handleInputChange}
                  placeholder={isHindi ? 'जैसे श्रीमती कमला देवी' : 'e.g. Kamla Devi'}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'संपर्क मोबाइल नंबर *' : 'Contact Phone *'}
                </label>
                <input
                  type="text"
                  name="contactPhone"
                  value={formData.contactPhone || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. 911234567890"
                  className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'कार्यालय ईमेल' : 'Office Email'}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. gprampur2026@gmail.com"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* GEOGRAPHICAL LOCATION SELECTION (State -> District -> Block -> Gram Panchayat) */}
              <div className="sm:col-span-2 bg-amber-50/70 border-2 border-amber-300/80 p-4 sm:p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📍</span>
                    <h4 className="text-sm font-black text-amber-950 uppercase tracking-wide">
                      {isHindi ? 'ग्राम पंचायत भौगोलिक स्थान चयन (State, District, Block & Gram Panchayat)' : 'Geographical Location Selection'}
                    </h4>
                  </div>
                  <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2.5 py-1 rounded-full">
                    {isHindi ? 'डैशबोर्ड एवं आंकड़े स्वतः अपडेट होंगे' : 'Updates Dashboard stats instantly'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 1. STATE SELECTOR */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {isHindi ? 'राज्य (State) *' : 'State *'}
                    </label>
                    <select
                      name="state"
                      value={formData.state || 'MADHYA PRADESH'}
                      onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary bg-white shadow-sm"
                    >
                      <option value="MADHYA PRADESH">मध्य प्रदेश (MADHYA PRADESH)</option>
                    </select>
                  </div>

                  {/* 2. DISTRICT SELECTOR */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {isHindi ? 'जिला (District) *' : 'District *'}
                    </label>
                    <select
                      value={selectedDistrict}
                      onChange={(e) => handleDistrictSelect(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary bg-white shadow-sm"
                      required
                    >
                      {districtList.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 3. BLOCK / JANPAD PANCHAYAT SELECTOR */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                      {isHindi ? 'जनपद पंचायत / ब्लॉक (Block) *' : 'Block / Janpad *'}
                    </label>
                    <select
                      value={selectedBlock}
                      onChange={(e) => handleBlockSelect(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary bg-white shadow-sm"
                      required
                    >
                      {blockList.map((blk) => (
                        <option key={blk} value={blk}>
                          {blk.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 4. GRAM PANCHAYAT SELECTOR */}
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                    <label className="block text-xs font-bold text-slate-800 uppercase">
                      {isHindi ? 'ग्राम पंचायत चयन (Select Gram Panchayat) *' : 'Select Gram Panchayat *'}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={panchayatSearch}
                        onChange={(e) => setPanchayatSearch(e.target.value)}
                        placeholder={isHindi ? '🔍 सूची में खोजें...' : '🔍 Search in list...'}
                        className="text-xs px-2.5 py-1 border border-slate-300 rounded-lg bg-white"
                      />
                      <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                        {panchayatList.length} {isHindi ? 'ग्राम पंचायतें' : 'Panchayats'}
                      </span>
                    </div>
                  </div>

                  <select
                    value={selectedPanchayat}
                    onChange={(e) => handlePanchayatSelect(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm font-black text-slate-900 border-2 border-amber-400/80 rounded-xl focus:ring-2 focus:ring-primary bg-white shadow-sm"
                    required
                  >
                    <option value="">{isHindi ? '-- ग्राम पंचायत चुनें --' : '-- Select Gram Panchayat --'}</option>
                    {panchayatList
                      .filter((p) => !panchayatSearch || p.toLowerCase().includes(panchayatSearch.toLowerCase()))
                      .map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    <option value="OTHER_CUSTOM">
                      {isHindi ? '✏️ अन्य / कस्टम ग्राम पंचायत नाम दर्ज करें' : '✏️ Other / Enter Custom Panchayat Name'}
                    </option>
                  </select>

                  {/* If custom Panchayat selected, show direct input */}
                  {isCustomGp && (
                    <div className="mt-3 p-3 bg-white border border-amber-300 rounded-xl space-y-1.5">
                      <label className="block text-xs font-bold text-amber-900 uppercase">
                        {isHindi ? 'कस्टम ग्राम पंचायत का नाम दर्ज करें *' : 'Enter Custom Gram Panchayat Name *'}
                      </label>
                      <input
                        type="text"
                        value={customGpName}
                        onChange={(e) => handleCustomGpChange(e.target.value)}
                        placeholder={isHindi ? 'e.g. ग्राम पंचायत जोवा / रामपुर' : 'e.g. Gram Panchayat Jova'}
                        className="w-full px-3.5 py-2 text-sm font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="pt-2 text-xs text-amber-900 flex flex-wrap items-center gap-3">
                  <span><strong>{isHindi ? 'चयनित:' : 'Selected:'}</strong> {formData.gramPanchayat || '—'}</span>
                  <span>•</span>
                  <span><strong>{isHindi ? 'ब्लॉक:' : 'Block:'}</strong> {formData.block || selectedBlock}</span>
                  <span>•</span>
                  <span><strong>{isHindi ? 'जिला:' : 'District:'}</strong> {formData.district || selectedDistrict}</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'कार्यालय का पूरा पता *' : 'Full Office Address *'}
                </label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. मुख्य बस स्टैंड रोड, ग्राम पंचायत रामपुर, जनपद पंचायत सीहोर"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'पिन कोड' : 'Pin Code'}
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode || ''}
                  onChange={handleInputChange}
                  placeholder="e.g. 466001"
                  className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  {isHindi ? 'लॉगिन पासवर्ड' : 'Login Password'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password || admin?.password || ''}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full px-3.5 py-2 text-sm font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* BANK ACCOUNT DETAILS SECTION */}
            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2 mb-4">
                <span>🏦</span> {isHindi ? '2. ग्राम पंचायत बैंक खाता विवरण (Bank Account Details)' : '2. Bank Account Details'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {isHindi ? 'बैंक का नाम (Bank Name) *' : 'Bank Name *'}
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    value={formData.bankName || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. भारतीय स्टेट बैंक (SBI)"
                    className="w-full px-3.5 py-2 text-sm font-semibold border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {isHindi ? 'खाताधारक का नाम (Account Holder Name) *' : 'Account Holder Name *'}
                  </label>
                  <input
                    type="text"
                    name="accountName"
                    value={formData.accountName || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. ग्राम पंचायत रामपुर निधि खाता"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {isHindi ? 'खाता क्रमांक (Account Number) *' : 'Account Number *'}
                  </label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={formData.accountNumber || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. 38291048291"
                    className="w-full px-3.5 py-2 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary bg-white text-emerald-800"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    {isHindi ? 'IFSC कोड (IFSC Code) *' : 'IFSC Code *'}
                  </label>
                  <input
                    type="text"
                    name="ifscCode"
                    value={formData.ifscCode || ''}
                    onChange={handleInputChange}
                    placeholder="e.g. SBIN0001234"
                    className="w-full px-3.5 py-2 text-sm font-mono font-bold uppercase border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* LOGO & BARCODE UPLOAD SECTION */}
            <div className="pt-4 border-t border-slate-200 space-y-6">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>🖼️</span> {isHindi ? '3. कार्यालय लोगो एवं ऑनलाइन भुगतान बारकोड (Logo & Payment QR)' : '3. Office Logo & Payment Barcode'}
              </h3>

              {/* LOGO SELECTION / UPLOAD */}
              <div className="space-y-3 bg-amber-50/60 border border-amber-200 p-4 rounded-xl">
                <label className="block text-xs font-bold text-amber-950 uppercase">
                  {isHindi ? 'ग्राम पंचायत लोगो (Office Logo)' : 'Office Logo'}
                </label>

                {/* Preset Emblem Selection */}
                <p className="text-xs text-amber-900 font-medium">
                  {isHindi ? 'पूर्वनिर्धारित शासकीय प्रतीक चुनें या अपनी स्वयं की लोगो इमेज फाइल अपलोड करें:' : 'Choose a preset official emblem or upload custom image:'}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PRESET_LOGOS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, logoUrl: p.url }))}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        formData.logoUrl === p.url
                          ? 'bg-amber-100 border-amber-600 shadow-sm ring-2 ring-amber-500'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <img src={p.url} alt={p.name} className="w-10 h-10 object-contain shrink-0" />
                      <span className="text-xs font-bold text-slate-800 leading-tight">{p.name}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <span className="text-xs font-bold text-slate-500">{isHindi ? 'अथवा लोगो इमेज अपलोड करें:' : 'Or Upload Custom Logo Image:'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logoUrl')}
                    className="text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary file:text-white hover:file:bg-primary-700 cursor-pointer"
                  />
                </div>
              </div>

              {/* PAYMENT BARCODE / QR CODE UPLOAD & AUTO GENERATOR */}
              <div className="space-y-3 bg-cyan-50/60 border border-cyan-200 p-4 rounded-xl">
                <label className="block text-xs font-bold text-cyan-950 uppercase">
                  {isHindi ? 'डिजिटल भुगतान बारकोड / UPI QR Code' : 'Payment QR Barcode'}
                </label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Option A: Upload Barcode Image */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <p className="text-xs font-bold text-slate-800">
                      {isHindi ? '1. अपने बैंक QR कोड का स्क्रीनशॉट/फोटो अपलोड करें:' : '1. Upload QR Code Image:'}
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'qrCodeUrl')}
                      className="text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-cyan-700 file:text-white hover:file:bg-cyan-800 cursor-pointer"
                    />
                  </div>

                  {/* Option B: Auto-Generate UPI QR */}
                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                    <p className="text-xs font-bold text-slate-800">
                      {isHindi ? '2. या 1-क्लिक में UPI बारकोड जनरेट करें:' : '2. Or Auto-Generate UPI Barcode:'}
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={upiIdInput}
                        onChange={(e) => setUpiIdInput(e.target.value)}
                        placeholder="e.g. grampanchayat@sbi"
                        className="flex-1 px-3 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-cyan-500"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateUpiQr}
                        className="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        {isHindi ? 'जनरेट QR' : 'Generate'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-black text-sm rounded-xl shadow-lg transition-all transform hover:scale-[1.01] cursor-pointer flex items-center gap-2"
              >
                <span>{isSaving ? '⏳' : '💾'}</span>
                <span>
                  {isSaving
                    ? (isHindi ? 'डेटाबेस में सुरक्षित हो रहा है...' : 'Saving to Database...')
                    : (isHindi ? 'कार्यालय विवरण एवं बैंक प्रोफाइल सेव करें' : 'Save Office & Bank Profile')}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT 1 COL: LIVE PREVIEW CARD */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl space-y-4 border border-slate-800 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <span>👁️</span> {isHindi ? 'लाइव रसीद व मांग नोटिस प्रीव्यू' : 'Live Official Header Preview'}
              </span>
              <span className="bg-emerald-500 text-slate-950 px-2 py-0.5 rounded text-[10px] font-black">
                ACTIVE
              </span>
            </div>

            <p className="text-[11px] text-slate-300">
              {isHindi ? 'आपके द्वारा दर्ज किया गया कार्यालय विवरण, लोगो, बैंक विवरण एवं बारकोड सभी बिल, कर रसीद एवं मांग नोटिस पर इस प्रकार दिखेगा:' : 'Your registered logo, office info, bank details & QR code will appear on all bills & demand notices as below:'}
            </p>

            {/* MOCK OFFICIAL HEADER CARD */}
            <div className="bg-white text-slate-900 p-4 rounded-xl space-y-4 border-2 border-slate-300 font-sans shadow-inner">
              <OfficialVoucherHeader
                officeDetails={formData}
                admin={admin}
                adminPanchayat={formData.gramPanchayat || admin?.gramPanchayat}
                voucherTitle="डिजिटल कर रसीद एवं मांग नोटिस प्रपत्र"
                badgeBgColor="bg-amber-50 text-amber-950 border-amber-300"
              />

              {/* BANK & QR FOOTER PREVIEW */}
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[10px] space-y-1">
                <p className="font-extrabold text-slate-800 border-b pb-1 text-[10px] flex justify-between">
                  <span>🏦 बैंक भुगतान विवरण:</span>
                  <span className="text-emerald-700 font-mono">{formData.ifscCode}</span>
                </p>
                <p><span className="text-slate-500">बैंक:</span> <strong className="text-slate-900">{formData.bankName}</strong></p>
                <p><span className="text-slate-500">खाता:</span> <strong className="text-slate-900">{formData.accountName}</strong></p>
                <p><span className="text-slate-500">A/C No:</span> <strong className="text-emerald-800 font-mono">{formData.accountNumber}</strong></p>
              </div>

              {formData.qrCodeUrl && (
                <div className="text-center bg-cyan-50/80 p-2 rounded-lg border border-cyan-200">
                  <p className="text-[9px] font-bold text-cyan-950 mb-1">📱 UPI / ऑनलाइन कर भुगतान क्यूआर कोड</p>
                  <img src={formData.qrCodeUrl} alt="QR Code" className="w-24 h-24 mx-auto object-contain border border-white rounded shadow-sm" />
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-500 font-bold">
                <div>[ मुहर ]</div>
                <div className="text-right">
                  <p className="text-slate-900 font-black">{formData.secretaryName}</p>
                  <p className="text-[8px] text-slate-500">ग्राम पंचायत सचिव</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageOfficeView;
