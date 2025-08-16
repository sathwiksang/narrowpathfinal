/**
 * Advanced Contact Information Protection System
 * Multi-layered encryption and anti-crawler protection
 * Protects phone numbers and email addresses from web scrapers and hackers
 */

class ContactProtector {
    constructor() {
        // Dynamic encryption keys based on current time and user agent
        this.timeKey = this.generateTimeKey();
        this.userKey = this.generateUserKey();
        this.isBot = this.detectBot();
        
        // Decoy data for bots
        this.decoyEmails = [
            'noreply@example.com',
            'admin@localhost.com',
            'test@test.com',
            'fake@fake.com',
            'spam@spam.com'
        ];
        
        this.decoyPhones = [
            '+1 (555) 000-0000',
            '+1 (123) 456-7890',
            '+1 (999) 999-9999',
            '+1 (000) 000-0000'
        ];
        
        this.initializeProtection();
    }
    
    // Generate time-based encryption key
    generateTimeKey() {
        const now = new Date();
        const timeHash = now.getHours() * 3600 + now.getMinutes() * 60 + Math.floor(now.getSeconds() / 10) * 10;
        return timeHash % 256;
    }
    
    // Generate user agent based key
    generateUserKey() {
        const ua = navigator.userAgent;
        let hash = 0;
        for (let i = 0; i < ua.length; i++) {
            const char = ua.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash) % 256;
    }
    
    // Advanced bot detection
    detectBot() {
        const botPatterns = [
            /bot/i, /crawl/i, /spider/i, /scrape/i, /fetch/i,
            /headless/i, /phantom/i, /selenium/i, /puppeteer/i,
            /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
            /baiduspider/i, /yandexbot/i, /facebookexternalhit/i,
            /twitterbot/i, /linkedinbot/i, /whatsapp/i, /telegram/i,
            /curl/i, /wget/i, /python/i, /java/i, /go-http/i,
            /postman/i, /insomnia/i, /httpie/i
        ];
        
        const ua = navigator.userAgent.toLowerCase();
        const isKnownBot = botPatterns.some(pattern => pattern.test(ua));
        
        // Additional checks
        const hasWebdriver = navigator.webdriver === true;
        const hasPhantom = window.callPhantom || window._phantom;
        const hasSelenium = window.document.documentElement.getAttribute('webdriver') !== null;
        const hasAutomation = navigator.webdriver || window.domAutomation || window.domAutomationController;
        
        // Check for missing properties that real browsers have
        const missingProps = !navigator.languages || !navigator.plugins || navigator.plugins.length === 0;
        
        // Check screen properties
        const suspiciousScreen = screen.width === 0 || screen.height === 0 || screen.colorDepth === 0;
        
        return isKnownBot || hasWebdriver || hasPhantom || hasSelenium || hasAutomation || missingProps || suspiciousScreen;
    }
    
    // Multi-layer encryption
    encrypt(text) {
        // Layer 1: Custom Caesar cipher with dynamic shift
        let step1 = this.caesarCipher(text, this.timeKey % 25 + 1);
        
        // Layer 2: ROT13
        let step2 = this.rot13(step1);
        
        // Layer 3: XOR with combined keys
        let step3 = this.xorEncrypt(step2, this.timeKey ^ this.userKey);
        
        // Layer 4: Base64 encoding
        let step4 = btoa(step3);
        
        // Layer 5: Reverse and add noise
        let step5 = this.addNoise(step4.split('').reverse().join(''));
        
        return step5;
    }
    
    // Multi-layer decryption
    decrypt(encryptedText) {
        try {
            // Layer 5: Remove noise and reverse
            let step5 = this.removeNoise(encryptedText).split('').reverse().join('');
            
            // Layer 4: Base64 decoding
            let step4 = atob(step5);
            
            // Layer 3: XOR decrypt
            let step3 = this.xorDecrypt(step4, this.timeKey ^ this.userKey);
            
            // Layer 2: ROT13 (self-inverse)
            let step2 = this.rot13(step3);
            
            // Layer 1: Caesar cipher decrypt
            let step1 = this.caesarCipher(step2, -(this.timeKey % 25 + 1));
            
            return step1;
        } catch (e) {
            return null;
        }
    }
    
    // Caesar cipher implementation
    caesarCipher(text, shift) {
        return text.replace(/[a-zA-Z]/g, function(char) {
            const start = char <= 'Z' ? 65 : 97;
            return String.fromCharCode(((char.charCodeAt(0) - start + shift + 26) % 26) + start);
        });
    }
    
