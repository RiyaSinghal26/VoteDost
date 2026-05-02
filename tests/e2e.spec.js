const { test, expect } = require('@playwright/test');

test.describe('Voter-Dost Pro E2E Flow', () => {

    test.beforeEach(async ({ page }) => {
        // Assuming local dev server or Docker is running
        await page.goto('http://localhost:8080'); 
    });

    test('Full User Journey: Quiz -> Roadmap -> Booth Sim', async ({ page }) => {
        // 1. Take Quiz
        await page.click('#startQuiz');
        await expect(page.locator('#quizOverlay')).toBeVisible();
        
        // Answer questions (mocking choices)
        await page.click('text=18 - 60');
        await page.click('text=No, this is my first time!');
        
        // Finish Quiz
        await page.click('text=Set this Profile');
        await expect(page.locator('#profileChip')).toContainText('First-Time Voter');

        // 2. Navigate to Roadmap
        await page.click('#nav-roadmap');
        await expect(page.locator('#view-roadmap')).toBeVisible();
        await expect(page.locator('#roadmapTimeline')).not.toBeEmpty();

        // Check Google Services
        await expect(page.locator('.google-services-box')).toBeVisible();
        await expect(page.locator('text=Find Nearest Booth')).toBeVisible();

        // 3. Open Booth Simulation
        await page.click('#nav-boothsim');
        await expect(page.locator('#view-boothsim')).toBeVisible();

        // Walk through steps
        for (let i = 1; i < 4; i++) {
            await page.click('#btnNext');
        }
        await expect(page.locator('#btnNext')).toContainText('Finish');
        await page.click('#btnNext');
        await expect(page.locator('#assistantText')).toContainText('ready to vote');
    });

    test('Visual Regression: Dark/Light Mode', async ({ page }) => {
        // Check Dark Mode (Default)
        await expect(page.locator('body')).not.toHaveClass(/light/);
        await page.screenshot({ path: 'tests/screenshots/dark-mode.png' });

        // Toggle Light Mode
        await page.click('#themeBtn');
        await expect(page.locator('body')).toHaveClass(/light/);
        await page.screenshot({ path: 'tests/screenshots/light-mode.png' });
    });

    test('i18n: Language Toggle — Hindi and back to English', async ({ page }) => {
        // Verify default language is English
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');

        // Switch to Hindi
        await page.click('button[data-lang="hi"]');

        // Assert html lang attribute changes
        await expect(page.locator('html')).toHaveAttribute('lang', 'hi');

        // Assert page title changes to Hindi
        await expect(page.locator('#pageTitle')).toContainText('वोटर-दोस्त');

        // Assert nav items are also translated
        await expect(page.locator('#nav-home span')).toContainText('होम');
        await expect(page.locator('#nav-roadmap span')).toContainText('आपका रोडमैप');

        // Assert aria-pressed reflects active language
        await expect(page.locator('button[data-lang="hi"]')).toHaveAttribute('aria-pressed', 'true');
        await expect(page.locator('button[data-lang="en"]')).toHaveAttribute('aria-pressed', 'false');

        // Switch back to English
        await page.click('button[data-lang="en"]');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');
        await expect(page.locator('#pageTitle')).toContainText('Welcome to Voter-Dost');
        await expect(page.locator('button[data-lang="en"]')).toHaveAttribute('aria-pressed', 'true');
    });

    test('Accessibility: Critical aria-labels are present', async ({ page }) => {
        // AI Bot toggle must have aria-label and aria-expanded
        const botToggle = page.locator('#geminiToggle');
        await expect(botToggle).toHaveAttribute('aria-label', 'Open AI Assistant');
        await expect(botToggle).toHaveAttribute('aria-expanded', 'false');
        await expect(botToggle).toHaveAttribute('aria-controls', 'geminiChat');

        // After opening, aria-expanded should be true
        await botToggle.click();
        await expect(botToggle).toHaveAttribute('aria-expanded', 'true');

        // Close button has proper label
        await expect(page.locator('#closeGemini')).toHaveAttribute('aria-label', 'Close AI Assistant');

        // Language buttons have aria-label and aria-pressed
        await expect(page.locator('button[data-lang="en"]')).toHaveAttribute('aria-label', 'Switch to English');
        await expect(page.locator('button[data-lang="hi"]')).toHaveAttribute('aria-label', 'Switch to Hindi');

        // Theme toggle has aria-label
        await expect(page.locator('#themeBtn')).toHaveAttribute('aria-label');

        // Close quiz button
        await page.click('#startQuiz');
        await expect(page.locator('#closeQuiz')).toHaveAttribute('aria-label', 'Close quiz');

        // Nav items have aria-labels
        await expect(page.locator('#nav-home')).toHaveAttribute('aria-label', 'Go to Home');
        await expect(page.locator('#nav-roadmap')).toHaveAttribute('aria-label', 'View Your Roadmap');
    });

    test('Gemini AI Bot: Chat interaction', async ({ page }) => {
        await page.click('#geminiToggle');
        await expect(page.locator('#geminiChat')).toBeVisible();

        await page.fill('#geminiInput', 'How do I get a voter ID?');
        await page.click('#geminiSend');

        // Wait for bot response (mocked)
        await page.waitForTimeout(1000);
        const msgs = await page.locator('.gemini-messages').innerText();
        expect(msgs).toContain('Form 6');
    });
});
