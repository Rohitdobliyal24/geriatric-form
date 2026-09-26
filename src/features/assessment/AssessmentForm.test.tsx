import { describe, expect, it, vi } from 'vitest';
import { render, screen, userEvent, waitFor } from '../../../test-utils';
import { AssessmentForm } from './AssessmentForm';

describe('AssessmentForm', () => {
  it('loads the sample patient and submits the Zod-parsed values via the save handler', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);

    render(<AssessmentForm onSave={onSave} />);

    await user.click(screen.getByRole('button', { name: /load sample patient/i }));
    await user.click(screen.getByRole('button', { name: /save assessment/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledTimes(1);
    });

    // Assert on the parsed Assessment the save handler actually received,
    // not the raw (loosely-typed) form state.
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
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
      })
    );

    await waitFor(() => {
      expect(screen.getByText(/assessment saved/i)).toBeInTheDocument();
    });
  });
});
