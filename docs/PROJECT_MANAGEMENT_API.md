# Project Management API Documentation

This documentation covers the essential project management endpoints in the Axon backend system.

## 🛡️ Authentication

All endpoints require JWT authentication unless stated otherwise.

```http
Authorization: Bearer <jwt-token>
```

---

## 📋 Core Project Management

### Create Project
```http
POST /projects
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "name": "My Awesome Project",
  "description": "Project description here (optional)"
}
```

**Validation Requirements:**
- `name`: Required, 3-100 characters
- `description`: Optional, maximum 255 characters

**Success Response (201):**
```json
{
  "message": "project-created-succesfully",
  "id": "project-uuid-here"
}
```

**Notes:**
- Creator automatically becomes project owner
- Owner is automatically added as project member with `owner` role

---

### Get User's Projects
```http
GET /projects/mine
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
[
  {
    "id": "project-uuid",
    "name": "Project Name",
    "description": "Project description",
    "status": "active",
    "role": "owner"
  },
  {
    "id": "another-project-uuid",
    "name": "Another Project",
    "description": null,
    "status": "active", 
    "role": "member"
  }
]
```

**Possible Roles:**
- `owner`: Project creator, full permissions
- `admin`: Can manage members and project settings
- `member`: Basic project access

---

### Get Project Details (Including Participants)
```http
GET /projects/{projectId}
Authorization: Bearer <jwt-token>
```

**Permissions Required:** `VIEW_PROJECT`

**Success Response (200):**
```json
{
  "id": "project-uuid",
  "name": "Project Name",
  "description": "Project description",
  "status": "active",
  "members": [
    {
      "id": "user-uuid",
      "nombre": "John",
      "apellidos": "Smith",
      "role": "owner",
      "status": "active"
    },
    {
      "id": "user-uuid-2",
      "nombre": "Jane",
      "apellidos": "Doe", 
      "role": "admin",
      "status": "active"
    }
  ]
}
```

---

## 👥 Member Management

### Invite Member to Project
```http
POST /projects/{projectId}/invite
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**OR**

```http
POST /projects/{projectId}/invite
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "userId": "user-uuid-here"
}
```

**Permissions Required:** `MANAGE_MEMBERS` (Admin/Owner only)

**Validation:**
- Must provide either `email` OR `userId` (not both)
- Email must be valid format
- UserId must be valid UUID v4

**Success Response (201):**
```json
{
  "message": "invitation-sent-successfully",
  "invitationId": "invitation-uuid",
  "userId": "invited-user-uuid"
}
```

**Error Responses:**
- `404`: `user-to-invite-not-found`
- `400`: `user-already-member`
- `400`: `invitation-already-pending`

---

### Change Member Role
```http
PUT /projects/{projectId}/members/{memberId}/role
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "role": "admin"
}
```

**Permissions Required:** Project Owner only

**Available Roles:**
- `member`: Basic project access
- `admin`: Can manage members and project settings

**Success Response (200):**
```json
{
  "message": "member-role-changed-successfully",
  "memberId": "user-uuid",
  "newRole": "admin",
  "memberName": "John Smith"
}
```

**Restrictions:**
- Only project owner can change roles
- Cannot change owner role
- Cannot change your own role
- Cannot change non-existent members

---

## ✉️ Invitation Management

### Get Pending Invitations
```http
GET /projects/invitations/pending
Authorization: Bearer <jwt-token>
```

**Success Response (200):**
```json
[
  {
    "id": "invitation-uuid",
    "project": {
      "id": "project-uuid",
      "name": "Project Name",
      "description": "Project description"
    },
    "inviter": {
      "id": "inviter-uuid",
      "nombre": "John",
      "apellidos": "Smith"
    },
    "role": "member",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

---

### Respond to Invitation
```http
PUT /projects/invitations/{invitationId}/respond
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "action": "accept"
}
```

**OR**

```http
PUT /projects/invitations/{invitationId}/respond
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "action": "reject"
}
```

**Available Actions:**
- `accept`: Join the project with specified role
- `reject`: Decline the invitation

**Success Response (200) - Accept:**
```json
{
  "message": "invitation-accepted-successfully",
  "projectId": "project-uuid"
}
```

**Success Response (200) - Reject:**
```json
{
  "message": "invitation-rejected-successfully"
}
```

---

## 🔑 Permission System

### Project Roles & Permissions

**Owner:**
- All permissions
- Can delete project
- Can change member roles
- Cannot be changed by others

**Admin:**
- Can view and edit project
- Can manage members (invite/remove)
- Can manage sections and announcements
- Can create and assign tasks

**Member:**
- Can view project
- Can create tasks
- Limited editing capabilities

### Permission Checks

The system uses permission guards to protect endpoints:

```typescript
@RequirePermission(Permission.MANAGE_MEMBERS)
```

Available permissions:
- `VIEW_PROJECT`
- `EDIT_PROJECT` 
- `MANAGE_MEMBERS`
- `CREATE_TASK`
- `ASSIGN_TASK`
- `DELETE_PROJECT`
- `MANAGE_SECTIONS`
- `MANAGE_ANNOUNCEMENTS`

---

## ❌ Common Error Responses

**400 Bad Request:**
```json
{
  "statusCode": 400,
  "message": "project-name-required"
}
```

**401 Unauthorized:**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "statusCode": 403,
  "message": "insufficient-permissions"
}
```

**404 Not Found:**
```json
{
  "statusCode": 404,
  "message": "project-not-found"
}
```

---

## 🔧 Frontend Integration Examples

### JavaScript/Fetch

```javascript
// Get user's projects
async function getUserProjects() {
  const response = await fetch('/projects/mine', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }
  
  return response.json();
}

// Create new project
async function createProject(projectData) {
  const response = await fetch('/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    body: JSON.stringify(projectData)
  });
  
  return response.json();
}

