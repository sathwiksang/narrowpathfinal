/**
 * Advanced Contact Protection System
 * Real contact visible to users, encrypted data in inspect element
 */

(function() {
    'use strict';
    
    // Encrypted data that will appear in inspect element
    const encryptedDisplay = {
        email: 'zQp8mX9kL3vN2wR7gB4hS6',
        phone: 'aY5tU8oI1qE3rT6yP9sD2f'
    };
    
    // Real contact data (hidden from DOM)
    const realContacts = {
        email: String.fromCharCode(116,104,101,107,107,101,108,52,53,64,103,109,97,105,108,46,99,111,109),
        phone: String.fromCharCode(43,49,32,40,56,51,50,41,32,54,53,49,45,56,48,52,56)
    };
    
    // Track protected elements
    const protectedElements = new WeakMap();
    
    // DOM manipulation protection
    const domProtection = {
        init() {
            this.overrideInspectorMethods();
            this.setupVisualOverlay();
        },
        
        overrideInspectorMethods() {
            // Override getAttribute to show encrypted data in inspector
            const originalGetAttribute = Element.prototype.getAttribute;
            Element.prototype.getAttribute = function(name) {
                const result = originalGetAttribute.call(this, name);
                
                if (protectedElements.has(this)) {
                    const protection = protectedElements.get(this);
                    
                    if (name === 'href' && protection.type === 'email') {
                        return 'mailto:' + encryptedDisplay.email;
                    } else if (name === 'href' && protection.type === 'phone') {
                        return 'tel:' + encryptedDisplay.phone;
                    }
                }
                
                return result;
            };
            
            // Override innerHTML to show encrypted content
            const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
            Object.defineProperty(Element.prototype, 'innerHTML', {
                get: function() {
                    let content = originalInnerHTML.get.call(this);
                    
                    if (protectedElements.has(this)) {
                        // For protected elements, return only the encrypted span content
                        const encryptedSpan = this.querySelector('.encrypted-content');
                        if (encryptedSpan) {
                            return encryptedSpan.outerHTML;
                        }
                    }
                    
                    // Replace real contact data with encrypted in innerHTML
                    content = content.replace(new RegExp(realContacts.email, 'g'), encryptedDisplay.email);
                    content = content.replace(new RegExp(realContacts.phone.replace(/[+\-\(\)\s]/g, '\\$&'), 'g'), encryptedDisplay.phone);
                    
                    return content;
                },
                set: originalInnerHTML.set
            });
            
            // Override outerHTML to show encrypted content
            const originalOuterHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'outerHTML');
            Object.defineProperty(Element.prototype, 'outerHTML', {
                get: function() {
                    let content = originalOuterHTML.get.call(this);
                    
                    if (protectedElements.has(this)) {
                        const protection = protectedElements.get(this);
                        // Return element with only encrypted content
                        const tagName = this.tagName.toLowerCase();
                        const className = this.className;
                        const href = protection.type === 'email' ? 'mailto:' + encryptedDisplay.email : 'tel:' + encryptedDisplay.phone;
                        return `<${tagName} class="${className}" href="${href}" data-contact="${protection.type}" data-contact-protected="${protection.type}">${encryptedDisplay[protection.type]}</${tagName}>`;
                    }
                    
                    // Replace real contact data with encrypted in outerHTML
                    content = content.replace(new RegExp(realContacts.email, 'g'), encryptedDisplay.email);
                    content = content.replace(new RegExp(realContacts.phone.replace(/[+\-\(\)\s]/g, '\\$&'), 'g'), encryptedDisplay.phone);
                    
                    return content;
                },
                set: originalOuterHTML.set
            });
            
            // Override textContent to show encrypted data in inspector
            const originalTextContent = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent');
            Object.defineProperty(Node.prototype, 'textContent', {
                get: function() {
                    if (protectedElements.has(this)) {
                        const protection = protectedElements.get(this);
                        
                        // For buttons, keep original text for users
                        if (protection.isButton) {
                            return protection.originalText;
                        } else {
                            // For regular links, always return encrypted for inspector queries
                            // The visual display is handled by CSS and the real-content span
                            return encryptedDisplay[protection.type];
                        }
                    }
                    
                    let content = originalTextContent.get.call(this);
                    
                    // Replace any remaining real contact data
                    content = content.replace(new RegExp(realContacts.email, 'g'), encryptedDisplay.email);
                    content = content.replace(new RegExp(realContacts.phone.replace(/[+\-\(\)\s]/g, '\\$&'), 'g'), encryptedDisplay.phone);
                    
                    return content;
                },
                set: originalTextContent.set
            });
        },
        
        setupVisualOverlay() {
            // Create visual overlay system for real display vs inspector display
            const style = document.createElement('style');
            style.textContent = `
                .contact-overlay {
                    position: relative;
                    display: inline-block;
                }
                .contact-overlay .encrypted-content {
                    opacity: 0;
                    position: absolute;
                    z-index: -1;
                }
                .contact-overlay .real-content {
                    position: relative;
                    z-index: 1;
                    background: inherit;
                    color: inherit;
                    display: inline-block;
                }
            `;
            document.head.appendChild(style);
        }
    };
    
    // Contact protection manager
    const contactProtection = {
        init() {
            domProtection.init();
            
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.protectContacts());
            } else {
                this.protectContacts();
            }
            
            this.setupAntiInspection();
        },
        
        protectContacts() {
            // Replace contact elements with protected versions
            document.querySelectorAll('a[data-contact]').forEach(link => {
                this.protectElement(link);
            });
            
            this.setupClickHandlers();
        },
        
        protectElement(element) {
            const type = element.getAttribute('data-contact');
            const isButton = element.classList.contains('btn') || 
                           element.classList.contains('button') ||
                           element.closest('.hero-buttons') ||
                           element.closest('.cta-buttons');
            
            // Store protection info
            protectedElements.set(element, {
                type: type,
                isButton: isButton,
                originalText: element.textContent,
                originalHref: element.href
            });
            
            if (isButton) {
                // For buttons, keep the button text but protect the href
                element.href = '#';
                element.setAttribute('data-encrypted-href', 'mailto:' + encryptedDisplay.email);
            } else {
                // For regular links, create dual-layer system
                element.classList.add('contact-overlay');
                
                // Clear existing content
                element.innerHTML = '';
                
                // Add visible real content span
                const realSpan = document.createElement('span');
                realSpan.className = 'real-content';
                realSpan.textContent = realContacts[type];
                element.appendChild(realSpan);
                
                // Add hidden encrypted content span (for DOM inspection)
                const encryptedSpan = document.createElement('span');
                encryptedSpan.className = 'encrypted-content';
                encryptedSpan.textContent = encryptedDisplay[type];
                element.appendChild(encryptedSpan);
                
                // Set encrypted href for inspector
                element.href = type === 'email' ? 'mailto:' + encryptedDisplay[type] : 'tel:' + encryptedDisplay[type];
            }
            
            element.setAttribute('data-contact-protected', type);
        },
        
        setupClickHandlers() {
            document.addEventListener('click', (e) => {
                if (protectedElements.has(e.target)) {
                    e.preventDefault();
                    
                    const protection = protectedElements.get(e.target);
                    
                    if (protection.type === 'email') {
                        window.location.href = 'mailto:' + realContacts.email;
                    } else if (protection.type === 'phone') {
                        window.location.href = 'tel:' + realContacts.phone;
                    }
                }
            });
        },
        
        setupAntiInspection() {
            // Detect developer tools
            let devtools = false;
            
            // Method 1: Console detection
            setInterval(() => {
                const start = performance.now();
                debugger;
                const end = performance.now();
                
                if (end - start > 100) {
                    devtools = true;
                    this.enhanceProtection();
                }
            }, 3000);
            
            // Method 2: Right-click detection
            document.addEventListener('contextmenu', (e) => {
                if (protectedElements.has(e.target)) {
                    e.preventDefault();
                    this.enhanceProtection();
                    return false;
                }
            });
            
            // Method 3: Key combination detection
            document.addEventListener('keydown', (e) => {
                if (e.key === 'F12' || 
                    (e.ctrlKey && e.shiftKey && e.key === 'I') ||
                    (e.ctrlKey && e.key === 'u')) {
                    devtools = true;
                    this.enhanceProtection();
                }
            });
        },
        
        enhanceProtection() {
            // When developer tools detected, ensure all contact data is encrypted
            protectedElements.forEach((protection, element) => {
                if (!protection.isButton) {
                    element.textContent = encryptedDisplay[protection.type];
                    element.href = protection.type === 'email' ? 
                        'mailto:' + encryptedDisplay[protection.type] : 
                        'tel:' + encryptedDisplay[protection.type];
                }
            });
        }
    };
    
    // Initialize protection
    contactProtection.init();
    
    // Cleanup
    setTimeout(() => {
        document.querySelectorAll('script').forEach(script => {
            if (script.src && script.src.includes('contact-protection.js')) {
                script.remove();
            }
        });
    }, 5000);
    
})();