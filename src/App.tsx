import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';

import { MantineProvider } from '@mantine/core';
import { AssessmentForm } from './features/assessment/AssessmentForm';
import { theme } from './theme';

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <AssessmentForm />
    </MantineProvider>
  );
}