// Invite member by email
async function inviteMember(projectId, email) {
  const response = await fetch(`/projects/${projectId}/invite`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    },
    body: JSON.stringify({ email })
  });
  
  return response.json();
}
```

### React Native with AsyncStorage

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

class ProjectService {
  async getAuthHeader() {
    const token = await AsyncStorage.getItem('access_token');
    return { 'Authorization': `Bearer ${token}` };
  }

  async getUserProjects() {
    const headers = await this.getAuthHeader();
    const response = await fetch('/projects/mine', { headers });
    return response.json();
  }

  async getProjectDetails(projectId) {
    const headers = await this.getAuthHeader();
    const response = await fetch(`/projects/${projectId}`, { headers });
    return response.json();
  }

  async respondToInvitation(invitationId, action) {
    const headers = {
      ...await this.getAuthHeader(),
      'Content-Type': 'application/json'
    };
    
    const response = await fetch(`/projects/invitations/${invitationId}/respond`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ action })
    });
    
    return response.json();
  }
}
```

---

## 🎯 Use Case Examples

### 1. Creating and Setting Up a Project

```javascript
// 1. Create project
const project = await createProject({
  name: "Mobile App Development",
  description: "Building our company mobile app"
});

// 2. Invite team members
await inviteMember(project.id, "developer@company.com");
await inviteMember(project.id, "designer@company.com");

// 3. Get project details to see members
const projectDetails = await getProjectDetails(project.id);
console.log('Project members:', projectDetails.members);
```

### 2. Managing Project Invitations

```javascript
// Get pending invitations
const invitations = await getPendingInvitations();

// Accept specific invitation
if (invitations.length > 0) {
  await respondToInvitation(invitations[0].id, 'accept');
}

// Check updated projects list
const myProjects = await getUserProjects();
```

### 3. Role Management (Owner Only)

```javascript
// Change member to admin
await changeMemberRole(projectId, memberId, 'admin');

// Get updated project details
const updated = await getProjectDetails(projectId);
console.log('Updated roles:', updated.members);
```

---

## 🔍 Troubleshooting

### Common Issues

**"insufficient-permissions" Error:**
- Check if user has required role (admin/owner)
- Verify user is actually a project member

**"invitation-already-pending" Error:**
- User already has pending invitation
- Check pending invitations before sending new one

**"user-already-member" Error:**
- User is already in the project
- Check project members list first

**Invalid UUID Errors:**
- Ensure projectId/userId are valid UUID v4 format
- Check API endpoint URLs for typos

### Debug Tips

```javascript
// Check user's role in project
const projectDetails = await getProjectDetails(projectId);
const currentUser = projectDetails.members.find(m => m.id === userId);
console.log('Current user role:', currentUser?.role);

// List all pending invitations
const invitations = await getPendingInvitations();
console.log('Pending invitations:', invitations);
```

---

## 🚀 Production Considerations

1. **Rate Limiting**: Implement rate limiting for invitation endpoints
2. **Email Notifications**: Set up email service for invitation notifications  
3. **Audit Logging**: Log all role changes and member additions
4. **Bulk Invitations**: Consider batch invitation endpoint for large teams
5. **Member Limits**: Consider implementing project member limits
6. **Soft Deletes**: Implement soft deletion for projects to preserve history

This documentation covers the core project management functionality. For task management, announcements, and other features, refer to their respective API documentation files. 