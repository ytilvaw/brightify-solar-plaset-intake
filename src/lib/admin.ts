import type { IntakePayload } from './intake'

export interface SubmissionRecord extends IntakePayload {
  source: string
  submissionId: string
  submittedAt: string
  userAgent: string
}
