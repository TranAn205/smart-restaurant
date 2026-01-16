# Daily Standup Log - Smart Restaurant

## Team Members

| Tên | MSSV | Git Username |
|-----|------|-------------|
| Nguyễn Lê Thế Vinh | 23120190 | Zinthw |
| Trần Thanh An | 23120017 | Gaaus56, Tran An |
| Nguyễn Thị Ánh Ngọc | 23120061 | angquoc |

---

## Sprint 0: Setup (Day 1-2)

### Day 1 - 03/01/2026

#### Nguyễn Lê Thế Vinh (Vinh)
- **Yesterday:** Project kickoff, team meeting
- **Today:** Review project requirements, confirm scope với team
- **Blockers:** None

#### Trần Thanh An (An)
- **Yesterday:** Project kickoff
- **Today:** Initialize project structure, setup backend Express skeleton
- **Commits:** 
  - `chore: Initialize project structure`
  - `feat(backend): Add Express server skeleton`
- **Blockers:** None

#### Nguyễn Thị Ánh Ngọc (Ngọc)
- **Yesterday:** Project kickoff
- **Today:** Review frontend requirements, prepare development environment
- **Blockers:** None

**Team Notes:** Sprint 0 goals confirmed. Project structure initialized.

---

### Day 2 - 04/01/2026

#### Vinh
- **Yesterday:** Reviewed docs, sketched component structure
- **Today:** Finalize UI component list, prepare for Sprint 1
- **Blockers:** None

#### An
- **Yesterday:** Backend skeleton completed
- **Today:** Database schema design, run migrations, initialize NextJS
- **Commits:**
  - `feat(db): Add database schema and migrations`
  - `feat(frontend): Initialize NextJS project`
  - `docs: Add project documentation structure`
- **Blockers:** None

#### Ngọc
- **Yesterday:** Reviewed existing code
- **Today:** Setup frontend development environment, test local run
- **Blockers:** None

**Team Notes:** Database schema approved. Both backend and frontend can run locally.

---

## Sprint 1: Core Features (Day 3-7)

### Day 3 - 05/01/2026

#### Vinh
- **Yesterday:** Prepared component structure
- **Today:** CartContext + CartDrawer skeleton
- **Blockers:** None

#### An
- **Yesterday:** Database migrations completed
- **Today:** Socket.IO server setup, seed data
- **Commits:**
  - `feat(backend): Add Socket.IO integration`
  - `feat(db): Add seed data script`
- **Blockers:** None

#### Ngọc
- **Yesterday:** Frontend environment ready
- **Today:** Review Guest Menu UI, identify needed components
- **Commits:**
  - `feat(frontend): Add shared UI components`
- **Blockers:** None

**Team Notes:** Socket.IO integration started.

---

### Day 4 - 06/01/2026

#### Vinh
- **Yesterday:** CartContext working
- **Today:** Add to cart functionality from Menu page
- **Blockers:** None

#### An
- **Yesterday:** Socket.IO connected
- **Today:** Order create/update events implementation
- **Commits:**
  - `feat(backend): Add order API endpoints`
- **Blockers:** None

#### Ngọc
- **Yesterday:** UI components created
- **Today:** Fix modifier display bugs, menu UI improvements
- **Commits:**
  - `fix(frontend): Fix menu item display issues`
- **Blockers:** None

**Team Notes:** Order API ready for integration.

---

### Day 5 - 07/01/2026

#### Vinh
- **Yesterday:** Add to cart working with modifiers
- **Today:** Cart edit/remove, quantity changes
- **Commits:**
  - `feat(frontend): Add cart functionality`
- **Blockers:** None

#### An
- **Yesterday:** Order events implemented
- **Today:** Authentication middleware, JWT implementation
- **Commits:**
  - `feat(backend): Add authentication middleware`
  - `feat(auth): Implement JWT token system`
- **Blockers:** None

#### Ngọc
- **Yesterday:** Menu bugs fixed
- **Today:** Start testing guest ordering flow
- **Blockers:** None

**Team Notes:** Authentication system in place.

---

### Day 6-7 - 08-09/01/2026

#### Vinh
- **Yesterday:** Cart fully functional
- **Today:** Checkout page, order submission, order status tracking
- **Commits:**
  - `feat(frontend): Add checkout and order status pages`
- **Blockers:** None

#### An
- **Yesterday:** Auth system complete
- **Today:** Payment API integration, QR code generation
- **Commits:**
  - `feat(backend): Add payment endpoints`
  - `feat(backend): Add QR code generation for tables`
