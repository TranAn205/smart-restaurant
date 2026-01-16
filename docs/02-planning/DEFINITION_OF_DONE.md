# Definition of Done (DoD) - Smart Restaurant

## Team Members

| Tên | MSSV | Role |
|-----|------|------|
| Nguyễn Lê Thế Vinh | 23120190 | Team Lead, FE Customer |
| Trần Thanh An | 23120017 | Backend, Database |
| Nguyễn Thị Ánh Ngọc | 23120061 | FE Admin, QA |

---

## General DoD (Áp dụng cho mọi task)

### Code Quality

- [x] Code compiles without errors
- [x] No console errors/warnings
- [x] Code follows project coding standards
- [x] Self-reviewed before PR

### Testing

- [x] Manual testing passed
- [x] Edge cases considered
- [x] Responsive on mobile/desktop

### Documentation

- [x] Functions documented with JSDoc (complex ones)
- [x] README updated if needed
- [x] API docs updated if BE changes

### Git

- [x] Meaningful commit messages
- [x] PR created with description
- [x] At least 1 reviewer approved

---

## DoD by Feature Type

### Frontend Component

- [x] Component renders correctly
- [x] Props validated (TypeScript)
- [x] Loading states handled (Skeleton)
- [x] Error states handled
- [x] Responsive design works

### Backend API

- [x] Endpoint returns correct data
- [x] Input validation works
- [x] Error codes appropriate
- [x] Tested with Postman/browser
- [x] Documented in API_DOCUMENTATION.md

### Database Change

- [x] Migration file created
- [x] Rollback works
- [x] Seed data updated if needed
- [x] No data loss on existing records

### UI Page

- [x] Matches mockup design
- [x] All interactive elements work
- [x] Loading indicators present
- [x] Error messages user-friendly
- [x] Mobile responsive

---

## DoD by Sprint Deliverable

### Sprint 0: Setup ✅

- [x] Team aligned on scope
- [x] Backend + Frontend running locally
- [x] Database schema finalized

### Sprint 1: Guest Ordering ✅

- [x] Can add items to cart
- [x] Can submit order
- [x] Can view order status
- [x] Real-time updates working

### Sprint 2: KDS & Waiter ✅

- [x] KDS shows new orders
- [x] Kitchen can update status
- [x] Waiter notifications work
- [x] Timer displays correctly

### Sprint 3: Payment & Reports ✅

- [x] Bill calculates correctly
- [x] Payment flow works
- [x] Daily revenue shows
- [x] Top items chart works

### Sprint 4: Final ✅

- [x] All critical bugs fixed
- [x] Demo flow works E2E
- [x] Mobile tested

### Sprint 5: Delivery 🔄

- [x] Documentation complete
- [x] Self-Assessment filled
- [ ] Deployed successfully
- [ ] Public URL accessible
- [ ] Demo video recorded

---

## Acceptance Criteria Met

| Sprint | DoD Items | Completed | Percentage |
|--------|-----------|-----------|------------|
| Sprint 0 | 3 | 3 | 100% ✅ |
| Sprint 1 | 4 | 4 | 100% ✅ |
| Sprint 2 | 4 | 4 | 100% ✅ |
| Sprint 3 | 4 | 4 | 100% ✅ |
| Sprint 4 | 3 | 3 | 100% ✅ |
| Sprint 5 | 5 | 2 | 40% 🔄 |
| **Total** | **23** | **20** | **87%** |

---

_Document Version: 1.1 | Last Updated: 16/01/2026_
