# Quick Setup Guide for Enhanced Tickets System

## What's New?

The tickets system has been enhanced to properly handle unforeseen activities with a complete workflow:

### Key Improvements:
1. ✅ **Priority Levels**: Critical, High, Medium, Low
2. ✅ **Categories**: Machine Breakdown, Equipment Failure, System Issue, Safety Incident, Maintenance, Other
3. ✅ **Auto-Assignment**: Tickets automatically assigned to Department Head or Company Head
4. ✅ **Responsibility Mapping**: Managers can assign tickets to specific personnel
5. ✅ **Time Tracking**: Track estimated vs actual hours spent
6. ✅ **Resolution Notes**: Document what was done to fix the issue
7. ✅ **Enhanced Filtering**: Filter by status, priority, department, and role-based views
8. ✅ **Better UI**: Improved interface with color-coded priorities and status indicators

## Setup Instructions

### Step 1: Update Database Schema

Run the migration script to add new columns to your tickets table:

```bash
cd server
node src/scripts/migrateTickets.js
```

**Expected Output:**
```
Starting tickets table migration...
Current columns: [...]
Adding column: category
✓ Added category
Adding column: priority
✓ Added priority
...
✓ Updated status ENUM
✅ Migration completed successfully!
```

### Step 2: Restart Your Server

```bash
# In the server terminal (if running)
# Press Ctrl+C to stop, then:
npm start
```

### Step 3: Test the System

1. **Login** to your application
2. **Navigate** to the Tickets page
3. **Create a test ticket**:
   - Title: "Test Machine Breakdown"
   - Category: Machine Breakdown
   - Priority: High
   - Department: (select your department)
   - Description: Testing the new ticket system

4. **Verify auto-assignment**:
   - If you're a Manager: Check "Assigned to Me" tab
   - If you're Management: Check "All Tickets" tab

5. **Test assignment** (Manager/Management only):
   - Click the purple user icon to assign the ticket
   - Select a responsible person
   - Save the assignment

6. **Update status**:
   - Click the blue edit icon
   - Change status and add resolution notes
   - Save changes

## Workflow Overview

```
Employee Creates Ticket
        ↓
Auto-Assigned to Dept Head/Company Head
        ↓
Manager Assigns to Responsible Person
        ↓
Responsible Person Works on Resolution
        ↓
Updates Status → Resolved → Closed
```

## View Modes

### Employee View
- **My Tickets**: Tickets I created

### Manager/Management View
- **My Tickets**: Tickets I created
- **Assigned to Me**: Tickets waiting for me to assign to someone
- **I'm Responsible**: Tickets I'm personally handling
- **All Tickets**: Complete overview (role-based filtering applied)

## Filters Available

- **Search**: Search by title, description, department
- **Status**: Open, Assigned, In Progress, Pending, Resolved, Closed
- **Priority**: Low, Medium, High, Critical

## Troubleshooting

### Migration Issues

**Problem**: "Table 'tickets' doesn't exist"
**Solution**: The table will be created automatically when the server starts. Just start your server normally.

**Problem**: "Column already exists"
**Solution**: This is normal if you've run the migration before. The script skips existing columns.

### Permission Issues

**Problem**: "Cannot assign tickets"
**Solution**: Assignment is only available for Manager and Management roles. Check your user role.

**Problem**: "Forbidden" error
**Solution**: Make sure you have appropriate permissions for the action you're trying to perform.

### Database Connection

**Problem**: Migration script can't connect to database
**Solution**: 
1. Check your `.env` file has correct database credentials
2. Make sure MySQL/MariaDB is running
3. Verify the database exists

## Next Steps

1. **Configure Departments**: Make sure all departments are set up in the system
2. **Assign Roles**: Ensure users have correct roles (Employee, Manager, Management)
3. **Train Staff**: Brief your team on the new ticket workflow
4. **Monitor Usage**: Check that tickets are being created and assigned properly

## Need Help?

- Check `TICKETS_SYSTEM.md` for detailed documentation
- Review the API endpoints in the tickets controller
- Check server logs for any errors
- Contact your system administrator

## Rollback (If Needed)

If you need to rollback the changes:

```sql
-- Run these SQL commands to remove new columns
ALTER TABLE tickets DROP COLUMN category;
ALTER TABLE tickets DROP COLUMN priority;
ALTER TABLE tickets DROP COLUMN department_id;
ALTER TABLE tickets DROP COLUMN responsible_person;
ALTER TABLE tickets DROP COLUMN resolution_notes;
ALTER TABLE tickets DROP COLUMN resolved_at;
ALTER TABLE tickets DROP COLUMN closed_at;
ALTER TABLE tickets DROP COLUMN estimated_hours;
ALTER TABLE tickets DROP COLUMN actual_hours;
ALTER TABLE tickets DROP COLUMN attachment_url;
ALTER TABLE tickets DROP COLUMN updated_at;

-- Restore old status ENUM
ALTER TABLE tickets MODIFY COLUMN status ENUM('Open','In Progress','Resolved') DEFAULT 'Open';
```

---

**Version**: 2.0  
**Last Updated**: November 4, 2025  
**Compatibility**: Node.js 14+, MySQL 5.7+
