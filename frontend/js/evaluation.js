function sendEvaluation(gameType, gameData, event) {
    console.log('sendEvaluation called:', gameType, gameData);
    const endpoints = {
        'game1': '/evaluate_game1',
        'game2': '/evaluate_game2',
        'game3': '/evaluate_game3'
    };
    const endpoint = endpoints[gameType];
    if (!endpoint) {
        console.error('Invalid game type:', gameType);
        return;
    }

    // Show loading state
    const button = event.target;
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Getting AI Feedback...';
    button.disabled = true;

    console.log('Sending payload to', endpoint, ':', { data: gameData });

    fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: gameData })
    })
    .then(response => {
        console.log('Response status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(result => {
        console.log('Backend response:', result);
        displayAiFeedback(result.ai_feedback || result.error || "No feedback received from AI.", result, gameType);
        // Reset button
        button.innerHTML = originalText;
        button.disabled = false;
    })
    .catch(error => {
        console.error('Evaluation error:', error);
        displayAiFeedback('Network error: ' + error.message, {}, gameType);
        button.innerHTML = originalText;
        button.disabled = false;
    });
}

function displayAiFeedback(feedback, metrics, gameType) {
    let feedbackDiv = document.getElementById('ai-feedback-display');
    if (!feedbackDiv) {
        feedbackDiv = document.createElement('div');
        feedbackDiv.id = 'ai-feedback-display';
        feedbackDiv.className = 'ai-feedback';
        // Try to append to the results container, fallback to body
        const resultsContainer = document.querySelector('.results');
        if (resultsContainer) {
            resultsContainer.appendChild(feedbackDiv);
        } else {
            document.body.appendChild(feedbackDiv);
        }
    }
    
    feedbackDiv.style.display = 'block';
    
    // Build metrics display based on game type
    let metricsHtml = '';
    
    if (gameType === 'game1') {
        if (metrics.confidence_score !== undefined) {
            metricsHtml += `
                <div class="metric">
                    <span class="metric-label">AI Confidence Score</span>
                    <span class="metric-value">${Math.round(metrics.confidence_score)}%</span>
                </div>
            `;
        }
    } else if (gameType === 'game2') {
        if (metrics.adaptability_score !== undefined) {
            metricsHtml += `
                <div class="metric">
                    <span class="metric-label">Adaptability Score</span>
                    <span class="metric-value">${Math.round(metrics.adaptability_score)}%</span>
                </div>
            `;
        }
        if (metrics.energy_range !== undefined) {
            metricsHtml += `
                <div class="metric">
                    <span class="metric-label">Energy Range</span>
                    <span class="metric-value">${metrics.energy_range}</span>
                </div>
            `;
        }
    } else if (gameType === 'game3') {
        if (metrics.coherence_score !== undefined) {
            metricsHtml += `
                <div class="metric">
                    <span class="metric-label">Coherence Score</span>
                    <span class="metric-value">${Math.round(metrics.coherence_score)}%</span>
                </div>
            `;
        }
        if (metrics.integrated_count !== undefined && metrics.total_words !== undefined) {
            metricsHtml += `
                <div class="metric">
                    <span class="metric-label">Words Integrated</span>
                    <span class="metric-value">${metrics.integrated_count}/${metrics.total_words}</span>
                </div>
            `;
        }
    }
    
    feedbackDiv.innerHTML = `
        <h4><i class="fas fa-brain"></i> AI Coach Feedback</h4>
        <p>${feedback}</p>
        ${metricsHtml}
    `;
}
