document.getElementById('pfsForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const proposalTypeElement = document.querySelector('input[name="proposalType"]:checked');
    if (!proposalTypeElement) {
        alert('Please select who made the proposal');
        return;
    }
    const proposalType = proposalTypeElement.value;
    const proposalAmount = parseCurrencyInput(document.getElementById('proposalAmount').value);
    const judgmentAmount = parseCurrencyInput(document.getElementById('judgmentAmount').value);

    const results = calculatePFS(proposalType, proposalAmount, judgmentAmount);
    displayResults(results);
});

function calculatePFS(proposalType, proposalAmount, judgmentAmount) {
    let threshold, difference, percentDifference, meetsThreshold;

    if (proposalType === 'plaintiff') {
        // Plaintiff: Judgment must be at least 25% MORE than proposal
        threshold = proposalAmount * 1.25;
        difference = judgmentAmount - proposalAmount;
        percentDifference = (difference / proposalAmount) * 100;
        meetsThreshold = judgmentAmount >= threshold;

        return {
            type: 'Plaintiff',
            proposalAmount: proposalAmount,
            judgmentAmount: judgmentAmount,
            threshold: threshold,
            difference: difference,
            percentDifference: percentDifference,
            meetsThreshold: meetsThreshold,
            explanation: meetsThreshold
            ? `The judgment of ${formatCurrency(judgmentAmount)} is ${percentDifference.toFixed(2)}% more than the proposal of ${formatCurrency(proposalAmount)}, which exceeds the required 25% threshold.`
            : `The judgment of ${formatCurrency(judgmentAmount)} is only ${percentDifference.toFixed(2)}% more than the proposal of ${formatCurrency(proposalAmount)}, which does not meet the required 25% threshold.`
        };

    } else { // defendant
        // Defendant: Judgment must be at least 25% LESS than proposal
        threshold = proposalAmount * 0.75;
        difference = proposalAmount - judgmentAmount;
        percentDifference = (difference / proposalAmount) * 100;
        meetsThreshold = judgmentAmount <= threshold;

        return {
            type: 'Defendant',
            proposalAmount: proposalAmount,
            judgmentAmount: judgmentAmount,
            threshold: threshold,
            difference: difference,
            percentDifference: percentDifference,
            meetsThreshold: meetsThreshold,
            explanation: meetsThreshold
            ? `The judgment of ${formatCurrency(judgmentAmount)} is ${percentDifference.toFixed(2)}% less than the proposal of ${formatCurrency(proposalAmount)}, which exceeds the required 25% threshold.`
            : `The judgment of ${formatCurrency(judgmentAmount)} is only ${percentDifference.toFixed(2)}% less than the proposal of ${formatCurrency(proposalAmount)}, which does not meet the required 25% threshold.`
        };
    }
}

function displayResults(results) {
    const resultsDiv = document.getElementById('results');

    const resultClass = results.meetsThreshold ? 'success' : 'failure';
    const resultText = results.meetsThreshold ? '✅ Threshold MET' : '❌ Threshold NOT Met';

    resultsDiv.innerHTML = `
    <h3>${resultText}</h3>
    <p><strong>${results.type}'s Proposal:</strong> ${formatCurrency(results.proposalAmount)}</p>
    <p><strong>Final Judgment:</strong> ${formatCurrency(results.judgmentAmount)}</p>
    <p><strong>Required Threshold:</strong> ${formatCurrency(results.threshold)}</p>
    <p><strong>Percent Difference:</strong> ${Math.abs(results.percentDifference).toFixed(2)}%</p>
    <p>${results.explanation}</p>
    ${results.meetsThreshold ? '<p><strong>Result:</strong> The proposing party may be entitled to recover attorney\'s fees under § 768.79.</p>' : '<p><strong>Result:</strong> The proposing party is not entitled to recover attorney\'s fees under § 768.79.</p>'}
    `;

    resultsDiv.className = `results ${resultClass}`;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(amount);
}

// Reverse Calculator
document.getElementById('reverseForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const proposalTypeElement = document.querySelector('input[name="reverseProposalType"]:checked');
    if (!proposalTypeElement) {
        alert('Please select who made the proposal');
        return;
    }
    const proposalType = proposalTypeElement.value;
    const proposalAmount = parseCurrencyInput(document.getElementById('reverseProposalAmount').value);

    const results = calculateRequiredJudgment(proposalType, proposalAmount);
    displayReverseResults(results);
});

function calculateRequiredJudgment(proposalType, proposalAmount) {
    let requiredJudgment, description;

    if (proposalType === 'plaintiff') {
        // Plaintiff: Judgment must be at least 25% MORE than proposal
        requiredJudgment = proposalAmount * 1.25;
        description = `For a plaintiff's proposal of ${formatCurrency(proposalAmount)}, the final judgment must be at least ${formatCurrency(requiredJudgment)} (25% more) for the proposal to be effective.`;

        return {
            type: 'Plaintiff',
            proposalAmount: proposalAmount,
            requiredJudgment: requiredJudgment,
            threshold: '25% more than proposal',
            description: description,
            range: `Any judgment of ${formatCurrency(requiredJudgment)} or higher will meet the threshold.`
        };

    } else { // defendant
        // Defendant: Judgment must be at least 25% LESS than proposal
        requiredJudgment = proposalAmount * 0.75;
        description = `For a defendant's proposal of ${formatCurrency(proposalAmount)}, the final judgment must be ${formatCurrency(requiredJudgment)} or less (25% less) for the proposal to be effective.`;

        return {
            type: 'Defendant',
            proposalAmount: proposalAmount,
            requiredJudgment: requiredJudgment,
            threshold: '25% less than proposal',
            description: description,
            range: `Any judgment of ${formatCurrency(requiredJudgment)} or lower will meet the threshold.`
        };
    }
}

