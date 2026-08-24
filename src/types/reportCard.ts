export interface CBCSubjectMark {
  id: number;
  name: string;
  t1: number | string;
  t2: number | string;
  t3: number | string;
  avg?: number;
  grade?: string;
  remarks?: string;
}

export type LearnerRating = 'E' | 'VG' | 'G' | 'S' | 'N';

export interface LearnerProfileRatings {
  attendance: LearnerRating;
  punctuality: LearnerRating;
  discipline: LearnerRating;
  initiative: LearnerRating;
  cooperation: LearnerRating;
  respect: LearnerRating;
  neatness: LearnerRating;
  cocurricular: LearnerRating;
}

export interface StudentReport {
  id: string;
  reportNo: string;
  year: string;
  schoolName: string;
  name: string;
  gradeClass: string;
  stream: string;
  term: '1ST TERM' | '2ND TERM' | '3RD TERM';
  photoUrl?: string;
  nrc: string;
  examNo: string;
  gender: 'Male' | 'Female';
  dob: string;
  status: 'Draft' | 'Approved' | 'Published';
  subjects: CBCSubjectMark[];
  learnerProfile: LearnerProfileRatings;
  teacherRemarks: string;
  teacherName: string;
  teacherDate: string;
  daysOpened: number;
  daysPresent: number;
  daysAbsent: number;
  headTeacherName: string;
  headTeacherDate: string;
  parentName: string;
  parentDate: string;
  historyRecords?: {
    term: string;
    year: string;
    average: number;
    gradeSummary: string;
    position: string;
    attendance: string;
  }[];
}

export const calculateCBCGrade = (score: number): { grade: string; desc: string } => {
  if (isNaN(score)) return { grade: '-', desc: '-' };
  if (score >= 80) return { grade: 'A', desc: 'Excellent' };
  if (score >= 70) return { grade: 'B', desc: 'Very Good' };
  if (score >= 60) return { grade: 'C', desc: 'Good' };
  if (score >= 50) return { grade: 'D', desc: 'Satisfactory' };
  if (score >= 40) return { grade: 'E', desc: 'Fair' };
  return { grade: 'F', desc: 'Needs Improvement' };
};

export const getDefaultRemark = (grade: string): string => {
  switch (grade) {
    case 'A': return 'Outstanding mastery of curriculum competencies.';
    case 'B': return 'Commendable effort with very good performance.';
    case 'C': return 'Good consistent application in learning area.';
    case 'D': return 'Satisfactory understanding; regular review advised.';
    case 'E': return 'Fair grasp; additional guided coaching recommended.';
    case 'F': return 'Needs intensive remedial support and structured practice.';
    default: return 'Satisfactory progress demonstrated.';
  }
};
