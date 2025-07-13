# 🧠 HSK 1-3 Flashcards Tutor

<div align="center">

![HSK Flashcards Banner](./public/images/Screenshot%202025-07-12%20at%2021-07-59%20HSK%201-3%20Flashcards%20Tutor.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=flat&logo=Firebase&logoColor=white)](https://firebase.google.com/)

</div>

A **modern Chinese vocabulary learning app** with **2,200+ HSK words**, scientifically-proven spaced repetition, and **built-in audio pronunciation**. Master HSK levels 1-3 with comprehensive progress tracking.

## ✨ Key Features

### 🎯 **Comprehensive HSK Coverage**
- **2,219 essential words** covering HSK levels 1-3 (HSK 3.0 standards)
- **70+ categories** with Chinese characters, pinyin, IPA, English & French translations
- **Stroke count data** and usage frequency ratings

### 🔊 **High-Quality Audio Pronunciation** ⭐ *NEW*
- **Google Cloud Text-to-Speech** - Professional-grade Chinese voices
- **Neural AI voices** with natural pronunciation and intonation
- **Automatic fallback** to Web Speech API for reliability
- **Male & female voice options** with simple user selection
- **Adjustable speed controls** (0.5x - 2x) for learning preferences

### 🧠 **Smart Learning System**
- **Spaced Repetition System (SRS)** - Scientifically proven for optimal retention
- **4 learning levels**: New → Learning → Review → Mastered
- **Adaptive difficulty** adjusts based on your performance

### 📊 **Progress Tracking**
- **Study streak counter** and detailed learning statistics
- **Session analytics** with accuracy rates and learning time
- **Visual progress indicators** for each HSK level and word

### 🎨 **Customizable Experience**
- **Flexible sessions** (5-50 cards) with HSK level and category filtering
- **Display preferences** for pinyin, IPA, English, French
- **Audio controls** for pronunciation settings

### ☁️ **Cross-Device Sync**
- **Google Authentication** with Firebase cloud storage
- **Guest mode** available without account creation

## 🖼️ Screenshots

<div align="center">
<img src="./public/images/Screenshot%202025-07-12%20at%2021-08-25%20HSK%201-3%20Flashcards%20Tutor.png" alt="Learning Dashboard with Progress Tracking" width="300"/>
<img src="./public/images/Screenshot%202025-07-12%20at%2021-09-25%20HSK%201-3%20Flashcards%20Tutor.png" alt="Flashcard Interface with Audio Pronunciation" width="300"/>
</div>

*Features audio pronunciation buttons (🔊) for Chinese character pronunciation*

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- **Firebase account** for authentication and data storage
- **Google Cloud account** for Text-to-Speech API (optional - has fallback)

### Installation

```bash
# Clone and install
git clone https://github.com/Ekoban/hsk1-flashcards.git
cd hsk1-flashcards
npm install

# Configure environment variables
cp .env.example .env.local
# Add your Firebase and Google Cloud credentials

# Start development
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Firebase (Authentication, Firestore)
- **Audio**: Google Cloud Text-to-Speech + Web Speech API fallback
- **Deployment**: Vercel optimized

## 🔊 Audio Quality

| Service | Quality | Notes |
|---------|---------|-------|
| **Google TTS** | ✅ Excellent | Neural AI voices, natural pronunciation |
| **Web Speech** | ⚠️ Fallback | Browser-dependent, automatic backup |

**Primary**: Google Cloud Text-to-Speech with Neural2 Chinese voices  
**Fallback**: Web Speech API ensures audio always works

## 📚 Learning Algorithm

**Spaced Repetition System (SRS)** based on cognitive science:
- **Correct answers**: Advance level, double review interval
- **Incorrect answers**: Reset to earlier level for more practice
- **Smart scheduling**: Due cards first, then new vocabulary
- **Adaptive sessions**: Mix of difficulty levels for balanced learning

## 🆕 Recent Updates

### **v2.2.0 - Google TTS Integration** ⭐ *Latest*
- 🎯 Google Cloud Text-to-Speech with Neural AI voices
- 👨👩 Simple male/female voice selection
- 🔄 Automatic fallback to Web Speech API
- 🧹 Simplified audio settings for better UX
- 🚀 Production-ready with robust error handling

### **Previous Versions**
- **v2.1.0**: Web Speech API integration and browser optimization
- **v2.0.0**: 2,219 HSK words with multi-level support
- **v1.5.0**: Firebase integration and cloud sync

## 📖 Database

- **2,219 HSK words** across levels 1-3 (HSK 3.0 standards)
- **70+ categories**: verbs, nouns, adjectives, numbers, time, family, etc.
- **Multiple translations**: English and French
- **Pronunciation guides**: Pinyin and IPA notation
- **Learning metadata**: Stroke counts, difficulty levels, usage frequency

## 🤝 Contributing

1. **Fork** the repository
2. **Create** feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** Pull Request

## 📄 Documentation

Complete documentation has been moved to the `docs/` folder (local development only):
- Firebase setup and configuration guides
- Deployment instructions for various platforms  
- Security features and best practices
- Migration strategies and development notes

For production deployment, only the essential application files are included.

## 📊 Performance

- **First Contentful Paint**: < 1.5s
- **Bundle size**: < 500KB gzipped
- **Responsive design** optimized for mobile, tablet, and desktop
- **Offline capabilities** with local storage fallback

## 🗺️ Roadmap

- [ ] **HSK 4-6 support** - Advanced vocabulary levels
- [ ] **Writing practice** - Stroke order training  
- [ ] **Sentence examples** - Context-based learning
- [ ] **Voice quality options** - Standard vs Neural voice selection
- [ ] **PWA features** - Enhanced offline functionality

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **What this means:**
- ✅ **Commercial use, modification, distribution, private use**
- ❌ **No liability or warranty**

## 🙏 Acknowledgments

- **HSK Standard** - Based on official HSK 3.0 vocabulary
- **Firebase** - Backend-as-a-service platform
- **Google Cloud TTS** - High-quality Chinese text-to-speech
- **React & TypeScript** - Modern development framework

---

<div align="center">

**Built with ❤️ for Chinese language learners**

[⭐ Star this project](https://github.com/Ekoban/hsk1-flashcards) • [🐛 Report Issues](https://github.com/Ekoban/hsk1-flashcards/issues) • [💡 Request Features](https://github.com/Ekoban/hsk1-flashcards/discussions)

</div>
