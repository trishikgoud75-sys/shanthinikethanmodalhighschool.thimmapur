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

## School site architecture
- Keep public school content in top-level TanStack routes and use inline editors protected by database policies; visitors must never need login to read school content.
- Use the shared PeopleEditor for faculty and leadership so upload, replacement and deletion behaviors remain consistent.
- Derive admin access from the database is_admin RPC backed by the admins allowlist, never from browser storage or legacy role rows.
- Bind admin RPC results to the current session identity and discard stale async results; account switching and sign-out must never retain prior admin privileges.
- Keep private entry standalone with sitemap exclusion; dashboard panels mount only after database-verified admin access, while RLS independently enforces every read and write.
- Resolve uploaded photos through the shared media helper and keep them in the existing media bucket; this preserves user photos and compresses new uploads.
- Use school-rules for the supported grades, unset fee state and slideshow hold duration so these rules are independently testable.
