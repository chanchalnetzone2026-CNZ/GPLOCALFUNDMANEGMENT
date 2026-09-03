/**
 * Location Normalization & Canonical Matching Utilities
 * Ensures seamless bridging between Hindi & English district, block, and gram panchayat names.
 */

// Comprehensive Hindi & English district name aliases for Madhya Pradesh
export const CANONICAL_DISTRICTS: Record<string, string> = {
  // Narsinghpur
  'नरसिंहपुर': 'NARSINGHPUR',
  'नरसिम्हापुर': 'NARSINGHPUR',
  'नरसिंह पुर': 'NARSINGHPUR',
  'narsinghpur': 'NARSINGHPUR',
  'narsimhapur': 'NARSINGHPUR',
  'narsingpur': 'NARSINGHPUR',

  // Sehore
  'सीहोर': 'SEHORE',
  'sehore': 'SEHORE',

  // Bhopal
  'भोपाल': 'BHOPAL',
  'bhopal': 'BHOPAL',

  // Indore
  'इंदौर': 'INDORE',
  'इन्दौर': 'INDORE',
  'indore': 'INDORE',

  // Jabalpur
  'जबलपुर': 'JABALPUR',
  'jabalpur': 'JABALPUR',

  // Gwalior
  'ग्वालियर': 'GWALIOR',
  'gwalior': 'GWALIOR',

  // Ujjain
  'उज्जैन': 'UJJAIN',
  'ujjain': 'UJJAIN',

  // Sagar
  'सागर': 'SAGAR',
  'sagar': 'SAGAR',

  // Rewa
  'रीवा': 'REWA',
  'rewa': 'REWA',

  // Satna
  'सतना': 'SATNA',
  'satna': 'SATNA',

  // Vidisha
  'विदिशा': 'VIDISHA',
  'vidisha': 'VIDISHA',

  // Raisen
  'रायसेन': 'RAISEN',
  'raisen': 'RAISEN',

  // Rajgarh
  'राजगढ़': 'RAJGARH',
  'rajgarh': 'RAJGARH',

  // Hoshangabad / Narmadapuram
  'होशंगाबाद': 'Narmadapuram',
  'नर्मदापुरम': 'Narmadapuram',
  'hoshangabad': 'Narmadapuram',
  'narmadapuram': 'Narmadapuram',

  // Harda
  'हरदा': 'Harda',
  'harda': 'Harda',

  // Betul
  'बैतूल': 'Betul',
  'betul': 'Betul',

  // Chhindwara
  'छिंदवाड़ा': 'Chhindwara',
  'chhindwara': 'Chhindwara',

  // Seoni
  'सिवनी': 'Seoni',
  'seoni': 'Seoni',

  // Balaghat
  'बालाघाट': 'Balaghat',
  'balaghat': 'Balaghat',

  // Mandla
  'मंडला': 'Mandla',
  'mandla': 'Mandla',

  // Dindori
  'डिंडोरी': 'Dindori',
  'dindori': 'Dindori',

  // Katni
  'कटनी': 'Katni',
  'katni': 'Katni',

  // Damoh
  'दमोह': 'Damoh',
  'damoh': 'Damoh',

  // Panna
  'पन्ना': 'Panna',
  'panna': 'Panna',

  // Chhatarpur
  'छतरपुर': 'Chhatarpur',
  'chhatarpur': 'Chhatarpur',

  // Tikamgarh
  'टीकमगढ़': 'Tikamgarh',
  'tikamgarh': 'Tikamgarh',

  // Niwari
  'निवाड़ी': 'Niwari',
  'niwari': 'Niwari',

  // Datia
  'दतिया': 'Datia',
  'datia': 'Datia',

  // Shivpuri
  'शिवपुरी': 'Shivpuri',
  'shivpuri': 'Shivpuri',

  // Guna
  'गुना': 'Guna',
  'guna': 'Guna',

  // Ashoknagar
  'अशोकनगर': 'Ashoknagar',
  'ashoknagar': 'Ashoknagar',

  // Morena
  'मुरैना': 'Morena',
  'morena': 'Morena',

  // Bhind
  'भिंड': 'Bhind',
  'bhind': 'Bhind',

  // Sheopur
  'श्योपुर': 'Sheopur',
  'sheopur': 'Sheopur',

  // Ratlam
  'रतलाम': 'Ratlam',
  'ratlam': 'Ratlam',

  // Mandsaur
  'मंदसौर': 'Mandsaur',
  'mandsaur': 'Mandsaur',

  // Neemuch
  'नीमच': 'Neemuch',
  'neemuch': 'Neemuch',

  // Dewas
  'देवास': 'Dewas',
  'dewas': 'Dewas',

  // Shajapur
  'शाजापुर': 'Shajapur',
  'shajapur': 'Shajapur',

  // Agar-Malwa
  'आगर मालवा': 'Agar-Malwa',
  'agar-malwa': 'Agar-Malwa',
  'agarmalwa': 'Agar-Malwa',

  // Khandwa
  'खंडवा': 'Khandwa (East Nimar)',
  'khandwa': 'Khandwa (East Nimar)',

  // Khargone
  'खरगोन': 'Khargone (West Nimar)',
  'khargone': 'Khargone (West Nimar)',

  // Barwani
  'बड़वानी': 'Barwani',
  'barwani': 'Barwani',

  // Burhanpur
  'बुरहानपुर': 'Burhanpur',
  'burhanpur': 'Burhanpur',

  // Dhar
  'धार': 'Dhar',
  'dhar': 'Dhar',

  // Alirajpur
  'अलीराजपुर': 'Alirajpur',
  'alirajpur': 'Alirajpur',

  // Jhabua
  'झाबुआ': 'Jhabua',
  'jhabua': 'Jhabua',

  // Shahdol
  'शहडोल': 'Shahdol',
  'shahdol': 'Shahdol',

  // Umaria
  'उमरिया': 'Umaria',
  'umaria': 'Umaria',

  // Anuppur
  'अनूपपुर': 'Anuppur',
  'anuppur': 'Anuppur',

  // Sidhi
  'सीधी': 'Sidhi',
  'sidhi': 'Sidhi',

  // Singrauli
  'सिंगरौली': 'Singrauli',
  'singrauli': 'Singrauli',

  // Maihar
  'मैहर': 'Maihar',
  'maihar': 'Maihar',

  // Mauganj
  'मऊगंज': 'MAUGANJ',
  'mauganj': 'MAUGANJ',

  // Pandhurna
  'पांढुर्णा': 'Pandhurna',
  'pandhurna': 'Pandhurna',
};

