# Rebuild per new brief (Nov 5)

## Private admin access (Nov 10)
- [x] Private Google-only entry, five-click header logo shortcut, admin-only header controls and safe sign-out
- [x] Dashboard overview, confirmations, mobile layout and search exclusion
- [x] Verify allowlist security, session persistence and public/admin flows: 11 tests pass; both upper-case allowlisted emails accepted by database and unlisted email refused; real admin fee save/reload, five-click entry, session reload and sign-out verified on desktop/mobile. Interactive Google consent itself remains unverified.

- [x] admission_enquiries table: student/father/mother names, mobile, alt mobile, email, class; anyone inserts, only admins read/update/delete (RLS)
- [x] Admission form: new fields, class dropdown, validation, loading state, honeypot + 1-per-minute rate limit per mobile
- [x] Enquiry email to BOTH trishikgoud75@gmail.com and shanthi123@gmail.com, subject "New Admission Enquiry - [student] - Class [class]"
- [x] Success message: "Thank you! Our school will contact you soon."
- [x] Admission period now "September to July", shown only on the Admission page (never in the modal)
- [x] Home order: animated hero name + "Nursery to 10th Class" + glowing Admission button → editable intro → slideshow (3s hold, fade, Ken Burns, placeholder) → address + Address map modal → School Management marquee (right-to-left, pause on hover/touch, draggable, View all) → footer
- [x] Hidden /administration dashboard: Google sign-in, non-admins refused + logged out, noindex; tabs for Enquiries (search, delete, newest first), Gallery (multi-upload, replace, delete), Events, Notices, Fees, Faculty, Management, About text, School logo
- [x] Footer slimmed: logo, name, 3 phones, address, email, Instagram only — no admin link
- [x] Background: aurora gradient + drifting orbs + particle field (pointer parallax) + cursor glow; reduced-motion safe
- [x] Feedback page (3 categories, saved + emailed, admin tab); management strip is swipe/arrow only
- [x] Verify: build OK, 7 tests pass, home + /administration render without errors, enquiry submit saves and shows Thank you, Admission page shows September to July. Note: enquiry email to shanthi123@gmail.com fails until a domain is verified in Resend (test sender only reaches trishikgoud75@gmail.com).
