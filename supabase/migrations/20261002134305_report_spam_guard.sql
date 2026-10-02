-- One report per athlete per spot.
--
-- The reports table already constrains the reason to a fixed list; what it did not constrain is
-- how often one account can file against the same spot. Without a key, "prevent spam where
-- appropriate" has no mechanism at all: holding the button files a report every tap.
--
-- One-per-athlete-per-spot is the smallest guard that is still honest. A repeat is treated as the
-- report already filed rather than as a failure — the athlete's intent is identical either way —
-- and moderation still sees the original with its own created_at. Re-reporting after a report is
-- resolved is deliberately not possible; the report describes the spot as it was seen, and a
-- second look is a new account's report or the moderation queue's own observation.

create unique index reports_spot_id_user_id_key on public.reports (spot_id, user_id);

comment on index public.reports_spot_id_user_id_key is
  'One report per athlete per spot; a repeat insert is the existing report, not a second row.';
