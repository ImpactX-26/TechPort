# Security Specification - GermanPath AI

## 1. Data Invariants
- Each applicant document in `/applicants/{applicantId}` belongs exclusively to the authenticated user where `applicantId == request.auth.uid`.
- Applicants can only read, create, and update their own document.
- Identity cannot be spoofed: `incoming().id` must match `request.auth.uid` on creation, and cannot be changed on update (`incoming().id == existing().id`).
- All other collections are denied by default.

## 2. The Dirty Dozen Payloads Handled
1. Anonymous write attempt -> Blocked by `isSignedIn()`.
2. Cross-user read attempt -> Blocked by `request.auth.uid == applicantId`.
3. Identity spoofing on create (setting `id` to another user's UID) -> Blocked by `incoming().id == request.auth.uid`.
4. Overwriting another applicant's document -> Blocked by `request.auth.uid == applicantId`.
5. ID poisoning with oversized/invalid path character string -> Blocked by `isValidId(applicantId)`.
6. Malicious list scrape query across all applicants -> Blocked by list rule requiring `resource.data.id == request.auth.uid`.
7. Client tampering with ID on update -> Blocked by `incoming().id == existing().id`.
8. Unauthenticated read attempt -> Blocked by default deny & auth check.
9. Deleting another applicant's file -> Blocked by owner check.
10. Unbounded string injection into applicant ID -> Blocked by `id.size() <= 128`.
11. Arbitrary collection write outside `/applicants` -> Blocked by default deny rule.
12. Attempt to bypass rules without valid token -> Blocked.
