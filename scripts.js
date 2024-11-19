const patterns = {
    gpt2: "'(?:[sdmt]|ll|ve|re)| ?\\p{L}+| ?\\p{N}+| ?[^\\s\\p{L}\\p{N}]+|\\s+(?!\\S)|\\s+",
    gpt4: "'(?i:[sdmt]|ll|ve|re)|[^\\r\\n\\p{L}\\p{N}]?\\p{L}+|\\p{N}{1,3}| ?[^\\s\\p{L}\\p{N}]+[\\r\\n]*|\\s*[\\r\\n]|\\s+(?!\\S)|\\s+"
};

function getRandomColor() {
    const hue = Math.random() * 360;
    return `hsl(${hue}, 80%, 85%)`;
}

const patternExplanations = {
    gpt2: [
        { pattern: "'(?:[sdmt]|ll|ve|re)", desc: "Common English contractions ('s, 'd, 'm, 't, 'll, 've, 're)" },
        { pattern: "\\p{L}+", desc: "Consecutive letter characters" },
        { pattern: "\\p{N}+", desc: "Consecutive numbers" },
        { pattern: "[^\\s\\p{L}\\p{N}]+", desc: "Consecutive punctuation and special characters" },
        { pattern: "\\s+(?!\\S)", desc: "Trailing whitespace" },
        { pattern: "\\s+", desc: "Other whitespace characters" }
    ],
    gpt4: [
        { pattern: "'(?i:[sdmt]|ll|ve|re)", desc: "Common English contractions (case insensitive)" },
        { pattern: "[^\\r\\n\\p{L}\\p{N}]?\\p{L}+", desc: "Letter sequence with possible prefix" },
        { pattern: "\\p{N}{1,3}", desc: "1-3 digit numbers" },
        { pattern: "[^\\s\\p{L}\\p{N}]+[\\r\\n]*", desc: "Special characters and punctuation" },
        { pattern: "\\s*[\\r\\n]", desc: "Line breaks" },
        { pattern: "\\s+(?!\\S)|\\s+", desc: "Whitespace characters" }
    ]
};

function updateLegend(patternType) {
    const legendDiv = document.getElementById('pattern-legend');
    legendDiv.innerHTML = '';
    
    const patterns = patternExplanations[patternType];
    const colors = patterns.map(() => getRandomColor());
    
    patterns.forEach((item, index) => {
        const legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.dataset.patternIndex = index;
        
        const colorBox = document.createElement('div');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = colors[index];
        
        const description = document.createElement('div');
        description.innerHTML = `${item.desc} (<code>${item.pattern}</code>)`;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(description);
        legendDiv.appendChild(legendItem);
        
        legendItem.addEventListener('mouseenter', () => {
            document.querySelectorAll('.token').forEach(token => {
                if (token.dataset.patternIndex === index.toString()) {
                    token.style.backgroundColor = colors[index];
                } else {
                    token.style.backgroundColor = 'transparent';
                }
            });
        });
        
        legendItem.addEventListener('mouseleave', () => {
            document.querySelectorAll('.token').forEach(token => {
                token.style.backgroundColor = colors[token.dataset.patternIndex];
            });
        });
    });
    
    return colors;
}

function tokenize() {
    try {
        const input = document.getElementById('input-text').value;
        const patternType = document.getElementById('pattern-select').value;
        
        const colors = updateLegend(patternType);
        
        const output = document.getElementById('output');
        output.innerHTML = '';
        
        const patternString = patterns[patternType];
        const regex = new RegExp(patternString, 'gu');
        let match;
        let lastIndex = 0;
        
        while ((match = regex.exec(input)) !== null) {
            const matchText = match[0];
            const patternExps = patternExplanations[patternType];
            let colorIndex = 0;
            
            for (let i = 0; i < patternExps.length; i++) {
                if (new RegExp(patternExps[i].pattern, 'gu').test(matchText)) {
                    colorIndex = i;
                    break;
                }
            }
            
            if (match.index > lastIndex) {
                const textNode = document.createTextNode(input.slice(lastIndex, match.index));
                output.appendChild(textNode);
            }
            
            const span = document.createElement('span');
            span.textContent = matchText;
            span.className = 'token';
            span.dataset.patternIndex = colorIndex;
            span.style.backgroundColor = colors[colorIndex];
            output.appendChild(span);
            
            lastIndex = match.index + matchText.length;
        }
        
        if (lastIndex < input.length) {
            const textNode = document.createTextNode(input.slice(lastIndex));
            output.appendChild(textNode);
        }
    } catch (error) {
        console.error('Tokenization error:', error);
        document.getElementById('output').innerHTML = `<span style="color: red;">Tokenization error: ${error.message}</span>`;
    }
}
