// Persian Voice Payment Assistant - Frontend Logic

class PersianVoiceAssistant {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.sessionId = this.generateSessionId();
        this.currentTranscript = '';
        this.lastLoggedTime = -1;
        this.userToken = null;
        this.userId = null;
        this.savedCards = [];
        this.cardCollectionMode = false;
        this.cardData = {};
        this.waitingForCardConfirmation = false;
        this.currentCardField = null; // 'cardNumber', 'cvv2', 'expireMonth', 'expireYear'
        
        this.initToken();
        this.initElements();
        this.initSpeechRecognition();
        this.bindEvents();
        this.loadUserData();
    }

    initToken() {
        // Get token from URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        let token = urlParams.get('token');

        // If no token in URL, check localStorage
        if (!token) {
            token = localStorage.getItem('userToken');
        }

        // If still no token, generate new 16-character token
        if (!token || token.length !== 16) {
            token = this.generateToken();
            // Update URL with new token
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('token', token);
            window.history.replaceState({}, '', newUrl);
        }

        // Store token
        this.userToken = token;
        localStorage.setItem('userToken', token);
        console.log('User token:', token.substring(0, 4) + '...');
    }

    generateToken() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let token = '';
        for (let i = 0; i < 16; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return token;
    }

    async loadUserData() {
        try {
            console.log('Loading user data for token:', this.userToken.substring(0, 4) + '...');
            
            const response = await fetch(`/api/user?token=${this.userToken}`);
            const data = await response.json();

            if (data.success) {
                this.userId = data.user.id;
                console.log('User loaded:', data.user);
                console.log('Card count:', data.card_count);
                console.log('Transaction count:', data.transaction_count);

                // Display saved cards
                if (data.cards && data.cards.length > 0) {
                    this.savedCards = data.cards;
                    this.displayCards();
                }

                // Display transaction history
                if (data.transactions && data.transactions.length > 0) {
                    this.displayTransactionHistory(data.transactions);
                }

                this.speak('سلام! من دستیار پرداخت صوتی هستم. آماده کمک به شما می‌باشم.');
            } else {
                console.error('Failed to load user:', data.error);
                this.speak('سلام! من دستیار پرداخت صوتی هستم. آماده کمک به شما می‌باشم.');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            this.speak('سلام! من دستیار پرداخت صوتی هستم. آماده کمک به شما می‌باشم.');
        }
    }

    displayTransactionHistory(transactions) {
        this.paymentLog.innerHTML = '';
        
        transactions.forEach(tx => {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.innerHTML = `
                <div class="log-time">${new Date(tx.timestamp).toLocaleString('fa-IR')}</div>
                <div class="log-details">
                    💳 کارت: ${tx.card_number} | 💰 مبلغ: ${tx.amount.toLocaleString('fa-IR')} ${tx.currency}
                </div>
                ${tx.voice_transcript ? `<div class="log-transcript">📝 ${tx.voice_transcript}</div>` : ''}
            `;
            this.paymentLog.appendChild(logEntry);
        });
    }

    initElements() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.testBtn = document.getElementById('testBtn');
        this.testApiBtn = document.getElementById('testApiBtn');
        this.addCardBtn = document.getElementById('addCardBtn');
        this.statusText = document.getElementById('statusText');
        this.statusIndicator = document.getElementById('statusIndicator').querySelector('.pulse');
        this.transcriptBox = document.getElementById('transcript');
        this.responseBox = document.getElementById('response');
        this.paymentLog = document.getElementById('paymentLog');
        this.cardsContainer = document.getElementById('savedCards');
    }

    initSpeechRecognition() {
        // Check for browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            this.showError('مرورگر شما از تشخیص گفتار پشتیبانی نمی‌کند. لطفا از Chrome یا Edge استفاده کنید.');
            return;
        }

        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'fa-IR'; // Persian language
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        // Event handlers
        this.recognition.onstart = () => {
            console.log('Speech recognition started');
            this.updateStatus('در حال گوش دادن...', 'listening');
        };

        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('Transcript:', transcript);
            this.currentTranscript = transcript;
            this.transcriptBox.textContent = transcript;
            this.processCommand(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.updateStatus('خطا در تشخیص گفتار', 'error');
            this.showError(`خطا: ${event.error}`);
            this.stopListening();
        };

        this.recognition.onend = () => {
            console.log('Speech recognition ended');
            if (this.isListening) {
                this.stopListening();
            }
        };
    }

    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startListening());
        this.stopBtn.addEventListener('click', () => this.stopListening());
        this.testBtn.addEventListener('click', () => this.testAudio());
        this.testApiBtn.addEventListener('click', () => this.testApiConnection());
        
        // Add card button
        if (this.addCardBtn) {
            this.addCardBtn.addEventListener('click', () => this.startCardCollection());
        }
    }

    async testApiConnection() {
        console.log('=== API CONNECTION TEST STARTED ===');
        this.testApiBtn.disabled = true;
        this.transcriptBox.textContent = 'در حال تست اتصال API...';
        this.responseBox.textContent = 'لطفا صبر کنید...';
        
        try {
            const response = await fetch('/api/test-elevenlabs');
            const result = await response.json();
            
            console.log('API Test Result:', result);
            
            if (result.success) {
                this.transcriptBox.textContent = '✅ اتصال موفق';
                this.responseBox.textContent = `API کار می‌کند!\n` +
                    `تعداد صداها: ${result.tests.voiceCount}\n` +
                    `صدای Jessica: ${result.tests.jessicaVoiceFound ? 'موجود' : 'نا موجود'}\n` +
                    `اعتبار: ${result.userData.subscription?.tier || 'N/A'}\n` +
                    `کاراکترهای باقیمانده: ${result.userData.character_count}/${result.userData.character_limit}`;
            } else {
                this.transcriptBox.textContent = '❌ خطا در اتصال';
                this.responseBox.textContent = `خطا: ${result.error}\n${result.details || ''}`;
            }
        } catch (error) {
            console.error('API Test Error:', error);
            this.transcriptBox.textContent = '❌ خطا';
            this.responseBox.textContent = `خطا: ${error.message}`;
        } finally {
            this.testApiBtn.disabled = false;
        }
    }

    async testAudio() {
        console.log('=== AUDIO TEST STARTED ===');
        this.testBtn.disabled = true;
        
        // Test 1: Simple text-to-speech
        const testText = 'سلام! این یک تست صوتی است. آیا صدای من را می‌شنوید؟';
        this.transcriptBox.textContent = 'تست: ' + testText;
        
        console.log('Test text:', testText);
        
        try {
            await this.speak(testText);
            console.log('=== AUDIO TEST COMPLETED SUCCESSFULLY ===');
        } catch (error) {
            console.error('=== AUDIO TEST FAILED ===', error);
        } finally {
            this.testBtn.disabled = false;
        }
    }

    startListening() {
        if (!this.recognition) {
            this.showError('تشخیص گفتار در دسترس نیست');
            return;
        }

        try {
            this.recognition.start();
            this.isListening = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
        } catch (error) {
            console.error('Error starting recognition:', error);
            this.showError('خطا در شروع تشخیص گفتار');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        this.isListening = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.updateStatus('آماده شنیدن', 'ready');
    }

    async processCommand(transcript) {
        // Handle card collection mode first
        if (this.cardCollectionMode) {
            await this.handleCardCollection(transcript);
            return;
        }

        // Simple payment detection (looking for keywords)
        const lowerTranscript = transcript.toLowerCase();
        
        // Check if it's a payment command
        if (this.containsPaymentKeywords(lowerTranscript)) {
            // Check if user has saved cards first
            const hasCards = await this.checkCardsBeforePayment();
            if (!hasCards) {
                return; // Card collection will start automatically
            }

            const paymentData = this.extractPaymentInfo(transcript);
            
            if (paymentData) {
                await this.processPayment(paymentData);
            } else {
                await this.speak('متاسفم، نتوانستم اطلاعات پرداخت را شناسایی کنم. لطفا شماره کارت و مبلغ را واضح بگویید.');
            }
        } else {
            // General conversation
            await this.speak('برای پرداخت آنلاین، لطفا بگویید: پرداخت آنلاین، شماره کارت و مبلغ مورد نظر.');
        }
    }

    containsPaymentKeywords(text) {
        const keywords = ['پرداخت', 'کارت', 'مبلغ', 'تومان', 'ریال', 'آنلاین'];
        return keywords.some(keyword => text.includes(keyword));
    }

    extractPaymentInfo(transcript) {
        // Extract card number (looking for sequences of digits)
        const cardMatch = transcript.match(/(\d[\s\d]{10,})/);
        let cardNumber = cardMatch ? cardMatch[0].replace(/\s/g, '') : null;
        
        // If no digits found, try Persian numbers
        if (!cardNumber) {
            // For now, use a mock card number
            cardNumber = '1234567890123456';
        }

        // Extract amount (looking for numbers before تومان or ریال)
        const amountMatch = transcript.match(/(\d+)\s*(هزار|میلیون)?\s*(تومان|ریال)/);
        let amount = amountMatch ? parseInt(amountMatch[1]) : null;
        
        if (amount && amountMatch[2] === 'هزار') {
            amount *= 1000;
        } else if (amount && amountMatch[2] === 'میلیون') {
            amount *= 1000000;
        }

        // If no amount found, use a default for testing
        if (!amount) {
            amount = 100000;
        }

        if (cardNumber || amount) {
            return {
                cardNumber: cardNumber,
                amount: amount,
                currency: 'IRR',
                transcript: transcript
            };
        }

        return null;
    }

    async processPayment(paymentData) {
        this.updateStatus('در حال پردازش پرداخت...', 'speaking');

        try {
            // Mask card number (show only last 4 digits)
            const maskedCard = '****' + paymentData.cardNumber.slice(-4);

            // Log payment to backend
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({                    token: this.userToken,                    cardNumber: maskedCard,
                    amount: paymentData.amount,
                    currency: paymentData.currency,
                    transcript: paymentData.transcript,
                    sessionId: this.sessionId
                })
            });

            if (!response.ok) {
                throw new Error('Failed to log payment');
            }

            const result = await response.json();
            console.log('Payment logged:', result);

            // Add to local log
            this.addPaymentToLog({
                ...paymentData,
                cardNumber: maskedCard,
                timestamp: new Date().toISOString()
            });

            // Speak confirmation
            const confirmationMessage = `پرداخت شما با موفقیت ثبت شد. کارت شماره ${maskedCard} به مبلغ ${this.formatAmount(paymentData.amount)} تومان.`;
            await this.speak(confirmationMessage);
            this.responseBox.textContent = confirmationMessage;

            this.updateStatus('پرداخت ثبت شد ✓', 'ready');

        } catch (error) {
            console.error('Payment processing error:', error);
            const errorMessage = 'متاسفم، خطایی در ثبت پرداخت رخ داد. لطفا دوباره تلاش کنید.';
            await this.speak(errorMessage);
            this.responseBox.textContent = errorMessage;
            this.updateStatus('خطا در ثبت پرداخت', 'error');
        }
    }

    async speak(text) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔊 SPEAK FUNCTION CALLED');
        console.log('Text to speak:', text);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        this.updateStatus('در حال صحبت...', 'speaking');
        this.responseBox.textContent = text;

        try {
            console.log('📡 Step 1: Calling TTS API...');
            console.log('Endpoint: /api/elevenlabs');
            console.log('Method: POST');
            console.log('Body:', JSON.stringify({ text: text.substring(0, 50) + '...' }));
            
            const fetchStartTime = Date.now();
            
            // Call ElevenLabs TTS API through our Pages Function
            const response = await fetch('/api/elevenlabs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            const fetchEndTime = Date.now();
            console.log(`⏱️ Fetch took ${fetchEndTime - fetchStartTime}ms`);
            console.log('📨 Step 2: Response received');
            console.log('Status:', response.status, response.statusText);
            console.log('Response OK:', response.ok);
            console.log('Response headers:', {
                'content-type': response.headers.get('content-type'),
                'content-length': response.headers.get('content-length'),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error Response:', errorText);
                throw new Error(`TTS request failed: ${response.status} - ${errorText}`);
            }

            console.log('✅ Step 3: Converting response to blob...');
            const audioBlob = await response.blob();
            console.log('📦 Audio blob created:');
            console.log('  - Size:', audioBlob.size, 'bytes');
            console.log('  - Type:', audioBlob.type);
            console.log('  - Valid:', audioBlob.size > 0);
            
            if (audioBlob.size === 0) {
                throw new Error('Received empty audio blob from server');
            }

            console.log('🔗 Step 4: Creating object URL...');
            const audioUrl = URL.createObjectURL(audioBlob);
            console.log('Object URL:', audioUrl);
            
            console.log('🎵 Step 5: Creating Audio element...');
            const audio = new Audio(audioUrl);
            
            console.log('Audio element created:', {
                src: audio.src,
                readyState: audio.readyState,
                networkState: audio.networkState
            });

            return new Promise((resolve, reject) => {
                let hasResolved = false;

                const cleanup = () => {
                    if (!hasResolved) {
                        hasResolved = true;
                        URL.revokeObjectURL(audioUrl);
                        console.log('🧹 Cleaned up object URL');
                    }
                };

                audio.onloadedmetadata = () => {
                    console.log('📊 Audio metadata loaded:');
                    console.log('  - Duration:', audio.duration, 'seconds');
                    console.log('  - Ready state:', audio.readyState);
                };

                audio.onloadeddata = () => {
                    console.log('📥 Audio data loaded successfully');
                };

                audio.oncanplay = () => {
                    console.log('✅ Audio can start playing');
                };

                audio.onplay = () => {
                    console.log('▶️ Audio playback started');
                };

                audio.onplaying = () => {
                    console.log('🎶 Audio is now playing');
                };

                audio.ontimeupdate = () => {
                    // Log every second
                    if (Math.floor(audio.currentTime) !== this.lastLoggedTime) {
                        this.lastLoggedTime = Math.floor(audio.currentTime);
                        console.log(`⏰ Playing: ${audio.currentTime.toFixed(2)}s / ${audio.duration.toFixed(2)}s`);
                    }
                };

                audio.onended = () => {
                    console.log('✅ Audio playback completed');
                    cleanup();
                    this.updateStatus('آماده شنیدن', 'ready');
                    resolve();
                };

                audio.onerror = (e) => {
                    console.error('❌ Audio playback error event:', e);
                    console.error('Audio error details:', {
                        error: audio.error,
                        code: audio.error?.code,
                        message: audio.error?.message,
                        readyState: audio.readyState,
                        networkState: audio.networkState
                    });
                    cleanup();
                    this.updateStatus('خطا در پخش صدا', 'error');
                    reject(new Error(`Audio error: ${audio.error?.message || 'Unknown error'}`));
                };

                audio.onpause = () => {
                    console.log('⏸️ Audio paused');
                };

                audio.onstalled = () => {
                    console.warn('⚠️ Audio stalled');
                };

                audio.onsuspend = () => {
                    console.log('💤 Audio suspended');
                };

                console.log('🎬 Step 6: Attempting to play audio...');
                audio.play().then(() => {
                    console.log('✅ audio.play() promise resolved - playback started successfully');
                }).catch(error => {
                    console.error('❌ audio.play() promise rejected:', error);
                    console.error('Error details:', {
                        name: error.name,
                        message: error.message,
                        stack: error.stack
                    });
                    
                    // Check if it's autoplay policy
                    if (error.name === 'NotAllowedError') {
                        console.error('🚫 Autoplay blocked by browser policy');
                        alert('🔊 لطفا برای پخش صدا، دکمه تست صدا را دوباره کلیک کنید.\n\nمرورگر پخش خودکار را مسدود کرده است.');
                    }
                    
                    cleanup();
                    this.updateStatus('آماده شنیدن', 'ready');
                    reject(error);
                });
            });

        } catch (error) {
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('❌ SPEAK FUNCTION ERROR');
            console.error('Error:', error);
            console.error('Error type:', error.constructor.name);
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            this.updateStatus('آماده شنیدن', 'ready');
            throw error;
        }
    }

    addPaymentToLog(payment) {
        const paymentItem = document.createElement('div');
        paymentItem.className = 'payment-item';
        
        const time = new Date(payment.timestamp).toLocaleString('fa-IR');
        
        paymentItem.innerHTML = `
            <div class="time">⏰ ${time}</div>
            <div class="details">
                💳 کارت: ${payment.cardNumber}<br>
                💰 مبلغ: ${this.formatAmount(payment.amount)} تومان<br>
                📝 متن: ${payment.transcript}
            </div>
        `;
        
        this.paymentLog.insertBefore(paymentItem, this.paymentLog.firstChild);
    }

    formatAmount(amount) {
        return new Intl.NumberFormat('fa-IR').format(amount);
    }

    updateStatus(text, state = 'ready') {
        this.statusText.textContent = text;
        this.statusIndicator.className = 'pulse';
        
        if (state === 'listening') {
            this.statusIndicator.classList.add('listening');
        } else if (state === 'speaking') {
            this.statusIndicator.classList.add('speaking');
        }
    }

    showError(message) {
        this.responseBox.textContent = `❌ ${message}`;
        console.error(message);
    }

    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // ========== Card Management Methods ==========

    displayCards() {
        if (!this.cardsContainer) return;
        
        this.cardsContainer.innerHTML = '';
        
        if (this.savedCards.length === 0) {
            this.cardsContainer.innerHTML = '<p class="no-cards">هیچ کارتی ذخیره نشده است</p>';
            return;
        }
        
        this.savedCards.forEach(card => {
            const cardEl = document.createElement('div');
            cardEl.className = 'saved-card';
            cardEl.innerHTML = `
                <div class="card-info">
                    <span class="card-number">**** **** **** ${card.last_four}</span>
                    <span class="card-expiry">انقضا: ${card.expire_month}/${card.expire_year}</span>
                    ${card.card_name ? `<span class="card-name">${card.card_name}</span>` : ''}
                    ${card.is_default ? '<span class="badge">پیش‌فرض</span>' : ''}
                </div>
                <button class="delete-card-btn" data-id="${card.id}">🗑️</button>
            `;
            this.cardsContainer.appendChild(cardEl);
        });
        
        // Add delete handlers
        document.querySelectorAll('.delete-card-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteCard(e.target.dataset.id);
            });
        });
    }

    startCardCollection() {
        this.cardCollectionMode = true;
        this.cardData = {};
        this.waitingForCardConfirmation = false;
        this.currentCardField = 'cardNumber';
        // Example for agent: 1234 5678 9012 3456 - but don't say this to user
        this.speak('برای افزودن کارت جدید، لطفا شماره کارت ۱۶ رقمی خود را بگویید');
        this.updateStatus('در انتظار شماره کارت', 'listening');
    }

    async handleCardCollection(transcript) {
        // If waiting for confirmation
        if (this.waitingForCardConfirmation) {
            if (transcript.includes('بله') || transcript.includes('تایید') || transcript.includes('آره')) {
                await this.saveCard(this.cardData);
                this.cardCollectionMode = false;
                this.waitingForCardConfirmation = false;
                this.currentCardField = null;
                return;
            } else if (transcript.includes('خیر') || transcript.includes('نه')) {
                this.cardCollectionMode = false;
                this.waitingForCardConfirmation = false;
                this.cardData = {};
                this.currentCardField = null;
                await this.speak('عملیات لغو شد');
                return;
            }
        }

        // Try to extract all card info at once from the transcript
        const extracted = this.extractCardInfo(transcript);
        
        // If user is providing specific field based on context
        if (this.currentCardField) {
            // Extract based on what we're asking for
            if (this.currentCardField === 'cardNumber' && extracted.cardNumber) {
                this.cardData.cardNumber = extracted.cardNumber;
                console.log('Captured card number:', this.cardData.cardNumber);
            } else if (this.currentCardField === 'cvv2' && extracted.cvv2) {
                this.cardData.cvv2 = extracted.cvv2;
                console.log('Captured CVV2:', this.cardData.cvv2);
            } else if (this.currentCardField === 'expireMonth' && extracted.expireMonth) {
                this.cardData.expireMonth = extracted.expireMonth;
                console.log('Captured expire month:', this.cardData.expireMonth);
            } else if (this.currentCardField === 'expireYear' && extracted.expireYear) {
                this.cardData.expireYear = extracted.expireYear;
                console.log('Captured expire year:', this.cardData.expireYear);
            }
        } else {
            // User might be providing all data at once - try to extract everything
            if (extracted.cardNumber) this.cardData.cardNumber = extracted.cardNumber;
            if (extracted.cvv2) this.cardData.cvv2 = extracted.cvv2;
            if (extracted.expireMonth) this.cardData.expireMonth = extracted.expireMonth;
            if (extracted.expireYear) this.cardData.expireYear = extracted.expireYear;
            console.log('Extracted all-at-once:', this.cardData);
        }
        
        // Now check what's missing and ask for next field with context
        if (!this.cardData.cardNumber) {
            this.currentCardField = 'cardNumber';
            // Example for agent: 1234 5678 9012 3456 - but don't say this to user
            await this.speak('لطفا شماره کارت ۱۶ رقمی خود را بگویید');
            this.updateStatus('در انتظار شماره کارت', 'listening');
            return;
        }
        
        if (!this.cardData.cvv2) {
            this.currentCardField = 'cvv2';
            const lastFour = this.readDigitByDigit(this.cardData.cardNumber.slice(-4));
            // CVV2 is 3 or 4 digits - agent understands this but don't give example to user
            const msg = `بسیار خوب. شماره کارت با اعداد آخر ${lastFour} ثبت شد. حالا لطفا کد امنیتی سه یا چهار رقمی پشت کارت را بگویید`;
            await this.speak(msg);
            this.updateStatus('در انتظار CVV2', 'listening');
            return;
        }
        
        if (!this.cardData.expireMonth) {
            this.currentCardField = 'expireMonth';
            const cvv = this.readDigitByDigit(this.cardData.cvv2);
            // Month should be 01-12, two digits - agent understands but don't give example
            const msg = `عالی. کد امنیتی ${cvv} ثبت شد. حالا لطفا ماه انقضای کارت را دو رقمی بگویید`;
            await this.speak(msg);
            this.updateStatus('در انتظار ماه انقضا', 'listening');
            return;
        }
        
        if (!this.cardData.expireYear) {
            this.currentCardField = 'expireYear';
            const month = this.readDigitByDigit(this.cardData.expireMonth);
            // Year should be 2 digits - agent understands but don't give example
            const msg = `خوب. ماه ${month} ثبت شد. حالا لطفا سال انقضای کارت را دو رقمی بگویید`;
            await this.speak(msg);
            this.updateStatus('در انتظار سال انقضا', 'listening');
            return;
        }
        
        // All data collected - read back with full context for confirmation
        this.currentCardField = null;
        const lastFour = this.readDigitByDigit(this.cardData.cardNumber.slice(-4));
        const cvv = this.readDigitByDigit(this.cardData.cvv2);
        const month = this.readDigitByDigit(this.cardData.expireMonth);
        const year = this.readDigitByDigit(this.cardData.expireYear);
        
        const confirmMsg = `اطلاعات کارت شما کامل شد. اجازه بدهید بررسی کنم: 
                           شماره کارت با اعداد آخر ${lastFour}، 
                           کد امنیتی سی وی وی دو ${cvv}، 
                           تاریخ انقضا ماه ${month} سال ${year}. 
                           آیا این اطلاعات را تایید می‌کنید؟ لطفا بله یا خیر بگویید.`;
        
        await this.speak(confirmMsg);
        this.updateStatus('در انتظار تایید', 'listening');
        this.waitingForCardConfirmation = true;
    }

    extractCardInfo(text) {
        const info = {};
        
        // Remove extra spaces
        const cleanText = text.trim();
        
        // Extract 16-digit card number (with or without spaces)
        // Try multiple patterns to catch different speech recognition outputs
        const cardPatterns = [
            /(\d{16})/,                                    // 1234567890123456
            /(\d{4}\s*\d{4}\s*\d{4}\s*\d{4})/,           // 1234 5678 9012 3456
            /(\d{4}-\d{4}-\d{4}-\d{4})/,                 // 1234-5678-9012-3456
        ];
        
        for (const pattern of cardPatterns) {
            const cardMatch = cleanText.match(pattern);
            if (cardMatch) {
                const digits = cardMatch[0].replace(/[^0-9]/g, '');
                if (digits.length === 16) {
                    info.cardNumber = digits;
                    break;
                }
            }
        }
        
        // If we're specifically asking for card number and got 16 digits anywhere in text
        if (!info.cardNumber && this.currentCardField === 'cardNumber') {
            const allDigits = cleanText.replace(/[^0-9]/g, '');
            if (allDigits.length === 16) {
                info.cardNumber = allDigits;
            }
        }
        
        // Extract CVV2 (3-4 digits) - multiple patterns
        const cvvPatterns = [
            /(?:سی\s*وی\s*وی|cvv|سیویتو|امنیتی)\s*:?\s*(\d{3,4})/i,
            /(\d{3,4})\s*(?:cvv|سیویتو)/i
        ];
        for (const pattern of cvvPatterns) {
            const match = cleanText.match(pattern);
            if (match) {
                info.cvv2 = match[1];
                break;
            }
        }
        
        // If we're specifically looking for CVV2 and got a 3-4 digit number alone
        if (!info.cvv2 && this.currentCardField === 'cvv2') {
            const standaloneMatch = cleanText.match(/^(\d{3,4})$/);
            if (standaloneMatch) {
                info.cvv2 = standaloneMatch[1];
            }
        }
        
        // Extract expire month (01-12)
        const monthPatterns = [
            /(?:ماه|month)\s*:?\s*(\d{1,2})/i,
            /(\d{1,2})\s*(?:ماه|month)/i
        ];
        for (const pattern of monthPatterns) {
            const match = cleanText.match(pattern);
            if (match) {
                const month = parseInt(match[1]);
                if (month >= 1 && month <= 12) {
                    info.expireMonth = month.toString().padStart(2, '0');
                    break;
                }
            }
        }
        
        // If we're specifically looking for month and got a 1-2 digit number
        if (!info.expireMonth && this.currentCardField === 'expireMonth') {
            const standaloneMatch = cleanText.match(/^(\d{1,2})$/);
            if (standaloneMatch) {
                const month = parseInt(standaloneMatch[1]);
                if (month >= 1 && month <= 12) {
                    info.expireMonth = month.toString().padStart(2, '0');
                }
            }
        }
        
        // Extract expire year (2 digits)
        const yearPatterns = [
            /(?:سال|year)\s*:?\s*(\d{2})/i,
            /(\d{2})\s*(?:سال|year)/i
        ];
        for (const pattern of yearPatterns) {
            const match = cleanText.match(pattern);
            if (match) {
                info.expireYear = match[1];
                break;
            }
        }
        
        // If we're specifically looking for year and got a 2 digit number
        if (!info.expireYear && this.currentCardField === 'expireYear') {
            const standaloneMatch = cleanText.match(/^(\d{2})$/);
            if (standaloneMatch) {
                info.expireYear = standaloneMatch[1];
            }
        }
        
        return info;
    }

    maskCardNumber(cardNumber) {
        if (!cardNumber || cardNumber.length < 4) return '****';
        return '**** **** **** ' + cardNumber.slice(-4);
    }

    readDigitByDigit(number) {
        // Convert number to Persian digit-by-digit reading
        const persianDigits = {
            '0': 'صفر',
            '1': 'یک',
            '2': 'دو',
            '3': 'سه',
            '4': 'چهار',
            '5': 'پنج',
            '6': 'شش',
            '7': 'هفت',
            '8': 'هشت',
            '9': 'نه'
        };
        
        return String(number).split('').map(digit => persianDigits[digit] || digit).join(' ');
    }

    readCardNumberGrouped(cardNumber) {
        // Read card number in 4-digit groups
        if (!cardNumber || cardNumber.length !== 16) return '';
        
        const groups = [
            cardNumber.slice(0, 4),
            cardNumber.slice(4, 8),
            cardNumber.slice(8, 12),
            cardNumber.slice(12, 16)
        ];
        
        return groups.map(group => this.readDigitByDigit(group)).join('، ');
    }

    async saveCard(cardData) {
        try {
            console.log('Saving card...');
            
            const response = await fetch('/api/cards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: this.userToken,
                    cardNumber: cardData.cardNumber,
                    cvv2: cardData.cvv2,
                    expireMonth: cardData.expireMonth,
                    expireYear: cardData.expireYear,
                    cardName: cardData.cardName || null,
                    setAsDefault: this.savedCards.length === 0
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                await this.speak('کارت شما با موفقیت ذخیره شد');
                // Reload cards
                const userData = await fetch(`/api/user?token=${this.userToken}`);
                const data = await userData.json();
                if (data.success && data.cards) {
                    this.savedCards = data.cards;
                    this.displayCards();
                }
                this.cardCollectionMode = false;
                this.cardData = {};
            } else {
                await this.speak('خطا در ذخیره کارت: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving card:', error);
            await this.speak('خطا در ذخیره کارت');
        }
    }

    async deleteCard(cardId) {
        if (!confirm('آیا از حذف این کارت اطمینان دارید؟')) {
            return;
        }

        try {
            const response = await fetch(`/api/cards?token=${this.userToken}&id=${cardId}`, {
                method: 'DELETE'
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Reload cards
                const userData = await fetch(`/api/user?token=${this.userToken}`);
                const data = await userData.json();
                if (data.success && data.cards) {
                    this.savedCards = data.cards;
                    this.displayCards();
                }
                await this.speak('کارت حذف شد');
            } else {
                await this.speak('خطا در حذف کارت');
            }
        } catch (error) {
            console.error('Error deleting card:', error);
            await this.speak('خطا در حذف کارت');
        }
    }

    async checkCardsBeforePayment() {
        if (this.savedCards.length === 0) {
            await this.speak('شما هیچ کارتی ذخیره نکرده‌اید. ابتدا باید یک کارت اضافه کنید. لطفا اطلاعات کارت خود را بگویید');
            this.startCardCollection();
            return false;
        }
        return true;
    }
}

// Initialize the assistant when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Persian Voice Assistant initializing...');
    window.assistant = new PersianVoiceAssistant();
});
