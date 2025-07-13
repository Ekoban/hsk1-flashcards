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

### 🔊 **Audio Pronunciation** ⭐ *NEW*
- **Web Speech API integration** - Native Chinese text-to-speech
- **Manual & auto-play modes** with adjustable speed (0.5x - 2x)
- **Chinese voice optimization** for accurate pronunciation
- **Browser compatibility** - Best in Chrome/Edge, guidance for Firefox

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

### Installation

```bash
# Clone and install
git clone https://github.com/Ekoban/hsk1-flashcards.git
cd hsk1-flashcards
npm install

# Configure Firebase
cp src/firebase.example.ts src/firebase.ts
# Edit src/firebase.ts with your Firebase credentials

# Start development
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Firebase (Authentication, Firestore)
- **Audio**: Web Speech API for Chinese pronunciation
- **Deployment**: Vercel/Firebase Hosting ready

## 🔊 Audio Browser Compatibility

| Browser | Support | Notes |
|---------|---------|-------|
| **Chrome** | ✅ Excellent | Full Chinese TTS, multiple voices |
| **Edge** | ✅ Good | Chromium-based Chinese support |
| **Firefox** | ⚠️ Limited | Basic support, may not work reliably |
| **Safari** | ⚠️ Basic | Limited TTS capabilities |

**Recommended**: Use Chrome or Edge for optimal Chinese pronunciation.

## 📚 Learning Algorithm

**Spaced Repetition System (SRS)** based on cognitive science:
- **Correct answers**: Advance level, double review interval
- **Incorrect answers**: Reset to earlier level for more practice
- **Smart scheduling**: Due cards first, then new vocabulary
- **Adaptive sessions**: Mix of difficulty levels for balanced learning

## 🆕 Recent Updates

### **v2.1.0 - Audio Pronunciation** ⭐ *Latest*
- 🔊 Web Speech API integration for Chinese TTS
- 🎮 Manual & auto-play pronunciation modes
- 🎛️ Adjustable speed controls (0.5x - 2x)
- 🌐 Browser compatibility with Chrome/Edge optimization

### **Previous Versions**
- **v2.0.0**: 2,219 HSK words with multi-level support
- **v1.5.0**: Firebase integration and cloud sync
- **v1.4.0**: Spaced repetition algorithm improvements

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

- **[Firebase Setup](./FIREBASE_SETUP.md)** - Complete configuration guide
- **[Deployment Guide](./DEPLOYMENT_GUIDE.md)** - Platform deployment instructions
- **[Security Documentation](./SECURITY.md)** - Security features and best practices

## 📊 Performance

- **First Contentful Paint**: < 1.5s
- **Bundle size**: < 500KB gzipped
- **Responsive design** optimized for mobile, tablet, and desktop
- **Offline capabilities** with local storage fallback

## 🗺️ Roadmap

- [ ] **HSK 4-6 support** - Advanced vocabulary levels
- [ ] **Writing practice** - Stroke order training
- [ ] **Sentence examples** - Context-based learning
- [ ] **AI-powered review** - Intelligent difficulty adjustment
- [ ] **PWA features** - Enhanced offline functionality

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### **What this means:**
- ✅ **Commercial use, modification, distribution, private use**
- ❌ **No liability or warranty**

## 🙏 Acknowledgments

- **HSK Standard** - Based on official HSK 3.0 vocabulary
- **Firebase** - Backend-as-a-service platform
- **React & TypeScript** - Modern development framework
- **Web Speech API** - Native browser audio capabilities

---

<div align="center">

**Built with ❤️ for Chinese language learners**

[⭐ Star this project](https://github.com/Ekoban/hsk1-flashcards) • [🐛 Report Issues](https://github.com/Ekoban/hsk1-flashcards/issues) • [💡 Request Features](https://github.com/Ekoban/hsk1-flashcards/discussions)

</div>
