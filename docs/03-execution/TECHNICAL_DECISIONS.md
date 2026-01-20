# Technical Decisions (ADR) - Smart Restaurant

## Team

| Tên | MSSV | Role |
|-----|------|------|
| Nguyễn Lê Thế Vinh | 23120190 | Team Lead, FE Customer |
| Trần Thanh An | 23120017 | Backend, Database |
| Nguyễn Thị Ánh Ngọc | 23120061 | FE Admin, QA |

---

## ADR-001: Frontend Framework Selection

**Date:** 03/01/2026  
**Status:** ✅ Accepted  
**Deciders:** All team

### Context
Cần chọn framework cho frontend.

### Decision
Sử dụng **NextJS 14** với React, App Router.

### Rationale
- Có base code sẵn từ existing project
- SSR support nếu cần
- File-based routing đơn giản
- Team đã quen với React

### Consequences
- ✅ Fast development
- ✅ Built-in TypeScript support
- ⚠️ Cần hiểu NextJS App Router

---

## ADR-002: State Management

**Date:** 03/01/2026  
**Status:** ✅ Accepted  
**Deciders:** Nguyễn Lê Thế Vinh

### Context
Cần quản lý cart state và user session.

### Decision
Sử dụng **React Context + useReducer** cho cart, không dùng Redux.

### Rationale
- Cart state không quá phức tạp
- Giảm boilerplate
- Built-in React, không cần thư viện ngoài

### Consequences
- ✅ Simple implementation
- ✅ No external dependencies
- ⚠️ Không có devtools như Redux

---

## ADR-003: Real-time Communication

**Date:** 03/01/2026  
**Status:** ✅ Accepted  
**Deciders:** Trần Thanh An

### Context
Cần real-time updates cho KDS, order status.

### Decision
Sử dụng **Socket.IO**.

### Rationale
- Fallback to polling tự động
- Documentation tốt
- Đã có experience

### Consequences
- ✅ Reliable real-time
- ✅ Auto-reconnection
- ⚠️ Setup complexity

---

## ADR-004: Database Choice

**Date:** 03/01/2026  
**Status:** ✅ Accepted  
**Deciders:** Trần Thanh An

### Context
Cần database cho backend.

### Decision
Sử dụng **PostgreSQL** với raw queries (pg library).

### Rationale
- Relational data (menu, orders)
- Strong ACID compliance
- Free tier trên Railway/Render
- JSON support cho modifiers

### Consequences
- ✅ ACID compliance
- ✅ JSON support for modifiers
- ✅ Excellent performance

---

## ADR-005: Authentication Strategy

**Date:** 03/01/2026  
**Status:** ✅ Accepted  
**Deciders:** Trần Thanh An

### Context
Cần auth cho Admin, Waiter, Kitchen staff.

### Decision
**JWT + bcrypt** với role-based access control.

### Rationale
- Stateless
- Easy role-based access (admin, waiter, kitchen, guest)
- Project requirement

### Consequences
- ✅ Scalable
- ✅ Stateless API
- ⚠️ Token refresh handling

---

## ADR-006: Payment Integration

**Date:** 13/01/2026  
**Status:** ✅ Accepted  
**Deciders:** Nguyễn Lê Thế Vinh, Trần Thanh An

### Context
Cần payment integration cho project.

### Decision
Sử dụng **Stripe** với test mode.

### Rationale
- Great documentation
- Test mode không cần production credentials
- React components available

### Consequences
- ✅ Easy integration
- ✅ Well-documented
- ⚠️ Demo with test cards only

---

## ADR-007: Deployment Platform

**Date:** 17/01/2026  
**Status:** ✅ Accepted  
**Deciders:** Trần Thanh An

### Context
Cần deploy app lên public URL.

### Decision
- **Frontend:** Vercel
- **Backend:** Render
- **Database:** Render PostgreSQL

### Rationale
- Free tier đủ cho demo
- Easy deployment
- No configuration needed

### Consequences
- ✅ Quick deployment
- ⚠️ Cold start on free tier

---

## ADR-008: Styling Approach

**Date:** 03/01/2026  
**Status:** ✅ Accepted  
**Deciders:** Nguyễn Lê Thế Vinh, Nguyễn Thị Ánh Ngọc

### Context
Cần consistent styling cho UI.

### Decision
Sử dụng **Tailwind CSS** + **shadcn/ui** components.

### Rationale
- Utility-first approach
- Pre-built accessible components
- Easy customization
- Great DX

### Consequences
- ✅ Fast UI development
- ✅ Consistent design system
- ✅ Accessible by default

---

## ADR-009: Export Functionality

**Date:** 16/01/2026  
**Status:** ✅ Accepted  
**Deciders:** Nguyễn Thị Ánh Ngọc

### Context
Cần export reports to PDF and Excel.

### Decision
Sử dụng **jsPDF + jspdf-autotable** cho PDF và **xlsx** cho Excel.

### Rationale
- Client-side generation (no server needed)
- Mature libraries
- Good documentation

### Consequences
- ✅ No server-side processing
- ⚠️ PDF doesn't support Vietnamese fonts natively (use ASCII)

---

## ADR-010: Charts & Visualization

**Date:** 16/01/2026  
**Status:** ✅ Accepted  
**Deciders:** Nguyễn Thị Ánh Ngọc

### Context
Cần charts cho Dashboard và Reports.

### Decision
Sử dụng **Recharts**.

### Rationale
- React-based
- Responsive
- Good documentation
- Supports Line, Bar, Pie charts

### Consequences
- ✅ Easy integration with React
- ✅ Declarative API

---

_Document Version: 1.2 | Last Updated: 20/01/2026_
