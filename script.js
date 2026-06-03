let currentSpread = 'single';
let currentMode = 'random';
let drawnCards = [];
let shuffledDeck = [];
let manuallySelectedCards = [];
let isShuffled = false;
let userQuestion = '';

document.addEventListener('DOMContentLoaded', () => {
    const spreadBtns = document.querySelectorAll('.spread-btn');
    const modeBtns = document.querySelectorAll('.mode-btn');
    const drawBtn = document.getElementById('drawBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    const confirmNumberBtn = document.getElementById('confirmNumberBtn');
    
    spreadBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            spreadBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSpread = btn.dataset.spread;
            updateUI();
        });
    });
    
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;
            updateUI();
        });
    });
    
    shuffleBtn.addEventListener('click', performShuffle);
    drawBtn.addEventListener('click', drawCardsRandomly);
    confirmNumberBtn.addEventListener('click', handleNumberSelection);
    
    updateUI();
});

function updateUI() {
    const shuffleArea = document.getElementById('shuffleArea');
    const actionArea = document.getElementById('actionArea');
    const manualSelector = document.getElementById('manualSelector');
    const numberSelector = document.getElementById('numberSelector');
    
    shuffleArea.classList.toggle('show', currentMode !== 'random');
    actionArea.style.display = currentMode === 'random' ? 'block' : 'none';
    manualSelector.classList.toggle('show', currentMode === 'manual');
    numberSelector.classList.toggle('show', currentMode === 'number');
    
    const totalNeeded = document.getElementById('totalNeeded');
    totalNeeded.textContent = SPREAD_POSITIONS[currentSpread].length;
    
    if (currentMode === 'manual') {
        setupManualSelector();
    } else if (currentMode === 'number') {
        setupNumberInputs();
    }
    
    isShuffled = false;
    updateShuffleHint();
}

function performShuffle() {
    const shuffleBtn = document.getElementById('shuffleBtn');
    shuffleBtn.classList.add('shuffling');
    
    setTimeout(() => {
        shuffledDeck = [...Array(78).keys()];
        for (let i = shuffledDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledDeck[i], shuffledDeck[j]] = [shuffledDeck[j], shuffledDeck[i]];
        }
        
        shuffleBtn.classList.remove('shuffling');
        isShuffled = true;
        updateShuffleHint();
        
        if (currentMode === 'manual') {
            setupManualSelector();
        }
    }, 1500);
}

function updateShuffleHint() {
    const shuffleHint = document.getElementById('shuffleHint');
    if (isShuffled) {
        shuffleHint.textContent = '✓ 洗牌完成，可以开始选牌';
        shuffleHint.style.color = '#d4af37';
    } else {
        shuffleHint.textContent = '点击洗牌开始';
        shuffleHint.style.color = '#a0a0a8';
    }
}

function setupManualSelector() {
    const cardGrid = document.getElementById('cardGrid');
    cardGrid.innerHTML = '';
    manuallySelectedCards = [];
    updateSelectedCount();
    
    const deck = isShuffled ? shuffledDeck : [...Array(78).keys()];
    
    deck.forEach((cardIndex, position) => {
        const gridCard = document.createElement('div');
        gridCard.className = 'grid-card';
        gridCard.dataset.cardIndex = cardIndex;
        gridCard.dataset.position = position;
        
        const cardBack = document.createElement('div');
        cardBack.className = 'grid-card-back';
        
        gridCard.appendChild(cardBack);
        
        gridCard.addEventListener('click', () => toggleCardSelection(gridCard, cardIndex));
        
        cardGrid.appendChild(gridCard);
    });
}

function toggleCardSelection(gridCard, cardIndex) {
    const maxCards = SPREAD_POSITIONS[currentSpread].length;
    
    if (gridCard.classList.contains('selected')) {
        gridCard.classList.remove('selected');
        manuallySelectedCards = manuallySelectedCards.filter(c => c !== cardIndex);
    } else {
        if (manuallySelectedCards.length < maxCards) {
            gridCard.classList.add('selected');
            manuallySelectedCards.push(cardIndex);
        } else {
            alert(`最多只能选择 ${maxCards} 张牌`);
        }
    }
    
    updateSelectedCount();
}

function updateSelectedCount() {
    const selectedCount = document.getElementById('selectedCount');
    const maxCards = SPREAD_POSITIONS[currentSpread].length;
    
    selectedCount.textContent = manuallySelectedCards.length;
    
    if (manuallySelectedCards.length === maxCards) {
        setTimeout(() => {
            if (manuallySelectedCards.length === maxCards) {
                displaySelectedCards();
            }
        }, 500);
    }
}

