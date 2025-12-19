// Persian Voice Payment Assistant - Frontend Logic

class PersianVoiceAssistant {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.sessionId = this.generateSessionId();
        this.currentTranscript = '';
        this.lastLoggedTime = -1;
        
        this.initElements();
        this.initSpeechRecognition();
        this.bindEvents();
        this.speak('سلام! من دستیار پرداخت صوتی هستم. آماده کمک به شما می‌باشم.');
    }

    initElements() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.testBtn = document.getElementById('testBtn');
        this.testApiBtn = document.getElementById('testApiBtn');
        this.statusText = document.getElementById('statusText');
        this.statusIndicator = document.getElementById('statusIndicator').querySelector('.pulse');
        this.transcriptBox = document.getElementById('transcript');
        this.responseBox = document.getElementById('response');
        this.paymentLog = document.getElementById('paymentLog');
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
        // Simple payment detection (looking for keywords)
        const lowerTranscript = transcript.toLowerCase();
        
        // Check if it's a payment command
        if (this.containsPaymentKeywords(lowerTranscript)) {
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
                body: JSON.stringify({
                    cardNumber: maskedCard,
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
}

// Initialize the assistant when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Persian Voice Assistant initializing...');
    window.assistant = new PersianVoiceAssistant();
});
