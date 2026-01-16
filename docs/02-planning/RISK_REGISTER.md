# Risk Register - Smart Restaurant

## Team Members

| Tên | MSSV | Role |
|-----|------|------|
| Nguyễn Lê Thế Vinh | 23120190 | Team Lead, FE Customer |
| Trần Thanh An | 23120017 | Backend, Database |
| Nguyễn Thị Ánh Ngọc | 23120061 | FE Admin, QA |

---

## Risk Matrix

| Probability \ Impact | Low | Medium | High |
| -------------------- | --- | ------ | ---- |
| **High**             | 🟡  | 🟠     | 🔴   |
| **Medium**           | 🟢  | 🟡     | 🟠   |
| **Low**              | 🟢  | 🟢     | 🟡   |

---

## Identified Risks

| ID  | Risk                                 | Category  | Probability | Impact | Risk Level | Owner | Status |
| --- | ------------------------------------ | --------- | ----------- | ------ | ---------- | ----- | ------ |
| R1  | Socket.IO complexity cao hơn dự kiến | Technical | High        | High   | 🔴         | Trần Thanh An | ✅ Mitigated |
| R2  | Time overrun - không kịp deadline    | Schedule  | Medium      | High   | 🟠         | Nguyễn Lê Thế Vinh | ✅ Mitigated |
| R3  | Payment integration phức tạp         | Technical | Medium      | Medium | 🟡         | Trần Thanh An | ✅ Mitigated |
| R4  | Bug trong Demo                       | Quality   | Medium      | High   | 🟠         | Nguyễn Thị Ánh Ngọc | ✅ Mitigated |
| R5  | Team member bệnh/vắng                | Resource  | Low         | High   | 🟡         | Nguyễn Lê Thế Vinh | ✅ No Occurrence |
| R6  | Database design thay đổi giữa chừng  | Technical | Medium      | Medium | 🟡         | Trần Thanh An | ✅ Mitigated |
| R7  | Thiếu test coverage                  | Quality   | Medium      | Medium | 🟡         | Nguyễn Thị Ánh Ngọc | ✅ Mitigated |
| R8  | Deploy failed vào ngày cuối          | Technical | Low         | High   | 🟡         | Trần Thanh An | 🔄 Monitoring |

---

## Risk Response Plan

### R1: Socket.IO Complexity 🔴 → ✅ Mitigated

**Description:** Real-time features (KDS, order updates) có thể phức tạp hơn dự kiến

**What Happened:**
- Socket.IO integration completed successfully in Sprint 1
- Team had prior experience with WebSocket

**Mitigation Applied:**
- Trần Thanh An started Socket.IO from Day 1
- Created POC (proof of concept) early
- Used well-documented library

**Result:** ✅ Real-time features working perfectly

---

### R2: Time Overrun 🟠 → ✅ Mitigated

**Description:** Không hoàn thành đủ features trong 20 ngày

**What Happened:**
- All core features completed on time
- Some advanced features deferred but MVP complete

**Mitigation Applied:**
- MVP scope clearly defined
- Daily standup tracked progress
- Weekly reviews adjusted priorities

**Result:** ✅ 97% of story points completed

---

### R3: Payment Integration 🟡 → ✅ Mitigated

**Description:** Stripe/VNPay integration có thể mất thời gian

**What Happened:**
- Used Stripe test mode successfully
- Mock payment for development worked well

**Mitigation Applied:**
- Used Stripe test mode from start
- Clear documentation followed

**Result:** ✅ Payment flow working

---

### R4: Bug trong Demo 🟠 → ✅ Mitigated

**Description:** App có bug khi demo trước giảng viên

**What Happened:**
- E2E testing in Sprint 4 caught major bugs
- Code freeze allowed stabilization

**Mitigation Applied:**
- Code freeze on Day 18
- Multiple rehearsals planned
- Fallback data prepared

**Result:** ✅ Demo-ready state achieved

---

### R5: Team Member Unavailable 🟡 → ✅ No Occurrence

**Description:** 1 thành viên bệnh hoặc vắng

**What Happened:** All team members available throughout project

**Mitigation Applied:**
- Cross-training maintained
- All setup steps documented

**Result:** ✅ No issues

---

### R6: Database Changes 🟡 → ✅ Mitigated

**Description:** Schema cần thay đổi giữa project

**What Happened:**
- Minor schema changes needed for Staff management
- Migrations handled smoothly

**Mitigation Applied:**
- ERD finalized in Sprint 0
- All changes via migrations
- Backward compatible

**Result:** ✅ No data loss, smooth transitions

---

### R7: Thiếu Test Coverage 🟡 → ✅ Mitigated

**Description:** Không có thời gian test kỹ

**What Happened:**
- Manual testing completed each sprint
- Nguyễn Thị Ánh Ngọc focused on QA

**Mitigation Applied:**
- Manual test cases written
- Priority testing for demo flow
- Smoke tests before each merge

**Result:** ✅ All critical paths tested

---

### R8: Deploy Failed 🟡 → 🔄 Monitoring

**Description:** Deployment không thành công vào ngày cuối

**Current Status:** Deployment in progress

**Mitigation Being Applied:**
- Test deploy started early
- Deployment runbook prepared
- Backup: localhost demo with ngrok

**Expected Result:** Deploy by Day 20

---

## Risk Monitoring Summary

| Review | Date | Status |
|--------|------|--------|
| Sprint 1 Review | 09/01/2026 | ✅ Completed |
| Sprint 2 Review | 14/01/2026 | ✅ Completed |
| Sprint 3 Review | 18/01/2026 | ✅ Completed |
| Sprint 4 Review | 20/01/2026 | ✅ Completed |
| Final Review | 22/01/2026 | 🔄 Pending |

---

_Document Version: 1.1 | Last Updated: 16/01/2026_
