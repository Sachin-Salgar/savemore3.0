# CSV Member Upload Guide

## Overview

SaveMore allows group presidents and administrators to add multiple members at once using CSV (Comma-Separated Values) file uploads.

## Features

- **Single Member Addition**: Add members one at a time with name, email, and optional phone
- **Bulk CSV Upload**: Upload multiple members at once via CSV file
- **Sample CSV Download**: Download a template CSV file to understand the correct format
- **Validation**: Automatic validation of all entries before upload
- **Error Handling**: Clear error messages for invalid rows

## How to Add Members

### For Group Presidents

1. Navigate to **Members** section from the bottom menu
2. Click the **+ Add Members** button
3. Choose one of two options:
   - **Single Member**: Enter name, email, and optional phone number
   - **CSV Upload**: Upload a CSV file with multiple members

### For Administrators

1. Navigate to **Members** from the hamburger menu (Admin section)
2. Select the group you want to add members to
3. Click the **+ Add Members** button
4. Choose single or bulk upload option

## CSV File Format

### Required Columns

- `email` - Member's email address (required)
- `name` - Member's full name (required)
- `phone` - Member's phone number (optional)

### Example CSV Format

```csv
email,name,phone
john.doe@example.com,John Doe,9876543210
jane.smith@example.com,Jane Smith,9876543211
raj.kumar@example.com,Raj Kumar,9876543212
```

### Important Notes

- The header row (first row) must contain column names
- Column names are case-insensitive
- Phone number is optional but recommended
- Email addresses must be valid and unique
- Each member can only be in a group once

## Downloading Sample CSV

1. Open the CSV Upload tab in the Add Members modal
2. Click **📥 Download Sample CSV**
3. A file named `sample_members.csv` will be downloaded
4. Use this as a template for your CSV file

## Uploading CSV

1. In the CSV Upload tab, click **Upload CSV File** or drag a CSV file
2. Select your CSV file from your computer
3. The system will validate the file and show a preview
4. If validation errors exist, they will be highlighted
5. Click **Upload Members** to add all valid members
6. You'll see a summary of successful and failed additions

## Troubleshooting

### Validation Errors

**"Invalid email format"**
- The email address doesn't contain the `@` symbol or is missing a domain

**"Name is required"**
- The name field is empty or missing

**"Insufficient columns in row"**
- The row has fewer columns than the header

### Common Issues

**"Member is already part of this group"**
- This member's email is already added to this group
- You cannot add the same member twice

**"CSV file is empty"**
- The file you uploaded contains no data rows

**"CSV must have "email" and "name" columns"**
- The header row doesn't contain both required columns
- Check the column names and ensure they match exactly

## Permission Levels

### Member
- Cannot add members
- Can view group members

### President
- Can add members to their own group only
- Can approve or reject member applications
- Can view all members in their group

### Admin
- Can add members to any group
- Can select group when adding members
- Can view members across all groups

## Best Practices

1. **Validate Data Before Upload**
   - Use the preview feature to check your data
   - Ensure all emails are unique and valid
   - Review phone numbers for correct format

2. **Use the Sample Template**
   - Always start with the downloaded sample
   - Don't add or remove columns
   - Keep the exact column names

3. **Batch Upload Tips**
   - Upload members in batches of 100 or less for best performance
   - If a large upload has errors, fix them and try again
   - Check the error report after upload

4. **Follow Naming Conventions**
   - Use full names for clarity
   - Keep names concise and consistent
   - Include middle names if available

## Member Approval Workflow

After uploading members:

1. Members are added with **Pending** status
2. Members need to be **Approved** by the group president
3. Once approved, members become **Active**
4. Active members can:
   - View their savings balance
   - Apply for loans
   - View transaction history

## FAQ

**Q: Can I edit a member after uploading?**
A: Currently, member details are set at creation. Contact support for changes.

**Q: What happens if the upload fails?**
A: You can review the error report and retry after fixing the issues.

**Q: Can I upload members to multiple groups at once?**
A: No, you must select one group per upload session. Repeat the process for other groups.

**Q: Is there a maximum number of members I can upload?**
A: There's no hard limit, but we recommend uploading in batches of 100-200 for optimal performance.

**Q: Can I re-use the sample CSV file?**
A: Yes, you can modify the sample CSV by adding your member data.

## Need Help?

For issues with CSV upload:
1. Review the error messages carefully
2. Check the Troubleshooting section above
3. Verify your CSV format matches the sample
4. Contact support if problems persist
