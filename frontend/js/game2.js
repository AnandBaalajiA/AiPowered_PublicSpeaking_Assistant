function loadGame2() {
    const topics = [
        "If money didn't exist...",
        "Where I get my inspiration...",
        "Technology in 10 years...",
        "My biggest challenge...",
        "The power of creativity...",
        "What motivates me daily..."
    ];
    
    let currentTopic = 0;
    let currentEnergyLevel = 5;
    let energyChanges = [];
    let allTranscripts = [];
    let timerSel = 120; // 2 minutes default
    let gameTimer, energyTimer;
    let recognition;
    let isGameActive = false;
    let breatheMode = false;
    
    const container = document.getElementById('game-container');

    // Setup Screen
    container.innerHTML = `
        <div class="game-setup">
            <h2>The Conductor</h2>
            <p>Adapt your vocal energy as the conductor guides you through different emotional levels!</p>
            <div class="control-group">
                <label for="topic-select">Choose Topic:</label>
                <select id="topic-select">
                    ${topics.map((topic, idx) => `<option value="${idx}">${topic}</option>`).join('')}
                </select>
            </div>
            <div class="control-group">
                <label for="duration-select">Duration:</label>
                <select id="duration-select">
                    <option value="120">2 minutes (Beginner)</option>
                    <option value="180">3 minutes (Intermediate)</option>
                    <option value="240">4 minutes (Advanced)</option>
                </select>
            </div>
            <div class="energy-preview">
                <h4>Energy Levels Guide:</h4>
                <div>1-3: Soft, calm, reflective</div>
                <div>4-6: Normal conversational tone</div>
                <div>7-9: Energetic, passionate, louder</div>
            </div>
            <button id="start-conductor-btn" class="btn">Start Speaking</button>
        </div>
    `;

    document.getElementById('topic-select').addEventListener('change', function() {
        currentTopic = +this.value;
    });

    document.getElementById('duration-select').addEventListener('change', function() {
        timerSel = +this.value;
    });

    document.getElementById('start-conductor-btn').onclick = () => startGame();

    function startGame() {
        energyChanges = [];
        allTranscripts = [];
        currentEnergyLevel = 5;
        isGameActive = true;
        breatheMode = false;
        showActiveGame();
        startSpeechRecognition();
        startGameTimer();
        startEnergyChanges();
    }

    function showActiveGame() {
        container.innerHTML = `
            <div class="game-active conductor-mode">
                <div class="topic-display">${topics[currentTopic]}</div>
                
                <div class="energy-display" id="energy-display">
                    <div class="energy-level" id="energy-level">ENERGY ${currentEnergyLevel}</div>
                    <div class="energy-description" id="energy-desc">${getEnergyDescription(currentEnergyLevel)}</div>
                </div>
                
                <div class="energy-meter" id="energy-meter">
                    <div class="energy-bar" id="energy-bar" style="width: ${(currentEnergyLevel/9)*100}%"></div>
                </div>
                
                <div class="game-timer">Time: <span id="game-countdown">${Math.floor(timerSel/60)}:${String(timerSel%60).padStart(2,'0')}</span></div>
                
                <div id="breathe-overlay" class="breathe-overlay" style="display: none;">
                    <div class="breathe-text">BREATHE</div>
                    <div class="breathe-instruction">Take a deep breath, then continue</div>
                </div>
                
                <div id="spoken-log" class="speech-log">
                    <div class="log-header">Your Speech:</div>
                    <div class="log-content">Start speaking about the topic above...</div>
                </div>
                
                <div id="speech-status" class="speech-status">🎤 Listening...</div>
                
                <button class="btn btn-secondary" id="end-conductor-btn">End Game</button>
            </div>
        `;

        document.getElementById('end-conductor-btn').onclick = endGame;
    }

    function getEnergyDescription(level) {
        if (level <= 3) return "Soft & Reflective";
        if (level <= 6) return "Normal Conversation";
        return "High Energy & Passionate";
    }

    function startGameTimer() {
        let remaining = timerSel;
        
        gameTimer = setInterval(() => {
            remaining--;
            const minutes = Math.floor(remaining / 60);
            const seconds = remaining % 60;
            document.getElementById('game-countdown').textContent = 
                `${minutes}:${String(seconds).padStart(2, '0')}`;
            
            if (remaining <= 0) {
                endGame();
            }
        }, 1000);
    }

    function startEnergyChanges() {
        function scheduleNextChange() {
            if (!isGameActive) return;
            
            // Random interval between 15-30 seconds
            const interval = 15000 + Math.random() * 15000;
            
            energyTimer = setTimeout(() => {
                if (!isGameActive) return;
                
                // 20% chance for breathe moment
                if (Math.random() < 0.2) {
                    triggerBreathe();
                } else {
                    changeEnergyLevel();
                }
                
                scheduleNextChange();
            }, interval);
        }
        
        // First change after 10-20 seconds
        setTimeout(() => {
            if (isGameActive) changeEnergyLevel();
            scheduleNextChange();
        }, 10000 + Math.random() * 10000);
    }

    function changeEnergyLevel() {
        // Generate new energy level (different from current)
        let newLevel;
        do {
            newLevel = Math.floor(Math.random() * 9) + 1;
        } while (newLevel === currentEnergyLevel);
        
        const previousLevel = currentEnergyLevel;
        currentEnergyLevel = newLevel;
        
        // Record the change
        energyChanges.push({
            timestamp: Date.now(),
            from: previousLevel,
            to: newLevel,
            type: 'energy_change'
        });
        
        // Update UI with animation
        updateEnergyDisplay();
        
        console.log(`Energy changed: ${previousLevel} → ${newLevel}`);
    }

    function triggerBreathe() {
        breatheMode = true;
        
        energyChanges.push({
            timestamp: Date.now(),
            type: 'breathe',
            duration: 3000
        });
        
        // Show breathe overlay
        const overlay = document.getElementById('breathe-overlay');
        overlay.style.display = 'flex';
        
        // Hide after 3 seconds and change energy
        setTimeout(() => {
            overlay.style.display = 'none';
            breatheMode = false;
            changeEnergyLevel(); // New energy after breathe
        }, 3000);
        
        console.log('Breathe moment triggered');
    }

    function updateEnergyDisplay() {
        document.getElementById('energy-level').textContent = `ENERGY ${currentEnergyLevel}`;
        document.getElementById('energy-desc').textContent = getEnergyDescription(currentEnergyLevel);
        
        const energyBar = document.getElementById('energy-bar');
        energyBar.style.width = `${(currentEnergyLevel/9)*100}%`;
        
        // Color coding
        const display = document.getElementById('energy-display');
        display.className = 'energy-display';
        if (currentEnergyLevel <= 3) display.classList.add('low-energy');
        else if (currentEnergyLevel <= 6) display.classList.add('normal-energy');
        else display.classList.add('high-energy');
        
        // Animation effect
        display.style.transform = 'scale(1.1)';
        setTimeout(() => {
            display.style.transform = 'scale(1)';
        }, 200);
    }

    function startSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            document.getElementById('speech-status').innerHTML = 
                '⚠️ Speech recognition not supported. Please use Chrome or Edge.';
            return;
        }

        recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscript = '';

        recognition.onresult = function(event) {
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript + ' ';
                    allTranscripts.push(transcript.trim());
                } else {
                    interimTranscript = transcript;
                }
            }
            
            // Update speech log
            const logContent = document.querySelector('.log-content');
            if (logContent) {
                const displayText = finalTranscript + interimTranscript;
                logContent.textContent = displayText || 'Start speaking...';
            }
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            document.getElementById('speech-status').innerHTML = `❌ Error: ${event.error}`;
        };

        recognition.onend = function() {
            if (isGameActive) {
                try {
                    recognition.start();
                } catch (e) {
                    console.error('Failed to restart recognition:', e);
                }
            }
        };

        try {
            recognition.start();
            document.getElementById('speech-status').innerHTML = '🎤 Listening... Start speaking!';
        } catch (e) {
            console.error('Failed to start recognition:', e);
        }
    }

    function endGame() {
        isGameActive = false;
        
        // Clear timers
        clearInterval(gameTimer);
        clearTimeout(energyTimer);
        
        // Stop recognition
        if (recognition) {
            try { recognition.stop(); } catch (e) {}
        }
        
        // Calculate statistics
        const totalChanges = energyChanges.filter(c => c.type === 'energy_change').length;
        const breatheMoments = energyChanges.filter(c => c.type === 'breathe').length;
        const energyRange = calculateEnergyRange();
        
        // Store data for AI evaluation
        window.game2Data = {
            topic: topics[currentTopic],
            transitions: energyChanges,
            transcripts: allTranscripts.filter(t => t && t.trim()),
            totalChanges: totalChanges,
            breatheMoments: breatheMoments,
            energyRange: energyRange,
            duration: timerSel
        };
        
        console.log('Game 2 ended. Data:', window.game2Data);
        
        showResults(totalChanges, breatheMoments, energyRange);
    }

    function calculateEnergyRange() {
        const levels = energyChanges
            .filter(c => c.type === 'energy_change')
            .map(c => [c.from, c.to])
            .flat();
        
        return levels.length > 0 ? Math.max(...levels) - Math.min(...levels) : 0;
    }

    function showResults(totalChanges, breatheMoments, energyRange) {
        const speechText = allTranscripts.join(' ') || 'No speech captured';
        
        container.innerHTML = `
            <div class="results">
                <h3>The Conductor - Results</h3>
                <div class="result-stats">
                    <div><strong>Topic:</strong> ${topics[currentTopic]}</div>
                    <div><strong>Energy Changes:</strong> ${totalChanges}</div>
                    <div><strong>Breathe Moments:</strong> ${breatheMoments}</div>
                    <div><strong>Energy Range:</strong> ${energyRange} levels</div>
                </div>
                <div><strong>Your Speech:</strong></div>
                <div class="speech-display">${speechText}</div>
                <div class="result-buttons">
                    <button class="btn" onclick="loadGame2()">Try Again</button>
                    <button class="btn" onclick="sendEvaluation('game2', window.game2Data, event)">AI Feedback</button>
                </div>
                <div id="ai-feedback-display" style="margin-top:24px; display:none;"></div>
            </div>
        `;
    }
}
