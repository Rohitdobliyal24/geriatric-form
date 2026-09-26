import { describe, expect, it } from 'vitest';
import { assessmentSchema } from './schema';

const validAssessment = {
  mrn: 'MRN-004821',
  patientName: 'Sushila Deshpande',
  dateOfBirth: '1949-03-12',
  assessmentDate: '2026-08-07',
  mobility: 'cane',
  barthelIndex: 80,
  medicationCount: 3,
  pharmacistReviewRequested: false,
  followUpDate: '2026-09-04',
  consentObtained: true,
};

describe('assessmentSchema - age boundary (60 years, checked against assessmentDate)', () => {
  it('accepts a patient who turns exactly 60 on the assessment date', () => {
    const result = assessmentSchema.safeParse({
      ...validAssessment,
      dateOfBirth: '1966-08-07',
      assessmentDate: '2026-08-07',
    });

    expect(result.success).toBe(true);
  });

  it('rejects a patient who is one day short of 60 on the assessment date', () => {
    const result = assessmentSchema.safeParse({
      ...validAssessment,
      dateOfBirth: '1966-08-08',
      assessmentDate: '2026-08-07',
    });

    if (result.success) {
      throw new Error('expected validation to fail for a patient one day short of 60');
    }

    const dobIssue = result.error.issues.find((issue) => issue.path.join('.') === 'dateOfBirth');
    expect(dobIssue?.message).toBe('This pathway is for patients aged 60 and over');
  });
});
