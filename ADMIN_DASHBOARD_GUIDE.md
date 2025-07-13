# 🛠️ Admin Dashboard Setup Guide

## Access the Admin Dashboard

### **Local Development**
1. **Direct URL Access:**
   ```
   http://localhost:5173/?admin=true
   ```

2. **Path-based Access:**
   ```
   http://localhost:5173/admin
   ```

### **Production (Vercel)**
1. **Query Parameter:**
   ```
   https://your-app.vercel.app/?admin=true
   ```

2. **URL Path:**
   ```
   https://your-app.vercel.app/admin
   ```

## Admin Password
- **Default Password:** `hsk-admin-2025`
- **Change Location:** `src/components/AdminRoute.tsx` (line 10)

## Dashboard Features

### **📊 User Statistics**
- Total users (authenticated + guest)
- Active users (7 days / 30 days)
- New registrations
- User type breakdown

### **🎯 Session Analytics**
- Total learning sessions
- Daily/weekly/monthly activity
- Average session length
- Word study progress
- Accuracy rates

### **🔊 Audio API Usage**
- Azure Speech Service usage
- Character count tracking
- Usage percentage vs. limits
- Cost estimation
- Web Speech API fallback stats

### **⚙️ System Overview**
- Database size
- Word catalog metrics
- Most popular categories
- HSK level distribution

## Privacy & Security

### **Local-Only Access**
- Dashboard runs entirely client-side
- No server-side admin authentication
- Perfect for local development and testing

### **Data Sources**
- Firebase Firestore (user & session data)
- localStorage (audio usage tracking)
- Client-side calculations

### **Security Features**
- Password protection
- No data transmission to external servers
- All stats calculated locally

## Development Commands

### **Start Development Server**
```bash
npm run dev
```

### **Access Admin Dashboard**
```bash
# Open browser to:
http://localhost:5173/?admin=true
```

### **Test Audio Tracking**
1. Use the flashcard app normally
2. Play audio with both Azure and Web Speech
3. Check admin dashboard for usage statistics

## Configuration

### **Environment Variables**
Add to `.env.local`:
```env
# Admin API key (optional, for server-side stats)
ADMIN_KEY=hsk-admin-key-2025

# Azure Speech Service
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=your_region
```

### **Customization**
- **Password:** Edit `src/components/AdminRoute.tsx`
- **Stats:** Modify `src/components/AdminDashboard.tsx`
- **Tracking:** Update `src/services/audioUsageTracker.ts`

## Usage Statistics

### **Audio Tracking**
- **Azure Speech:** Character count, daily/monthly limits
- **Web Speech:** Call count, success/error rates
- **Cost Monitoring:** Real-time Azure usage vs. free tier

### **User Analytics**
- **Registration:** New users per day/week
- **Activity:** Active users and session frequency
- **Progress:** Words studied and accuracy rates

### **System Health**
- **Database:** Document count and size
- **Performance:** Response times and error rates
- **Backup:** Last backup timestamp

## Quick Actions

### **Export Data**
```javascript
// In browser console:
AudioUsageTracker.getInstance().exportUsageData();
```

### **Reset Usage Stats**
```javascript
// In browser console (use carefully):
AudioUsageTracker.getInstance().clearUsageData();
```

### **Refresh Dashboard**
- Click "🔄 Refresh Data" button
- All stats reload from live data sources

## Troubleshooting

### **Dashboard Not Loading**
1. Check console for JavaScript errors
2. Verify Firebase configuration
3. Ensure localStorage is enabled

### **Missing Statistics**
1. Use the app to generate data first
2. Check Firebase connection
3. Verify data permissions

### **Audio Stats Not Updating**
1. Test audio functionality
2. Check localStorage permissions
3. Verify tracking integration

## Production Deployment

### **Hide Admin Access**
1. Remove obvious admin links from UI
2. Use obscure URL parameters
3. Consider IP-based restrictions

### **Security Considerations**
- Change default password
- Use environment variables for secrets
- Monitor access logs

### **Performance**
- Dashboard loads all data client-side
- May be slow with large datasets
- Consider pagination for large user bases

---

🚀 **Ready to Monitor Your HSK App!**

Your admin dashboard provides comprehensive insights into user behavior, audio usage, and system performance. Perfect for optimizing your flashcard app and monitoring Azure API costs.
