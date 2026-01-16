# Code Review Checklist - Smart Restaurant

## Team

| Reviewer | Role | GitHub |
|----------|------|--------|
| Nguyễn Lê Thế Vinh | Team Lead | [Zinthw](https://github.com/Zinthw) |
| Trần Thanh An | Backend Lead | [Gaaus56](https://github.com/Gaaus56) |
| Nguyễn Thị Ánh Ngọc | QA Lead | [angquoc](https://github.com/angquoc) |

---

## Before Creating PR

### General
- [x] Code compiles without errors
- [x] No console.log() left in production code
- [x] Removed TODO/FIXME comments or documented them
- [x] Self-reviewed the diff

### Naming
- [x] Variables/functions have meaningful names
- [x] Consistent naming convention (camelCase)
- [x] No abbreviations that are unclear

### Code Quality
- [x] No duplicate code
- [x] Functions are small (<30 lines ideally)
- [x] No deeply nested conditionals (>3 levels)
- [x] Early returns used where appropriate

---

## PR Description Template

```markdown
## What does this PR do?
[Brief description of changes]

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing done
- [ ] Tested locally
- [ ] Screenshots attached (if UI change)

## Related issues
Closes #[issue number]
```

---

## Reviewer Checklist

### Frontend (React/NextJS)

#### Components
- [x] Props are typed/validated (TypeScript)
- [x] No inline styles (use Tailwind CSS)
- [x] Loading states handled (Skeleton components)
- [x] Error states handled
- [x] Key prop used for lists

#### State
- [x] No unnecessary re-renders
- [x] State is at appropriate level
- [x] useEffect dependencies correct

#### UI/UX
- [x] Responsive design works
- [x] Accessible (aria labels, tabbing)
- [x] Consistent with design mockups

---

### Backend (NodeJS/Express)

#### API
- [x] Correct HTTP methods (GET, POST, PUT, PATCH, DELETE)
- [x] Input validation present
- [x] Error handling with appropriate status codes
- [x] Response format consistent (JSON)

#### Security
- [x] No sensitive data in logs
- [x] Authentication required where needed (JWT)
- [x] Authorization checked (role-based)
- [x] SQL injection prevented (parameterized queries)

#### Database
- [x] Indexes on frequently queried columns
- [x] Migrations reversible
- [x] No N+1 query issues

---

### Common Issues to Avoid

| Issue | Solution |
|-------|----------|
| Hardcoded values | Use environment variables or constants |
| Missing error handling | Wrap async calls in try/catch |
| Large files | Split into smaller modules |
| No comments | Add JSDoc for complex functions |
| Missing loading states | Add skeleton/spinner |

---

## Approval Criteria

### Can Merge ✅
- No critical issues
- At least 1 approval
- CI passes (if configured)

### Request Changes 🔄
- Security vulnerabilities
- Breaking changes not documented
- Missing tests for complex logic

---

## PR Review History

| PR | Feature | Reviewer | Date | Status |
|----|---------|----------|------|--------|
| #1 | Backend skeleton | Nguyễn Lê Thế Vinh | 03/01 | ✅ Merged |
| #2 | Frontend setup | Trần Thanh An | 04/01 | ✅ Merged |
| #3 | Cart functionality | Nguyễn Thị Ánh Ngọc | 06/01 | ✅ Merged |
| #4 | Socket.IO integration | Nguyễn Lê Thế Vinh | 07/01 | ✅ Merged |
| #5 | KDS implementation | Trần Thanh An | 10/01 | ✅ Merged |
| #6 | Admin dashboard | Nguyễn Lê Thế Vinh | 12/01 | ✅ Merged |
| #7 | Reports & export | Trần Thanh An | 16/01 | ✅ Merged |
| #8 | Staff management fix | Nguyễn Thị Ánh Ngọc | 16/01 | ✅ Merged |
| #9 | Documentation update | All | 16/01 | ✅ Merged |

---

_Document Version: 1.1 | Last Updated: 16/01/2026_
