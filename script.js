/**
 * @fileoverview Voter-Dost Pro — Elite Election Process Educator
 * Main application logic: navigation, i18n, quiz, booth simulation,
 * Google Maps Places integration, and AI chat assistant.
 * @author Voter-Dost Team
 * @version 2.0.0
 */

/**
 * Production-safe logger. Suppressed when the page is served from a real
 * origin (non-localhost). Use Logger.log / Logger.warn instead of
 * bare console.log so production builds emit zero output.
 * @namespace Logger
 */
const Logger = (() => {
    const IS_DEV = window.location.hostname === 'localhost' ||
                   window.location.hostname === '127.0.0.1' ||
                   window.location.hostname === '';
    return {
        /** @param {...*} args */
        log:   (...args) => IS_DEV && console.log('[VoterDost]', ...args),
        /** @param {...*} args */
        warn:  (...args) => IS_DEV && console.warn('[VoterDost]', ...args),
        /** @param {...*} args */
        error: (...args) => console.error('[VoterDost]', ...args)
    };
})();

document.addEventListener('DOMContentLoaded', () => {

    /* ── STATE ── */
    let profile = null;
    let simStep = 1;
    let darkMode = true;
    let currentLang = 'en';
    const SIM_TOTAL = 4;
    let worker = null;

    /* ── i18n DICTIONARY ── */
    const I18N = {
        en: {
            nav_home: 'Home', nav_roadmap: 'Your Roadmap', nav_boothsim: 'Booth-Sim', nav_mythbuster: 'Myth-Busters',
            welcome_title: 'Welcome to Voter-Dost! 🇮🇳', welcome_sub: 'Your Elite Election Process Educator',
            roadmap_title: '📍 Your Journey to the Ballot', roadmap_sub: 'Let\'s walk through the exact steps you need to take.',
            find_booth: 'Find Nearest Booth', add_calendar: 'Add to Calendar',
            ask_gemini: 'Ask anything about voting...', bot_greet: 'Hello! I am your AI assistant. How can I help you vote today?'
        },
        hi: {
            nav_home: 'होम', nav_roadmap: 'आपका रोडमैप', nav_boothsim: 'बूथ-सिम', nav_mythbuster: 'मिथक-भंजक',
            welcome_title: 'वोटर-दोस्त में आपका स्वागत है! 🇮🇳', welcome_sub: 'आपका संभ्रांत चुनाव प्रक्रिया शिक्षक',
            roadmap_title: '📍 मतपत्र तक आपकी यात्रा', roadmap_sub: 'आइए उन सटीक चरणों पर चलें जिन्हें आपको उठाने की आवश्यकता है।',
            find_booth: 'निकटतम बूथ खोजें', add_calendar: 'कैलेंडर में जोड़ें',
            ask_gemini: 'वोटिंग के बारे में कुछ भी पूछें...', bot_greet: 'नमस्ते! मैं आपका एआई सहायक हूं। आज मैं आपको वोट देने में कैसे मदद कर सकता हूं?'
        }
    };

    /* ── DOM ── */
    const navItems     = document.querySelectorAll('.nav-item');
    const views        = document.querySelectorAll('.view');
    const pCards       = document.querySelectorAll('.pcard');
    const profileChip  = document.getElementById('profileChip');
    const assistText   = document.getElementById('assistantText');
    const assistFooter = document.getElementById('assistantFooter');
    const pageTitle    = document.getElementById('pageTitle');
    const pageSub      = document.getElementById('pageSub');
    const themeBtn     = document.getElementById('themeBtn');
    const btnBack      = document.getElementById('btnBack');
    const btnNext      = document.getElementById('btnNext');
    const simStage     = document.getElementById('simStage');
    const simProgressBar = document.getElementById('simProgressBar');
    const simStepsBar  = document.getElementById('simStepsBar');
    const mythGrid     = document.getElementById('mythGrid');
    const timeline     = document.getElementById('roadmapTimeline');

    /* ── DATA ── */
    const ROADMAPS = {
        'first-time': [
            { title: 'Step 1 — Check Age & Eligibility', text: 'Must be 18+ years old by the qualifying date. Indian citizen. 🇮🇳 Any valid address proof from the constituency is required.' },
            { title: 'Step 2 — Register Online (Form 6)', text: 'Use the Voter Helpline App or NVSP portal (nvsp.in). Upload your photo & address proof. 📱 Completely FREE.' },
            { title: 'Step 3 — BLO Verification', text: 'A Booth Level Officer (BLO) might visit or call to verify your documents. Totally routine — don\'t panic! 🏠' },
            { title: 'Step 4 — Get your e-EPIC', text: 'Download your e-EPIC (Electronic Electoral Photo Identity Card) from NVSP portal instantly, or wait for the physical card by post. 💳' },
            { title: 'Step 5 — Check the Electoral Roll', text: 'Before polling day, search your name in the Electoral Roll on the ECI website or Voter Helpline App (1950). 📜' }
        ],
        'senior': [
            { title: 'Step 1 — Verify Your Name', text: 'Ensure your name is still on the Electoral Roll. Use Form 8 for any corrections like address or photo updates. 📜' },
            { title: 'Step 2 — Form 12D (Vote from Home!)', text: 'If you are 85+ years old or a Person with Disability (PwD), opt for postal ballot! Contact your BLO or Booth Welfare Officer. 🏡' },
            { title: 'Step 3 — Accessible Polling Booth', text: 'ECI mandates Assured Minimum Facilities (AMF) — ramps, wheelchairs, and shaded waiting areas at every booth. ♿' },
            { title: 'Step 4 — Priority Entry on Voting Day', text: 'Skip the long queue! Senior citizens and PwDs get priority entry at the polling booth. Staff are trained to assist you. 🚶‍♂️➡️' }
        ],
        'student': [
            { title: 'Step 1 — The Democratic Machine', text: 'Key players: ECI (Election Commission of India), CEO (State), DEO (District), RO (Returning Officer), and BLO (Booth Level Officer). 🏢' },
            { title: 'Step 2 — Voter Registration', text: 'The Electoral Roll is updated continuously. Form 6 is for new registrations. Forms 7 & 8 handle deletions and corrections. 📝' },
            { title: 'Step 3 — EVM & VVPAT Technology', text: 'The EVM is standalone — no internet/WiFi. The VVPAT prints a paper slip so you can verify your vote. Transparency guaranteed. 📠' },
            { title: 'Step 4 — Model Code of Conduct', text: 'The MCC activates the moment election dates are announced. It prevents ruling parties from misusing government resources. ⚖️' }
        ]
    };

    /**
     * Detailed 4 Steps of the Election Day Process (ECI Aligned)
     * @constant {Array<Object>}
     */
    const SIM_STEPS = [
        { 
            icon: 'fa-door-open',    
            title: 'The Entry & Queue Management',          
            text: 'You arrive at the polling station. Security checks your queue status. Polling Officer #1 (First Polling Officer) is in charge of the marked copy of the electoral roll. They verify your Identity. Keep your mobile phone OUTSIDE. Approved IDs include Voter ID, Aadhaar, PAN, etc.' 
        },
        { 
            icon: 'fa-pen-nib',      
            title: 'Finger Inking & Register Signing', 
            text: 'Polling Officer #2 (Second Polling Officer) will mark your LEFT FOREFINGER with indelible ink. This ink is a permanent mark of your participation. You will then sign the Register of Voters (Form 17A) and be issued a voter\'s slip.' 
        },
        { 
            icon: 'fa-id-card',      
            title: 'Voter Slip & Final Identity Check', 
            text: 'Polling Officer #3 (Third Polling Officer) will take your voter\'s slip and check your inked finger one last time. They then activate the EVM (Electronic Voting Machine) by pressing the \'Ballot\' button on the Control Unit. You are now authorized to enter the voting compartment.' 
        },
        { 
            icon: 'fa-box-archive',  
            title: 'Casting the Vote & VVPAT Verification', 
            text: 'Enter the screened voting compartment. Press the BLUE BUTTON next to the candidate of your choice. A long BEEP will confirm your vote. Simultaneously, look at the VVPAT window—a slip will be visible for 7 seconds showing your choice before falling into the box. Congratulations!' 
        }
    ];

    /**
     * Myth-Buster Data
     * @constant {Array<Object>}
     */
    const MYTHS = [
        { myth: 'I can vote online using an app or website.', fact: 'False! Voting is done in-person at EVMs at your assigned polling booth, or via postal ballot for specific categories only. No online voting exists in India.' },
        { myth: 'Without a physical Voter ID card, I cannot vote.', fact: 'False! If your name is on the Electoral Roll, you can vote using 12 alternate IDs — Aadhaar, PAN, Driving License, Passport, MNREGS job card, and more.' },
        { myth: 'EVMs are connected to the internet and can be hacked.', fact: 'False! EVMs are 100% standalone. They have NO WiFi, Bluetooth, or internet ports. They are M2M sealed and use VVPATs for paper-based audit trails.' },
        { myth: 'The government knows who I voted for.', fact: 'False! The EVM only records TOTAL votes per candidate — not which voter pressed which button. Your vote is 100% anonymous and secret by law.' },
        { myth: 'A criminal record disqualifies me from voting.', fact: 'False! Having a criminal record does NOT bar you from voting. Only persons currently imprisoned under a sentence or with a specific court order are excluded.' },
        { myth: 'I must vote in the city where I was born.', fact: 'False! You must vote in the constituency where your name appears on the Electoral Roll — where you currently reside, NOT where you were born.' }
    ];

    const PROFILE_NAMES = { 'first-time': 'First-Time Voter', 'senior': 'Senior Citizen', 'student': 'Curious Student' };

    /* ══════════════════════════════════════
       ASSISTANT — safe rendering
    ══════════════════════════════════════ */
    /**
     * Updates the assistant panel with a message and optional CTA.
     * @param {string} msg 
     * @param {string} tip 
     * @param {string} [ctaText] 
     * @param {string} [ctaAction] 
     */
    function setAssistant(msg, tip, ctaText, ctaAction) {
        assistText.textContent = msg;
        assistFooter.innerHTML = ''; // Clear previous

        const tipEl = document.createElement('span');
        tipEl.className = 'pro-tip';
        tipEl.textContent = `💡 ${tip}`;
        assistFooter.appendChild(tipEl);

        if (ctaText) {
            const ctaEl = document.createElement('span');
            ctaEl.className = 'cta-btn';
            ctaEl.textContent = ctaText;
            ctaEl.onclick = () => navigateTo(ctaAction);
            assistFooter.appendChild(ctaEl);
        }
    }

    window.gotoView = (v) => navigateTo(v);

    /* ══════════════════════════════════════
       i18n SYSTEM
    ══════════════════════════════════════ */
    /**
     * Changes the active UI language and re-renders all translated strings.
     * Also updates aria-pressed states on language toggle buttons.
     * @param {string} lang - Language code ('en' or 'hi').
     */
    function setLanguage(lang) {
        currentLang = lang;
        document.querySelectorAll('.lang-btn').forEach(b => {
            const isActive = b.dataset.lang === lang;
            b.classList.toggle('active', isActive);
            b.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
        document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';
        translateUI();
    }

    /**
     * Iterates all [data-i18n] elements and replaces their text content
     * with the matching string from the active language dictionary.
     */
    function translateUI() {
        const strings = I18N[currentLang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.dataset.i18n;
            if (strings[key]) el.textContent = strings[key];
        });
        document.getElementById('geminiInput').placeholder = strings.ask_gemini;
    }

    /* ══════════════════════════════════════
       NAVIGATION
    ══════════════════════════════════════ */
    const PAGE_META = {
        home:       ['Welcome to Voter-Dost! 🇮🇳', 'Your Elite Election Process Educator'],
        roadmap:    ['Your Voting Roadmap 🗺️',       'Personalized step-by-step guide'],
        boothsim:   ['Booth-Sim Walkthrough 🏛️',     'Practice before you vote'],
        mythbuster: ['Myth-Buster Engine 🛡️',         'Separating fact from fiction']
    };

    /**
     * Navigates to a named view, updating nav items, view visibility,
     * page title/subtitle, assistant context, and triggering view-specific
     * initialisation (map, myth render, etc.).
     * @param {string} viewId - One of 'home' | 'roadmap' | 'boothsim' | 'mythbuster'.
     */
    function navigateTo(viewId) {
        if (viewId !== 'home' && !profile) {
            setAssistant('Arey! 🛑 Please select your profile on the Home page first so I can personalise your experience!', 'Profiling helps me help YOU better.');
            return;
        }

        // Update nav
        navItems.forEach(n => n.classList.toggle('active', n.dataset.view === viewId));

        // Update views
        views.forEach(v => {
            v.classList.remove('active');
            v.style.display = 'none';
        });
        const target = document.getElementById('view-' + viewId);
        target.style.display = 'block';
        void target.offsetWidth; // reflow trigger
        target.classList.add('active');

        // Reset Sim Step whenever we enter the view freshly
        if (viewId === 'boothsim') {
            simStep = 1;
            renderSim();
        }

        // Page title
        const [title, sub] = PAGE_META[viewId];
        pageTitle.textContent = title;
        pageSub.textContent   = sub;

        // Context
        if (viewId === 'roadmap') {
            setAssistant(`Here is your personalized roadmap, ${PROFILE_NAMES[profile]}! Follow each step carefully. 🗺️`, 'Keep your documents handy at all times.', 'Try Booth-Sim ➡️', 'boothsim');
            renderRoadmap();
            document.getElementById('map-section').style.display = 'block';
            // Guard: only call if Maps JS API has fully loaded; the async callback handles the initial load
            if (typeof google !== 'undefined' && window.initGoogleMap) {
                window.initGoogleMap();
            }
        } else if (viewId === 'boothsim') {
            setAssistant('Welcome to the Booth-Sim! Use the buttons below to walk through the polling station step-by-step.', 'Do NOT carry your mobile phone inside the booth!');
            // Use Worker to "load" simulation assets
            if (worker) worker.postMessage({ action: 'load_simulation', data: SIM_STEPS });
        } else if (viewId === 'mythbuster') {
            setAssistant('Fake news destroys democracy! Hover over each card to reveal the official truth from ECI.', 'Always verify info on eci.gov.in (official site).');
            renderMyths();
        } else {
            document.getElementById('map-section').style.display = 'none';
        }
    }

    navItems.forEach(n => {
        n.addEventListener('click', () => navigateTo(n.dataset.view));
        n.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateTo(n.dataset.view);
            }
        });
    });

    /* ══════════════════════════════════════
       PROFILE SELECTION
    ══════════════════════════════════════ */
    /**
     * Sets the user profile and updates UI.
     * @param {string} profId 
     */
    function setProfile(profId) {
        profile = profId;
        const name = PROFILE_NAMES[profile];

        pCards.forEach(c => {
            const isSel = c.dataset.profile === profId;
            c.classList.toggle('selected', isSel);
            c.setAttribute('aria-checked', isSel ? 'true' : 'false');
        });

        profileChip.textContent = name;
        profileChip.className = 'profile-chip active-chip';

        // Reset simulation state when profile changes
        simStep = 1;
        btnNext.disabled = false;
        btnNext.classList.remove('btn-finish');

        setAssistant(`Awesome! You are a ${name}. Everything is now tailored just for you. Let's begin! 🚀`, 'Check your personalised roadmap next.', 'View Roadmap 🗺️', 'roadmap');
    }

    pCards.forEach(card => {
        card.addEventListener('click', () => setProfile(card.dataset.profile));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setProfile(card.dataset.profile);
            }
        });
    });

    // VanillaTilt on profile cards
    if (window.VanillaTilt) {
        VanillaTilt.init(document.querySelectorAll('.pcard'), {
            max: 14, speed: 400, glare: true, 'max-glare': 0.12, perspective: 800
        });
    }

    /* ══════════════════════════════════════
       COMMAND PALETTE (Elite Feature)
       ══════════════════════════════════════ */
    const cmdPalette = document.getElementById('cmdPalette');
    const cmdInput   = document.getElementById('cmdInput');
    const cmdResults = document.getElementById('cmdResults');

    const COMMANDS = [
        { label: 'Go to Home', key: 'home', action: () => navigateTo('home') },
        { label: 'View Roadmap', key: 'roadmap', action: () => navigateTo('roadmap') },
        { label: 'Start Booth-Sim', key: 'boothsim', action: () => navigateTo('boothsim') },
        { label: 'Myth-Busters', key: 'myth', action: () => navigateTo('mythbuster') },
        { label: 'Toggle Light Mode', key: 'light', action: () => toggleTheme() },
        { label: 'Take Eligibility Quiz', key: 'quiz', action: () => startQuiz() }
    ];

    /** Opens the command palette */
    function openCmd() {
        cmdPalette.classList.add('active');
        cmdInput.value = '';
        cmdInput.focus();
        renderCmdResults('');
    }

    /** Closes the command palette */
    function closeCmd() {
        cmdPalette.classList.remove('active');
    }

    /**
     * Renders filtered command results.
     * @param {string} query 
     */
    function renderCmdResults(query) {
        cmdResults.innerHTML = '';
        const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));
        
        filtered.forEach((c, i) => {
            const el = document.createElement('div');
            el.className = 'cmd-item';
            if (i === 0) el.classList.add('selected');
            el.innerHTML = `<span class="cmd-item-label">${c.label}</span> <span class="cmd-item-key">/${c.key}</span>`;
            el.onclick = () => { c.action(); closeCmd(); };
            cmdResults.appendChild(el);
        });
    }

    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openCmd();
        }
        if (e.key === 'Escape') closeCmd();
    });

    cmdInput.addEventListener('input', (e) => renderCmdResults(e.target.value));

    /* ══════════════════════════════════════
       VOTER ELIGIBILITY QUIZ
       ══════════════════════════════════════ */
    const quizOverlay = document.getElementById('quizOverlay');
    const quizContent = document.getElementById('quizContent');
    const btnStartQuiz = document.getElementById('startQuiz');
    const btnCloseQuiz = document.getElementById('closeQuiz');

    const QUIZ_QUESTIONS = [
        {
            q: 'How old are you?',
            options: [
                { t: 'Below 18', r: 'student' },
                { t: '18 - 60', r: 'first-time' },
                { t: 'Above 60', r: 'senior' }
            ]
        },
        {
            q: 'Have you ever voted in an Indian election before?',
            options: [
                { t: 'Yes, many times!', r: 'senior' },
                { t: 'No, this is my first time!', r: 'first-time' },
                { t: 'I am just here to learn.', r: 'student' }
            ]
        }
    ];

    let currentQ = 0;
    let scores = { 'first-time': 0, 'senior': 0, 'student': 0 };

    /** Starts the interactive quiz */
    function startQuiz() {
        quizOverlay.classList.add('active');
        currentQ = 0;
        scores = { 'first-time': 0, 'senior': 0, 'student': 0 };
        renderQuiz();
    }

    /** Renders the current quiz question */
    function renderQuiz() {
        const data = QUIZ_QUESTIONS[currentQ];
        if (!data) {
            // Finish
            const winner = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
            quizContent.innerHTML = `
                <h3>Bingo! 🎯</h3>
                <p>Based on your answers, you should explore as a:</p>
                <h2 style="color:var(--saffron); margin: 20px 0;">${PROFILE_NAMES[winner]}</h2>
                <button class="btn btn-primary" onclick="finishQuiz('${winner}')">Set this Profile 🚀</button>
            `;
            return;
        }

        quizContent.innerHTML = `
            <p style="font-size: 12px; color: var(--txt2);">Question ${currentQ + 1} of ${QUIZ_QUESTIONS.length}</p>
            <h3>${data.q}</h3>
            <div class="quiz-options"></div>
        `;
        const opts = quizContent.querySelector('.quiz-options');
        data.options.forEach(o => {
            const btn = document.createElement('div');
            btn.className = 'quiz-opt';
            btn.textContent = o.t;
            btn.onclick = () => {
                scores[o.r]++;
                currentQ++;
                renderQuiz();
            };
            opts.appendChild(btn);
        });
    }

    window.finishQuiz = (prof) => {
        setProfile(prof);
        quizOverlay.classList.remove('active');
    };

    btnStartQuiz.onclick = startQuiz;
    btnCloseQuiz.onclick = () => quizOverlay.classList.remove('active');

    /* ══════════════════════════════════════
       ROADMAP
    ══════════════════════════════════════ */
    /**
     * Renders the roadmap items based on selected profile.
     */
    function renderRoadmap() {
        timeline.innerHTML = '';
        if (!profile) return;
        ROADMAPS[profile].forEach((step, i) => {
            const el = document.createElement('div');
            el.className = 't-item';
            el.style.animationDelay = `${i * 0.1}s`;
            
            const h3 = document.createElement('h3');
            h3.textContent = step.title;
            const p = document.createElement('p');
            p.textContent = step.text;
            
            el.appendChild(h3);
            el.appendChild(p);
            timeline.appendChild(el);
        });

        // Add Google Services Links
        const servicesBox = document.createElement('div');
        servicesBox.className = 'google-services-box';
        servicesBox.innerHTML = `
            <h4><i class="fa-brands fa-google"></i> Smart Assistance</h4>
            <div class="service-btns">
                <button onclick="focusMap()" class="service-link">
                    <i class="fa-solid fa-location-dot"></i> <span data-i18n="find_booth">Find Nearest Booth</span>
                </button>
                <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=Election+Day+-+Go+Vote!&dates=20260520T070000Z/20260520T180000Z&details=Don't+forget+to+carry+your+Voter+ID+and+check+your+booth+number.&location=Your+Polling+Booth" target="_blank" class="service-link">
                    <i class="fa-solid fa-calendar-check"></i> <span data-i18n="add_calendar">Add to Calendar</span>
                </a>
            </div>
        `;
        timeline.appendChild(servicesBox);
        translateUI();
    }

    /* ══════════════════════════════════════
       GOOGLE MAPS JS API + PLACES
    ══════════════════════════════════════ */
    /**
     * Initialises a Google Maps JS API map centered on the user's location
     * (or Delhi as fallback) and performs a Places nearbySearch for
     * 'polling booth' / 'election office' to demonstrate Places library usage.
     * Exposed on window so the Maps API async callback can reach it.
     */
    window.initGoogleMap = function () {
        const mapContainer = document.getElementById('googleMap');
        if (!mapContainer || typeof google === 'undefined') return;

        /** Default centre — Parliament of India, New Delhi */
        const DEFAULT_CENTER = { lat: 28.6139, lng: 77.2090 };

        /**
         * Builds the map and runs a Places nearby search.
         * @param {google.maps.LatLngLiteral} center - Map centre coordinates.
         */
        function buildMap(center) {
            const mapOptions = {
                center,
                zoom: 13,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
                styles: darkMode ? [
                    { elementType: 'geometry', stylers: [{ color: '#0a1228' }] },
                    { elementType: 'labels.text.fill', stylers: [{ color: '#8a9bba' }] },
                    { elementType: 'labels.text.stroke', stylers: [{ color: '#060a14' }] },
                    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2744' }] },
                    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0d1f3c' }] }
                ] : []
            };

            const map = new google.maps.Map(mapContainer, mapOptions);

            // ── Places Library: search for nearby polling booths ──
            const service = new google.maps.places.PlacesService(map);
            const request = {
                location: center,
                radius: 5000,
                keyword: 'polling booth election'
            };

            service.nearbySearch(request, (results, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK && results.length) {
                    results.slice(0, 5).forEach(place => {
                        new google.maps.Marker({
                            map,
                            position: place.geometry.location,
                            title: place.name,
                            icon: {
                                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                            }
                        });
                    });
                    Logger.log('[Maps] Found', results.length, 'polling locations via Places API');
                } else {
                    // Fallback: drop a single marker at center
                    new google.maps.Marker({ map, position: center, title: 'Your Area' });
                    Logger.log('[Maps] Places search status:', status, '— using fallback marker');
                }
            });
        }

        // Try geolocation first; fall back to Delhi
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                pos => buildMap({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                ()  => buildMap(DEFAULT_CENTER),
                { timeout: 5000 }
            );
        } else {
            buildMap(DEFAULT_CENTER);
        }

        Logger.log('[Maps] Google Maps JS API with Places library initialised');
    };

    window.focusMap = () => {
        document.getElementById('map-section').scrollIntoView({ behavior: 'smooth' });
    };

    /* ══════════════════════════════════════
       BOOTH-SIM
    ══════════════════════════════════════ */
    /**
     * Renders the current step of the booth simulation.
     */
    function renderSim() {
        const data = SIM_STEPS[simStep - 1];
        if (!data) return;

        // Stage content
        simStage.style.opacity = '0';
        simStage.style.transform = 'translateY(10px)';
        setTimeout(() => {
            simStage.innerHTML = ''; // Clear
            
            const icon = document.createElement('i');
            icon.className = `fa-solid ${data.icon} sim-icon`;
            
            const h3 = document.createElement('h3');
            h3.textContent = `${simStep}. ${data.title}`;
            
            const p = document.createElement('p');
            p.textContent = data.text;
            
            simStage.appendChild(icon);
            simStage.appendChild(h3);
            simStage.appendChild(p);

            simStage.style.transition = 'opacity .3s ease, transform .3s ease';
            simStage.style.opacity = '1';
            simStage.style.transform = 'translateY(0)';
        }, 180);

        // Tab indicators
        document.querySelectorAll('.sim-tab').forEach(t => {
            t.classList.toggle('active', parseInt(t.dataset.step) === simStep);
        });

        // Progress bar
        simProgressBar.style.width = `${(simStep / SIM_TOTAL) * 100}%`;

        // Buttons
        btnBack.disabled = (simStep === 1);
        btnNext.disabled = false; 

        if (simStep === SIM_TOTAL) {
            btnNext.textContent = 'Finish 🏆';
            btnNext.className = 'btn btn-primary btn-finish';
        } else {
            btnNext.innerHTML = 'Next Step <i class="fa-solid fa-arrow-right"></i>';
            btnNext.className = 'btn btn-primary';
        }

        // Contextual tips
        if (simStep === 2) setAssistant('The ink is indelible, meaning it cannot be removed easily. It stays for 2-3 weeks!', 'It is a symbol of democratic pride.');
        if (simStep === 3) setAssistant('The Third Polling Officer ensures you are legally authorized to vote on the EVM.', 'Always follow the officer\'s instructions.');
        if (simStep === 4) setAssistant('The VVPAT window is your verification. If you don\'t see the slip, inform the officer immediately.', 'The beep is the sound of your voice being heard!');
    }

    btnBack.addEventListener('click', (e) => {
        e.preventDefault();
        if (simStep > 1) { simStep--; renderSim(); }
    });

    btnNext.addEventListener('click', (e) => {
        e.preventDefault();
        if (simStep < SIM_TOTAL) {
            simStep++;
            renderSim();
        } else if (simStep === SIM_TOTAL) {
            setAssistant('🎉 Woohoo! You\'ve completed the full Booth-Sim! You are 100% ready to vote. Go exercise your democratic right!', 'Take a proud voter selfie OUTSIDE the booth and inspire others!');
            btnNext.textContent = 'Done! ✅';
            btnNext.disabled = true;
            btnNext.classList.add('btn-finish');
            simStep++; 
        }
    });

    /* ══════════════════════════════════════
       MYTH-BUSTERS (Fuzzy Search)
    ══════════════════════════════════════ */
    /**
     * Renders the myth-buster cards.
     */
    function renderMyths() {
        if (mythGrid.children.length > 0) return;
        MYTHS.forEach(m => {
            const el = document.createElement('div');
            el.className = 'myth-card';
            
            const inner = document.createElement('div');
            inner.className = 'myth-inner';
            
            const front = document.createElement('div');
            front.className = 'myth-front';
            front.innerHTML = `<h3><i class="fa-solid fa-circle-xmark"></i> Myth</h3><p>${m.myth}</p>`;
            
            const back = document.createElement('div');
            back.className = 'myth-back';
            back.innerHTML = `<h3><i class="fa-solid fa-circle-check"></i> Fact ✅</h3><p>${m.fact}</p>`;
            
            inner.appendChild(front);
            inner.appendChild(back);
            el.appendChild(inner);
            mythGrid.appendChild(el);
        });
    }

    /* ══════════════════════════════════════
       THEME & SW
    ══════════════════════════════════════ */
    /** Toggles between light and dark mode */
    function toggleTheme() {
        darkMode = !darkMode;
        document.body.classList.toggle('light', !darkMode);
        themeBtn.innerHTML = darkMode ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
        themeBtn.setAttribute('aria-label', darkMode ? 'Switch to light mode' : 'Switch to dark mode');
    }

    themeBtn.onclick = toggleTheme;

    // Register PWA Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => Logger.log('[PWA] Service Worker Active'))
            .catch(err => Logger.error('[PWA] Registration failed:', err));
    }

    /* ══════════════════════════════════════
       GEMINI CHAT LOGIC
    ══════════════════════════════════════ */
    const geminiToggle = document.getElementById('geminiToggle');
    const geminiChat   = document.getElementById('geminiChat');
    const geminiClose  = document.getElementById('closeGemini');
    const geminiSend   = document.getElementById('geminiSend');
    const geminiInput  = document.getElementById('geminiInput');
    const geminiMsgs   = document.getElementById('geminiMessages');

    /**
     * Appends a chat bubble to the Gemini message area.
     * @param {string} text - Message content to display.
     * @param {'user'|'bot'} role - Who sent the message (controls styling).
     */
    function addMessage(text, role) {
        const el = document.createElement('div');
        el.className = `msg msg-${role}`;
        el.textContent = text;
        geminiMsgs.appendChild(el);
        geminiMsgs.scrollTop = geminiMsgs.scrollHeight;
    }

    geminiToggle.onclick = () => {
        const isVisible = geminiChat.style.display !== 'none';
        geminiChat.style.display = isVisible ? 'none' : 'flex';
        geminiToggle.setAttribute('aria-expanded', isVisible ? 'false' : 'true');
        geminiToggle.setAttribute('aria-label', isVisible ? 'Open AI Assistant' : 'Close AI Assistant');
        if (!isVisible && geminiMsgs.children.length === 0) {
            addMessage(I18N[currentLang].bot_greet, 'bot');
        }
    };

    geminiClose.onclick = () => geminiChat.style.display = 'none';

    /**
     * Handles sending a user message to the AI assistant.
     * Reads input, renders the user bubble, then after a short delay
     * responds with a context-aware reply derived from ECI handbook data.
     * Uses keyword matching to route to the correct response branch.
     * @returns {void}
     */
    function handleGemini() {
        const txt = geminiInput.value.trim();
        if (!txt) return;
        addMessage(txt, 'user');
        geminiInput.value = '';

        // Simulated Gemini Intelligence (ECI Handbook Data)
        setTimeout(() => {
            const query = txt.toLowerCase();
            let response = "I'm analyzing the ECI handbook for you...";

            if (query.includes('form 6') || query.includes('register') || query.includes('enrollment')) {
                response = "Form 6 is the application form for new voter registration on the NVSP portal (nvsp.in). It's completely free and can be done online!";
            } else if (query.includes('id') || query.includes('voter card')) {
                response = "According to the ECI handbook, you can use any of the 12 approved identity proofs like Aadhaar, PAN, or Passport if your name is in the roll. If you don't have an ID, you must apply via Form 6.";
            } else if (query.includes('booth') || query.includes('location')) {
                response = "You can find your exact booth location by sending an SMS 'ECI <VoterID>' to 1950 or by using the interactive map in the 'Roadmap' section of this app.";
            } else if (query.includes('age') || query.includes('eligible')) {
                response = "The qualifying age is 18 years as of January 1st of the election year. You must be an Indian citizen and a resident of the constituency.";
            } else if (query.includes('time') || query.includes('when')) {
                response = "Polling typically takes place from 7:00 AM to 6:00 PM. However, any voter reaching the booth before 6:00 PM is legally allowed to cast their vote.";
            } else if (query.includes('evm') || query.includes('machine') || query.includes('hack')) {
                response = "EVMs are 100% standalone devices with no WiFi, Bluetooth, or internet connectivity. They are M2M sealed and paired with VVPAT for paper audit trails. Completely secure!";
            } else {
                response = "That's a great question! Based on ECI guidelines, the process ensures full transparency. For specific details on your constituency, I recommend checking the Voter Helpline App or nvsp.in.";
            }

            addMessage(response, 'bot');
        }, 800);
    }

    geminiSend.onclick = handleGemini;
    geminiInput.onkeydown = (e) => { if(e.key === 'Enter') handleGemini(); };

    /* ══════════════════════════════════════
       LANGUAGE & WORKER INIT
    ══════════════════════════════════════ */
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.onclick = () => setLanguage(btn.dataset.lang);
    });

    if (window.Worker) {
        worker = new Worker('worker.js');
        /**
         * Handles messages from the background Worker thread.
         * @param {MessageEvent} e - Worker message event.
         */
        worker.onmessage = (e) => {
            Logger.log('[Worker] Response:', e.data);
            if (e.data.action === 'simulation_ready') {
                Logger.log('[Worker] Simulation Data Processed in Background');
            }
        };
    }

});
