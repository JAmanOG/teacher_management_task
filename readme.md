
# Frontend
# Teacher Management System

A comprehensive web application for managing teachers, students, schedules, and educational content in a school environment. Built with Next.js, TypeScript, and modern UI components.

## Table of Contents

- Features
- Tech Stack
- Installation
- Project Structure
- Design Decisions
- Authentication & Authorization
- Key Components
- API Integration
- Assumptions
- Usage
- Contributing

## Features

### 🎯 Core Features

#### Teacher Management
- **Teacher Registration & Profile Management**: Complete teacher onboarding with profile creation
- **Role-based Access Control**: Multiple user roles (Teacher, Head Teacher, Admin, Principal)
- **Status Management**: Active/Inactive teacher status tracking
- **Bulk Operations**: Bulk teacher management and data export

#### Student Management
- **Student Registration**: Individual and bulk student registration via CSV import
- **Grade Tracking**: Subject-wise grade management and overall performance tracking
- **Parent Contact Management**: Comprehensive parent contact information
- **Class Assignment**: Automatic class assignment based on grade levels

#### Schedule Management
- **Class Scheduling**: Day-wise and time-slot based class scheduling
- **Teacher-Subject Assignment**: Flexible teacher-subject-class mapping
- **Room Management**: Classroom allocation and tracking
- **Schedule Conflicts**: Automatic conflict detection and resolution

#### Chapter & Lesson Management
- **Chapter Creation**: Structured chapter creation with templates
- **Lesson Tracking**: Individual lesson completion tracking
- **Progress Monitoring**: Real-time progress tracking with visual indicators
- **Resource Management**: Digital resource and material organization

#### Check-in/Check-out System
- **Real-time Attendance**: Teacher check-in/out with location tracking
- **Attendance History**: Comprehensive attendance record maintenance
- **Status Monitoring**: Present/Absent/Late status tracking

#### Comments & Communication
- **Comment System**: Multi-level commenting (General, Chapter, Student)
- **Priority Management**: Priority-based comment categorization
- **History Tracking**: Complete comment history and audit trail

### 📊 Dashboard & Analytics
- **Real-time Statistics**: Live teacher count, active teachers, completed chapters
- **Visual Charts**: Interactive charts for data visualization
- **Performance Metrics**: Key performance indicators and metrics
- **Export Capabilities**: Data export in various formats

### 🎨 UI/UX Features
- **Dark/Light Mode**: Theme switching with system preference detection
- **Responsive Design**: Mobile-first responsive design
- **Accessibility**: WCAG compliant design with proper ARIA labels
- **Toast Notifications**: Real-time feedback and notifications

## Tech Stack

### Frontend
- **Framework**: Next.js 15.3.5 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context + useState
- **Theme**: next-themes

### Backend Integration
- **API**: REST API integration
- **Authentication**: JWT-based authentication
- **File Upload**: CSV file processing
- **Data Export**: CSV export functionality

### Development Tools
- **Linting**: ESLint with Next.js config
- **Type Checking**: TypeScript strict mode
- **Build Tool**: Turbopack (Next.js)
- **Package Manager**: npm/yarn/pnpm

## Installation

### Prerequisites
- Node.js 18.0 or later
- npm, yarn, or pnpm

### Setup Instructions

1. **Clone the repository**
```bash
git clone <repository-url>
cd teacher_management_task/frontend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. **Environment Configuration**
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Teacher Management System
```

