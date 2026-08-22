export interface SchoolLocationProfile {
  town: string;
  province: string;
  suburbs: string[];
}

export function getLocationForSchool(schoolName: string): SchoolLocationProfile {
  const s = schoolName.toLowerCase();
  
  if (s.includes('munali') || s.includes('kabulonga') || s.includes('matero') || s.includes('david kaunda') || s.includes('kamwala') || s.includes('arakan') || s.includes('twin palm') || s.includes('woodlands') || s.includes('jacaranda') || s.includes('northmead') || s.includes('libala') || s.includes('kabwata') || s.includes('chelstone') || s.includes('chunga')) {
    return {
      town: 'Lusaka',
      province: 'Lusaka Province',
      suburbs: ['Munali Residential', 'Chelston Green', 'Avondale Phase 2', 'Rhodes Park', 'Woodlands Extension', 'Northmead', 'Kabulonga', 'Matero East', 'Kamwala South', 'Ibex Hill']
    };
  }

  if (s.includes('hillcrest') || s.includes('livingstone') || s.includes('victoria falls') || s.includes('linda') || s.includes('choma') || s.includes('mazabuka')) {
    return {
      town: 'Livingstone / Choma',
      province: 'Southern Province',
      suburbs: ['Highlands Residential', 'Maramba East', 'Dambwa North', 'Riverside Park', 'Town Centre Area', 'Batoka Valley']
    };
  }

  if (s.includes('mpelembe') || s.includes('fatima') || s.includes('ibenga') || s.includes('chifubu') || s.includes('kantanshi') || s.includes('ndola') || s.includes('kitwe') || s.includes('chingola') || s.includes('mufulira') || s.includes('luanshya')) {
    return {
      town: 'Kitwe / Ndola',
      province: 'Copperbelt Province',
      suburbs: ['Riverside West', 'Parklands Estate', 'Nkana West', 'Kansenshi Ext', 'Itawa Residential', 'Northrise', 'Mindolo North']
    };
  }

  if (s.includes('chizongwe') || s.includes('katete') || s.includes('petauke') || s.includes('lundazi') || s.includes('chipata')) {
    return {
      town: 'Chipata',
      province: 'Eastern Province',
      suburbs: ['Kalongwezi Residential', 'Mchini Extension', 'Umodzi Highway Area', 'Kapata Center', 'Lunkwakwa']
    };
  }

  if (s.includes('kasama') || s.includes('mungwi') || s.includes('mporokoso')) {
    return {
      town: 'Kasama',
      province: 'Northern Province',
      suburbs: ['Musa Residential', 'Kasama Central', 'Location Suburb', 'Chilubula Area', 'Mulenga Hills']
    };
  }

  if (s.includes('mansa') || s.includes('st. clement') || s.includes('samfya') || s.includes('kawambwa')) {
    return {
      town: 'Mansa',
      province: 'Luapula Province',
      suburbs: ['Mansa Central', 'Senama Residential', 'Kaole Extension', 'Chilyapa Suburb']
    };
  }

  if (s.includes('kambule') || s.includes('st. john') || s.includes('kalabo') || s.includes('senanga') || s.includes('mongu') || s.includes('kaoma')) {
    return {
      town: 'Mongu',
      province: 'Western Province',
      suburbs: ['Limulunga Residential', 'Mongu Central', 'Mulamwa Area', 'Imwiko Suburb']
    };
  }

  if (s.includes('solwezi') || s.includes('mwinilunga') || s.includes('kasempa')) {
    return {
      town: 'Solwezi',
      province: 'North-Western Province',
      suburbs: ['Kansanshi Golf Estate', 'Kyawama Extension', 'Messenger Compound', 'Kazomba Area']
    };
  }

  return {
    town: 'Lusaka / Regional Center',
    province: 'Zambia',
    suburbs: ['Central Residential Area', 'Highlands Suburb', 'Institutional Quarters', 'Town Center Road']
  };
}

export function generateParentDetailsForStudent(studentName: string, schoolName: string, className: string) {
  const parts = studentName.trim().split(' ');
  const surname = parts.length > 1 ? parts[parts.length - 1] : parts[0];
  const loc = getLocationForSchool(schoolName);
  
  const prefixes = ['Dr.', 'Eng.', 'Mr.', 'Mrs.', 'Pastor', 'Prof.', 'Inspector', 'Director'];
  const firstNames = ['Kelvin', 'Mary', 'Peter', 'Grace', 'David', 'Agnes', 'Patrick', 'Charity', 'Bwalya', 'Chanda', 'Mutale', 'Leonard', 'Evelyn', 'Brian', 'Judith', 'George'];
  
  const prefix = prefixes[Math.abs(surname.charCodeAt(0) * 3) % prefixes.length];
  const firstName = firstNames[Math.abs(surname.charCodeAt(surname.length - 1) * 7) % firstNames.length];
  const guardianName = `${prefix} ${firstName} ${surname}`;
  
  const relationship: 'Father' | 'Mother' | 'Guardian' | 'Sponsor' | 'Grandparent' = 
    prefix === 'Mrs.' ? 'Mother' : (prefix === 'Dr.' || prefix === 'Eng.' || prefix === 'Mr.' || prefix === 'Pastor') ? 'Father' : 'Guardian';
  
  const suburb = loc.suburbs[Math.abs(surname.charCodeAt(0) + className.length) % loc.suburbs.length];
  const plotNum = Math.floor(100 + Math.abs(surname.charCodeAt(0) * 37) % 900);
  const address = `Plot ${plotNum}, ${suburb}, ${loc.town}`;
  
  const phoneSuffix = Math.floor(100000 + Math.abs(surname.charCodeAt(0) * 12345) % 900000);
  const carrier = ['97', '96', '95'][Math.abs(surname.charCodeAt(0)) % 3];
  const phone = `+260 ${carrier} ${phoneSuffix.toString().slice(0, 3)} ${phoneSuffix.toString().slice(3)}`;
  const emergencyPhone = `+260 ${carrier === '97' ? '96' : '97'} ${(phoneSuffix + 111111).toString().slice(0, 3)} ${(phoneSuffix + 111111).toString().slice(3)}`;
  const email = `${firstName.toLowerCase()}.${surname.toLowerCase()}@gmail.com`;

  return {
    guardianName,
    relationship,
    phone,
    emergencyPhone,
    email,
    address,
    town: loc.town,
    province: loc.province
  };
}
