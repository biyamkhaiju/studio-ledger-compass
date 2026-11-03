<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the existing dashboard routes and store reducers; serialize reads and writes through one queue to prevent stale refreshes replacing saved records.
- Persist ledger changes through the authenticated transactional RPC `apply_ledger_changes`, applying retained-row updates before parent deletions to preserve detached references.
- Map empty optional link and date fields to NULL in `ledger-changes.ts`; Postgres rejects "" for uuid/date columns.
- Keep account avatars and worker photos in their private storage buckets; use signed URLs and unique photo paths to avoid stale replacements.
- Import validated backups only after explicit confirmation and merge missing IDs without overwriting current records.
- The first account created becomes admin via the `handle_new_user` trigger; roles live only in `user_roles` and are checked with `has_role`, never from client data.
- Ledger tables store the owner as a plain `user_id` uuid (no FK to auth.users) so imported records can be remapped to new account IDs.
- Use the brand asset pointer in `src/assets` for app branding and `public/favicon.png` for the favicon.
