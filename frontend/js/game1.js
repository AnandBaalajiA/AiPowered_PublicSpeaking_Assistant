function loadGame1() {
    const prompts = [
        "Business is like --",
        "Love is like --",
        "Success is like --",
        "Friendship is like --",
        "Learning is like --"
    ];
    let current = 0, responses = [], timerSel = 5;
    let allSpokenText = []; // Store all captured speech
    const container = document.getElementById('game-container');

    // Setup screen
    container.innerHTML = `
        <div class="game-setup">
            <h2>Rapid Fire Analogies</h2>
            <p>Complete each analogy as quickly and creatively as possible!</p>
            <div class="control-group">
                <label for="timer">Seconds per prompt:</label>
                <input type="range" id="timer" min="2" max="5" value="5" oninput="document.getElementById('timer-value').innerText=value">
                <span id="timer-value">5</span>
            </div>
            <button id="start-btn" class="btn">Start</button>
        </div>
    `;

    document.getElementById('timer').addEventListener('input', function () {
        timerSel = +this.value;
    });

    document.getElementById('start-btn').onclick = () => startGame();

    function startGame() {
        current = 0;
        responses = [];
        allSpokenText = [];
        showPrompt();
    }

    function showPrompt() {
        if (current >= prompts.length) {
            endGame();
            return;
        }

        container.innerHTML = `
            <div class="game-active">
                <div class="prompt" style="font-size: 2rem; margin-bottom: 1rem;">${prompts[current]}</div>
                <div class="timer-display">
                    <div>Time remaining: <span id="countdown">${timerSel}</span>s</div>
                </div>
                <div id="speech-status" style="color:#10b981;padding:8px 0;">🎤 Speak your analogy now!</div>
                <div id="live-transcript" style="background:#222;color:#0f0;padding:12px;min-height:50px;margin:12px 0;border-radius:4px;font-size:1.1rem;">
                    <em>Your speech will appear here...</em>
                </div>
                <div class="progress-indicator">Prompt ${current + 1} of ${prompts.length}</div>
                <div style="margin-top: 15px;">
                    <button class="btn" id="manual-input-btn">Type Instead</button>
                    <button class="btn btn-secondary" id="next-btn">Next Prompt</button>
                </div>
            </div>
        `;

        let remaining = timerSel;
        let currentTranscript = '';
        let promptStartTime = Date.now();

        // Manual input option
        document.getElementById('manual-input-btn').onclick = function() {
            const response = prompt(`Type your analogy for: ${prompts[current]}`);
            if (response && response.trim()) {
                allSpokenText.push({
                    text: response.trim(),
                    promptIndex: current,
                    timestamp: Date.now()
                });
                updateLiveTranscript(response.trim());
            }
        };

        // Next button
        document.getElementById('next-btn').onclick = function() {
            recordCurrentResponse();
        };

        // Timer
        const timerInterval = setInterval(() => {
            remaining--;
            document.getElementById('countdown').innerText = remaining;
            if (remaining <= 2) {
                document.getElementById('countdown').style.color = 'var(--error-color)';
            }
            if (remaining <= 0) {
                clearInterval(timerInterval);
                recordCurrentResponse();
            }
        }, 1000);

        // Speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onstart = function() {
                console.log('Recognition started for prompt:', prompts[current]);
                document.getElementById('speech-status').innerHTML = '🎤 <strong>Listening... Speak now!</strong>';
            };

            recognition.onresult = function(event) {
                let finalText = '';
                let interimText = '';

                for (let i = 0; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalText += transcript + ' ';
                    } else {
                        interimText = transcript;
                    }
                }

                if (finalText.trim()) {
                    currentTranscript = finalText.trim();
                    allSpokenText.push({
                        text: currentTranscript,
                        promptIndex: current,
                        timestamp: Date.now()
                    });
                    console.log('Speech captured:', currentTranscript);
                }

                const displayText = currentTranscript + (interimText ? ' ' + interimText : '');
                updateLiveTranscript(displayText);
            };

            recognition.onerror = function(event) {
                console.error('Recognition error:', event.error);
                document.getElementById('speech-status').innerHTML = `⚠️ ${event.error} - Try speaking again or use "Type Instead"`;
            };

            recognition.onend = function() {
                console.log('Recognition ended');
                // Don't restart - let timer handle the flow
            };

            try {
                recognition.start();
            } catch (e) {
                console.error('Failed to start recognition:', e);
                document.getElementById('speech-status').innerHTML = '❌ Speech recognition failed. Please use "Type Instead".';
            }

            // Store recognition reference to stop it later
            window.currentRecognition = recognition;
        } else {
            document.getElementById('speech-status').innerHTML = '⚠️ Speech recognition not supported. Please use "Type Instead".';
        }

        function updateLiveTranscript(text) {
            document.getElementById('live-transcript').innerHTML = text || '<em>No speech detected yet...</em>';
        }

        function recordCurrentResponse() {
            // Stop recognition
            if (window.currentRecognition) {
                try {
                    window.currentRecognition.stop();
                } catch (e) {}
            }

            // Find the most recent speech for this prompt
            const speechForThisPrompt = allSpokenText.filter(s => s.promptIndex === current);
            const latestSpeech = speechForThisPrompt.length > 0 ? 
                speechForThisPrompt[speechForThisPrompt.length - 1].text : '';

            const elapsed = Math.round((Date.now() - promptStartTime) / 1000);
            const spoke = latestSpeech.length > 0;

            console.log('Recording response:', {
                prompt: prompts[current],
                speech: latestSpeech,
                spoke: spoke,
                time: elapsed
            });

            responses.push({
                prompt: prompts[current],
                resp: latestSpeech,
                spoke: spoke,
                time: elapsed
            });

            current++;
            setTimeout(showPrompt, 1000);
        }
    }

    function endGame() {
        console.log('=== FINAL GAME RESULTS ===');
        console.log('All spoken text captured:', allSpokenText);
        console.log('Final responses array:', responses);

        window.collectedResults = responses;
        
        let spoken = responses.filter(r => r.spoke).length;
        let avgTime = spoken ? 
            (responses.filter(r => r.spoke).reduce((s, r) => s + r.time, 0) / spoken).toFixed(2) : 
            'N/A';

        let analogyHtml = '<div class="analogy-results">';
        responses.forEach((r, index) => {
            analogyHtml += `
                <div class="analogy-item">
                    <div class="analogy-prompt"><strong>${r.prompt}</strong></div>
                    <div class="analogy-response ${r.spoke ? 'spoken' : 'missed'}">
                        ${r.resp || '[No response]'}
                    </div>
                </div>
            `;
        });
        analogyHtml += '</div>';

        // Show debug info
        let debugHtml = '<div style="background:#333;padding:10px;margin:10px 0;border-radius:4px;"><strong>Debug Info:</strong><br>';
        allSpokenText.forEach((speech, i) => {
            debugHtml += `${i + 1}. Prompt ${speech.promptIndex + 1}: "${speech.text}"<br>`;
        });
        debugHtml += '</div>';

        let missedPrompts = responses.filter(r => !r.spoke).map(r => r.prompt);
        let stuckOnStr = missedPrompts.length ? missedPrompts.join(", ") : "None";

        container.innerHTML = `
            <div class="results">
                <h3>Rapid Fire Analogies - Results</h3>
                <div class="result-stats">
                    <div>
                        <span>Response Rate:</span>
                        <span class="metric-value">${spoken}/${responses.length}</span>
                    </div>
                    <div>
                        <span>Success Rate:</span>
                        <span class="metric-value">${Math.round((spoken/responses.length)*100)}%</span>
                    </div>
                    <div>
                        <span>Average Time:</span>
                        <span class="metric-value">${avgTime}s</span>
                    </div>
                    <div>
                        <span>Missed Prompts:</span>
                        <span class="metric-value">${stuckOnStr}</span>
                    </div>
                </div>
                
                ${debugHtml}
                
                <h4>Your Analogies:</h4>
                ${analogyHtml}
                
                <div class="result-buttons">
                    <button class="btn" onclick="loadGame1()">Try Again</button>
                    <button class="btn" onclick="sendEvaluation('game1', window.collectedResults, event)">AI Feedback</button>
                </div>
                <div id="ai-feedback-display" style="margin-top:24px; display:none;"></div>
            </div>
        `;
    }
}
