import { z } from 'zod';

/** The most characters a review comment accepts. The comment itself is optional. */
export const REVIEW_TEXT_MAX_LENGTH = 300;

/**
 * The review a write accepts.
 *
 * The database repeats every rule here — a 1-to-5 rating, one review per athlete per spot, a
 * bounded comment — and the repetition is deliberate: the client rule is what gives the athlete a
 * message before a request, and the database rule is what holds when the writer is not this
 * client. The schema exists because a form hands over loose numbers and strings, and this is the
 * boundary that turns them into the shape the mutation is allowed to send.
 */
export const reviewDraftSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().max(REVIEW_TEXT_MAX_LENGTH),
});

export type ReviewDraft = z.infer<typeof reviewDraftSchema>;
