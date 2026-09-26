import { useState } from 'react';
import {
  Alert,
  Button,
  Checkbox,
  Code,
  Container,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { DateInput, type DateValue } from '@mantine/dates';
import { schemaResolver, useForm } from '@mantine/form';
import { assessmentSchema, MOBILITY, type Assessment } from './schema';

// The shape the *inputs* work with while the user is filling the form in.
// This is intentionally looser than `Assessment` (the Zod-parsed output type):
// an untouched NumberInput is `''`, an untouched DateInput is `null`, and an
// untouched consent checkbox is `false` -- none of which satisfy `Assessment`
// (e.g. `consentObtained` there is the literal `true`, and `mobility` is a
// closed enum). `schemaResolver` validates these loose values against
// `assessmentSchema` on every blur/submit; the strict `Assessment` value only
// exists once `assessmentSchema.parse()` has actually accepted the form.
type AssessmentFormValues = {
  mrn: string;
  patientName: string;
  dateOfBirth: DateValue;
  assessmentDate: DateValue;
  mobility: Assessment['mobility'] | '';
  barthelIndex: number | '';
  medicationCount: number | '';
  pharmacistReviewRequested: boolean;
  followUpDate: DateValue;
  consentObtained: boolean;
};

const initialValues: AssessmentFormValues = {
  mrn: '',
  patientName: '',
  dateOfBirth: null,
  assessmentDate: null,
  mobility: '',
  barthelIndex: '',
  medicationCount: '',
  pharmacistReviewRequested: false,
  followUpDate: null,
  consentObtained: false,
};

// Valid fixture from the assignment brief, for the "Load sample patient" button.
const samplePatient: AssessmentFormValues = {
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

const MOBILITY_LABELS: Record<(typeof MOBILITY)[number], string> = {
  independent: 'Independent',
  cane: 'Cane',
  walker: 'Walker',
  wheelchair: 'Wheelchair',
  bedbound: 'Bedbound',
};

const mobilityOptions = MOBILITY.map((value) => ({ value, label: MOBILITY_LABELS[value] }));

// The "save" is faked with a delay, standing in for a real API call. It's
// taken as a prop (defaulting to the fake) so tests can pass a `vi.fn()` and
// assert it was called with the *parsed* Assessment, without needing to
// fake timers or reach into component internals.
type AssessmentFormProps = {
  onSave?: (assessment: Assessment) => Promise<void>;
};

async function fakeSave(_assessment: Assessment) {
  await new Promise((resolve) => setTimeout(resolve, 800));
}

export function AssessmentForm({ onSave = fakeSave }: AssessmentFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState<Assessment | null>(null);

  const form = useForm<AssessmentFormValues>({
    mode: 'controlled',
    initialValues,
    validateInputOnBlur: true,
    validate: schemaResolver(assessmentSchema, { sync: true }),
  });

  const handleSubmit = async (values: AssessmentFormValues) => {
    setSubmitting(true);
    setSaved(null);

    // schemaResolver already confirmed `values` is valid, so this parse
    // can't fail in practice -- it exists purely to hand back the *parsed*
    // Assessment (the shape the rest of the app would actually use) instead
    // of the raw, loosely-typed form state.
    const parsed = assessmentSchema.parse(values);
    await onSave(parsed);
    setSaved(parsed);
    setSubmitting(false);
  };

  return (
    <Container size="sm" py="xl">
      <Paper withBorder shadow="sm" p="xl" radius="md">
        <Title order={2} mb="lg">
          Geriatric Care Assessment
        </Title>

        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack gap="md">
            <TextInput
              label="Medical record number"
              placeholder="MRN-004821"
              withAsterisk
              {...form.getInputProps('mrn')}
            />

            <TextInput label="Patient name" withAsterisk {...form.getInputProps('patientName')} />

            <DateInput
              label="Date of birth"
              valueFormat="YYYY-MM-DD"
              withAsterisk
              {...form.getInputProps('dateOfBirth')}
            />

            <DateInput
              label="Assessment date"
              valueFormat="YYYY-MM-DD"
              maxDate={new Date()}
              withAsterisk
              {...form.getInputProps('assessmentDate')}
            />

            <Select
              label="Mobility"
              placeholder="Select mobility status"
              data={mobilityOptions}
              withAsterisk
              {...form.getInputProps('mobility')}
            />

            <NumberInput
              label="Barthel Index"
              step={5}
              min={0}
              max={100}
              withAsterisk
              {...form.getInputProps('barthelIndex')}
            />

            <NumberInput
              label="Regular medications"
              min={0}
              max={30}
              withAsterisk
              {...form.getInputProps('medicationCount')}
            />

            <Checkbox
              label="Pharmacist review requested"
              {...form.getInputProps('pharmacistReviewRequested', { type: 'checkbox' })}
            />

            <DateInput
              label="Next review date"
              valueFormat="YYYY-MM-DD"
              withAsterisk
              {...form.getInputProps('followUpDate')}
            />

            <Checkbox
              label="Patient or representative has given consent"
              {...form.getInputProps('consentObtained', { type: 'checkbox' })}
            />

            <Group justify="space-between" mt="md">
              <Button variant="default" type="button" onClick={() => form.setValues(samplePatient)}>
                Load sample patient
              </Button>

              <Button type="submit" loading={submitting}>
                Save assessment
              </Button>
            </Group>

            {saved && (
              <Alert color="green" title="Assessment saved" mt="md">
                <Code block>{JSON.stringify(saved, null, 2)}</Code>
              </Alert>
            )}
          </Stack>
        </form>
      </Paper>
    </Container>
  );
}
