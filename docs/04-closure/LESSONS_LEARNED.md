# Lessons Learned - Smart Restaurant

## Team Members

| Tên | MSSV | Role |
|-----|------|------|
| Nguyễn Lê Thế Vinh | 23120190 | Team Lead, FE Customer |
| Trần Thanh An | 23120017 | Backend, Database |
| Nguyễn Thị Ánh Ngọc | 23120061 | FE Admin, QA |

---

## Project Overview

| Metric | Value |
|--------|-------|
| Project Duration | 20 days (03/01 - 22/01/2026) |
| Team Size | 3 developers |
| Total Story Points | 162 SP |
| Completed Story Points | 160 SP (99%) |
| Total Commits | ~84 commits |

---

## Technical Lessons

### 1. Real-time Features (Socket.IO)

**What We Learned:**
- Socket.IO is powerful but requires careful room management
- Connection handling needs graceful degradation
- Testing real-time features is challenging

**Best Practices:**
```javascript
// Always join room on connect
socket.on('connect', () => {
  socket.emit('join-table', tableId);
});

// Handle reconnection
socket.on('reconnect', () => {
  refetchOrderStatus();
});
```

**Recommendation:** Start Socket.IO integration early in the project.

---

### 2. Authentication & Authorization

**What We Learned:**
- JWT works well for stateless auth
- Role-based access control is essential
- Token refresh strategy matters

**Best Practices:**
- Store tokens in localStorage for admin (httpOnly cookie for production)
- Always check role on both frontend AND backend
- Use middleware for auth, not repeated code

**Recommendation:** Set up auth middleware from day 1.

---

### 3. Database Design

**What We Learned:**
- Finalize schema early reduces refactoring
- Migrations are essential for team collaboration
- JSON columns are useful for flexible data (modifiers)

**Schema Highlights:**
- Users table with role-based access
- Orders with status tracking
- Menu items with modifier groups

**Recommendation:** Spend time on ERD in Sprint 0.

---

### 4. Frontend State Management

**What We Learned:**
- React Context + useReducer sufficient for our needs
- Cart state persistence important for UX
- TypeScript catches many bugs early

**Best Practices:**
- Keep state minimal
- Derive computed values
- Use TypeScript interfaces

**Recommendation:** Redux not needed for most projects of this size.

---

### 5. UI/UX Design

**What We Learned:**
- Mobile-first design is crucial for customer-facing features
- Loading skeletons improve perceived performance
- Consistent design system saves time

**Tools Used:**
- Tailwind CSS for utility-first styling
- shadcn/ui for pre-built components
- Recharts for data visualization

**Recommendation:** Use a component library to speed up development.

---

## Process Lessons

### 1. Agile/Scrum

**What Worked:**
- 4-day sprints fit well with 20-day timeline
- Daily standups kept team aligned
- Sprint retrospectives improved process

**What Didn't Work:**
- Sprint planning sometimes took too long
- Estimation accuracy improved over time

**Recommendation:** Keep standups under 15 minutes.

---

### 2. Code Review

**What Worked:**
- PRs caught bugs before merge
- Cross-review improved code understanding
- Consistent code style maintained

**What Didn't Work:**
- Some PRs delayed due to reviewer availability

**Recommendation:** Set 4-hour SLA for PR reviews.

---

### 3. Documentation

**What Worked:**
- API documentation helped frontend-backend sync
- Setup guide helped new environment setup
- Mockups provided clear UI direction

**What Didn't Work:**
- Some documentation written too late

**Recommendation:** Document while developing, not after.

---

## Team Collaboration Lessons

### Communication

**What Worked:**
- Discord for quick questions
- GitHub Issues for bug tracking
- Weekly video calls for complex discussions

**Recommendation:** Establish communication channels early.

---

### Task Distribution

**What Worked:**
- Clear ownership per feature
- Cross-functional support when needed
- Regular sync on dependencies

**Recommendation:** Define RACI matrix at project start.

---

## What We Would Do Differently

| Area | Current Approach | Better Approach |
|------|------------------|-----------------|
| Deployment | Started in Sprint 5 | Start in Sprint 3 |
| Testing | Manual only | Add some automated tests |
| Documentation | After development | During development |
| Mobile Testing | End of project | Throughout project |

---

## Recommendations for Future Teams

1. **Start with MVP:** Define minimum scope clearly
2. **Test Early:** Don't wait until the end
3. **Document As You Go:** Saves time later
4. **Use TypeScript:** Catches bugs before runtime
5. **Plan Deployment:** Don't leave it to the last day
6. **Daily Standups:** Keep team aligned
7. **Code Reviews:** Improve quality and knowledge sharing

---

## Acknowledgments

Special thanks to:
- Course instructors for clear project requirements
- Open source libraries that made development faster
- Each team member for their dedication and hard work

---

_Document Version: 1.1 | Last Updated: 20/01/2026_
