# Bulk Staff Upload Feature

## Overview
The bulk staff upload feature allows HR and Management users to add multiple staff members at once using an Excel file, following the same structure as the single staff creation form.

## Features Implemented

### 1. Backend (Server)
- **New Dependencies**: `xlsx` library for Excel file parsing
- **New Endpoints**:
  - `GET /api/users/download-template` - Download Excel template
  - `POST /api/users/bulk-upload` - Upload Excel file with staff data

### 2. Frontend (Client)
- **New UI Components**:
  - "Bulk Upload" button on Staff Management page
  - Bulk upload modal with instructions
  - Excel template download button
  - Results display showing success/error counts
  - Detailed error reporting table

## How to Use

### Step 1: Download Template
1. Navigate to HR > Staff Management page
2. Click the "Bulk Upload" button (green button)
3. Click "Download Excel Template"
4. Save the template file to your computer

### Step 2: Fill Template
The Excel template includes the following columns:

**Required Fields:**
- `Name` - Full name of the employee
- `Email` - Email address (must be unique)
- `EmployeeID` - Employee ID (must be unique)

**Optional Fields:**
- `Password` - Login password (default: "password123")
- `Department` - Department name (must match existing department)
- `Designation` - Designation name (must match existing designation)
- `Religion` - Religion (Hindu, Muslim, Christian, Sikh, Buddhist, Jain, Other)
- `Association` - Association name (must match existing association)
- `DateOfBirth` - Format: YYYY-MM-DD
- `PhoneNumber` - Contact number
- `BloodGroup` - Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
- `EmergencyContactName` - Emergency contact person name
- `EmergencyContactNumber` - Emergency contact number
- `EmergencyContactRelation` - Relation (Father, Mother, Spouse, Brother, Sister, Son, Daughter, Other)
- `PANNumber` - PAN card number
- `AadharNumber` - Aadhar card number
- `DateOfJoining` - Format: YYYY-MM-DD
- `TPMPillar` - TPM Pillar selection
- `AwardRecognition` - Awards and recognitions

### Step 3: Upload File
1. Fill in the template with staff data (one row per staff member)
2. Save the Excel file
3. In the bulk upload modal, click "Choose File" and select your Excel file
4. Click "Upload Staff"

### Step 4: Review Results
After upload, you'll see:
- **Total Rows**: Number of rows in your Excel file
- **Successful**: Number of staff members successfully created
- **Failed**: Number of rows that failed with errors

A detailed table shows:
- Successfully added staff with their details
- Failed rows with specific error messages

## Validation Rules

### Email Validation
- Must be unique in the system
- Must be a valid email format

### Employee ID Validation
- Must be unique in the system
- Cannot be empty

### Department/Designation/Association
- Must match existing records exactly (case-insensitive)
- If specified but not found, the row will fail with an error

### Date Fields
- Must be in YYYY-MM-DD format
- Example: 2024-01-15

### Phone Numbers
- Should be numeric
- No specific format enforced (can include country code)

## Error Handling

The system provides detailed error messages for:
- Missing required fields
- Duplicate email addresses
- Duplicate employee IDs
- Invalid department/designation/association names
- Any database errors during creation

Each error includes:
- Row number in the Excel file
- Specific error message
- Failed data for reference

## Technical Details

### Backend Implementation
- Uses `multer` for file upload handling (memory storage)
- Supports .xlsx and .xls file formats
- Maximum file size: 10MB
- Validates each row before creating
- Creates user and staff records with proper associations
- Sets up many-to-many relationships (departments, designations, associations)
- All staff created via bulk upload get "Employee" role by default

### Frontend Implementation
- File upload with validation
- Real-time feedback during upload
- Clear success/error reporting
- Maintains same structure as single staff creation
- Downloads template with example data

## File Structure

### Modified Files
1. `server/src/controllers/users.controller.js` - Added bulk upload and template download functions
2. `server/src/routes/user.routes.js` - Added new routes with multer middleware
3. `client/src/pages/hr/staff/StaffPage.jsx` - Added bulk upload UI components

### New Dependencies
- Server: `xlsx` (^0.18.5)

## Best Practices

1. **Test with Small Batches First**: Upload 2-3 rows initially to verify the format
2. **Verify Master Data**: Ensure departments, designations, and associations exist before upload
3. **Use Copy-Paste**: Copy data from existing systems and paste into template
4. **Keep Backup**: Save a copy of your Excel file before upload
5. **Review Errors**: If errors occur, fix them in the Excel file and re-upload

## Troubleshooting

### "Department not found" Error
- Ensure the department name in Excel exactly matches the name in the Departments page
- Check for extra spaces or typos

### "Email already exists" Error
- The email address is already used by another user
- Either use a different email or update the existing user manually

### "Employee ID already exists" Error
- The employee ID is already assigned to another staff member
- Use a unique employee ID for each staff member

### Upload Fails with No Error Message
- Check file format (.xlsx or .xls)
- Verify file size is under 10MB
- Ensure you're logged in with HR or Management role

## Future Enhancements

Potential improvements for future versions:
- Support for staff image upload via URLs in Excel
- Bulk update functionality
- Preview data before final upload
- Export existing staff to Excel format
- Support for custom field mapping
- Validation of date formats with clearer error messages
- Bulk assignment of multiple departments/designations per staff