function setupNumberInputs() {
    const numberInputs = document.getElementById('numberInputs');
    const positions = SPREAD_POSITIONS[currentSpread];
    
    numberInputs.innerHTML = '';
    
    positions.forEach((position, index) => {
        const group = document.createElement('div');
        group.className = 'number-group';
        
        const label = document.createElement('label');
        label.textContent = `${position.name}`;
        
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '1';
        input.max = '78';
        input.placeholder = `序号`;
        input.dataset.position = index;
        
        group.appendChild(label);
        group.appendChild(input);
        numberInputs.appendChild(group);
    });
}

function handleNumberSelection() {
    if (!isShuffled) {
        alert('请先洗牌');
        return;
    }
    
    const inputs = document.querySelectorAll('#numberInputs input');
    const positions = SPREAD_POSITIONS[currentSpread];
    const usedNumbers = new Set();
    
    userQuestion = document.getElementById('userQuestion').value.trim();
    
    drawnCards = [];
    
    for (let i = 0; i < inputs.length; i++) {
        const value = parseInt(inputs[i].value);
        
        if (isNaN(value) || value < 1 || value > 78) {
            alert(`第 ${i + 1} 张牌的序号无效，请输入 1-78 之间的数字`);
            return;
        }
        
        if (usedNumbers.has(value)) {
            alert(`序号 ${value} 重复，请选择不同的序号`);
            return;
        }
        
        usedNumbers.add(value);
        
        const cardIndex = shuffledDeck[value - 1];
        const card = TAROT_CARDS[cardIndex];
        const isReversed = Math.random() < 0.3;
        
        drawnCards.push({
            card: card,
            position: positions[i],
            isReversed: isReversed
        });
    }
    
    displayCards();
}

function drawCardsRandomly() {
    const drawBtn = document.getElementById('drawBtn');
    drawBtn.disabled = true;
    
    userQuestion = document.getElementById('userQuestion').value.trim();
    
    drawnCards = [];
    const positions = SPREAD_POSITIONS[currentSpread];
    const usedCards = new Set();
    
    for (let i = 0; i < positions.length; i++) {
        let cardIndex;
        do {
            cardIndex = Math.floor(Math.random() * TAROT_CARDS.length);
        } while (usedCards.has(cardIndex));
        usedCards.add(cardIndex);
        
        const card = TAROT_CARDS[cardIndex];
        const isReversed = Math.random() < 0.3;
        
        drawnCards.push({
            card: card,
            position: positions[i],
            isReversed: isReversed
        });
    }
    
    displayCards();
    drawBtn.disabled = false;
}

function displaySelectedCards() {
    const positions = SPREAD_POSITIONS[currentSpread];
    
    userQuestion = document.getElementById('userQuestion').value.trim();
    
    drawnCards = [];
    
    manuallySelectedCards.forEach((cardIndex, i) => {
        const card = TAROT_CARDS[cardIndex];
        const isReversed = Math.random() < 0.3;
        
        drawnCards.push({
            card: card,
            position: positions[i],
            isReversed: isReversed
        });
    });
    
    displayCards();
}

function displayCards() {
    const cardsContainer = document.getElementById('cardsContainer');
    const readingPanel = document.getElementById('readingPanel');
    
    cardsContainer.innerHTML = '';
    readingPanel.classList.remove('show');
    
    drawnCards.forEach((cardData, index) => {
        setTimeout(() => {
            createCard(cardData, index, cardsContainer);
        }, index * 200);
    });
    
    setTimeout(() => {
        showReading();
    }, drawnCards.length * 200 + 1000);
}

