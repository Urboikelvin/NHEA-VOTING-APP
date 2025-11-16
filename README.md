# NHEA-VOTING-APP
# NHEA White-Label Event Platform

A multi-tenant award event platform inspired by the **Nigerian Healthcare Excellence Awards (NHEA)**.  
This platform enables organizations to create, manage, and run award events with **custom branding, nominations, voting, and analytics**.

---

## Features

- **Multi-Tenant Support:** Each event has its own branding, domain/subdomain, and configuration.
- **Nomination System:** Public users can submit nominations; admins review and approve/reject.
- **Voting Module:** Secure voting with configurable rules (one vote per category per user).
- **Analytics Dashboard:** Visualize votes per nominee, engagement over time, and export reports.
- **Hidden Results:** Winners remain confidential until the live awards ceremony.
- **Responsive Design:** Works seamlessly on mobile and desktop devices.

---

## Roles & Access

| Role | Access |
|------|--------|
| Super Admin | Manage all events and platform settings |
| Event Admin | Manage a specific event: categories, nominations, voting, analytics |
| Public User | Submit nominations, vote, RSVP; cannot view winners until event |

---

## Tech Stack

- **Frontend:** Next.js + Tailwind CSS  
- **Backend:** Node.js + Express (or NestJS)  
- **Database:** MongoDB or PostgreSQL  
- **Authentication:** JWT with role-based access  
- **File Storage:** Cloudinary / S3 for logos and images  
- **Email Notifications:** Brevo (Sendinblue SMTP)  
- **Charts & Analytics:** Recharts or Chart.js  

---

## Goal

This project aims to create a **scalable, professional, and white-label award management system** that can be used for multiple events while keeping voting results secure until the live ceremony.  

---

## Status

Currently in **planning and design stage**. Development will follow a milestone-based approach covering:

1. Event & tenant setup  
2. Nomination module  
3. Voting system  
4. Admin dashboards & analytics  
5. Branding & white-label customization  

---

## License

MIT License