- **Blockers:** None

#### Ngọc
- **Yesterday:** Guest flow tested
- **Today:** Bug fixes, E2E testing documentation
- **Commits:**
  - `test: Add E2E test cases for guest ordering`
- **Blockers:** None

**Team Notes:** Sprint 1 complete! Guest ordering flow working.

---

## Sprint 2: Admin & KDS (Day 8-12)

### Day 8-10 - 10-12/01/2026

#### Vinh
- **Yesterday:** Order Status page complete
- **Today:** Polish Cart UX, add error handling, guest profile
- **Commits:**
  - `feat(frontend): Add guest profile page`
  - `fix(frontend): Improve error handling`
- **Blockers:** None

#### An
- **Yesterday:** Order flow tested
- **Today:** Kitchen API, waiter API, real-time order updates
- **Commits:**
  - `feat(backend): Add kitchen and waiter APIs`
  - `feat(socket): Add real-time order status updates`
- **Blockers:** None

#### Ngọc
- **Yesterday:** Test cases documented
- **Today:** KDS page layout, waiter interface, admin dashboard
- **Commits:**
  - `feat(frontend): Add Kitchen Display System (KDS)`
  - `feat(frontend): Add waiter order management`
  - `feat(frontend): Add admin dashboard`
- **Blockers:** None

**Team Notes:** KDS and Waiter interfaces implemented.

---

### Day 11-12 - 13-14/01/2026

#### Vinh
- **Yesterday:** Guest features polished
- **Today:** Review integration, fix cross-cutting issues
- **Commits:**
  - `fix(frontend): Fix integration issues`
- **Blockers:** None

#### An
- **Yesterday:** Kitchen/Waiter APIs ready
- **Today:** Reports API, analytics endpoints
- **Commits:**
  - `feat(backend): Add reports and analytics APIs`
- **Blockers:** None

#### Ngọc
- **Yesterday:** Admin dashboard started
- **Today:** Menu management UI, table management, QR generation UI
- **Commits:**
  - `feat(frontend): Add menu management page`
  - `feat(frontend): Add table management with QR codes`
- **Blockers:** None

**Team Notes:** Sprint 2 complete! Admin panel functional.

---

## Sprint 3: Polish & Deploy (Day 13-16)

### Day 13-14 - 15-16/01/2026

#### Vinh
- **Yesterday:** Integration issues fixed
- **Today:** Admin panel enhancements, orders page, staff management
- **Commits:**
  - `feat(admin): Add Orders, Staff pages, Dashboard charts, Menu sorting`
  - `fix(staff): Add backend API for listing staff`
  - `fix(staff): Correct API endpoint for staff registration`
- **Blockers:** None

#### An
- **Yesterday:** Reports API complete
- **Today:** Backend optimizations, API documentation
- **Commits:**
  - `docs: Add API documentation`
  - `fix(backend): Optimize database queries`
- **Blockers:** None

#### Ngọc
- **Yesterday:** Menu/Table management complete
- **Today:** Reports page with charts, export PDF/Excel functionality
- **Commits:**
  - `feat(reports): Add PDF and Excel export functionality`
  - `fix(reports): Fix PDF Vietnamese font encoding`
- **Blockers:** None

**Team Notes:** Admin enhancements complete. Export functionality working.

---

### Day 15-16 - 16-17/01/2026 (Current)

#### Vinh
- **Yesterday:** Admin enhancements completed
- **Today:** Update documentation, team info in all docs
- **Commits:**
  - `docs: Update team member info in README and SELF_ASSESSMENT_REPORT`
  - `docs: Update team info with names, IDs, emails and GitHub links`
- **Blockers:** None

#### An
- **Yesterday:** Backend optimized
- **Today:** Final testing, deployment preparation
- **Blockers:** None

#### Ngọc
- **Yesterday:** Reports with export complete
- **Today:** Final UI polish, responsive testing
- **Blockers:** None

**Team Notes:** Documentation updated. Preparing for final submission.

---

## Commit Summary by Developer

| Developer | Total Commits | Focus Areas |
|-----------|---------------|-------------|
| Nguyễn Lê Thế Vinh (Zinthw) | 27 | Frontend, Cart, Checkout, Admin enhancements, Docs |
| Trần Thanh An (Gaaus56) | 29 | Backend, APIs, Database, Socket.IO, Auth |
| Nguyễn Thị Ánh Ngọc (angquoc) | 28 | Admin UI, KDS, Waiter, Reports, Testing |

---

_Document Version: 1.1 | Last Updated: 16/01/2026_
