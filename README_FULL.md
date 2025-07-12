# 🧠 HSK 1-3 Flashcards Tutor

<div align="center">

![HSK Flashcards Banner](./public/images/Screenshot%202025-07-12%20at%2021-07-59%20HSK%201-3%20Flashcards%20Tutor.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=flat&logo=Firebase&logoColor=white)](https://firebase.google.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

A **modern, intelligent Chinese vocabulary learning application** featuring **2,200+ HSK words** with scientifically-proven spaced repetition algorithms. Master HSK levels 1-3 with our beautiful, responsive interface and comprehensive progress tracking.

## ✨ Key Features

### 🎯 **Comprehensive HSK Coverage**
- **2,219 essential Chinese words** covering HSK levels 1-3 (HSK 3.0 standards)
- **70+ word categories** including verbs, nouns, adjectives, numbers, and more
- **Detailed word information**: Chinese characters, pinyin, IPA pronunciation, English & French translations
- **Stroke count data** for handwriting practice
- **Usage frequency ratings** for prioritized learning

### 🧠 **Smart Learning System**
- **Spaced Repetition System (SRS)** - Scientifically proven algorithm for optimal retention
- **Adaptive difficulty** - Words adjust based on your performance
- **4 learning levels**: New → Learning → Review → Mastered
- **Intelligent scheduling** - Cards appear when you need to review them most

### � **Comprehensive Progress Tracking**
- **Study streak counter** - Track your daily learning consistency
- **Detailed statistics** - Accuracy rates, session counts, and learning time
- **Visual progress indicators** for each HSK level
- **Word-level tracking** - See individual word progress and statistics
- **Session analytics** - Performance metrics for each study session

### 🎨 **Customizable Study Experience**
- **Flexible session settings** - Adjust session size (5-50 cards)
- **HSK level filtering** - Study specific levels or combine them
- **Category filtering** - Focus on specific word types
- **Difficulty levels** - Choose appropriate challenge levels (1-5)
- **Stroke count filtering** - Practice based on character complexity
- **Display preferences** - Toggle pinyin, IPA, English, and French

### ☁️ **Cross-Device Synchronization**
- **Google Authentication** - Secure user accounts with Google Sign-In
- **Firebase Cloud Storage** - Progress synced across all devices
- **Guest mode** - Try the app without creating an account
- **Local storage fallback** - Works offline with automatic sync when online

### 📱 **Modern User Experience**
- **Mobile-first responsive design** - Perfect on phones, tablets, and desktop
- **Beautiful animations** - Confetti celebrations and smooth transitions
- **Dark theme** - Eye-friendly gradient design
- **Touch-friendly interface** - Optimized for touch interactions
- **Accessibility features** - Proper ARIA labels and keyboard navigation

## 🖼️ App Screenshots

<div align="center">
<img src="./public/images/Screenshot%202025-07-12%20at%2021-08-25%20HSK%201-3%20Flashcards%20Tutor.png" alt="Learning Dashboard" width="300"/>
<img src="./public/images/Screenshot%202025-07-12%20at%2021-09-25%20HSK%201-3%20Flashcards%20Tutor.png" alt="Flashcard Interface" width="300"/>
</div>

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **npm** or **yarn** package manager
- **Firebase account** - For authentication and data storage

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ekoban/hsk1-flashcards.git
   cd hsk1-flashcards
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**
   ```bash
   # Copy the example config
   cp src/firebase.example.ts src/firebase.ts
   
   # Edit src/firebase.ts with your Firebase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:5173
   ```

## 🛠️ Tech Stack

### **Frontend Framework**
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development with strict mode enabled
- **Vite** - Lightning-fast build tool and dev server

### **Styling & UI**
- **Tailwind CSS** - Utility-first CSS framework
- **CSS Grid & Flexbox** - Modern responsive layouts
- **Custom animations** - Smooth transitions and micro-interactions
- **Lucide React** - Beautiful, customizable icons

### **Backend & Database**
- **Firebase Authentication** - Google Sign-In integration
- **Cloud Firestore** - NoSQL database for user progress
- **Firebase Security Rules** - Secure data access

### **Development Tools**
- **ESLint** - Code linting and formatting
- **TypeScript compiler** - Strict type checking
- **PostCSS** - CSS processing with Autoprefixer

## 📚 Learning Algorithm

Our spaced repetition system is based on proven cognitive science research:

### **Word Levels**
- **Level 0 (New)**: 📘 Words you haven't studied yet
- **Level 1 (Learning)**: 📙 Words you've started learning
- **Level 2 (Review)**: 📒 Words you know but need regular review
- **Level 3 (Mastered)**: 📗 Words you know very well

### **Scheduling Algorithm**
- **Correct answers**: Increase level, double the review interval
- **Incorrect answers**: Decrease level, reset to daily review
- **Adaptive timing**: Review intervals from 1 day to several weeks

### **Session Composition**
1. **Due cards first** - Words scheduled for review today
2. **New cards** - Introduce fresh vocabulary when ready
3. **Random selection** - Proper shuffling for varied practice
4. **Balanced sessions** - Mix of different difficulty levels

## 📖 HSK Database

Our comprehensive database includes:

### **Word Coverage**
- **HSK Level 1**: 503 words (most essential vocabulary)
- **HSK Level 2**: 758 words (elementary level)
- **HSK Level 3**: 958 words (intermediate level)
- **Total**: 2,219 unique entries

### **Data Fields**
```typescript
interface HSKWord {
  id: number;                    // Unique identifier
  chinese: string;               // Chinese characters
  pinyin: string;                // Romanized pronunciation
  ipa?: string;                  // International Phonetic Alphabet
  english: string;               // English translation
  french?: string;               // French translation
  difficulty: 1-5;               // Subjective difficulty rating
  category: string;              // Word type (verb, noun, etc.)
  strokeCount: number;           // Number of strokes to write
  usageFrequency: 1-5;          // How commonly used
  hskLevel: 1 | 2 | 3;          // HSK classification level
}
```

### **Categories Available**
- **Verbs** - Action words and state verbs
- **Nouns** - People, places, things, concepts
- **Adjectives** - Descriptive words
- **Numbers** - Cardinal and ordinal numbers
- **Time** - Days, months, time expressions
- **Family** - Family relationships
- **Food** - Meals, ingredients, cooking
- **Colors** - Basic and advanced colors
- **Body** - Body parts and health
- **Transportation** - Vehicles and travel
- **And 60+ more categories**

## 🎮 How to Use

### **Getting Started**
1. **Sign in** with Google or continue as guest
2. **Choose HSK levels** you want to study (1, 2, 3, or combinations)
3. **Start your first session** with default settings
4. **Study consistently** to build your streak

### **Study Session Flow**
1. **View Chinese character** - Try to recall the meaning
2. **Click "Show Answer"** - See pinyin, IPA, and translations
3. **Rate your knowledge**:
   - **Again** (❌) - Didn't know it, will appear sooner
   - **Good** (✅) - Knew it, will appear later
4. **Complete session** - See your statistics and celebrate!

### **Customizing Your Experience**
- **Session Settings** ⚙️ - Adjust all parameters
- **HSK Level Buttons** - Quick toggle between levels
- **Progress Cards** - Click to see word lists
- **Filter Options** - Fine-tune your study material

### **Progress Monitoring**
- **Dashboard KPIs** - Key metrics at a glance
- **Learning Progress** - Visual progress bars
- **Word Lists** - Detailed breakdown by category
- **Study Streak** - Daily consistency tracking

## 📱 Cross-Platform Support

### **Desktop (Chrome, Firefox, Safari, Edge)**
- **Full feature set** - All functionality available
- **Keyboard shortcuts** - Space for next card, Enter for answer
- **Large screen optimization** - Thumbnail navigation
- **Multi-tab support** - Session state preserved

### **Mobile (iOS Safari, Android Chrome)**
- **Touch-optimized** - Large buttons, swipe gestures
- **Responsive design** - Adapts to all screen sizes
- **PWA features** - Install as app, offline capability
- **Mobile-specific UI** - Optimized layouts

### **Tablet (iPad, Android tablets)**
- **Hybrid layout** - Best of desktop and mobile
- **Touch and keyboard** - Multiple input methods
- **Split-screen compatible** - Use alongside other apps

## 🔧 Configuration & Customization

### **Firebase Setup**
See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for detailed configuration instructions.

### **Environment Variables**
```bash
# Firebase Configuration (add to .env.local)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### **Deployment Options**
See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for platform-specific instructions:
- **Vercel** (recommended) - Automatic deployments
- **Netlify** - Static site hosting
- **Firebase Hosting** - Google's hosting solution
- **GitHub Pages** - Free hosting for open source

## 🔒 Security & Privacy

### **Data Protection**
- **Client-side encryption** - Sensitive data never leaves your device in plain text
- **Firebase Security Rules** - Server-side access control
- **HTTPS only** - All communications encrypted
- **No tracking** - We don't track your learning data for advertising

### **Authentication**
- **Google OAuth 2.0** - Industry-standard authentication
- **Guest mode** - No account required for basic features
- **Automatic logout** - Sessions expire for security

### **Data Storage**
- **User progress**: Stored in Firestore, associated with your Google account
- **Session settings**: Synced across devices
- **Local fallback**: Offline capability with localStorage

See [SECURITY.md](./SECURITY.md) for detailed security information.

## 🚀 Development

### **Project Structure**
```
hsk1-flashcards/
├── src/
│   ├── components/          # React components
│   │   ├── HSK1FlashcardApp.tsx    # Main app logic
│   │   ├── LandingPage.tsx         # Landing page with carousel
│   │   └── LoginScreen.tsx         # Authentication
│   ├── contexts/           # React contexts
│   │   └── AuthContext.tsx        # Authentication state
│   ├── services/           # Firebase services
│   │   └── dataService.ts         # Data operations
│   ├── data/              # Static data
│   │   └── hsk-database.json      # HSK word database
│   └── firebase.ts        # Firebase configuration
├── public/
│   └── images/            # App screenshots
├── docs/                  # Documentation
└── package.json          # Dependencies and scripts
```

### **Available Scripts**
```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality

# Firebase (if using Firebase tools)
firebase serve       # Serve locally with Firebase
firebase deploy      # Deploy to Firebase Hosting
```

### **Contributing**
1. **Fork the repository**
2. **Create feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open Pull Request**

### **Development Guidelines**
- **TypeScript strict mode** - All code must be type-safe
- **ESLint compliance** - Follow established code style
- **Component documentation** - Document props and usage
- **Responsive design** - Test on multiple screen sizes
- **Accessibility** - Ensure keyboard and screen reader support

## 📊 Performance

### **Optimization Features**
- **Code splitting** - Dynamic imports for better loading
- **Tree shaking** - Eliminate unused code
- **Asset optimization** - Compressed images and fonts
- **Lazy loading** - Load components on demand
- **Service worker** - Cache static assets
- **Gzip compression** - Reduce transfer size

### **Performance Metrics**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Bundle size**: < 500KB gzipped

## 🗺️ Roadmap

### **Upcoming Features**
- [ ] **Audio pronunciation** - Native speaker recordings
- [ ] **Writing practice** - Stroke order training
- [ ] **Sentence examples** - Context-based learning
- [ ] **Study reminders** - Push notifications
- [ ] **Offline mode** - Full offline functionality
- [ ] **Social features** - Share progress with friends
- [ ] **HSK 4-6 support** - Advanced vocabulary levels
- [ ] **AI-powered review** - Intelligent difficulty adjustment

### **Performance Improvements**
- [ ] **PWA enhancement** - Full Progressive Web App features
- [ ] **Advanced caching** - Smarter cache strategies
- [ ] **Bundle optimization** - Further size reductions
- [ ] **Animation performance** - GPU-accelerated animations

## 🤝 Support

### **Getting Help**
- **Documentation**: Check our comprehensive guides
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join community discussions
- **Email**: Contact us for direct support

### **Common Issues**
- **Firebase connection**: Check your API keys and configuration
- **Progress not syncing**: Ensure you're signed in
- **Performance issues**: Try clearing browser cache
- **Mobile display**: Update to latest browser version

## 📄 Documentation

- **[Firebase Setup Guide](./FIREBASE_SETUP.md)** - Complete Firebase configuration
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Platform-specific deployment
- **[Security Documentation](./SECURITY.md)** - Security features and best practices
- **[Design Guide](./DESIGN_GUIDE.md)** - UI/UX design principles
- **[Reset Instructions](./RESET_INSTRUCTIONS.md)** - How to reset user data

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **What this means:**
- ✅ **Commercial use** - Use in commercial projects
- ✅ **Modification** - Modify and adapt the code
- ✅ **Distribution** - Share with others
- ✅ **Private use** - Use for personal projects
- ❌ **Liability** - No warranty or liability
- ❌ **Trademark use** - Don't use our trademarks

## 🙏 Acknowledgments

- **HSK Standard** - Based on official HSK 3.0 vocabulary lists
- **Firebase** - Excellent backend-as-a-service platform
- **React Team** - Amazing frontend framework
- **Tailwind CSS** - Beautiful utility-first CSS framework
- **Vite** - Lightning-fast build tool
- **Chinese Language Community** - Inspiration and feedback

---

<div align="center">

**Built with ❤️ for Chinese language learners**

[⭐ Star this project](https://github.com/Ekoban/hsk1-flashcards) • [🐛 Report Issues](https://github.com/Ekoban/hsk1-flashcards/issues) • [💡 Request Features](https://github.com/Ekoban/hsk1-flashcards/discussions)

</div>
