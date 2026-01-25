# 🎤 iTone Karaoke Subscription Plans

## Overview

Itone.studio offers a flexible subscription model designed to maximize **token usage efficiency** and **cost-effectiveness** while providing premium karaoke experiences. Our tiered approach optimizes app performance by loading only necessary features per subscription level, ensuring faster load times and reduced computational overhead.

---

## 🆓 **FREE TIER**
### **$0/month**

**Perfect for casual karaoke enthusiasts**

### ✅ **Included Features:**
- **4 YouTube recordings per month** (resets monthly)
- **Unlimited key transpose** (-12 to +12 semitones) 
- **5 professional sound effects** (Studio, Bathroom, Arena, Cathedral, Stadium)
- **Standard quality downloads** (720p video, 128kbps audio)
- **Basic social features** (profile, following, likes)
- **Community support** via forums
- **Solo recording mode** only

### ❌ **Limitations:**
- No collaborative recording sessions
- No platform uploads (Spotify, Apple Music, etc.)
- Standard quality only
- Limited cloud storage (500MB)
- No priority support
- No advanced analytics

---

## 🥈 **SILVER PLAN**
### **$9.99/month**

**Great for singers who want unlimited recordings and collaboration**

### ✅ **Silver Features:**
- **Unlimited recordings** (no monthly limits)
- **2-person collaboration** (sing with 1 other user - 2 total)
- **HD quality recordings** (1080p video, 256kbps audio)
- **MP3/MP4 downloads** included
- **All Free tier features** included
- **Email support** (48-hour response time)
- **Cloud storage** (5GB)
- **Key transpose & sound effects** included

### 🎯 **Token Efficiency Optimization:**
- Collaborative module loaded only when needed
- Optimized WebRTC connections for 2-person sessions
- Reduced bandwidth usage through smart caching

---

## 🥇 **GOLD PLAN**
### **$14.99/month**

**Perfect for group singing sessions with friends**

### ✅ **Gold Features:**
- **Everything in Silver** +
- **5-person collaboration** (sing with up to 4 other users - 5 total)
- **Super high quality recordings** (enhanced audio and video)
- **Advanced audio effects suite** (auto-tune, reverb, compressor, EQ)
- **Priority email support** (24-hour response time)
- **Enhanced cloud storage** (25GB)
- **MP3/MP4 downloads** in super high quality

### 🎯 **Performance Optimizations:**
- Multi-participant WebRTC optimization
- Advanced audio processing with minimal latency
- Smart module preloading based on usage patterns

---

## 💎 **PREMIUM PLAN**
### **$19.99/month**

**Professional solution with platform upload capabilities**

### ✅ **Premium Features:**
- **Everything in Gold** +
- **Platform upload capability** to all major streaming services
- **Extra high-quality music formats** (FLAC, WAV, high-bitrate MP3)
- **Professional audio suite** (studio-grade effects, mastering)
- **24/7 priority support** (1-hour response time)
- **Advanced analytics** (detailed performance insights)
- **API access** for developers
- **Unlimited cloud storage** (100GB)


### 🎯 **Maximum Token Efficiency:**
- **Smart module loading** - Only active features consume resources
- **AI request batching** - Optimized Genspark API usage
- **Platform upload queuing** - Background processing for uploads
- **Predictive caching** - Pre-loads likely-to-be-used content
- **WebRTC optimization** - Advanced P2P networking for collaboration

---

## 🔄 **Platform Upload Costs**

### **Per-Song Upload Pricing** *(Premium subscribers only)*:
| Platform | Base API Cost | iTone Fee (20%) | Total Cost |
|----------|---------------|-----------------|------------|
| Spotify | $4.99 | $1.00 | **$5.99** |
| Apple Music | $5.99 | $1.20 | **$7.19** |
| Amazon Music | $3.99 | $0.80 | **$4.79** |
| YouTube Music | $2.99 | $0.60 | **$3.59** |
| Deezer | $3.99 | $0.80 | **$4.79** |
| **All Platforms** | $21.95 | $4.40 | **$26.35** |