// Comprehensive Hindi & English block name aliases
export const CANONICAL_BLOCKS: Record<string, string> = {
  // Narsinghpur District Blocks
  'करेली': 'KARELI',
  'kareli': 'KARELI',
  'नरसिंहपुर': 'NARSIMHAPUR',
  'narsinghpur': 'NARSIMHAPUR',
  'narsimhapur': 'NARSIMHAPUR',
  'गाडरवारा': 'GADARWARA',
  'gadarwara': 'GADARWARA',
  'गोटेगांव': 'GOTEGAON',
  'gotegaon': 'GOTEGAON',
  'चांवरपाठा': 'CHANWARPATHA',
  'chanwarpatha': 'CHANWARPATHA',
  'साईंखेड़ा': 'SAIKHEDA',
  'saikheda': 'SAIKHEDA',
  'बाबई चीचली': 'BABAI CHICHLI',
  'babai chichli': 'BABAI CHICHLI',
  'चीचली': 'BABAI CHICHLI',
  'chichli': 'BABAI CHICHLI',

  // Sehore District Blocks
  'सीहोर': 'SEHORE',
  'sehore': 'SEHORE',
  'इछावर': 'ICHAWAR',
  'ichawar': 'ICHAWAR',
  'आष्टा': 'ASHTA',
  'ashta': 'ASHTA',
  'बुधनी': 'BUDHNI',
  'budhni': 'BUDHNI',
  'नसरुल्लागंज': 'NASRULLAGANJ',
  'भेरूंदा': 'NASRULLAGANJ',
  'nasrullaganj': 'NASRULLAGANJ',
  'श्यामपुर': 'SHYAMPUR',
  'shyampur': 'SHYAMPUR',

  // Bhopal District Blocks
  'फंदा': 'PHANDA',
  'phanda': 'PHANDA',
  'बैरसिया': 'BERASIA',
  'berasia': 'BERASIA',

  // Jabalpur District Blocks
  'पाटन': 'PATAN',
  'patan': 'PATAN',
  'पनागर': 'PANAGAR',
  'panagar': 'PANAGAR',
  'सिहोरा': 'SIHORA',
  'sihora': 'SIHORA',
  'मझौली': 'MAJHOLI',
  'majholi': 'MAJHOLI',
  'शहपुरा': 'SHAHPURA',
  'shahpura': 'SHAHPURA',
  'कुंडम': 'KUNDAM',
  'kundam': 'KUNDAM',
};

