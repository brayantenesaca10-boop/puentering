# Puente - Execution Roadmap

## Where We Are (April 12, 2026)

Done:
- Brand vision finalized (visibility company, confidence not need)
- Website live at puentering.com (three-screen Jobs-approved design)
- Web app live at app.puentering.com (profile creation, voice recording, photo upload, profile viewing, connection flow)
- Stripe payment link active ($49)
- Supplier contacted (Jarry at Yian, $6/ring, waiting on landed cost Monday)
- First potential customer (Katie) ready to buy
- 3D ring model on website
- OG image and SEO optimized
- Favicon and wordmark created
- Brand audit documented
- Supplier guide and quote tracking in place

Not done yet:
- Database persistence (profiles reset on deploy)
- Voice cleanup (remove pauses/gaps in recordings)
- Voice translation (record in English, hear in Spanish)
- AI matching (find real connections between people)
- Ring samples ordered
- Pre-launch content filmed
- Strategic 10 identified
- Rings ordered

---

## Phase 1: Foundation (April 12-18)

### Sales
- [ ] Close Katie as first customer
- [ ] Screenshot first Stripe payment as milestone

### Supplier
- [ ] Monday April 14: Receive landed cost breakdown from Jarry
- [ ] Check for responses from CXJ, Hecere, Chengdu Mind, Xinyetong, Goldbridge
- [ ] Compare all quotes in suppliers/quotes.md
- [ ] Select top 2 suppliers
- [ ] Order samples from top 2 (2 samples each: matte + glossy)

### Tech - Database
- [ ] Create Turso database (free tier)
- [ ] Get database URL and auth token
- [ ] Connect app to Turso so profiles persist across deploys
- [ ] Test: create profile, redeploy, profile still exists

### Tech - Voice Cleanup
- [ ] Add audio processing to remove silence/pauses from recordings
- [ ] Options: use Web Audio API to trim silence on client side, or process server-side
- [ ] Test: record with natural pauses, playback should be clean and tight

---

## Phase 2: Core Experience (April 18-25)

### Tech - Voice Translation
- [ ] Set up Resemble AI account (voice cloning)
- [ ] Set up DeepL API account (text translation)
- [ ] Flow: user records in English > transcribe audio > translate text to Spanish > clone voice in Spanish > save translated audio
- [ ] Add language toggle on profile page (EN / ES)
- [ ] Test: record in English, toggle to Spanish, hear YOUR voice in Spanish

### Tech - AI Matching
- [ ] When someone connects, AI analyzes both profiles
- [ ] Cross-reference: hometown, interests extracted from voice answers, languages
- [ ] Use Claude API or OpenAI to extract key info from voice transcripts
- [ ] Display matches: "You're both from Ecuador" / "You both love soccer"
- [ ] Test: create two profiles with overlapping info, connect, see matches

### Tech - Audio Transcription
- [ ] Transcribe voice recordings to text (needed for translation and AI matching)
- [ ] Options: Whisper API (OpenAI), or browser SpeechRecognition API
- [ ] Save transcripts alongside audio data
- [ ] Display text version on profile as fallback for when audio can't play

### Supplier
- [ ] Receive and evaluate samples
- [ ] Test: NFC read range, finish quality, comfort, engraving
- [ ] Select winning supplier

---

## Phase 3: Content & Strategic 10 (April 25 - May 5)

### Content - Pre-Launch (you are NOT in these videos)
- [ ] Film at 3-5 locations in Danbury: barbershop, church, soccer field, school, restaurant
- [ ] Ask people: "What's something nobody around here knows about you?"
- [ ] Film their answers and reactions
- [ ] Edit into short clips (15-30 seconds each)
- [ ] Post on TikTok, Instagram Reels, YouTube Shorts as Puente brand
- [ ] Caption style: "Your barber has a story you've never heard."
- [ ] Post 2-3 videos per week leading up to launch
- [ ] No product mention yet. Just human stories. Build the audience.

### Strategic 10
- [ ] Identify 10 magnetic invisible people in Danbury:
  - The barber who talks to everyone
  - The church receptionist
  - The soccer coach
  - The teacher everyone respects
  - The restaurant owner
  - The salon stylist
  - The community center volunteer
  - The school janitor
  - The store clerk everyone knows
  - One wildcard (someone who surprises you)