function createCard(cardData, index, container) {
    const wrapper = document.createElement('div');
    wrapper.className = 'card-wrapper';
    wrapper.style.animationDelay = `${index * 0.2}s`;
    
    const positionLabel = document.createElement('div');
    positionLabel.className = 'position-label';
    positionLabel.textContent = cardData.position.name;
    
    const cardElement = document.createElement('div');
    cardElement.className = 'card';
    
    const cardInner = document.createElement('div');
    cardInner.className = 'card-inner';
    
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    
    if (cardData.isReversed) {
        const reversedBadge = document.createElement('div');
        reversedBadge.className = 'reversed-badge';
        reversedBadge.textContent = '逆位';
        cardFront.appendChild(reversedBadge);
    }
    
    const cardImage = document.createElement('img');
    cardImage.className = 'card-image';
    cardImage.src = TAROT_IMAGE_BASE + cardData.card.img;
    cardImage.alt = cardData.card.name;
    cardImage.style.transform = cardData.isReversed ? 'rotate(180deg)' : 'none';
    cardImage.onerror = () => {
        cardImage.style.display = 'none';
        cardFront.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #8b4513;">
                <div style="font-size: 48px; margin-bottom: 10px;">${cardData.card.numeral}</div>
                <div style="font-size: 18px; font-weight: 600; margin-bottom: 5px;">${cardData.card.name}</div>
                <div style="font-size: 12px; opacity: 0.7;">${cardData.card.en}</div>
            </div>
        `;
        if (cardData.isReversed) {
            const badge = document.createElement('div');
            badge.className = 'reversed-badge';
            badge.textContent = '逆位';
            cardFront.appendChild(badge);
        }
    };
    cardFront.appendChild(cardImage);
    
    const cardInfo = document.createElement('div');
    cardInfo.className = 'card-info';
    cardInfo.innerHTML = `
        <div class="card-name-display">${cardData.card.name}</div>
        <div class="card-numeral-display">${cardData.card.numeral} - ${cardData.card.en}</div>
    `;
    cardFront.appendChild(cardInfo);
    
    cardInner.appendChild(cardBack);
    cardInner.appendChild(cardFront);
    cardElement.appendChild(cardInner);
    
    wrapper.appendChild(positionLabel);
    wrapper.appendChild(cardElement);
    container.appendChild(wrapper);
    
    setTimeout(() => {
        cardElement.classList.add('flipped');
    }, 600);
}

function generateDetailedReading(cardData, question) {
    const card = cardData.card;
    const isReversed = cardData.isReversed;
    const position = cardData.position;
    const interpretation = isReversed ? card.reversed : card.upright;
    
    let reading = interpretation;
    
    if (question) {
        reading += `\n\n针对你的问题"${question}"，这张牌在${position.name}位置提示：`;
        
        if (position.name === '过去') {
            reading += `\n过去的经历为当前情况奠定了基础。${card.name}的能量在过去起到了重要作用，${isReversed ? '但其受阻或逆转的影响可能带来了挑战' : '其正面影响为现在创造了机会'}。`;
        } else if (position.name === '现在') {
            reading += `\n当前你正处于${card.name}的能量影响下。${isReversed ? '这股能量可能受到阻碍，需要你注意调整' : '这是发挥这张牌正面特质的好时机'}。`;
        } else if (position.name === '未来') {
            reading += `\n如果不改变当前的发展轨迹，${card.name}的能量将${isReversed ? '以受阻或逆转的形式' : '以完整力量'}在未来显现。这是一个可能的走向，通过当前的行动可以影响这个结果。`;
        } else if (position.name === '现状') {
            reading += `\n你目前的核心状态受到${card.name}的影响。${isReversed ? '但这股力量可能受到限制，需要你识别并解除这些阻碍' : '这张牌的正面特质在你的生活中有所体现'}。`;
        } else if (position.name === '障碍') {
            reading += `\n${card.name}作为障碍出现，${isReversed ? '提示你可能过度执着于某些观念，需要释放和转化' : '其正面特质可能被误用，需要寻找平衡'}。`;
        } else if (position.name === '结果') {
            reading += `\n基于当前各方面因素，${card.name}作为最终结果指向了${isReversed ? '一个需要调整的方向' : '一个积极的发展方向'}。这不是注定的结局，而是基于当前能量的可能结果。`;
        } else {
            reading += `\n在${position.name}的位置上，${card.name}${isReversed ? '（逆位）' : '（正位）'}提供了重要的洞察。`;
        }
        
        const keyword = card.keywords[Math.floor(Math.random() * card.keywords.length)];
        reading += `\n\n💡 关键启示：关注"${keyword}"这个主题。`;
    }
    
    return reading;
}

function showReading() {
    const readingPanel = document.getElementById('readingPanel');
    const readingContent = document.getElementById('readingContent');
    
    let html = '<h3>牌义解读</h3>';
    
    if (userQuestion) {
        html += `<div class="question-display"><strong>你的问题：</strong>${userQuestion}</div>`;
    }
    
    drawnCards.forEach(cardData => {
        const orientation = cardData.isReversed ? '（逆位）' : '（正位）';
        const detailedReading = generateDetailedReading(cardData, userQuestion);
        
        html += `
            <div class="card-reading">
                <h4>
                    ${cardData.card.name}${orientation}
                    <span class="position">— ${cardData.position.name}</span>
                </h4>
                <div class="card-title">${cardData.position.description}</div>
                <div class="interpretation">${detailedReading.replace(/\n/g, '<br>')}</div>
            </div>
        `;
    });
    
    if (drawnCards.length > 1 && userQuestion) {
        html += `
            <div class="summary-reading">
                <h4>综合解读</h4>
                <p>将以上各张牌的含义综合起来，为你呈现一个完整的图景。每张牌都从不同角度回应你的问题。建议你：</p>
                <ul>
                    <li>关注各张牌之间的关联和对比</li>
                    <li>思考这些能量如何在你的实际生活中体现</li>
                    <li>根据牌面的指引，制定具体的行动计划</li>
                    <li>记住塔罗牌提供的是指引而非预言，最终的选择权在你手中</li>
                </ul>
            </div>
        `;
    }
    
    readingContent.innerHTML = html;
    readingPanel.classList.add('show');
}
