-- RLS policies say who may delete a row; they do not grant the DELETE privilege itself.
--
-- The moderator delete policy on spots was inert without this, so the cleanup path failed with
-- "permission denied for table spots". Granting DELETE to every authenticated caller is safe
-- because the only delete policy on the table is the moderator one: RLS remains the gate, and a
-- non-moderator's delete matches no policy and removes nothing. Owners still cannot delete their
-- own spots — that would be a separate policy and a separate decision.
grant delete on public.spots to authenticated;