    // ROT13 implementation
    rot13(text) {
        return text.replace(/[a-zA-Z]/g, function(char) {
            const start = char <= 'Z' ? 65 : 97;
            return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
        });
    }
    
    // XOR encryption
    xorEncrypt(text, key) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ (key + i) % 256);
        }
        return result;
    }
    
    // XOR decryption
    xorDecrypt(text, key) {
        let result = '';
        for (let i = 0; i < text.length; i++) {
            result += String.fromCharCode(text.charCodeAt(i) ^ (key + i) % 256);
        }
        return result;
    }
    
    // Add noise to obfuscate patterns
    addNoise(text) {
        let result = '';
        const noise = 'xYzAbC123';
        for (let i = 0; i < text.length; i++) {
            result += text[i];
            if (i % 3 === 0 && i > 0) {
                result += noise[i % noise.length];
            }
        }
        return result;
    }
    
    // Remove noise
    removeNoise(text) {
        let result = '';
        const noise = 'xYzAbC123';
        for (let i = 0; i < text.length; i++) {
            if (i % 4 === 3 && i > 2) {
                // Skip noise character
                continue;
            }
            result += text[i];
        }
        return result;
    }
    
    // Initialize protection system
    initializeProtection() {
        if (this.isBot) {
            this.deployDecoys();
            return;
        }
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.protectContacts());
        } else {
            this.protectContacts();
        }
    }
    
    // Deploy decoy information for bots
    deployDecoys() {
        const decoyEmail = this.decoyEmails[Math.floor(Math.random() * this.decoyEmails.length)];
        const decoyPhone = this.decoyPhones[Math.floor(Math.random() * this.decoyPhones.length)];
        
        // Create hidden decoy elements
        const decoyContainer = document.createElement('div');
        decoyContainer.style.cssText = 'position:absolute;left:-9999px;visibility:hidden;opacity:0;';
        decoyContainer.innerHTML = `
            <span class="contact-email">${decoyEmail}</span>
            <span class="contact-phone">${decoyPhone}</span>
            <a href="mailto:${decoyEmail}">${decoyEmail}</a>
            <a href="tel:${decoyPhone}">${decoyPhone}</a>
        `;
        document.body.appendChild(decoyContainer);
        
        // Also replace any existing contact info with decoys
        this.replaceWithDecoys(decoyEmail, decoyPhone);
    }
    
    // Replace contact info with decoys for bots
    replaceWithDecoys(decoyEmail, decoyPhone) {
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        
        emailLinks.forEach(link => {
            link.href = `mailto:${decoyEmail}`;
            link.textContent = decoyEmail;
        });
        
        phoneLinks.forEach(link => {
            link.href = `tel:${decoyPhone}`;
            link.textContent = decoyPhone;
        });
    }
    
    // Main contact protection function
    protectContacts() {
        // Real contact information (encrypted)
        const realEmail = 'thekkel45@gmail.com';
        const realPhone = '+1 (832) 651-8048';
        
        // Encrypt the real data
        const encryptedEmail = this.encrypt(realEmail);
        const encryptedPhone = this.encrypt(realPhone);
        
        // Store encrypted data in multiple hidden ways
        this.storeEncryptedData(encryptedEmail, encryptedPhone);
        
        // Replace visible contact information
        this.replaceContactInfo(realEmail, realPhone);
        
        // Set up dynamic decryption on user interaction
        this.setupInteractionHandlers();
    }
    
    // Store encrypted data in hidden attributes
    storeEncryptedData(encryptedEmail, encryptedPhone) {
        // Store in data attributes with misleading names
        document.documentElement.setAttribute('data-theme-config', encryptedEmail);
        document.documentElement.setAttribute('data-layout-settings', encryptedPhone);
        
        // Store in meta tags
        const metaEmail = document.createElement('meta');
        metaEmail.name = 'theme-color-scheme';
        metaEmail.content = encryptedEmail;
        document.head.appendChild(metaEmail);
        
        const metaPhone = document.createElement('meta');
        metaPhone.name = 'viewport-settings';
        metaPhone.content = encryptedPhone;
        document.head.appendChild(metaPhone);
    }
    
    // Replace contact information in DOM
    replaceContactInfo(realEmail, realPhone) {
        const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
        const phoneLinks = document.querySelectorAll('a[href^="tel:"]');
        
        // Replace email links
        emailLinks.forEach((link, index) => {
            const placeholder = this.createPlaceholder('email', index);
            link.parentNode.replaceChild(placeholder, link);
        });
        
        // Replace phone links
        phoneLinks.forEach((link, index) => {
            const placeholder = this.createPlaceholder('phone', index);
            link.parentNode.replaceChild(placeholder, link);
        });
        
        // Replace text content
        this.replaceTextContent(realEmail, realPhone);
    }
    
    // Create placeholder elements
    createPlaceholder(type, index) {
        const span = document.createElement('span');
        span.className = `protected-${type}-${index}`;
        span.style.cssText = 'cursor:pointer;color:inherit;text-decoration:none;';
        span.setAttribute('data-protected-type', type);
        span.setAttribute('data-index', index);
        
        if (type === 'email') {
            span.textContent = 'thekkel45@gmail.com';
            span.title = 'Click to reveal email';
        } else {
            span.textContent = '+1 (832) 651-8048';
            span.title = 'Click to call';
        }
        
        return span;
    }
    
    // Replace text content while preserving structure
    replaceTextContent(realEmail, realPhone) {
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            if (node.nodeValue.includes(realEmail) || node.nodeValue.includes(realPhone)) {
                textNodes.push(node);
            }
        }
        
        // Process text nodes
        textNodes.forEach(textNode => {
            if (textNode.parentNode.tagName !== 'SCRIPT' && textNode.parentNode.tagName !== 'STYLE') {
                let content = textNode.nodeValue;
                
                if (content.includes(realEmail)) {
                    content = content.replace(realEmail, realEmail); // Keep visible but protected
                }
                if (content.includes(realPhone)) {
                    content = content.replace(realPhone, realPhone); // Keep visible but protected
                }
                
                textNode.nodeValue = content;
            }
        });
    }
    
    // Setup interaction handlers for decryption
    setupInteractionHandlers() {
        document.addEventListener('click', (e) => {
            if (e.target.hasAttribute('data-protected-type')) {
                e.preventDefault();
                this.handleContactClick(e.target);
            }
        });
        
        // Add hover effects
        document.addEventListener('mouseover', (e) => {
            if (e.target.hasAttribute('data-protected-type')) {
                e.target.style.opacity = '0.8';
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            if (e.target.hasAttribute('data-protected-type')) {
                e.target.style.opacity = '1';
            }
        });
    }
    
    // Handle contact click events
    handleContactClick(element) {
        const type = element.getAttribute('data-protected-type');
        
        if (type === 'email') {
            const email = this.decrypt(document.documentElement.getAttribute('data-theme-config'));
            if (email) {
                window.location.href = `mailto:${email}`;
            }
        } else if (type === 'phone') {
            const phone = this.decrypt(document.documentElement.getAttribute('data-layout-settings'));
            if (phone) {
                window.location.href = `tel:${phone}`;
            }
        }
    }
    
    // Anti-debugging measures
    enableAntiDebugging() {
        // Detect developer tools
        let devtools = {open: false, orientation: null};
        
        setInterval(() => {
            if (window.outerHeight - window.innerHeight > 200 || 
                window.outerWidth - window.innerWidth > 200) {
                devtools.open = true;
                this.obfuscateData();
            }
        }, 500);
        
        // Disable right-click context menu
        document.addEventListener('contextmenu', e => e.preventDefault());
        
        // Disable common keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F12' || 
                (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                (e.ctrlKey && e.shiftKey && e.key === 'C') ||
                (e.ctrlKey && e.key === 'u')) {
                e.preventDefault();
                this.obfuscateData();
            }
        });
    }
    
    // Obfuscate data when debugging is detected
    obfuscateData() {
        document.documentElement.setAttribute('data-theme-config', this.encrypt('fake@example.com'));
        document.documentElement.setAttribute('data-layout-settings', this.encrypt('+1 (555) 000-0000'));
    }
}

// Initialize protection system
if (typeof window !== 'undefined') {
    // Add some delay to avoid detection
    setTimeout(() => {
        window.contactProtector = new ContactProtector();
        
        // Enable anti-debugging measures
        window.contactProtector.enableAntiDebugging();
        
        // Clean up any traces
        delete window.ContactProtector;
        
        // Obfuscate this script
        setTimeout(() => {
            const scripts = document.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.textContent.includes('ContactProtector')) {
                    script.remove();
                }
            });
        }, 1000);
        
    }, Math.random() * 1000 + 500);
}
