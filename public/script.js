// Persian Voice Payment Assistant - Frontend Logic

class PersianVoiceAssistant {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.sessionId = this.generateSessionId();
        this.currentTranscript = '';
        
        this.initElements();
        this.initSpeechRecognition();
        this.bindEvents();
        this.speak('سلام! من دستیار پرداخت صوتی هستم. آماده کمک به شما می‌باشم.');
    }

    initElements() {
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
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
        this.updateStatus('در حال صحبت...', 'speaking');
        this.responseBox.textContent = text;

        try {
            // Call ElevenLabs TTS API through our Pages Function
            const response = await fetch('/api/elevenlabs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error('TTS request failed');
            }

            // Get audio blob and play it
            const audioBlob = await response.blob();
            const audioUrl = URL.createObjectURL(audioBlob);
            const audio = new Audio(audioUrl);

            return new Promise((resolve) => {
                audio.onended = () => {
                    URL.revokeObjectURL(audioUrl);
                    this.updateStatus('آماده شنیدن', 'ready');
                    resolve();
                };
                audio.onerror = () => {
                    console.error('Audio playback error');
                    this.updateStatus('خطا در پخش صدا', 'error');
                    resolve();
                };
                audio.play().catch(error => {
                    console.error('Audio play error:', error);
                    // Browser might block autoplay
                    this.updateStatus('آماده شنیدن', 'ready');
                    resolve();
                });
            });

        } catch (error) {
            console.error('TTS error:', error);
            console.log('Fallback: Text displayed without audio');
            this.updateStatus('آماده شنیدن', 'ready');
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