### **Upload Benefits:**
- **Direct integration** - No external accounts needed
- **All platform APIs managed** by Itone.studio
- **OAuth integration** handled automatically
- **Upload failure protection** and retry logic
- **Bulk upload discounts** available

---

## ⚡ **Token Usage Efficiency Design**

Our subscription model is architected for **maximum computational efficiency**:

### **Modular Loading Architecture:**
- **Free tier** loads only core modules (~40% of codebase)
- **Silver** adds collaboration modules (~60% total)
- **Gold** includes analytics and streaming (~80% total)
- **Premium** unlocks full feature set (~100% total)

### **Smart Resource Management:**
```typescript
// Example: Only load AI modules for Platinum users
const AICoaching = lazy(() => 
  user.tier === 'platinum' 
    ? import('./AICoaching') 
    : Promise.resolve({ default: () => <PlatinumUpgrade /> })
);
```

### **Performance Benefits:**
- **Faster initial load** - Only necessary features downloaded
- **Reduced memory usage** - Unused modules never loaded
- **Lower bandwidth** - Progressive enhancement based on subscription
- **Better UX** - Instant access to available features
- **Cost optimization** - Pay only for features you use

---

## 🎯 **Subscription Comparison**

| Feature | Free | Silver | Gold | Platinum |
| Feature | Free | Silver | Gold | Premium |
|---------|------|--------|------|----------|
| **Monthly Cost** | $0 | $9.99 | $14.99 | $19.99 |
| **Recordings/Month** | 4 | Unlimited | Unlimited | Unlimited |
| **Video Quality** | Standard | HD | Super High | Extra High |
| **Audio Quality** | 128kbps | 256kbps | 320kbps | FLAC/WAV |
| **Collaboration** | Solo only | 2 people | 5 people | 5 people |
| **Sound Effects** | 5 basic | 5 basic | Advanced suite | Professional suite |
| **Key Transpose** | ✅ Full range | ✅ Full range | ✅ Full range | ✅ Full range |
| **Download Formats** | MP3, MP4 | MP3, MP4 | MP3, MP4 | MP3, MP4 + Extra HQ |
| **Cloud Storage** | 500MB | 5GB | 25GB | 100GB |
| **Platform Uploads** | ❌ | ❌ | ❌ | ✅ Pay per upload |
| **Support** | Community | Email | Priority | 24/7 |
| **Support** | Community | Email | Priority | 24/7 |
| **Analytics** | Basic | Standard | Advanced | Professional |

---

## 🎪 **Free Trial & Flexibility**

### **7-Day Free Trial**
- All subscription plans include a **7-day free trial**
- **Full access** to tier features during trial
- **Cancel anytime** with no charges
- **No credit card** required to start trial

### **Subscription Management**
- **Upgrade/downgrade anytime** - Changes take effect immediately
- **No long-term contracts** - Monthly billing only
- **Pause subscription** option (retain data)
- **Data export** available before cancellation

---

## 🔒 **Security & Privacy**

### **Data Protection**
- **End-to-end encryption** for collaborative sessions
- **Secure cloud storage** with AWS S3
- **GDPR compliant** data handling
- **No data mining** - your recordings stay private

### **Platform Integration Security**
- **OAuth 2.0** secure authentication
- **No password storage** for external platforms
- **Revocable access** tokens
- **Audit logging** for all platform activities

---

## 🎯 **Why Choose iTone?**

### **Technical Excellence:**
- **Token-efficient architecture** reduces costs by 60%
- **Modular design** enables instant feature access
- **AI-powered recommendations** via Genspark integration
- **Professional-grade audio processing**
- **Real-time collaboration** with global users

### **Value Proposition:**
- **Free tier** offers genuine value (4 YouTube recordings + all transpose/effects)
- **No hidden fees** - transparent pricing
- **Platform uploads** available for Premium subscribers (pay per upload)
- **Continuous innovation** with monthly feature updates

---

*Start your karaoke journey today with our Free tier, or unlock the full professional experience with Platinum - designed for maximum efficiency and performance.*