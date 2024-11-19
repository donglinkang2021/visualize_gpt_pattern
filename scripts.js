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
        { pattern: "'(?:[sdmt]|ll|ve|re)", desc: "常见的英文缩写（'s, 'd, 'm, 't, 'll, 've, 're）" },
        { pattern: "\\p{L}+", desc: "连续的字母字符" },
        { pattern: "\\p{N}+", desc: "连续的数字" },
        { pattern: "[^\\s\\p{L}\\p{N}]+", desc: "连续的标点符号和特殊字符" },
        { pattern: "\\s+(?!\\S)", desc: "末尾空白" },
        { pattern: "\\s+", desc: "其他空白字符" }
    ],
    gpt4: [
        { pattern: "'(?i:[sdmt]|ll|ve|re)", desc: "常见的英文缩写（大小写不敏感）" },
        { pattern: "[^\\r\\n\\p{L}\\p{N}]?\\p{L}+", desc: "可能带有前缀的字母序列" },
        { pattern: "\\p{N}{1,3}", desc: "1-3位数字" },
        { pattern: "[^\\s\\p{L}\\p{N}]+[\\r\\n]*", desc: "特殊字符和标点" },
        { pattern: "\\s*[\\r\\n]", desc: "换行符" },
        { pattern: "\\s+(?!\\S)|\\s+", desc: "空白字符" }
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
        legendItem.dataset.patternIndex = index; // 添加这行
        
        const colorBox = document.createElement('div');
        colorBox.className = 'legend-color';
        colorBox.style.backgroundColor = colors[index];
        
        const description = document.createElement('div');
        description.innerHTML = `${item.desc} (<code>${item.pattern}</code>)`;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(description);
        legendDiv.appendChild(legendItem);
        
        // 添加鼠标事件
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
        
        // 更新图例并获取颜色
        const colors = updateLegend(patternType);
        
        const output = document.getElementById('output');
        output.innerHTML = '';
        
        // 修改：使用一个完整的正则表达式来匹配所有模式
        const patternString = patterns[patternType];
        const regex = new RegExp(patternString, 'gu');
        let match;
        let lastIndex = 0;
        
        while ((match = regex.exec(input)) !== null) {
            // 找到匹配的模式类型
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
            span.dataset.patternIndex = colorIndex; // 添加这行
            span.style.backgroundColor = colors[colorIndex];
            output.appendChild(span);
            
            lastIndex = match.index + matchText.length;
        }
        
        if (lastIndex < input.length) {
            const textNode = document.createTextNode(input.slice(lastIndex));
            output.appendChild(textNode);
        }
    } catch (error) {
        console.error('分词错误:', error);
        document.getElementById('output').innerHTML = `<span style="color: red;">分词出错: ${error.message}</span>`;
    }
}