function displayReverseResults(results) {
    const resultsDiv = document.getElementById('reverseResults');

    const direction = results.type === 'Plaintiff' ? 'at least' : 'no more than';

    resultsDiv.innerHTML = `
    <h3>📊 Required Judgment Amount</h3>
    <p><strong>${results.type}'s Proposal:</strong> ${formatCurrency(results.proposalAmount)}</p>
    <p><strong>Required Threshold:</strong> ${results.threshold}</p>
    <div style="background: white; padding: 20px; border-radius: 6px; margin: 15px 0; border-left: 5px solid #2c5f8d;">
    <p style="font-size: 1.2rem; font-weight: 600; color: #1e3a5f; margin-bottom: 10px;">
    Judgment must be ${direction}: ${formatCurrency(results.requiredJudgment)}
    </p>
    </div>
    <p>${results.description}</p>
    <p style="margin-top: 15px;"><strong>Note:</strong> ${results.range}</p>
    `;

    resultsDiv.className = 'results success';
}

// Format currency inputs when user leaves the field
function formatCurrencyInput(input) {
    let value = input.value.replace(/[^0-9.]/g, '');
    if (value) {
        const number = parseFloat(value);
        input.value = '$' + number.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
}

function parseCurrencyInput(value) {
    return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
}

// Apply to all amount inputs - format on blur, not on input
document.getElementById('proposalAmount').addEventListener('blur', function(e) {
    formatCurrencyInput(e.target);
});

document.getElementById('judgmentAmount').addEventListener('blur', function(e) {
    formatCurrencyInput(e.target);
});

document.getElementById('reverseProposalAmount').addEventListener('blur', function(e) {
    formatCurrencyInput(e.target);
});

// Remove formatting when user focuses to make editing easier
document.getElementById('proposalAmount').addEventListener('focus', function(e) {
    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
});

document.getElementById('judgmentAmount').addEventListener('focus', function(e) {
    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
});

document.getElementById('reverseProposalAmount').addEventListener('focus', function(e) {
    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
});

// Format expectedJudgment input
document.getElementById('expectedJudgment').addEventListener('blur', function(e) {
    formatCurrencyInput(e.target);
});

document.getElementById('expectedJudgment').addEventListener('focus', function(e) {
    e.target.value = e.target.value.replace(/[^0-9.]/g, '');
});

// Strategic Calculator
document.getElementById('strategicForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const proposalType = document.querySelector('input[name="strategicProposalType"]:checked').value;
    const expectedJudgment = parseCurrencyInput(document.getElementById('expectedJudgment').value);

    const results = calculateStrategicProposal(proposalType, expectedJudgment);
    displayStrategicResults(results);
});

function calculateStrategicProposal(proposalType, expectedJudgment) {
    let proposalAmount, description;

    if (proposalType === 'plaintiff') {
        // Plaintiff: J >= P * 1.25, so P <= J / 1.25
        proposalAmount = expectedJudgment / 1.25;
        description = `To make a judgment of ${formatCurrency(expectedJudgment)} meet the 25% threshold, you should propose ${formatCurrency(proposalAmount)} or less.`;

        return {
            type: 'Plaintiff',
            expectedJudgment: expectedJudgment,
            proposalAmount: proposalAmount,
            description: description,
            range: `Any proposal of ${formatCurrency(proposalAmount)} or lower will meet the threshold if the judgment is ${formatCurrency(expectedJudgment)}.`
        };

    } else { // defendant
        // Defendant: J <= P * 0.75, so P >= J / 0.75
        proposalAmount = expectedJudgment / 0.75;
        description = `To make a judgment of ${formatCurrency(expectedJudgment)} meet the 25% threshold, you should propose ${formatCurrency(proposalAmount)} or more.`;

        return {
            type: 'Defendant',
            expectedJudgment: expectedJudgment,
            proposalAmount: proposalAmount,
            description: description,
            range: `Any proposal of ${formatCurrency(proposalAmount)} or higher will meet the threshold if the judgment is ${formatCurrency(expectedJudgment)}.`
        };
    }
}

function displayStrategicResults(results) {
    const resultsDiv = document.getElementById('strategicResults');

    const direction = results.type === 'Plaintiff' ? 'at most' : 'at least';

    resultsDiv.innerHTML = `
        <h3>📊 Recommended Proposal Amount</h3>
        <p><strong>Expected Judgment:</strong> ${formatCurrency(results.expectedJudgment)}</p>
        <div style="background: white; padding: 20px; border-radius: 6px; margin: 15px 0; border-left: 5px solid #2c5f8d;">
            <p style="font-size: 1.2rem; font-weight: 600; color: #1e3a5f; margin-bottom: 10px;">
                Propose ${direction}: ${formatCurrency(results.proposalAmount)}
            </p>
        </div>
        <p>${results.description}</p>
        <p style="margin-top: 15px;"><strong>Note:</strong> ${results.range}</p>
    `;

    resultsDiv.className = 'results success';
}
