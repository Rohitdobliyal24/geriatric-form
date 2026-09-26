# Geriatric Care Assessment Form

A one-page form for a visiting nurse to record a home assessment for an elderly
patient. Built with React 19, TypeScript, Mantine 9, and Zod 4.

**Live demo:** https://geriatric-form.vercel.app/

## Running it locally

```bash
yarn install   # uses the vendored Yarn 4 release in .yarn/, no separate install needed
yarn dev       # http://localhost:5173
```

To run the full check suite (typecheck, format check, lint, tests, build):

```bash
yarn test
```

Or individually: `yarn typecheck`, `yarn format:test`, `yarn lint`, `yarn vitest`, `yarn build`.

## How it's wired

- `src/features/assessment/schema.ts` is the schema exactly as given in the
  brief — untouched.
- `src/features/assessment/AssessmentForm.tsx` is the whole form. All
  validation goes through `schemaResolver(assessmentSchema, { sync: true })`
  from `@mantine/form`; there's no hand-written `validate` object and no rule
  re-implemented in JSX.
- **On the "empty initial values won't satisfy `Assessment`" gap:** the form's
  controlled inputs use a separate `AssessmentFormValues` type (not a
  duplicate of `Assessment` — it reuses `Assessment['mobility']` for the
  enum rather than retyping it). It exists because Mantine's inputs need
  in-progress, possibly-empty states that the *parsed* `Assessment` type
  can't represent: an empty `NumberInput` is `''`, an empty `DateInput` is
  `null`, an unchecked "consent" checkbox is `false` (but `Assessment.consentObtained`
  is the literal `true`). `assessmentSchema.parse()` bridges the two at
  submit time, once `schemaResolver` has already confirmed the values are
  valid — so the parse can't fail in practice, it's just how the strict,
  Zod-typed `Assessment` gets produced from the loose form state.
- The "save" is faked (a delay, no backend) and passed in as an `onSave`
  prop so it can be swapped for a `vi.fn()` in tests without mocking timers
  or reaching into the component's internals.
- Removed the template's demo scaffolding (`Welcome`, `Home page`, `Router`,
  `ColorSchemeToggle`) and the `react-router-dom` dependency, since routing
  is out of scope for this assignment.

## Tests

Two tests, per the brief:

1. `schema.test.ts` — `safeParse` on the age boundary: date of birth exactly
   60 years before the assessment date (accepted) vs. one day short
   (rejected on `dateOfBirth`).
2. `AssessmentForm.test.tsx` — loads the sample patient, submits, and
   asserts the injected save handler was called with the Zod-parsed
   `Assessment` values (not the raw form state).

I also independently ran every accept/reject case from the brief's fixture
tables through the schema directly, including the "empty form → exactly 9
errors, one per required field" check — all matched.


## Time spent
 2 Hours