4. **Run the development server**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. **Open the application**
Navigate to [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production
```bash
npm run build
npm run start
```

## Project Structure

```
src/
├── app/
│   ├── globals.css          # Global styles and CSS variables
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Main application page
│   ├── login/               # Authentication pages
│   └── register/
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── sidebar.tsx
│   │   └── ...
│   ├── teacher-*.tsx        # Teacher-specific components
│   ├── student-*.tsx        # Student-specific components
│   ├── schedule-*.tsx       # Schedule-specific components
│   ├── chapter-*.tsx        # Chapter-specific components
│   └── app-sidebar.tsx      # Main navigation sidebar
├── hooks/
│   ├── use-auth.tsx         # Authentication hook
│   ├── use-toast.tsx        # Toast notifications
│   └── use-mobile.tsx       # Mobile detection
├── lib/
│   └── utils.ts             # Utility functions
└── types/                   # TypeScript type definitions
```

## Design Decisions

### 1. **Component Architecture**
- **Modular Design**: Each feature is encapsulated in its own component
- **Reusable UI Components**: Shared UI library based on Radix UI
- **Compound Components**: Complex components broken into smaller, composable parts

### 2. **State Management**
- **Local State**: useState for component-level state
- **Context API**: For global state (authentication, theme)
- **Props Drilling**: Explicit prop passing for better tracking

### 3. **Styling Approach**
- **Tailwind CSS**: Utility-first CSS framework
- **CSS Variables**: Custom properties for theming
- **Component Variants**: Using class-variance-authority for consistent styling

### 4. **Form Handling**
- **React Hook Form**: Performance-optimized form handling
- **Zod Validation**: Type-safe form validation
- **Controlled Components**: Consistent form state management

### 5. **Data Fetching**
- **Fetch API**: Native fetch for API calls
- **Error Handling**: Comprehensive error handling with user feedback
- **Loading States**: Proper loading indicators for all async operations

### 6. **Authentication Strategy**
- **JWT Tokens**: Secure token-based authentication
- **Role-based Access**: Granular permission system
- **Token Refresh**: Automatic token refresh mechanism

## Authentication & Authorization

### User Roles
1. **Teacher**: Basic access to lessons and student data
2. **Head Teacher**: Department-level management capabilities
3. **Admin**: Full system access except principal functions
4. **Principal**: Complete system access and oversight

### Permission System
```typescript
const PERMISSIONS = [
  "view_teachers",
  "add_teachers", 
  "edit_teachers",
  "delete_teachers",
  "manage_roles",
  "view_lessons",
  "edit_lessons",
  "view_reports",
  "export_data",
  "manage_system"
];
```

## Key Components

### 1. **Teacher Management**
- `TeacherForm`: Teacher registration and editing
- `TeacherCard`: Teacher profile display
- `TeacherTable`: Tabular teacher data view

### 2. **Student Management**
- `StudentCreation`: Student registration with CSV import
- `StudentManagement`: Student profile management

### 3. **Schedule Management**
- `ScheduleManagement`: Class scheduling interface
- Dynamic conflict detection and resolution

### 4. **Chapter & Lesson System**
- `ChapterCreation`: Chapter creation with templates
- `ChapterDetailsModal`: Detailed chapter view
- `LessonTracker`: Lesson progress tracking

### 5. **Communication System**
- `CommentsHistory`: Comment management
- Multi-level commenting with priority system

## API Integration

### Base Configuration
```typescript
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
```

### API Endpoints
- **Authentication**: `/auth/login`, `/auth/register`
- **Teachers**: `/auth/all-users?role=Teacher`
- **Students**: `/student/students`
- **Classes**: `/class/classes`
- **Chapters**: `/chapter/chapters`
- **Lessons**: `/lesson/lessons`
- **Schedules**: `/schedule/schedules`

### Error Handling
- Comprehensive error handling with user-friendly messages
- Automatic token refresh on 401 errors
- Network error detection and retry mechanisms

## Assumptions

### 1. **User Roles & Permissions**
- Each user has a single primary role
- Permissions are role-based and hierarchical
- Admin roles have broader access than teacher roles

### 2. **Data Structure**
- Teachers can be assigned to multiple classes
- Students belong to a single class at a time
- Chapters are subject-specific and teacher-assigned

### 3. **Academic Structure**
- School follows a grade-based system (JKG to Grade 12)
- Each class has a designated class teacher
- Subjects are predefined and standardized

### 4. **Authentication**
- JWT tokens for session management
- Token refresh mechanism for continuous sessions
- Role-based access control for all features

### 5. **File Operations**
- CSV format for bulk student import
- Standardized CSV headers for data consistency
- File size limitations for uploads

### 6. **System Behavior**
- Real-time updates for collaborative features
- Automatic conflict resolution for scheduling
- Data persistence across browser sessions

## Usage

### Getting Started
1. **Login**: Use your credentials to access the system
2. **Dashboard**: View system overview and statistics
3. **Navigation**: Use the sidebar to navigate between features
4. **Role-based Access**: Features are shown based on your role

### Common Workflows

#### Teacher Management
1. Navigate to Teachers tab
2. Add new teachers using the "Add Teacher" button
3. Edit existing teachers by clicking on their profile
4. Manage permissions through the Role Management section

#### Student Registration
1. Go to Student Creation tab
2. Use individual form or bulk CSV import
3. Download template for CSV format
4. Assign students to appropriate classes

#### Schedule Management
1. Access Schedule tab
2. Create new schedules with teacher-subject-class mapping
3. View schedule conflicts and resolutions
4. Edit existing schedules as needed

### Best Practices
- **Data Backup**: Regular export of critical data
- **Permission Management**: Regular review of user permissions
- **System Monitoring**: Monitor system performance and usage
- **User Training**: Provide adequate training for new users

## Contributing

### Development Guidelines
1. Follow TypeScript strict mode
2. Use ESLint configuration
3. Maintain component modularity
4. Write comprehensive tests
5. Document new features

### Code Style
- Use Prettier for code formatting
- Follow React best practices
- Maintain consistent naming conventions
- Add proper TypeScript types

---

This project represents a comprehensive solution for educational institution management with modern web technologies and best practices. The system is designed to be scalable, maintainable, and user-friendly while providing robust functionality for all stakeholders.