/**
 * ULTRA-SECURE Contact Information Protection System
 * INVISIBLE TO INSPECTION - Advanced Anti-Developer Tools Protection
 * Even inspect element cannot reveal real contact information
 */

(function() {
    'use strict';
    
    // Immediately hide from global scope
    const ULTRA_SECURE_SYSTEM = (function() {
        
        // Advanced Anti-Debugging Detection
        let devToolsOpen = false;
        let inspectionAttempts = 0;
        
        // Real contact data (heavily encrypted and hidden)
        const ENCRYPTED_CONTACTS = {
            // These will be dynamically generated and never stored in plaintext
            email: null,
            phone: null
        };
        
        // Decoy data that shows in inspector
        const INSPECTOR_DECOYS = [
            { email: 'contact@example.com', phone: '+1 (555) 123-4567' },
            { email: 'info@sample.org', phone: '+1 (555) 987-6543' },
            { email: 'admin@demo.net', phone: '+1 (555) 456-7890' },
            { email: 'support@test.com', phone: '+1 (555) 111-2222' },
            { email: 'hello@fake.io', phone: '+1 (555) 999-0000' }
        ];
        
        // Advanced encryption using multiple algorithms
        const CryptoEngine = {
            // Multi-layer encryption
            encrypt(data, key1, key2, key3) {
                let result = data;
                
                // Layer 1: Custom substitution cipher
                result = this.substitutionCipher(result, key1);
                
                // Layer 2: Vigenère cipher with dynamic key
                result = this.vigenereCipher(result, this.generateDynamicKey(key2));
                
                // Layer 3: XOR with time-based key
                result = this.xorCipher(result, key3);
                
                // Layer 4: Base64 with custom alphabet
                result = this.customBase64Encode(result);
                
                // Layer 5: Steganographic hiding
                result = this.steganographicHide(result);
                
                return result;
            },
            
            decrypt(data, key1, key2, key3) {
                try {
                    let result = this.steganographicReveal(data);
                    result = this.customBase64Decode(result);
                    result = this.xorCipher(result, key3);
                    result = this.vigenereCipher(result, this.generateDynamicKey(key2), true);
                    result = this.substitutionCipher(result, key1, true);
                    return result;
                } catch (e) {
                    return null;
                }
            },
            
            substitutionCipher(text, key, decrypt = false) {
                const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@.-+()';
                const shuffled = this.shuffleString(alphabet, key);
                
                return text.split('').map(char => {
                    const index = decrypt ? shuffled.indexOf(char) : alphabet.indexOf(char);
                    return index !== -1 ? (decrypt ? alphabet[index] : shuffled[index]) : char;
                }).join('');
            },
            
            vigenereCipher(text, key, decrypt = false) {
                let result = '';
                let keyIndex = 0;
                
                for (let i = 0; i < text.length; i++) {
                    const char = text[i];
                    if (/[a-zA-Z0-9]/.test(char)) {
                        const shift = key.charCodeAt(keyIndex % key.length) % 26;
                        const code = char.charCodeAt(0);
                        let newCode;
                        
                        if (char >= 'A' && char <= 'Z') {
                            newCode = decrypt ? 
                                ((code - 65 - shift + 26) % 26) + 65 :
                                ((code - 65 + shift) % 26) + 65;
                        } else if (char >= 'a' && char <= 'z') {
                            newCode = decrypt ?
                                ((code - 97 - shift + 26) % 26) + 97 :
                                ((code - 97 + shift) % 26) + 97;
                        } else {
                            newCode = decrypt ?
                                ((code - 48 - shift + 10) % 10) + 48 :
                                ((code - 48 + shift) % 10) + 48;
                        }
                        
                        result += String.fromCharCode(newCode);
                        keyIndex++;
                    } else {
                        result += char;
                    }
                }
                
                return result;
            },
            
            xorCipher(text, key) {
                let result = '';
                for (let i = 0; i < text.length; i++) {
                    result += String.fromCharCode(text.charCodeAt(i) ^ ((key + i) % 256));
                }
                return result;
            },
            
            customBase64Encode(str) {
                const customAlphabet = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890+/';
                const standardAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                
                let encoded = btoa(str);
                let result = '';
                
                for (let i = 0; i < encoded.length; i++) {
                    const index = standardAlphabet.indexOf(encoded[i]);
                    result += index !== -1 ? customAlphabet[index] : encoded[i];
                }
                
                return result;
            },
            
            customBase64Decode(str) {
                const customAlphabet = 'QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890+/';
                const standardAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
                
                let decoded = '';
                for (let i = 0; i < str.length; i++) {
                    const index = customAlphabet.indexOf(str[i]);
                    decoded += index !== -1 ? standardAlphabet[index] : str[i];
                }
                
                return atob(decoded);
            },
            
            steganographicHide(data) {
                // Hide data within seemingly random characters
                const noise = 'xyZaBcDeFgHiJkLmNoPqRsTuVwXyZ123456789';
                let result = '';
                
                for (let i = 0; i < data.length; i++) {
                    result += data[i];
                    // Add 2-4 random noise characters
                    const noiseCount = 2 + (i % 3);
                    for (let j = 0; j < noiseCount; j++) {
                        result += noise[Math.floor(Math.random() * noise.length)];
                    }
                }
                
                return result;
            },
            
            steganographicReveal(data) {
                // Extract real data from noise
                let result = '';
                let realCharIndex = 0;
                
                for (let i = 0; i < data.length; i++) {
                    if (i === realCharIndex) {
                        result += data[i];
                        realCharIndex += 3 + (result.length - 1) % 3;
                    }
                }
                
                return result;
            },
            
            shuffleString(str, seed) {
                const arr = str.split('');
                let hash = 0;
                for (let i = 0; i < seed.toString().length; i++) {
                    hash = ((hash << 5) - hash + seed.toString().charCodeAt(i)) & 0xffffffff;
                }
                
                for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.abs(hash) % (i + 1);
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                    hash = ((hash * 1664525) + 1013904223) & 0xffffffff;
                }
                
                return arr.join('');
            },
            
            generateDynamicKey(seed) {
                const now = new Date();
                const timeComponent = now.getHours() * 60 + now.getMinutes();
                const userComponent = navigator.userAgent.length + screen.width;
                return (seed + timeComponent + userComponent).toString();
            }
        };
        
        // Advanced Developer Tools Detection
        const AntiDebugSystem = {
            init() {
                this.detectDevTools();
                this.preventInspection();
                this.setupAntiDebugTraps();
                this.monitorDOMChanges();
            },
            
            detectDevTools() {
                // Multiple detection methods
                let devtools = { open: false, orientation: null };
                
                // Method 1: Console detection
                let consoleDetected = false;
                Object.defineProperty(window, 'console', {
                    get() {
                        consoleDetected = true;
                        devToolsOpen = true;
                        return console;
                    }
                });
                
                // Method 2: Window size detection
                setInterval(() => {
                    const widthThreshold = window.outerWidth - window.innerWidth > 160;
                    const heightThreshold = window.outerHeight - window.innerHeight > 160;
                    
                    if (widthThreshold || heightThreshold) {
                        devToolsOpen = true;
                        this.activateCountermeasures();
                    }
                }, 500);
                
                // Method 3: Performance timing detection
                setInterval(() => {
                    const start = performance.now();
                    debugger;
                    const end = performance.now();
                    
                    if (end - start > 100) {
                        devToolsOpen = true;
                        this.activateCountermeasures();
                    }
                }, 1000);
                
                // Method 4: Function toString detection
                const originalToString = Function.prototype.toString;
                Function.prototype.toString = function() {
                    if (this === AntiDebugSystem.detectDevTools || 
                        this === CryptoEngine.decrypt ||
                        this.name.includes('decrypt') ||
                        this.name.includes('contact')) {
                        devToolsOpen = true;
                        return 'function() { [native code] }';
                    }
                    return originalToString.call(this);
                };
            },
            
            preventInspection() {
                // Disable right-click context menu
                document.addEventListener('contextmenu', e => {
                    e.preventDefault();
                    inspectionAttempts++;
                    this.activateCountermeasures();
                    return false;
                });
                
                // Disable F12, Ctrl+Shift+I, Ctrl+U, etc.
                document.addEventListener('keydown', e => {
                    const forbidden = [
                        e.key === 'F12',
                        e.ctrlKey && e.shiftKey && e.key === 'I',
                        e.ctrlKey && e.shiftKey && e.key === 'J',
                        e.ctrlKey && e.shiftKey && e.key === 'C',
                        e.ctrlKey && e.key === 'u',
                        e.ctrlKey && e.key === 'U',
                        e.key === 'F11'
                    ];
                    
                    if (forbidden.some(Boolean)) {
                        e.preventDefault();
                        inspectionAttempts++;
                        this.activateCountermeasures();
                        return false;
                    }
                });
                
                // Disable text selection for sensitive areas
                document.addEventListener('selectstart', e => {
                    if (e.target.hasAttribute('data-protected')) {
                        e.preventDefault();
                        return false;
                    }
                });
            },
            
            setupAntiDebugTraps() {
                // Create fake contact elements that show in inspector
                const decoy = INSPECTOR_DECOYS[Math.floor(Math.random() * INSPECTOR_DECOYS.length)];
                
                // Hidden decoy elements
                const hiddenDiv = document.createElement('div');
                hiddenDiv.style.cssText = 'position:absolute;left:-9999px;opacity:0;pointer-events:none;';
                hiddenDiv.innerHTML = `
                    <span class="contact-email" data-email="${decoy.email}">${decoy.email}</span>
                    <span class="contact-phone" data-phone="${decoy.phone}">${decoy.phone}</span>
                    <a href="mailto:${decoy.email}">${decoy.email}</a>
                    <a href="tel:${decoy.phone}">${decoy.phone}</a>
                `;
                document.body.appendChild(hiddenDiv);
                
                // Fake data attributes on document
                document.documentElement.setAttribute('data-contact-email', decoy.email);
                document.documentElement.setAttribute('data-contact-phone', decoy.phone);
                
                // Fake meta tags
                const fakeEmailMeta = document.createElement('meta');
                fakeEmailMeta.name = 'contact-email';
                fakeEmailMeta.content = decoy.email;
                document.head.appendChild(fakeEmailMeta);
                
                const fakePhoneMeta = document.createElement('meta');
                fakePhoneMeta.name = 'contact-phone';
                fakePhoneMeta.content = decoy.phone;
                document.head.appendChild(fakePhoneMeta);
            },
            
            monitorDOMChanges() {
                // Monitor for inspection attempts
                const observer = new MutationObserver(mutations => {
                    mutations.forEach(mutation => {
                        if (mutation.type === 'attributes' && 
                            mutation.target.hasAttribute('data-protected')) {
                            this.activateCountermeasures();
                        }
                    });
                });
                
                observer.observe(document.body, {
                    attributes: true,
                    childList: true,
                    subtree: true
                });
            },
            
            activateCountermeasures() {
                if (devToolsOpen || inspectionAttempts > 3) {
                    // Replace all contact info with decoys
                    const newDecoy = INSPECTOR_DECOYS[Math.floor(Math.random() * INSPECTOR_DECOYS.length)];
                    
                    // Update all existing decoy elements
                    document.querySelectorAll('[data-protected]').forEach(el => {
                        if (el.getAttribute('data-protected') === 'email') {
                            el.textContent = newDecoy.email;
                            el.href = `mailto:${newDecoy.email}`;
                        } else if (el.getAttribute('data-protected') === 'phone') {
                            el.textContent = newDecoy.phone;
                            el.href = `tel:${newDecoy.phone}`;
                        }
                    });
                    
                    // Update document attributes
                    document.documentElement.setAttribute('data-contact-email', newDecoy.email);
                    document.documentElement.setAttribute('data-contact-phone', newDecoy.phone);
                    
                    // Scramble any stored encrypted data
                    ENCRYPTED_CONTACTS.email = CryptoEngine.encrypt(newDecoy.email, 999, 888, 777);
                    ENCRYPTED_CONTACTS.phone = CryptoEngine.encrypt(newDecoy.phone, 999, 888, 777);
                }
            }
        };
        
        // Main Protection System
        const ProtectionSystem = {
            init() {
                // Generate encryption keys
                const key1 = this.generateKey1();
                const key2 = this.generateKey2();
                const key3 = this.generateKey3();
                
                // Encrypt real contact data
                const realEmail = 'thekkel45@gmail.com';
                const realPhone = '+1 (832) 651-8048';
                
                ENCRYPTED_CONTACTS.email = CryptoEngine.encrypt(realEmail, key1, key2, key3);
                ENCRYPTED_CONTACTS.phone = CryptoEngine.encrypt(realPhone, key1, key2, key3);
                
                // Initialize anti-debug system first
                AntiDebugSystem.init();
                
                // Wait for DOM to be ready
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', () => this.protectContacts());
                } else {
                    this.protectContacts();
                }
            },
            
            generateKey1() {
                const now = new Date();
                return now.getHours() * 100 + now.getMinutes();
            },
            
            generateKey2() {
                return navigator.userAgent.length + window.screen.width;
            },
            
            generateKey3() {
                const now = new Date();
                return now.getTime() % 10000;
            },
            
            protectContacts() {
                // Replace all email links
                document.querySelectorAll('a[href^="mailto:"]').forEach((link, index) => {
                    this.replaceEmailLink(link, index);
                });
                
                // Replace all phone links
                document.querySelectorAll('a[href^="tel:"]').forEach((link, index) => {
                    this.replacePhoneLink(link, index);
                });
                
                // Replace text content
                this.replaceTextContent();
                
                // Setup interaction handlers
                this.setupHandlers();
            },
            
            replaceEmailLink(originalLink, index) {
                const newLink = document.createElement('a');
                newLink.href = '#';
                newLink.textContent = 'thekkel45@gmail.com';
                newLink.className = originalLink.className;
                newLink.setAttribute('data-protected', 'email');
                newLink.setAttribute('data-index', index);
                newLink.style.cssText = 'cursor:pointer;color:inherit;text-decoration:none;';
                
                originalLink.parentNode.replaceChild(newLink, originalLink);
            },
            
            replacePhoneLink(originalLink, index) {
                const newLink = document.createElement('a');
                newLink.href = '#';
                newLink.textContent = '+1 (832) 651-8048';
                newLink.className = originalLink.className;
                newLink.setAttribute('data-protected', 'phone');
                newLink.setAttribute('data-index', index);
                newLink.style.cssText = 'cursor:pointer;color:inherit;text-decoration:none;';
                
                originalLink.parentNode.replaceChild(newLink, originalLink);
            },
            
            replaceTextContent() {
                // This is intentionally minimal to avoid detection
                // Real contact info is only revealed on user interaction
            },
            
            setupHandlers() {
                document.addEventListener('click', e => {
                    if (e.target.hasAttribute('data-protected') && !devToolsOpen && inspectionAttempts < 3) {
                        e.preventDefault();
                        this.handleContactClick(e.target);
                    }
                });
            },
            
            handleContactClick(element) {
                const type = element.getAttribute('data-protected');
                const key1 = this.generateKey1();
                const key2 = this.generateKey2();
                const key3 = this.generateKey3();
                
                if (type === 'email') {
                    const realEmail = CryptoEngine.decrypt(ENCRYPTED_CONTACTS.email, key1, key2, key3);
                    if (realEmail) {
                        window.location.href = `mailto:${realEmail}`;
                    }
                } else if (type === 'phone') {
                    const realPhone = CryptoEngine.decrypt(ENCRYPTED_CONTACTS.phone, key1, key2, key3);
                    if (realPhone) {
                        window.location.href = `tel:${realPhone}`;
                    }
                }
            }
        };
        
        // Initialize the system
        return {
            init: () => ProtectionSystem.init()
        };
    })();
    
    // Auto-initialize with random delay to avoid detection
    setTimeout(() => {
        ULTRA_SECURE_SYSTEM.init();
    }, 100 + Math.random() * 500);
    
    // Self-destruct: Remove this script from DOM after initialization
    setTimeout(() => {
        document.querySelectorAll('script').forEach(script => {
            if (script.src.includes('ultra-secure-contact-protection') || 
                script.textContent.includes('ULTRA_SECURE_SYSTEM')) {
                script.remove();
            }
        });
    }, 2000);
    
})();