- [ ] Meet each one in person. Tell them about Puente. See who lights up.
- [ ] Confirm your 10. Build the relationship before rings arrive.

### Rings
- [ ] Place full order with winning supplier (100 rings)
- [ ] Confirm: matte or glossy (based on samples)
- [ ] Confirm: all sizes, inner engraving "PUENTE"
- [ ] Track shipping

---

## Phase 4: Rings Arrive & Launch Prep (May 5-12)

### Ring Programming
- [ ] Receive 100 rings
- [ ] Program each ring with unique URL: app.puentering.com/t/[code]
- [ ] Register each ring code in database
- [ ] QA test every ring on iPhone and Android
- [ ] Package rings (velvet bags for batch 1)

### Strategic 10 Activation
- [ ] Give rings to strategic 10 (free)
- [ ] Help each create their profile in person
- [ ] Film the five-question onboarding (this IS content)
- [ ] Film the first time someone taps their ring
- [ ] Film the connection moment between two people

---

## Phase 5: Launch (May 12-31)

### Content - Launch
- [ ] Release strategic 10 videos on all platforms
- [ ] Each video ends with puentering.com
- [ ] Post the connection moments: "They've been neighbors for 3 years."
- [ ] Let the content drive traffic to the site

### Sales
- [ ] People from videos come to puentering.com
- [ ] People who experienced a ring tap buy through referral links
- [ ] Sell in person at churches, soccer games, barbershops
- [ ] Track: rings sold, profiles created, connections made

### Milestones
- [ ] First 10 rings sold
- [ ] First 25 rings sold
- [ ] First 50 rings sold
- [ ] First 100 rings sold (sell out)

---

## Phase 6: Post-Launch (June+)

### With Batch 1 Profits (~$3,600+)
- [ ] File LLC in Connecticut ($120)
- [ ] File trademark for "Puente" ($250-350)
- [ ] Apple Developer Account ($99) - build native app
- [ ] Order batch 2: 200-500 rings at lower per-unit cost
- [ ] Upgrade packaging to magnetic boxes
- [ ] Commission Puente notification sound (Fiverr, $30-50)

### Product
- [ ] Native iOS app (React Native / Expo)
- [ ] Add more onboarding questions (adaptive based on answers)
- [ ] Visibility map (see all your connections over time)
- [ ] Allow users to add new passion sections to their profile
- [ ] More languages (Portuguese, Creole, French)

### Growth
- [ ] Expand to neighboring CT towns
- [ ] Find the next community with dense multicultural population
- [ ] Seed 10 rings with magnetic invisible people in each new community
- [ ] Film the moments. Let it grow.

---

## Technical Debt / Polish

- [ ] Voice cleanup: remove pauses and silence from recordings
- [ ] Audio compression: reduce file size of recordings for faster loading
- [ ] Profile photo optimization: compress images on upload
- [ ] Offline support: profile pages should load fast even on slow connections
- [ ] Ring code lookup: proper database lookup instead of redirect-as-username
- [ ] Error handling: graceful failures for mic permission denied, network errors
- [ ] Analytics: track profile views, connection rates, audio play rates

---

## Key Dates

| Date | What |
|---|---|
| April 12 | Close Katie as first customer |
| April 14 | Jarry sends landed cost breakdown |
| April 18 | Samples ordered from top 2 suppliers |
| April 18 | Database connected to Turso (profiles persist) |
| April 25 | Samples evaluated, supplier selected |
| April 25 | Voice translation working (EN > ES) |
| April 25 | Pre-launch content filming begins |
| April 26 | Full ring order placed (100 units) |
| May 5 | Rings arrive. Programming begins. |
| May 10 | Strategic 10 have their rings and profiles |
| May 12 | Launch content goes live |
| May 12 | Sales open to public |
| May 31 | Goal: sell out 100 rings |
| June | File LLC, trademark, order batch 2 |

---

## The Rule

Every decision runs through one question: does this make invisible people more visible?

If yes, do it. If no, cut it.
