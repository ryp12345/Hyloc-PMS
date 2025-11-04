# Tickets System Documentation

## Overview
The Tickets system is designed to handle **unforeseen activities** such as machine breakdowns, equipment failures, system issues, and other unexpected incidents that require immediate attention and resolution.

## Workflow

### 1. **Ticket Creation (Employee)**
Any employee can create a ticket when an unforeseen activity occurs:
- Provide title and detailed description
- Select category (Machine Breakdown, Equipment Failure, System Issue, Safety Incident, Maintenance, Other)
- Set priority level (Low, Medium, High, Critical)
- Specify the affected department
- Optionally provide estimated resolution time

### 2. **Auto-Assignment to Department/Company Head**
When a ticket is created:
- The system automatically assigns it to the **Department Head (Manager)** if department is specified
- If no department manager exists, it's assigned to the **Company Head (Management)**
- Ticket status changes to "Assigned"
- The assigned person receives the ticket for review

### 3. **Mapping to Responsible Person (Manager/Management)**
Department Head or Company Head can:
- Review all assigned tickets
- Map/assign the ticket to the **appropriate responsible person** who will handle the resolution
- Set or adjust estimated hours for resolution
- Ticket status changes to "In Progress"

### 4. **Resolution (Responsible Person)**
The responsible person can:
- Update ticket status throughout the resolution process
- Add resolution notes describing actions taken
- Record actual hours spent on resolution
- Mark ticket as "Resolved" when fixed
- Finally close the ticket

### 5. **Tracking & Monitoring**
- **Employees**: View tickets they created
- **Managers**: View tickets in their department + assigned/responsible tickets
- **Management**: View all tickets across the organization
- Filter by status, priority, department
- Track time spent vs. estimated time

## Features

### Priority Levels
- 🔴 **Critical**: Requires immediate attention (e.g., production line stopped)
- 🟠 **High**: Important, should be addressed soon
- 🟡 **Medium**: Normal priority
- 🟢 **Low**: Can be scheduled for later

### Categories
- **Machine Breakdown**: Equipment or machinery failures
- **Equipment Failure**: Tool or device malfunctions
- **System Issue**: IT or software problems
- **Safety Incident**: Safety-related concerns
- **Maintenance**: Scheduled or unscheduled maintenance
- **Other**: Other unforeseen activities

### Status Flow
```
Open → Assigned → In Progress → [Pending] → Resolved → Closed
```

### Ticket Fields
- **Title**: Brief description of the issue
- **Description**: Detailed information about the incident
- **Category**: Type of unforeseen activity
- **Priority**: Urgency level
- **Department**: Affected department
- **Created By**: Employee who reported the issue
- **Assigned To**: Department/Company Head
- **Responsible Person**: Person handling the resolution
- **Status**: Current state of the ticket
- **Estimated Hours**: Expected time to resolve
- **Actual Hours**: Time actually spent on resolution
- **Resolution Notes**: Description of actions taken
- **Timestamps**: Created, resolved, and closed dates

## User Roles & Permissions

### Employee
- ✅ Create tickets
- ✅ View their own created tickets
- ✅ Update status of tickets they created
- ✅ Delete their own tickets (if allowed)

### Manager (Department Head)
- ✅ All Employee permissions
- ✅ View all tickets in their department
- ✅ View tickets assigned to them
- ✅ Assign tickets to responsible persons
- ✅ Update any ticket status in their department
- ✅ Add resolution notes

### Management (Company Head)
- ✅ All Manager permissions
- ✅ View all tickets organization-wide
- ✅ Assign any ticket to anyone
- ✅ Override any ticket settings
- ✅ Delete any ticket

## API Endpoints

### List Tickets
```
GET /tickets?scope={created|assigned|responsible|all}&status={status}&priority={priority}
```

### Create Ticket
```
POST /tickets
Body: { title, description, category, priority, department, estimated_hours }
```

### Get Single Ticket
```
GET /tickets/:id
```

### Assign Ticket
```
PATCH /tickets/:id/assign
Body: { responsible_person, estimated_hours }
```

### Update Status
```
PATCH /tickets/:id/status
Body: { status, resolution_notes, actual_hours, priority }
```

### Delete Ticket
```
DELETE /tickets/:id
```

## Database Schema

```sql
CREATE TABLE tickets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT,
  category ENUM('Machine Breakdown', 'Equipment Failure', 'System Issue', 'Safety Incident', 'Maintenance', 'Other') DEFAULT 'Other',
  priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  department VARCHAR(100),
  department_id INT,
  created_by CHAR(36) NOT NULL,
  assigned_to CHAR(36),
  responsible_person CHAR(36),
  status ENUM('Open', 'Assigned', 'In Progress', 'Pending', 'Resolved', 'Closed') DEFAULT 'Open',
  resolution_notes TEXT,
  resolved_at DATETIME,
  closed_at DATETIME,
  estimated_hours DECIMAL(5, 2),
  actual_hours DECIMAL(5, 2),
  attachment_url VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (assigned_to) REFERENCES users(id),
  FOREIGN KEY (responsible_person) REFERENCES users(id),
  FOREIGN KEY (department_id) REFERENCES departments(id)
);
```

## Migration

If you have an existing tickets table, run the migration script:

```bash
node server/src/scripts/migrateTickets.js
```

This will safely add new columns to your existing table without losing data.

## Best Practices

1. **Be Specific**: Provide detailed descriptions to help with quick resolution
2. **Set Appropriate Priority**: Use Critical only for urgent production issues
3. **Assign Quickly**: Department heads should review and assign tickets promptly
4. **Update Status**: Keep stakeholders informed by updating ticket status
5. **Document Resolution**: Always add resolution notes for future reference
6. **Track Time**: Record actual hours to improve future estimates
7. **Close Tickets**: Don't leave resolved tickets open - close them after verification

## Example Usage

### Reporting a Machine Breakdown
```javascript
{
  "title": "CNC Machine #3 stopped working",
  "description": "Machine suddenly stopped mid-operation with error code E-243. Production line 3 is affected.",
  "category": "Machine Breakdown",
  "priority": "Critical",
  "department": "Production",
  "estimated_hours": 4
}
```

### Assigning to Technician
```javascript
{
  "responsible_person": "tech-user-uuid",
  "estimated_hours": 3
}
```

### Resolving the Ticket
```javascript
{
  "status": "Resolved",
  "resolution_notes": "Replaced faulty motor sensor. Tested machine for 30 minutes - operating normally.",
  "actual_hours": 2.5
}
```

## Benefits

1. **Quick Response**: Immediate notification to department heads
2. **Clear Accountability**: Track who's responsible for each issue
3. **Time Tracking**: Monitor resolution efficiency
4. **Historical Data**: Build knowledge base of common issues
5. **Priority Management**: Focus on critical issues first
6. **Audit Trail**: Complete history of all incidents
7. **Performance Metrics**: Analyze response times and resolution patterns

## Support

For issues or questions about the Tickets system, contact your system administrator or refer to the main project documentation.
