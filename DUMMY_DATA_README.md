# Dummy Data Population Guide

This guide explains how to populate the database with sample data for testing and development purposes.

## Sample Data Included

### Freelancers (8 Tamil developers)
- **Arun Kumar** - React/Node.js Developer ($45/hr, 4.8⭐)
- **Priya Senthil** - Full-stack Python Developer ($50/hr, 4.9⭐)
- **Karthik Rajan** - Mobile App Developer ($55/hr, 4.7⭐)
- **Deepika Venkatesh** - UI/UX Designer ($40/hr, 4.6⭐)
- **Suresh Babu** - DevOps Engineer ($60/hr, 4.8⭐)
- **Lakshmi Narayanan** - Data Scientist ($65/hr, 4.9⭐)
- **Ravi Chandran** - WordPress Developer ($35/hr, 4.5⭐)
- **Anitha Balasubramanian** - Content Writer ($30/hr, 4.7⭐)

### Clients (2 companies)
- **Rajesh Kumar** - TechStart Solutions
- **Meera Srinivasan** - Creative Agency

### Projects (5 sample projects)
- E-commerce Website Development ($5,000) - Open
- Mobile App for Restaurant ($8,000) - In Progress
- Brand Identity Design ($2,500) - Completed
- Content Marketing Strategy ($3,000) - Open
- Data Analytics Dashboard ($6,000) - Draft

### Reviews (5 sample reviews)
- Ratings and feedback for completed projects

## Methods to Populate Data

### Method 1: Web Interface (Recommended)
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5174/populate-data`
3. Click "Populate Dummy Data" button
4. The data will be inserted into your Supabase database

### Method 2: Browser Console
1. Open your browser and navigate to the application
2. Log in with any user account
3. Open browser developer tools (F12)
4. Go to the Console tab
5. Run one of these commands:

```javascript
// Option 1: Simple populate
import('./lib/dummyData.js').then(m => m.populateDummyData())

// Option 2: Clear first, then populate
(async () => {
  const { clearDummyData, populateDummyData } = await import('./lib/dummyData.js');
  await clearDummyData();
  await populateDummyData();
})()
```

### Method 3: Direct Database Import
If you have direct database access, you can run the SQL from `src/lib/dummyData.ts` manually.

## Testing the Application

After populating the data:

1. **Browse Freelancers**: Go to `/freelancers` to see all freelancers with filtering
2. **View Projects**: Check `/projects` to see sample projects
3. **Test Messaging**: Click "Contact" on any freelancer to start a conversation
4. **View Reviews**: Check freelancer profiles to see their ratings
5. **Client Dashboard**: See project statistics and freelancer counts

## Clearing Data

To remove all dummy data:

1. Go to `/populate-data` page
2. Click "Clear All Dummy Data" button
3. Or run in console:
```javascript
import('./lib/dummyData.js').then(m => m.clearDummyData())
```

## Data Structure

The dummy data follows the database schema:
- **profiles**: User accounts with roles, skills, ratings
- **projects**: Client projects with budgets and deadlines
- **project_members**: Links freelancers to projects
- **reviews**: Ratings and feedback for completed work

All data includes realistic Tamil names, Indian contexts, and professional portfolios.