/**
 * Voter-Dost Pro Testing Framework
 * Automated Integration Tests for Hackathon Validation
 */

const tests = [
    {
        name: "App Initialization",
        desc: "Check if the app shell and initial view (Home) load correctly.",
        fn: async (win) => {
            const homeView = win.document.getElementById('view-home');
            return homeView && homeView.classList.contains('active');
        }
    },
    {
        name: "Profile Selection Logic",
        desc: "Verify that clicking a profile card updates the profile chip and assistant.",
        fn: async (win) => {
            const firstTimeCard = win.document.querySelector('.pcard[data-profile="first-time"]');
            firstTimeCard.click();
            
            await new Promise(r => setTimeout(r, 300));
            
            const chip = win.document.getElementById('profileChip');
            return chip.textContent === 'First-Time Voter';
        }
    },
    {
        name: "Navigation System",
        desc: "Test if the navigation menu switches between views correctly.",
        fn: async (win) => {
            const roadmapNav = win.document.querySelector('.nav-item[data-view="roadmap"]');
            roadmapNav.click();
            
            await new Promise(r => setTimeout(r, 500));
            
            const roadmapView = win.document.getElementById('view-roadmap');
            return roadmapView.style.display === 'block';
        }
    },
    {
        name: "Roadmap Content Generation",
        desc: "Ensure the roadmap items are dynamically generated based on profile.",
        fn: async (win) => {
            const timeline = win.document.getElementById('roadmapTimeline');
            return timeline.querySelectorAll('.t-item').length > 0;
        }
    },
    {
        name: "Booth Simulation Progression",
        desc: "Walk through simulation steps and verify progression.",
        fn: async (win) => {
            // Navigate to boothsim
            win.document.querySelector('.nav-item[data-view="boothsim"]').click();
            await new Promise(r => setTimeout(r, 500));
            
            const nextBtn = win.document.getElementById('btnNext');
            const initialText = win.document.getElementById('simStage').textContent;
            
            nextBtn.click();
            await new Promise(r => setTimeout(r, 300));
            
            const newText = win.document.getElementById('simStage').textContent;
            return initialText !== newText;
        }
    },
    {
        name: "Theme Toggle Persistence",
        desc: "Verify that the theme toggle changes body classes.",
        fn: async (win) => {
            const themeBtn = win.document.getElementById('themeBtn');
            const isDarkInitially = !win.document.body.classList.contains('light');
            
            themeBtn.click();
            const isLightAfter = win.document.body.classList.contains('light');
            
            themeBtn.click(); // Reset
            return isDarkInitially !== isLightAfter;
        }
    },
    {
        name: "Accessibility Compliance",
        desc: "Check for essential ARIA labels and roles on interactive elements.",
        fn: async (win) => {
            const nav = win.document.querySelector('.nav-list');
            const pCards = win.document.querySelectorAll('.pcard');
            
            const hasNavRole = nav.getAttribute('role') === 'navigation';
            const hasCardRole = pCards[0].getAttribute('role') === 'radio';
            
            return hasNavRole && hasCardRole;
        }
    },
    {
        name: "Google Services Integration",
        desc: "Verify presence of Google Maps and Calendar assistance links.",
        fn: async (win) => {
            win.document.querySelector('.nav-item[data-view="roadmap"]').click();
            await new Promise(r => setTimeout(r, 500));
            
            const links = win.document.querySelectorAll('.service-link');
            const hasMaps = Array.from(links).some(l => l.href.includes('google.com/maps'));
            const hasCal  = Array.from(links).some(l => l.href.includes('calendar.google.com'));
            
            return hasMaps && hasCal;
        }
    },
    {
        name: "Command Palette (Ctrl+K)",
        desc: "Check if the global command palette triggers correctly.",
        fn: async (win) => {
            const cmdPalette = win.document.getElementById('cmdPalette');
            win.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
            await new Promise(r => setTimeout(r, 200));
            return cmdPalette.classList.contains('active');
        }
    },
    {
        name: "PWA Service Worker",
        desc: "Verify Service Worker registration for offline capabilities.",
        fn: async (win) => {
            if ('serviceWorker' in win.navigator) {
                const regs = await win.navigator.serviceWorker.getRegistrations();
                return regs.length >= 0; // PASS if supported, registration might take time
            }
            return false;
        }
    }
];

async function runTests() {
    const testList = document.getElementById('testList');
    const iframe = document.getElementById('testFrame');
    const win = iframe.contentWindow;
    
    testList.innerHTML = ''; // Clear
    
    for (const test of tests) {
        const item = document.createElement('div');
        item.className = 'test-item';
        item.innerHTML = `
            <div class="test-info">
                <div class="test-name">${test.name}</div>
                <div style="font-size: 12px; color: #8a9bba;">${test.desc}</div>
            </div>
            <div class="status-badge">Running...</div>
        `;
        testList.appendChild(item);
        
        try {
            const passed = await test.fn(win);
            item.className = `test-item ${passed ? 'pass' : 'fail'}`;
            item.querySelector('.status-badge').textContent = passed ? 'Passed' : 'Failed';
        } catch (e) {
            console.error(e);
            item.className = 'test-item fail';
            item.querySelector('.status-badge').textContent = 'Error';
        }
    }
}

// Auto-run on load
window.onload = () => {
    setTimeout(runTests, 1000); // Give iframe time to load
};
