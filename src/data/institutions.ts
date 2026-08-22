export interface InstitutionItem {
  name: string;
  category: 'Higher Education' | 'Secondary Schools' | 'Primary Schools' | 'Administrative';
  province?: string;
  code?: string;
}

export const defaultInstitutions: InstitutionItem[] = [
  // --- HIGHER EDUCATION ---
  { name: 'National University of Technology', category: 'Higher Education', province: 'Central Region', code: 'NUT-01' },
  { name: 'National Institute of Technology (CBU)', category: 'Higher Education', province: 'North Region', code: 'CBU-01' },
  { name: 'Mulungushi Academy', category: 'Higher Education', province: 'Central', code: 'MU-01' },
  { name: 'Kwame Nkrumah Institute', category: 'Higher Education', province: 'Central', code: 'KNU-01' },
  { name: 'Chalimbana University', category: 'Higher Education', province: 'Capital', code: 'CHAL-01' },
  { name: 'Mukuba University', category: 'Higher Education', province: 'North Region', code: 'MUK-01' },
  { name: 'Levy Mwanawasa Medical University', category: 'Higher Education', province: 'Capital', code: 'LMMU-01' },
  { name: 'Evelyn Hone College', category: 'Higher Education', province: 'Capital', code: 'EHC-01' },
  { name: 'Natural Resources Development College', category: 'Higher Education', province: 'Capital', code: 'NRDC-01' },
  { name: 'Northern Technical College', category: 'Higher Education', province: 'North Region', code: 'NORTEC-01' },
  { name: 'National Institute of Mass Communication', category: 'Higher Education', province: 'Capital', code: 'ZAM-01' },
  { name: 'University of Lusaka', category: 'Higher Education', province: 'Capital', code: 'UNILUS-01' },
  { name: 'Cavendish University', category: 'Higher Education', province: 'Capital', code: 'CUZ-01' },
  { name: 'Texila American University', category: 'Higher Education', province: 'Capital', code: 'TAU-01' },
  { name: 'Mansha University', category: 'Higher Education', province: 'Eastern', code: 'MAN-01' },
  { name: 'National Catholic University', category: 'Higher Education', province: 'North Region' },
  { name: 'Gideon Robert University', category: 'Higher Education', province: 'Capital' },
  { name: 'Information and Communications University', category: 'Higher Education', province: 'Capital' },
  { name: 'Victoria Falls University of Technology', category: 'Higher Education', province: 'Southern' },
  { name: 'Rusangu University', category: 'Higher Education', province: 'Southern' },

  // --- SECONDARY SCHOOLS ---
  { name: 'Capital Boys Secondary School', category: 'Secondary Schools', province: 'Capital', code: 'LBS-01' },
  { name: 'Capital Girls Secondary School', category: 'Secondary Schools', province: 'Capital', code: 'LGS-01' },
  { name: 'Kabulonga Boys Secondary School', category: 'Secondary Schools', province: 'Capital', code: 'KBBS-01' },
  { name: 'Kabulonga Girls Secondary School', category: 'Secondary Schools', province: 'Capital', code: 'KBGS-01' },
  { name: 'Matero Boys Secondary School', category: 'Secondary Schools', province: 'Capital', code: 'MAT-01' },
  { name: 'David Kaunda National Technical School', category: 'Secondary Schools', province: 'Capital', code: 'DK-01' },
  { name: 'Munali Boys Secondary School', category: 'Secondary Schools', province: 'Capital', code: 'MUN-01' },
  { name: 'Munali Girls Secondary School', category: 'Secondary Schools', province: 'Capital', code: 'MUNG-01' },
  { name: 'Chunga Secondary School', category: 'Secondary Schools', province: 'Capital', code: 'CHUN-01' },
  { name: 'Twin Palm Secondary School', category: 'Secondary Schools', province: 'Capital', code: 'TWIN-01' },
  { name: 'Kamwala Secondary School', category: 'Secondary Schools', province: 'Capital', code: 'KAM-01' },
  { name: 'Arakan Secondary School', category: 'Secondary Schools', province: 'Capital', code: 'ARA-01' },
  { name: 'Hillcrest National Technical High School', category: 'Secondary Schools', province: 'Southern' },
  { name: 'Linda Secondary School', category: 'Secondary Schools', province: 'Southern' },
  { name: "St. John's Secondary School", category: 'Secondary Schools', province: 'Western' },
  { name: 'Kambule Secondary School', category: 'Secondary Schools', province: 'Western' },
  { name: 'Kalabo Secondary School', category: 'Secondary Schools', province: 'Western' },
  { name: 'Senanga Secondary School', category: 'Secondary Schools', province: 'Western' },
  { name: 'Lukulu Secondary School', category: 'Secondary Schools', province: 'Western' },
  { name: 'Kaoma Secondary School', category: 'Secondary Schools', province: 'Western' },
  { name: 'Mansa Secondary School', category: 'Secondary Schools', province: 'Luapula' },
  { name: "St. Clement's Secondary School", category: 'Secondary Schools', province: 'Luapula' },
  { name: 'Samfya Secondary School', category: 'Secondary Schools', province: 'Luapula' },
  { name: 'Kawambwa Boys Secondary School', category: 'Secondary Schools', province: 'Luapula' },
  { name: 'Mporokoso Secondary School', category: 'Secondary Schools', province: 'Northern' },
  { name: 'Kasama Boys Secondary School', category: 'Secondary Schools', province: 'Northern' },
  { name: 'Kasama Girls Secondary School', category: 'Secondary Schools', province: 'Northern' },
  { name: 'Mungwi Technical High School', category: 'Secondary Schools', province: 'Northern' },
  { name: 'Chinsali Girls Secondary School', category: 'Secondary Schools', province: 'Muchinga' },
  { name: 'Kenneth Kaunda Secondary School', category: 'Secondary Schools', province: 'Muchinga' },
  { name: 'Isoka Boys Secondary School', category: 'Secondary Schools', province: 'Muchinga' },
  { name: 'Mpika Boys Secondary School', category: 'Secondary Schools', province: 'Muchinga' },
  { name: 'Chizongwe Technical Secondary School', category: 'Secondary Schools', province: 'Eastern' },
  { name: 'Katete Girls Secondary School', category: 'Secondary Schools', province: 'Eastern' },
  { name: 'Petauke Boarding Secondary School', category: 'Secondary Schools', province: 'Eastern' },
  { name: 'Lundazi Boarding Secondary School', category: 'Secondary Schools', province: 'Eastern' },
  { name: 'Mpelembe Secondary School', category: 'Secondary Schools', province: 'North Region' },
  { name: 'Fatima Girls Secondary School', category: 'Secondary Schools', province: 'North Region' },
  { name: 'Ibenga Girls Secondary School', category: 'Secondary Schools', province: 'North Region' },
  { name: 'Chifubu Secondary School', category: 'Secondary Schools', province: 'North Region' },
  { name: 'Kantanshi Secondary School', category: 'Secondary Schools', province: 'North Region' },
  { name: 'Kalulushi Trust School', category: 'Secondary Schools', province: 'North Region' },

  // --- PRIMARY SCHOOLS ---
  { name: 'Woodlands A Primary School', category: 'Primary Schools', province: 'Capital' },
  { name: 'Woodlands B Primary School', category: 'Primary Schools', province: 'Capital' },
  { name: 'Kabulonga Primary School', category: 'Primary Schools', province: 'Capital' },
  { name: 'Jacaranda Primary School', category: 'Primary Schools', province: 'Capital' },
  { name: 'Northmead Primary School', category: 'Primary Schools', province: 'Capital' },
  { name: 'Lotus Primary School', category: 'Primary Schools', province: 'Capital' },
  { name: 'Emathelo Primary School', category: 'Primary Schools', province: 'Capital' },
  { name: 'Libala Primary School', category: 'Primary Schools', province: 'Capital' },
  { name: 'Kabwata Primary School', category: 'Primary Schools', province: 'Capital' },
  { name: 'Chawama Primary School', category: 'Primary Schools', province: 'Capital' },
  { name: 'Kalingalinga Primary School', category: 'Primary Schools', province: 'Capital' },
  { name: 'Mtendere Primary School', category: 'Primary Schools', province: 'Capital' },
  { name: 'Kaunda Square Primary School', category: 'Primary Schools', province: 'Capital' },
  { name: 'Chelstone Primary School', category: 'Primary Schools', province: 'Capital' },
  { name: 'Bauleni Primary School', category: 'Primary Schools', province: 'Capital' },
  { name: 'Livingstone Primary School', category: 'Primary Schools', province: 'Southern' },
  { name: 'Victoria Falls Primary School', category: 'Primary Schools', province: 'Southern' },
  { name: 'Choma Primary School', category: 'Primary Schools', province: 'Southern' },
  { name: 'Mazabuka Primary School', category: 'Primary Schools', province: 'Southern' },
  { name: 'Mongu Primary School', category: 'Primary Schools', province: 'Western' },
  { name: 'Ndola Primary School', category: 'Primary Schools', province: 'North Region' },
  { name: 'Kitwe Primary School', category: 'Primary Schools', province: 'North Region' },
  { name: 'Chingola Primary School', category: 'Primary Schools', province: 'North Region' },
  { name: 'Mufulira Primary School', category: 'Primary Schools', province: 'North Region' },
  { name: 'Luanshya Primary School', category: 'Primary Schools', province: 'North Region' },
  { name: 'Kalulushi Primary School', category: 'Primary Schools', province: 'North Region' },
  { name: 'Mansa Primary School', category: 'Primary Schools', province: 'Luapula' },
  { name: 'Kasama Primary School', category: 'Primary Schools', province: 'Northern' },
  { name: 'Chipata Primary School', category: 'Primary Schools', province: 'Eastern' },
  { name: 'Kabwe Primary School', category: 'Primary Schools', province: 'Central' },

  // --- ADMINISTRATIVE ---
  { name: 'Ministry of Education Headquarters', category: 'Administrative', province: 'Capital', code: 'MOE-HQ' },
  { name: 'National Examinations Council', category: 'Administrative', province: 'Capital', code: 'ECZ-HQ' },
  { name: 'National Teaching Council', category: 'Administrative', province: 'Capital', code: 'TCZ-HQ' },
  { name: 'Curriculum Development Centre', category: 'Administrative', province: 'Capital', code: 'CDC-HQ' },
  { name: 'Capital Provincial Education Office', category: 'Administrative', province: 'Capital', code: 'PEO-LUS' }
];

let cachedInstitutions: InstitutionItem[] = [...defaultInstitutions];

if (typeof window !== "undefined") {
  try {
    const custom = localStorage.getItem('eduzam_custom_schools');
    if (custom) {
      const parsed = JSON.parse(custom) as InstitutionItem[];
      cachedInstitutions = [...defaultInstitutions, ...parsed];
    }
  } catch(e){}
}

export const getZambianInstitutions = (): InstitutionItem[] => {
  return cachedInstitutions;
};

export const addZambianInstitution = async (school: InstitutionItem) => {
  try {
    const custom = localStorage.getItem('eduzam_custom_schools');
    const existing = custom ? JSON.parse(custom) as InstitutionItem[] : [];
    existing.push(school);
    localStorage.setItem('eduzam_custom_schools', JSON.stringify(existing));
    
    cachedInstitutions.push(school);
    window.dispatchEvent(new Event("eduzam_schools_updated"));
  } catch (err) {}
};
