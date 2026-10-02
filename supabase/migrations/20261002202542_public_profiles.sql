-- A username and an avatar are public content, not private data.
--
-- The original policies kept a profile readable only by its owner, so every join from another
-- account came back null: moderation showed "Добавено от —", reports "Докладвано от —", and
-- every review was attributed to "—". A name is how the community gives credit and blame, so the
-- profile row is readable by everyone. It carries no email and no other private field — only the
-- id, the username, the avatar and the creation date — so this exposes nothing sensitive.
--
-- The owner-only policy stays in place: two permissive policies are OR-ed, and the narrower one
-- is what the app's own profile reads still match first.
create policy "profiles are readable by everyone"
  on public.profiles for select
  to anon, authenticated
  using (true);
