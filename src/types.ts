export interface SchoolClass {
  id: string;
  name: string; // e.g. "Grade 10A (Pure Sciences)"
  grade: string; // e.g. "Grade 10"
  stream?: string; // e.g. "Pure Sciences", "Commercial", "Arts & Humanities", "Technical & Vocational"
  school: string;
  academicYear?: string;
  term?: string;
  room?: string;
  capacity?: number;
  classTeacherName?: string;
  classTeacherEmail?: string;
  classTeacherPhone?: string;
  classTeacherId?: string;
  subjects?: string[]; // Array of CBC subject names
  enrolledCount?: number;
  createdAt?: any;
}

export interface CBCSubjectDefinition {
  name: string;
  code: string;
  category: 'Core Curriculum' | 'Sciences & Mathematics (STEM)' | 'Languages & Literature' | 'Social Sciences & Humanities' | 'Business & Financial Literacy' | 'Technical, Practical & Vocational' | 'Creative Arts & Physical Well-being';
  level: 'Primary' | 'Junior Secondary' | 'Senior Secondary' | 'All Levels';
  description?: string;
}

export interface SchoolSubject {
  id: string;
  name: string; // e.g. "Mathematics", "English Language"
  code: string; // e.g. "MATH-10"
  grade?: string;
  classId?: string;
  className?: string;
  teacherName?: string;
  teacherEmail?: string;
  periodsPerWeek?: number;
  syllabusType?: 'ECZ Core' | 'ECZ Elective' | 'Zambia National Curriculum' | 'Practical / Vocational';
  school?: string;
}

export interface StudentCandidate {
  id: string;
  name: string;
  grade: string;
  classId?: string;
  className?: string;
  school: string;
  examNo?: string;
  gender?: 'Male' | 'Female';
  dob?: string;
  nrc?: string;
  status?: 'Active' | 'Transferred' | 'Graduated';
  guardianName?: string;
  guardianRelationship?: 'Father' | 'Mother' | 'Guardian' | 'Sponsor' | 'Grandparent';
  guardianPhone?: string;
  guardianEmergencyPhone?: string;
  guardianEmail?: string;
  guardianAddress?: string;
  guardianTown?: string;
  attendanceRate?: number;
  caStatus?: 'Up to Date' | 'Pending CA1' | 'Pending CA2' | 'Completed';
  createdAt?: any;
}

export interface ParentGuardianRecord {
  id: string;
  guardianName: string;
  relationship: 'Father' | 'Mother' | 'Guardian' | 'Sponsor' | 'Grandparent';
  phone: string;
  emergencyPhone?: string;
  email?: string;
  address?: string;
  town?: string;
  school: string;
  children: {
    studentId: string;
    studentName: string;
    grade: string;
    className: string;
  }[];
}
