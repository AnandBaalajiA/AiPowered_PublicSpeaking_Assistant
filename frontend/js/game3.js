function loadGame3() {
    const wordsPool = [
        "snacks", "microwave", "telescope", "umbrella", "bicycle", "dinner", "language", "smartphone", "coffee", "backpack",
        "nostalgia", "anxiety", "excitement", "curiosity", "determination", "frustration", "hope", "surprise", "gratitude", "confidence",
        "library", "vacation", "New York", "mountain", "classroom", "politics", "marketplace", "studio", "garden", "laboratory",
        "democracy", "innovation", "diversity", "plumber", "vote", "job"
    ];
    let selectedWords = [];
    let integratedWords = [];
    let sessionTranscripts = [];
    let timerSel = 35, timerInt, recognition;
    const container = document.getElementById('game-container');

    // Pick 5 random words for challenge this round
    selectedWords = [];
    while(selectedWords.length < 5) {
        let w = wordsPool[Math.floor(Math.random() * wordsPool.length)];
        if (!selectedWords.includes(w)) selectedWords.push(w);
    }

    container.innerHTML = `
        <div class="game-setup">
            <h2>Triple Step</h2>
            <div>Weave these words into your speech:</div>
            <ul id="word-list">
                ${selectedWords.map(w => `<li>${w}</li>`).join('')}
            </ul>
            <button id="start-step-btn" class="btn">Start</button>
        </div>
    `;

    document.getElementById('start-step-btn').onclick = () => startGame();

    function startGame() {
        integratedWords = [];
        sessionTranscripts = [];
        showPrompt();
    }

    function showPrompt() {
        container.innerHTML = `
            <div class="game-active">
                <div><strong>Weave these words:</strong> ${selectedWords.join(', ')}</div>
                <div>Stay on topic! Time left: <span id="countdown">${timerSel}</span>s</div>
                <div id="integration-log" style="background:#222;color:#0f0;padding:12px;margin-bottom:8px;min-height:2em;">Start speaking to see your words appear here...</div>
                <div id="word-status">Words woven in: <span style="color:#cbd5e1;">None yet</span></div>
                <div id="speech-status" style="color:#10b981;padding:8px 0;">🎤 Listening...</div>
                <button class="btn" id="end-step-btn">Finish</button>
            </div>
        `;

        let remaining = timerSel;
        document.getElementById('countdown').innerText = remaining;

        document.getElementById('end-step-btn').onclick = endGame;

        // Timer
        timerInt = setInterval(() => {
            remaining--;
            document.getElementById('countdown').innerText = remaining;
            if (remaining <= 0) {
                stopRecognition();
                endGame();
            }
        }, 1000);

        // Speech Recognition Setup
        let SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            document.getElementById('speech-status').innerHTML = 
                'Speech recognition not supported. Please type your speech below:';
            let inputBox = document.createElement('textarea');
            inputBox.placeholder = 'Type your speech here...';
            inputBox.style.width = "90%";
            inputBox.style.height = "60px";
            inputBox.addEventListener('input', function() {
                sessionTranscripts = [inputBox.value];
                // Check for integrated words
                selectedWords.forEach(word => {
                    if (
                        inputBox.value.toLowerCase().includes(word.toLowerCase())
                        && !integratedWords.includes(word)
                    ) {
                        integratedWords.push(word);
                    }
                });
                updateDisplay();
            });
            document.querySelector('.game-active').appendChild(inputBox);
            return;
        }

        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = function() {
            console.log('Game 3 speech recognition started');
            document.getElementById('speech-status').innerText = '🎤 Listening... Speak now!';
        };

        recognition.onresult = function(event) {
            console.log('Game 3 speech recognition result:', event);
            let transcript = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            transcript = transcript.trim();
            if (transcript) {
                console.log('Game 3 transcript captured:', transcript);
                sessionTranscripts.push(transcript);
                
                // Check for integration of challenge words
                selectedWords.forEach(word => {
                    if (
                        transcript.toLowerCase().includes(word.toLowerCase())
                        && !integratedWords.includes(word)
                    ) {
                        integratedWords.push(word);
                        console.log('Word integrated:', word);
                    }
                });
                updateDisplay();
            }
        };

        recognition.onerror = function(event) {
            console.error('Game 3 speech recognition error:', event.error);
            document.getElementById('speech-status').innerText = `Speech recognition error: ${event.error}`;
        };

        recognition.onend = function() {
            console.log('Game 3 speech recognition ended');
            // Don't automatically call stopRecognition here as it may cause loops
        };

        try {
            recognition.start();
            console.log('Game 3 speech recognition start attempted');
        } catch (e) {
            console.error('Failed to start speech recognition:', e);
        }

        function stopRecognition() {
            clearInterval(timerInt);
            if (recognition) {
                try { 
                    recognition.stop(); 
                    console.log('Game 3 speech recognition stopped');
                } catch (e) {
                    console.error('Error stopping recognition:', e);
                }
            }
        }

        function updateDisplay() {
            // Update transcript display
            const integrationLog = document.getElementById('integration-log');
            if (integrationLog) {
                integrationLog.innerHTML = sessionTranscripts.map((t, idx) => `<div>${t}</div>`).join('');
            }
            
            // Update word status
            const wordStatus = document.getElementById('word-status');
            if (wordStatus) {
                if (integratedWords.length > 0) {
                    wordStatus.innerHTML = 'Words woven in: ' + integratedWords.map(w => `<span style="color:#10b981;">${w}</span>`).join(', ');
                } else {
                    wordStatus.innerHTML = 'Words woven in: <span style="color:#cbd5e1;">None yet</span>';
                }
            }
        }
    }

    function endGame() {
        console.log('Game 3 endGame called');
        
        // Stop any ongoing recognition
        if (recognition) {
            try { recognition.stop(); } catch (e) {}
        }
        clearInterval(timerInt);
        
        // DEBUG: Log what we're sending
        console.log('Game 3 - selectedWords:', selectedWords);
        console.log('Game 3 - sessionTranscripts:', sessionTranscripts);
        console.log('Game 3 - integratedWords:', integratedWords);
        
        // Store data globally for the button click
        window.game3Data = {
            selectedWords: selectedWords,
            transcripts: sessionTranscripts,
            woven: integratedWords
        };
        
        container.innerHTML = `
            <div class="results">
                <h3>Result:</h3>
                <div>Words woven in: <strong>${integratedWords.length}/${selectedWords.length}</strong></div>
                <div>Words used: ${integratedWords.join(', ') || 'None'}</div>
                <div>Words missed: ${selectedWords.filter(w => !integratedWords.includes(w)).join(', ') || 'None'}</div>
                <div><strong>Your speech:</strong></div>
                <div style="background:#222;color:#0f0;padding:12px;margin-bottom:8px;min-height:2em;">${sessionTranscripts.length > 0 ? sessionTranscripts.join('<br>') : 'No speech captured'}</div>
                <button class="btn" onclick="loadGame3()">Try Again</button>
                <button class="btn" onclick="console.log('Sending Game 3 data:', window.game3Data); sendEvaluation('game3', window.game3Data, event)">AI Feedback</button>
                <div id="ai-feedback-display" style="margin-top:24px; display:none;"></div>
            </div>
        `;
    }
}
