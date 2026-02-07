# 🎓 EduHub - Education Application Portal

> **Vibrant, Modern, Youth-Focused** - Your gateway to higher education in South Africa

A comprehensive application portal for South African students to apply to universities, TVETs, and NSFAS funding - all in one beautiful, easy-to-use platform.

## ✨ What's New - Version 2.0

**🎨 Vibrant Youth-Friendly Design Update:**
- Stunning purple, pink, and blue gradient color scheme
- Modern, energetic UI that appeals to students
- Enhanced visual effects and smooth animations
- Improved accessibility and contrast
- Mobile-first responsive design

## 🚀 Features

### For Students
- 📝 **Streamlined Applications** - Apply to multiple institutions at once
- 🏫 **20+ Institutions** - Universities, TVETs, and colleges
- 💰 **NSFAS Integration** - Funding application included
- 📊 **Application Tracking** - Monitor your application status
- 🤖 **AI Assistant** - Get help with Google Gemini AI
- 📱 **Mobile Optimized** - Beautiful mobile-first design
- 💾 **PWA Support** - Install as an app on your device
- 🔒 **Secure OTP Login** - Safe and secure authentication

### For Institutions
- 👨‍💼 **Admin Portal** - Manage applications and students
- 📈 **Analytics Dashboard** - Track applications and trends
- ✅ **Application Review** - Efficient review workflow
- 📧 **Communication Tools** - Connect with applicants

## 🎨 Design Highlights

- **Gradient Backgrounds** - Purple, pink, and blue combinations
- **Vibrant CTAs** - Eye-catching buttons with hover effects
- **Modern Cards** - Clean, elevated card designs
- **Smooth Animations** - Delightful micro-interactions
- **Glass Morphism** - Contemporary blur effects
- **Color Psychology** - Colors chosen to inspire and motivate

See [COLOR_SCHEME.md](./COLOR_SCHEME.md) for complete design system.

## 🛠️ Tech Stack

- **Frontend:** React 18 + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (utility classes)
- **Icons:** Lucide React
- **Database:** PostgreSQL (Neon)
- **AI:** Google Gemini API
- **Deployment:** Netlify (Serverless Functions)
- **Email/SMS:** Nodemailer, Twilio (optional)

## 📦 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Local Development

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   
   Copy `.env.example` to `.env.local` and fill in:
   ```env
   POSTGRES_URL=your_neon_database_url
   API_KEY=your_gemini_api_key
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   ```
   http://localhost:5173
   ```

## 🚀 Deploy to Netlify

**Quick Deploy:**
1. Push code to GitHub
2. Connect repository to Netlify
3. Add environment variables
4. Deploy!

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guide.

## 📁 Project Structure

```
eduhub/
├── components/          # React components
│   ├── Auth.tsx        # Authentication
│   ├── ApplicationForm.tsx
│   ├── AdminDashboard.tsx
│   └── ...
├── services/           # Business logic
│   ├── database.ts     # Database operations
│   └── geminiService.ts # AI integration
├── netlify/           # Serverless functions
│   └── functions/
├── api/               # API route handlers
├── App.tsx            # Main app component
├── types.ts           # TypeScript definitions
├── constants.ts       # App constants
└── netlify.toml       # Netlify config
```

## 🔧 Configuration Files

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `vite.config.ts` - Vite build configuration
- `netlify.toml` - Netlify deployment settings
- `tailwind.config.js` - Tailwind CSS (implicit via CDN)

## 🌍 Environment Variables

### Required
- `POSTGRES_URL` - Neon PostgreSQL connection string
- `API_KEY` - Google Gemini API key

### Optional (for enhanced features)
- `TWILIO_ACCOUNT_SID` - Twilio SMS service
- `TWILIO_AUTH_TOKEN` - Twilio authentication
- `TWILIO_PHONE_NUMBER` - Twilio phone number
- `SMTP_HOST` - Email server host
- `SMTP_USER` - Email username
- `SMTP_PASS` - Email password

## 📱 Progressive Web App

EduHub is a PWA and can be installed on:
- ✅ Android devices
- ✅ iOS devices (limited)
- ✅ Desktop browsers (Chrome, Edge, etc.)

Features:
- Offline capability (coming soon)
- Add to home screen
- Native app feel

## 🧪 Testing

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [VERIFICATION_REPORT.md](./VERIFICATION_REPORT.md) - Pre-deployment checklist
- [COLOR_SCHEME.md](./COLOR_SCHEME.md) - Design system and colors

## 🤝 Contributing

This is a production application for MamputlaMokone NPC. For contributions or issues, please contact the development team.

## 📄 License

Proprietary - © 2026 MamputlaMokone NPC

## 🆘 Support

For support or questions:
- Check documentation files
- Review deployment guide
- Contact: support@mamputlamokone.co.za

## 🎉 Acknowledgments

- Built with React and Vite
- Powered by Google Gemini AI
- Hosted on Netlify
- Database by Neon
- Icons by Lucide

---

**Status:** ✅ Ready for Production Deployment
**Version:** 2.0 (Vibrant Youth Update)
**Last Updated:** February 7, 2026