// Known Gram Panchayat cross-language mappings
export const CANONICAL_PANCHAYATS: Record<string, string> = {
  'जोवा': 'JOVA',
  'jova': 'JOVA',
  'jowa': 'JOVA',
  'कठौतिया': 'KATHOUTIYA',
  'कठोतिया': 'KATHOUTIYA',
  'kathoutiya': 'KATHOUTIYA',
  'kathotiya': 'KATHOUTIYA',
  'पिपरिया रंकई': 'PIPARIYA RANKAI',
  'पिपरिया रनकई': 'PIPARIYA RANKAI',
  'pipariya rankai': 'PIPARIYA RANKAI',
};

/**
 * Strips prefixes and non-essential noise from any regional string
 */
export function cleanRegionalNoise(val?: string): string {
  if (!val) return '';
  return val
    .replace(/(कार्यालय\s*जनपद\s*पंचायत|जनपद\s*पंचायत|कार्यालय\s*ग्राम\s*पंचायत|ग्राम\s*पंचायत|कार्यालय|ब्लॉक|जनपद|जिला|ग्रामपंचायत|office\s*gram\s*panchayat|gram\s*panchayat|janpad\s*panchayat|janpad|district|block|office|panchayat|gp)/gi, '')
    .trim();
}

/**
 * Returns canonical district representation matching LOCATIONS keys (uppercase English).
 */
export function getCanonicalDistrict(val?: string): string {
  if (!val) return '';
  const cleaned = cleanRegionalNoise(val);
  const trimmed = cleaned.trim();
  const lower = trimmed.toLowerCase();

  // Direct lookup
  if (CANONICAL_DISTRICTS[trimmed]) return CANONICAL_DISTRICTS[trimmed].toUpperCase();
  if (CANONICAL_DISTRICTS[lower]) return CANONICAL_DISTRICTS[lower].toUpperCase();

  // Substring match
  for (const [key, canon] of Object.entries(CANONICAL_DISTRICTS)) {
    if (trimmed.includes(key) || lower.includes(key.toLowerCase())) {
      return canon.toUpperCase();
    }
  }

  // Fallback: sanitized uppercase
  return trimmed.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '').toUpperCase() || 'NARSINGHPUR';
}

/**
 * Returns canonical block representation (uppercase English).
 */
export function getCanonicalBlock(val?: string): string {
  if (!val) return '';
  const cleaned = cleanRegionalNoise(val);
  const trimmed = cleaned.trim();
  const lower = trimmed.toLowerCase();

  // Direct lookup
  if (CANONICAL_BLOCKS[trimmed]) return CANONICAL_BLOCKS[trimmed].toUpperCase();
  if (CANONICAL_BLOCKS[lower]) return CANONICAL_BLOCKS[lower].toUpperCase();

  // Substring match
  for (const [key, canon] of Object.entries(CANONICAL_BLOCKS)) {
    if (trimmed.includes(key) || lower.includes(key.toLowerCase())) {
      return canon.toUpperCase();
    }
  }

  // Fallback: sanitized uppercase
  return trimmed.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '').toUpperCase() || 'KARELI';
}

/**
 * Returns canonical gram panchayat representation for deduplication.
 */
export function getCanonicalPanchayat(val?: string): string {
  if (!val) return '';
  const cleaned = cleanRegionalNoise(val);
  const trimmed = cleaned.trim();
  const lower = trimmed.toLowerCase();

  // Check known map
  if (CANONICAL_PANCHAYATS[trimmed]) return CANONICAL_PANCHAYATS[trimmed];
  if (CANONICAL_PANCHAYATS[lower]) return CANONICAL_PANCHAYATS[lower];

  for (const [key, canon] of Object.entries(CANONICAL_PANCHAYATS)) {
    if (trimmed.includes(key) || lower.includes(key.toLowerCase())) {
      return canon;
    }
  }

  // Fallback: remove symbols and normalize to uppercase
  return trimmed.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '').toUpperCase();
}
