# 📱 Store Deployment Guide

This guide walks you through publishing iTone Karaoke to Google Play Store and Apple App Store.

## 🤖 Google Play Store Deployment

### Prerequisites
1. **Google Play Console Account** ($25 one-time fee)
2. **Android Studio** installed
3. **Java 17** installed

### Step 1: Build the App
```bash
# Run the automated build script
chmod +x scripts/build-android.sh
./scripts/build-android.sh
```

### Step 2: Upload to Play Console
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app: **iTone Karaoke**
3. Upload `android/app/build/outputs/bundle/release/app-release.aab`
4. Complete store listing using metadata from `store-metadata/google-play/`

### Step 3: Store Listing Details
- **Title**: iTone Karaoke - Sing Your Heart Out
- **Category**: Music & Audio
- **Content Rating**: Everyone
- **Target Audience**: Ages 13+
- **Privacy Policy**: https://itone.studio/privacy

### Step 4: Release
1. Create internal testing release first
2. Run closed testing with beta users
3. Submit for production review
4. Publish when approved (usually 1-3 days)

---

## 🍎 Apple App Store Deployment

### Prerequisites
1. **Apple Developer Account** ($99/year)
2. **Xcode** installed (latest version)
3. **macOS** required

### Step 1: Build the App
```bash
# Run the automated build script
chmod +x scripts/build-ios.sh
./scripts/build-ios.sh
```

### Step 2: Upload to App Store Connect
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create new app: **iTone Karaoke**
3. Upload `ios/App/build/AppStore/iTone Karaoke.ipa`
4. Complete app metadata using `store-metadata/app-store/metadata.json`

### Step 3: App Store Information
- **App Name**: iTone Karaoke
- **Subtitle**: Sing Your Heart Out
- **Category**: Music
- **Price**: Free (with in-app purchases)
- **Age Rating**: 4+

### Step 4: Review & Release
1. Submit for App Store review
2. Response time: 24-48 hours typically
3. Address any feedback from Apple
4. Release when approved

---

## 📸 Required Assets

### Screenshots Needed
**Android (Google Play):**
- Phone: 1080x1920 pixels (5 screenshots)
- Tablet: 1200x1920 pixels (2 screenshots)
- Feature Graphic: 1024x500 pixels

**iOS (App Store):**
- iPhone: 1284x2778 pixels (5 screenshots)
- iPad: 2048x2732 pixels (2 screenshots)

### App Icons
- **Android**: 512x512 PNG (adaptive icon)
- **iOS**: 1024x1024 PNG (rounded automatically)

### Demo Video (Optional)
- Max 30 seconds showing key features
- Upload to YouTube and link in store listing

---

## 💰 Monetization Setup

### In-App Purchases (Both Stores)
1. **Silver Subscription**: $9.99/month
2. **Gold Subscription**: $19.99/month  
3. **Platinum Subscription**: $53.99/month
4. **Platform Upload Credits**: $2.99-$5.99 each

### Store Commission
- **Google Play**: 15% for first $1M, then 30%
- **Apple App Store**: 15% for first $1M, then 30%

---

## 🔧 Technical Requirements

### Android Permissions
- Camera (for video recording)
- Microphone (for audio recording)
- Storage (for saving recordings)
- Network (for streaming and uploads)

### iOS Permissions
- Camera Usage
- Microphone Usage
- Photo Library (for saving recordings)
- Network access

### Minimum Requirements
- **Android**: API level 24 (Android 7.0+)
- **iOS**: iOS 13.0+
- **Storage**: 100MB minimum
- **RAM**: 2GB recommended

---

## 🚀 Launch Strategy

### Pre-Launch
1. Create landing page at https://itone.studio
2. Set up social media accounts
3. Record demo videos
4. Prepare press kit

### Launch Day
1. Submit press release
2. Share on social media
3. Reach out to karaoke communities
4. Contact music bloggers and influencers

### Post-Launch
1. Monitor store reviews and ratings
2. Respond to user feedback
3. Release regular updates
4. Build user community

---

## 📊 Analytics & Monitoring

### Store Performance
- Track downloads and installs
- Monitor user ratings and reviews
- Analyze user retention metrics
- A/B test store listing elements

### App Performance
- Monitor crash reports
- Track feature usage
- Measure subscription conversion
- Optimize user onboarding

---

## 🛠️ Maintenance

### Regular Updates
- Monthly feature updates
- Bug fixes and performance improvements
- New song additions
- Platform integration updates

### Store Compliance
- Keep privacy policy updated
- Maintain content rating accuracy
- Respond to store policy changes
- Update app metadata as needed

---

## 📞 Support

For deployment assistance:
- **Email**: dev@itone.studio
- **Documentation**: https://itone.studio/docs
- **Community**: https://discord.gg/itone

Good luck with your store launches! 🚀