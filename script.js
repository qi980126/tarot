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

function analyzeQuestionType(question) {
    const q = question.toLowerCase();
    
    if (q.includes('感情') || q.includes('爱情') || q.includes('关系') || q.includes('恋爱') || q.includes('婚姻') || q.includes('他') || q.includes('她')) {
        return 'love';
    } else if (q.includes('事业') || q.includes('工作') || q.includes('职业') || q.includes('发展') || q.includes('晋升')) {
        return 'career';
    } else if (q.includes('选择') || q.includes('决定') || q.includes('应该') || q.includes('要不要') || q.includes('是否')) {
        return 'decision';
    } else if (q.includes('财运') || q.includes('钱') || q.includes('投资') || q.includes('收入')) {
        return 'money';
    } else {
        return 'general';
    }
}

function generateDetailedReading(cardData, question) {
    const card = cardData.card;
    const isReversed = cardData.isReversed;
    const position = cardData.position;
    const interpretation = isReversed ? card.reversed : card.upright;
    const orientation = isReversed ? '逆位' : '正位';
    
    let reading = `<span class="section-icon">📜</span> <span class="section-title">牌义核心</span>\n${interpretation}`;
    
    if (!question) {
        return reading;
    }
    
    const questionType = analyzeQuestionType(question);
    
    reading += `\n\n<span class="section-icon">🔮</span> <span class="section-title">深度解读</span>`;
    
    // 根据问题类型和位置深度分析
    if (questionType === 'love') {
        reading += generateLoveReading(card, isReversed, position, question);
    } else if (questionType === 'career') {
        reading += generateCareerReading(card, isReversed, position, question);
    } else if (questionType === 'decision') {
        reading += generateDecisionReading(card, isReversed, position, question);
    } else if (questionType === 'money') {
        reading += generateMoneyReading(card, isReversed, position, question);
    } else {
        reading += generateGeneralReading(card, isReversed, position, question);
    }
    
    // 心理层面洞察
    reading += `\n\n<span class="section-icon">🧠</span> <span class="section-title">心理洞察</span>`;
    reading += generatePsychologicalInsight(card, isReversed, position);
    
    // 行动建议
    reading += `\n\n<span class="section-icon">⚡</span> <span class="section-title">行动建议</span>`;
    reading += generateActionAdvice(card, isReversed, position, questionType);
    
    return reading;
}

function generateSymbolicReading(card, isReversed) {
    const cardName = card.name;
    let reading = '';
    
    const symbolMeanings = {
        '愚者': '悬崖边缘象征未知与冒险，白色小狗代表本能直觉，行囊暗示经验尚浅，向阳步伐体现信念与勇气。逆位时，悬崖变成陷阱，直觉变为鲁莽。',
        '魔术师': '桌上四元素（权杖、圣杯、宝剑、星币）象征掌控物质世界的能力，无限符号代表神圣连接，一手指天一手指地传递天地的能量桥梁。逆位时才能被误用或分散。',
        '女祭司': '柱子（黑与白）象征二元对立的平衡，帷幕后的水域代表潜意识深处，卷轴象征隐藏的智慧，月桂枝冠代表直觉与神圣知识。逆位时内在智慧被遮蔽。',
        '皇后': '丰饶的自然象征生命创造力，河边的坐姿显示与自然的融合，权杖上的石榴代表生育与丰收，皇冠的十二星象征黄道完整循环。逆位时创造力受阻。',
        '皇帝': '石座象征稳固权威，权杖代表生命力的掌控，盔甲显示战神特质，背景山脉暗示理性统治的结构。逆位时权威变成专制或失控。',
        '教皇': '三重权杖象征三界（身、心、灵）的指引，两把交叉钥匙代表开启神秘之门的权限，两位信徒显示传统传承，手势是祝福与教导。逆位时打破传统或虚伪教导。',
        '恋人': '伊甸园象征纯洁选择，天使代表神圣见证，善恶知识树的果实暗示选择后果，五人的裸露象征真实与脆弱。逆位时价值观冲突或关系失衡。',
        '战车': '斯芬克斯拉车象征对立力量的驾驭，盔甲上的新月代表灵性指引，城市背景显示征服的成就，手杖是意志力的象征。逆位时失控或方向迷失。',
        '力量': '女子轻抚狮子象征以柔克刚，无穷符号代表内在力量的永恒，狮子是原始本能，花朵项链显示对野性的驯服而非压制。逆位时内在力量薄弱。',
        '隐士': '雪山象征孤独的高度，提灯照亮黑暗代表内在智慧之光，手杖支持独自前行，灰色长袍显示中性与内省。逆位时过度孤立或逃避。',
        '命运之轮': '轮上的生物象征生命循环的不同阶段，斯芬克斯代表智慧的平衡点，阿努比斯是升起的指引，云中的神兽象征命运的神秘力量。逆位时抗拒变化。',
        '正义': '天平象征公正衡量，宝剑代表理性判断与因果，红色长袍显示正义的热情，石座显示客观立场。逆位时偏见或不公。',
        '倒吊人': '倒悬姿态象征视角转换，一只脚交叉形成牺牲符号，金色光环代表觉悟，从T型树延伸新叶象征重生。逆位时无意义的牺牲或拖延。',
        '死神': '骑白马的骷髅象征不可避免的转化，倒下的国王显示旧秩序的终结，升起的太阳代表新生，河流流向远方象征生命延续。逆位时抗拒改变或恐惧。',
        '节制': '天使一脚入水一脚在岸象征平衡，倾倒两杯水流显示调和的艺术，彩虹象征神圣盟约，山路的蜿蜒代表耐心渐进。逆位时失衡或极端。',
        '恶魔': '巨大的山羊象征物质诱惑与阴影面，锁链显示束缚但松动暗示可解脱，倒立的五芒星代表物质至上，两个奴隶象征沉溺。逆位时打破束缚或继续沉溺。',
        '塔': '闪电击塔象征不可避免的崩塌，坠落的两人代表旧结构的瓦解，火焰显示净化，倒塌的皇冠是虚假骄傲的终结。逆位时恐惧改变或内心崩塌。',
        '星星': '裸女倾水象征生命之流的滋养，一颗大星八颗小星代表九重天的祝福，池水分流显示物质与精神的平衡，鸟象征灵感飞翔。逆位时失去希望。',
        '月亮': '升落的龙虾象征从潜意识浮现，两只狗代表本能的呼唤，两塔之间的道路显示不确定的前行，月相变化象征幻象。逆位时走出迷雾或继续迷惑。',
        '太阳': '两个孩子象征纯真与喜悦，向日葵代表生命向阳，骑白马显示光明的前行，城墙显示安全庇护，阳光普照万物。逆位时暂时阴霾。',
        '审判': '天使吹号象征神圣召唤，亡者升起代表灵魂觉醒，雪山显示新生的纯净，号角声唤醒内在真实。逆位时拒绝召唤或自我怀疑。',
        '世界': '舞者象征生命的圆满，花环代表完成的循环，四活物象征四元素与四福音的整合，无尽的椭圆显示永恒循环。逆位时未完成或延迟。'
    };
    
    reading = symbolMeanings[cardName] || `${cardName}的图像蕴含${card.keywords.slice(0, 2).join('与')}的象征意义，通过视觉元素传递深层信息。`;
    
    if (isReversed) {
        reading += ` 逆位时图像能量反转，需要从相反角度理解象征。`;
    }
    
    return reading;
}

function generateNumerologyReading(card, isReversed) {
    const numeral = card.numeral;
    let reading = '';
    
    const numberMeanings = {
        '0': '0代表无限潜力与原始状态，既是起点也是终点，象征纯粹的创造能量。在灵数学中，0是精神的源头，代表未显化的可能性。',
        'I': '1是创造的开始，象征领导力、独立性与首创精神。灵数1代表自我意识的确立，行动的启动，是阳性主动能量的象征。',
        'II': '2象征对立统一与平衡，代表直觉、合作、二元性。灵数2是阴性的容纳能量，显示选择、对立面的调和、镜像反射。',
        'III': '3代表创造与表达，象征成长、扩展、三位一体。灵数3是创造的第一个完成态，显示思想的显化、成果的初现。',
        'IV': '4象征稳固与结构，代表秩序、基础、物质实现。灵数4是第一个物质稳定数，显示构建、根基、实际成果。',
        'V': '5代表变化与挑战，象征自由、冲突、学习。灵数4的稳定被打破，显示运动的开始、经验的积累、转折点。',
        'VI': '6象征和谐与责任，代表平衡、关系、服务。灵数6是第一个完美数（1+2+3=6），显示爱、责任、和谐关系。',
        'VII': '7代表灵性与分析，象征智慧、内省、神秘。灵数7是灵性觉醒数，显示深层理解、精神追求、内在探索。',
        'VIII': '8象征力量与因果，代表成就、循环、物质丰盛。灵数8是无限循环的象征，显示业力、回报、物质成功。',
        'IX': '9代表完成与智慧，象征人道、理想、终局。灵数9是数字周期的终结，显示智慧的圆满、准备新一轮开始。',
        'X': '10象征循环完成与新开始，代表命运、转折、整体。灵数10是1的更高层次（1+0=1），显示一个周期的结束与开启。',
        'XI': '11是大师数，象征灵性觉醒与启示，代表直觉与理性平衡。灵数11（1+1=2）是高层意识的对立统一。',
        'XII': '12代表圆满与服务，象征牺牲、完成、新视角。灵数12（1+2=3）是灵性创造的完成态，显示转化的智慧。',
        'XIII': '13象征转化与重生，代表结束、转变、神秘力量。灵数13（1+3=4）显示转化后的物质稳固，不是厄运而是新生。',
        'XIV': '14代表调和与平衡，象征中庸、节制、融合。灵数14（1+4=5）显示平衡后的运动与变化。',
        'XV': '15象征物质束缚，代表欲望、执着、阴影面。灵数15（1+5=6）显示物质世界的责任课题。',
        'XVI': '16代表崩塌与觉醒，象征突变、启示、解构。灵数16（1+6=7）显示破坏后的灵性觉醒。',
        'XVII': '17象征希望与疗愈，代表灵感、新生、神圣指引。灵数17（1+7=8）显示希望的力量与因果回报。',
        'XVIII': '18代表幻象与直觉，象征恐惧、潜意识、月相变化。灵数18（1+8=9）显示走出幻象的智慧完成。',
        'XIX': '19象征光明与成功，代表喜悦、生命力、真理显化。灵数19（1+9=10）显示成功后的新一轮开始。',
        'XX': '20代表觉醒与召唤，象征重生、抉择、更高使命。灵数20（2+0=2）显示觉醒后的新平衡。',
        'XXI': '21象征圆满与整合，代表完成、宇宙整体、新循环。灵数21（2+1=3）是最高层次的创造完成。',
        'A': '王牌(Ace)象征元素能量的纯粹表达，代表新机会、潜能、种子的力量。是火、水、风、土元素的原始形态。',
        '2': '2在小阿卡纳中象征对立与平衡，显示选择的开始、关系的建立、二元能量的互动。',
        '3': '3在小阿卡纳中代表初步成果，显示创造的显化、合作的成果、三元能量的流动。',
        '4': '4在小阿卡纳中象征稳固与基础，显示物质的实现、结构的建立、四方能量的支撑。',
        '5': '5在小阿卡纳中代表冲突与挑战，显示变化的开始、经验的获得、五芒星能量的流转。',
        '6': '6在小阿卡纳中象征和谐与慷慨，显示关系的平衡、给予接受、六芒星能量的整合。',
        '7': '7在小阿卡纳中代表反思与评估，显示内省的必要、灵性层面、七重能量的显化。',
        '8': '8在小阿卡纳中象征行动与运动，显示快速进展、因果循环、八方能量的流动。',
        '9': '9在小阿卡纳中代表完成前的坚持，显示努力的结果、接近圆满、九重能量的积淀。',
        '10': '10在小阿卡纳中象征周期完成，显示一个循环的终结、过度或圆满、新一轮的准备。',
        'P': '侍从(Page)象征元素能量的学习者，代表探索、好奇、年轻能量、消息的传递。',
        'K': '骑士(Knight)代表元素能量的行动者，显示追求、移动、积极表达、能量的推进。',
        'Q': '王后(Queen)象征元素能量的成熟女性表达，代表涵容、直觉、滋养、内向的掌控。',
        'King': '国王(King)代表元素能量的成熟男性表达，显示权威、掌控、外向表达、结构的建立。'
    };
    
    reading = numberMeanings[numeral] || `${numeral}承载着特定的灵数能量与数理意义，影响这张牌的核心频率。`;
    
    if (isReversed) {
        reading += ` 逆位时数理能量受阻或需要反向理解。`;
    }
    
    return reading;
}

function generateElementReading(card, isReversed) {
    const suit = card.suit || (card.arcana === 'major' ? 'major' : null);
    let reading = '';
    
    if (suit === 'major') {
        reading = `大阿卡纳超越单一元素，整合火（行动）、水（情感）、风（思维）、土（物质）四元素能量。`;
        reading += ` 愚者代表元素的原始混沌，世界象征元素的终极整合。中间的牌展示不同元素能量的主导阶段。`;
    } else if (suit === 'wands') {
        reading = `权杖对应火元素，象征行动、意志、创造力、事业、激情。`;
        reading += ` 火元素能量快速、主动、阳刚、外向，与事业进取、创意表达、竞争精神相关。`;
        reading += ` 在占星学上对应白羊座、狮子座、射手座，显示开创、表现、扩展的特质。`;
    } else if (suit === 'cups') {
        reading = `圣杯对应水元素，象征情感、直觉、关系、想象、灵性。`;
        reading += ` 水元素能量流动、容纳、阴柔、内向，与情感流动、潜意识、人际连接相关。`;
        reading += ` 在占星学上对应巨蟹座、天蝎座、双鱼座，显示滋养、转化、超越的特质。`;
    } else if (suit === 'swords') {
        reading = `宝剑对应风元素，象征思维、沟通、真理、冲突、理性。`;
        reading += ` 风元素能量清晰、锐利、中性、穿透，与逻辑分析、信息传递、决断力相关。`;
        reading += ` 在占星学上对应双子座、天秤座、水瓶座，显示沟通、平衡、创新的特质。`;
    } else if (suit === 'pentacles') {
        reading = `星币对应土元素，象征物质、现实、资源、身体、稳定。`;
        reading += ` 土元素能量稳固、厚重、实际、慢速，与财务状况、事业发展、身体健康相关。`;
        reading += ` 在占星学上对应金牛座、处女座、摩羯座，显示积累、完善、结构的特质。`;
    } else {
        reading = `这张牌承载特定元素能量，影响其在实际占卜中的表现领域。`;
    }
    
    if (isReversed) {
        reading += ` 逆位时元素能量受阻、过度或表达不当，需要识别是能量缺失还是能量误用。`;
    }
    
    return reading;
}

function generateLoveReading(card, isReversed, position, question) {
    let reading = `\n针对感情议题，${card.name}${isReversed ? '逆位' : '正位'}在${position.name}位置揭示了深层动态：`;
    
    const cardName = card.name;
    const keywords = card.keywords.slice(0, 2).join('与');
    
    if (position.name === '过去') {
        reading += `\n\n过去的情感经历中，${keywords}的能量塑造了你当前的关系模式。`;
        if (isReversed) {
            reading += ` 逆位显示过去的互动中存在未化解的情结：可能是信任受损、需求压抑、或界限模糊。这些模式像隐形剧本，仍在影响你对亲密关系的期待和行为。觉察这些根源，是转化当前困境的关键。`;
        } else {
            reading += ` 正位表明过去的经历为现在的感情观提供了养分：学会的课题、建立的价值、获得的能力都在此刻发挥作用。理解这个基础，有助于你更清晰地看待当前的关系状态。`;
        }
    } else if (position.name === '现在') {
        reading += `\n\n当前关系中，${keywords}的能量正在运作。`;
        if (isReversed) {
            reading += ` 逆位揭示了关系中的阻力点：沟通阻滞、需求错位、或亲密恐惧。这不一定是危机信号，而是提醒你关注被忽视的层面。常见表现包括：一方过度付出而另一方退缩、期待与现实脱节、或旧有防御机制被激活。识别具体卡点，才能精准解决。`;
        } else {
            reading += ` 正位显示关系能量流动顺畅，双方在${keywords}层面建立了积极互动。这是深化信任、推进承诺、或共同成长的窗口期。建议把握当下的契机，同时保持觉察，避免因顺利而忽视深层需求。`;
        }
    } else if (position.name === '未来') {
        reading += `\n\n感情的发展轨迹指向${keywords}能量的进一步显化。`;
        if (isReversed) {
            reading += ` 逆位警示：若不主动调整，关系可能陷入重复模式或渐行渐远。这不是预言，而是基于当前能量流动的可能性。好消息是，你有能力改变这个走向——关键在于识别并解决核心障碍，而非回避或压抑。`;
        } else {
            reading += ` 正位预示关系有向好的发展潜质：可能进入新阶段、达成重要共识、或经历共同成长。保持当前的投入和觉察，同时为下一步做好准备。`;
        }
    } else {
        reading += `\n\n${cardName}在此位置强调：${keywords}是需要关注的核心主题。`;
        if (isReversed) {
            reading += ` 逆位提示该层面存在待解决的张力，建议深入反思具体表现和根源。`;
        }
    }
    
    return reading;
}

function generateCareerReading(card, isReversed, position, question) {
    let reading = `\n就职业发展而言，${card.name}${isReversed ? '逆位' : '正位'}在${position.name}位置展现了关键动态：`;
    
    const cardName = card.name;
    const keywords = card.keywords.slice(0, 2).join('与');
    
    if (position.name === '过去') {
        reading += `\n\n职业历程中，${keywords}的经历塑造了你的工作模式和职业信念。`;
        if (isReversed) {
            reading += ` 逆位表明过去在相关领域遇到过挑战：可能是能力未获认可、机会错失、或方向迷茫。这些经历可能形成了自我设限的信念，如"我不够好"或"机会不属于我"。识别这些内在叙事，是突破瓶颈的前提。`;
        } else {
            reading += ` 正位显示过去的积累为当下奠定了基础：习得的技能、建立的人脉、验证的能力都在此刻可用。这是你的职业资本，理解其价值有助于更自信地面对当前机遇。`;
        }
    } else if (position.name === '现在') {
        reading += `\n\n当前职业状态的核心能量是${keywords}。`;
        if (isReversed) {
            reading += ` 逆位揭示职业困境：可能表现为动力枯竭、方向模糊、或环境制约。深层原因往往是能力与岗位不匹配、价值未获体现、或内在需求与外在要求冲突。建议诚实评估现状，区分哪些是可改变的，哪些需要接纳或转换。`;
        } else {
            reading += ` 正位显示职业发展势头积极，${keywords}的特质正在发挥优势。这是展示能力、拓展边界、或获得认可的有利时机。建议明确下一步目标，有策略地积累和展示，而非被动等待机会。`;
        }
    } else if (position.name === '未来') {
        reading += `\n\n职业发展的可能走向与${keywords}能量的表达方式密切相关。`;
        if (isReversed) {
            reading += ` 逆位提醒：维持现状可能遭遇停滞或倒退。这并非恐吓，而是基于当前轨迹的可能性分析。转化的关键在于主动作为——升级技能、调整方向、或转换环境。停滞往往源于被动，突破始于觉察和行动。`;
        } else {
            reading += ` 正位预示职业前景乐观：可能出现晋升机会、项目突破、或职业转型成功。建议提前准备，而非临阵磨枪。持续学习、扩展人脉、保持可见度，为机会到来做好准备。`;
        }
    } else {
        reading += `\n\n${cardName}在此强调：${keywords}是当前职业议题的核心。`;
        if (isReversed) {
            reading += ` 逆位提示该层面需要调整或转化，而非继续投入。`;
        }
    }
    
    return reading;
}

function generateDecisionReading(card, isReversed, position, question) {
    let reading = `\n面对选择，${card.name}${isReversed ? '逆位' : '正位'}提供了重要指引：`;
    
    const keywords = card.keywords.slice(0, 2).join('与');
    
    if (isReversed) {
        reading += `\n\n逆位警示当前决策存在隐患：`;
        reading += `\n• 信息不足：你掌握的情况可能不完整，建议收集更多资料、咨询不同立场的人`;
        reading += `\n• 认知偏差：${keywords}的能量受阻，意味着某些选项可能不符合你的真实需求`;
        reading += `\n• 时机未到：如果情况允许，延迟决定以便更清晰思考。仓促决策往往源于焦虑而非判断`;
        reading += `\n• 外在影响：觉察是否有他人期待、社会压力或恐惧驱动了你的倾向`;
    } else {
        reading += `\n\n正位支持你做出选择：`;
        reading += `\n• 能量支持：${keywords}的积极流向表明这个方向与你的深层需求协调`;
        reading += `\n• 判断合理：你的分析基础是稳健的，可以信任直觉与理性的结合`;
        reading += `\n• 时机成熟：过度延迟可能错失机会或消耗能量。准备七成即可行动`;
        reading += `\n• 长远一致：这个选择支持你更大的生命方向，而非仅仅是解决眼前问题`;
    }
    
    if (position.name === '过去') {
        reading += `\n\n过去的决策模式塑造了当前处境，理解这个模式有助于做出更清醒的选择。`;
    } else if (position.name === '未来') {
        reading += `\n\n这个选择将开启特定的发展路径，权衡其利弊并做好准备。`;
    }
    
    return reading;
}

function generateMoneyReading(card, isReversed, position, question) {
    let reading = `\n就财务层面，${card.name}${isReversed ? '逆位' : '正位'}在${position.name}位置揭示了重要信息：`;
    
    const keywords = card.keywords.slice(0, 2).join('与');
    
    if (isReversed) {
        reading += `\n\n逆位警示财务方面需要注意：`;
        reading += `\n• 能量阻滞：${keywords}的流动受阻，可能表现为收入停滞、意外支出、或判断失误`;
        reading += `\n• 风险提示：当前不适合冒进或高风险决策。稳健比收益更重要`;
        reading += `\n• 观念审视：检查是否有不健康的财务信念，如匮乏心态、过度消费、或回避理财`;
        reading += `\n• 重新评估：调整不切实际的期望，制定可行的财务计划`;
    } else {
        reading += `\n\n正位显示财务状况积极：`;
        reading += `\n• 能量顺畅：${keywords}支持财务增长和稳定`;
        reading += `\n• 机会显现：可能出现收入提升、投资回报、或理财机会`;
        reading += `\n• 决策稳健：你的财务判断基础良好，可以适度把握机会`;
        reading += `\n• 长期规划：这是积累和布局的有利时机`;
    }
    
    return reading;
}

function generateGeneralReading(card, isReversed, position, question) {
    let reading = `\n${card.name}${isReversed ? '逆位' : '正位'}在${position.name}位置揭示了当前情况的核心能量：`;
    
    const keywords = card.keywords.slice(0, 2).join('与');
    
    if (isReversed) {
        reading += `\n\n逆位提示：`;
        reading += `\n• ${keywords}的能量受到制约，影响了事情的发展`;
        reading += `\n• 需要识别并解决阻碍因素，而非回避或压抑`;
        reading += `\n• 这个位置指出了需要觉察和转化的具体层面`;
    } else {
        reading += `\n\n正位显示：`;
        reading += `\n• ${keywords}的积极特质正在发挥作用`;
        reading += `\n• 当前情况有良好基础和发展潜力`;
        reading += `\n• 可以信任事情朝积极方向演进的趋势`;
    }
    
    return reading;
}

function generatePsychologicalInsight(card, isReversed, position) {
    const cardName = card.name;
    let insight = '';
    
    const psychologicalThemes = {
        '愚者': '对未知的渴望与恐惧',
        '魔术师': '掌控感与自我效能',
        '女祭司': '直觉智慧与潜意识连接',
        '皇后': '滋养与被滋养的需求',
        '皇帝': '秩序、权威与控制',
        '恋人': '选择、关系与自我认同',
        '战车': '意志力与胜利驱动',
        '力量': '内在力量与自我掌控',
        '隐士': '独处与内在探索',
        '命运之轮': '变化感知与命运态度',
        '正义': '公平、因果与道德判断',
        '倒吊人': '暂停、牺牲与视角转换',
        '死神': '结束、转变与重生历程',
        '节制': '平衡、调和与耐心',
        '恶魔': '束缚、阴影与执着',
        '塔': '突变、觉醒与崩塌',
        '星星': '希望、疗愈与灵感',
        '月亮': '幻象、直觉与恐惧',
        '太阳': '快乐、成功与生命力',
        '审判': '觉醒、重生与召唤',
        '世界': '完成、整合与圆满'
    };
    
    const theme = psychologicalThemes[cardName] || `${card.keywords[0]}的心理维度`;
    
    if (isReversed) {
        insight = `${cardName}逆位在心理层面揭示：${theme}存在张力或扭曲。`;
        insight += ` 这反映内在某些需求未获健康表达，或某些模式需要觉察和调整。`;
        insight += ` 深层提问：是什么信念或情绪模式制约了这股能量的流动？`;
    } else {
        insight = `${cardName}正位显示：${theme}正以协调的方式表达。`;
        insight += ` 内在需求与外在行为基本平衡，心理状态支持当前的发展方向。`;
    }
    
    return insight;
}

function generateActionAdvice(card, isReversed, position, questionType) {
    const cardName = card.name;
    let advice = '';
    
    if (isReversed) {
        advice = `面对${cardName}逆位的挑战：\n`;
        
        if (questionType === 'love') {
            advice += `• 审视沟通模式，诚实表达需求而非期待对方读心\n`;
            advice += `• 疗愈过去创伤，避免无意识重演旧有剧本\n`;
            advice += `• 建立健康界限：既不过度依赖也不情感隔离`;
        } else if (questionType === 'career') {
            advice += `• 识别瓶颈根源：是能力、环境、还是心态？\n`;
            advice += `• 制定具体行动计划，分步骤推进\n`;
            advice += `• 提升关键技能，拓展支持网络`;
        } else if (questionType === 'decision') {
            advice += `• 收集更多信息，避免仓促决定\n`;
            advice += `• 听取多元意见，突破认知盲区\n`;
            advice += `• 反思真实需求，区分恐惧与直觉`;
        } else if (questionType === 'money') {
            advice += `• 审视财务状况，制定实际预算\n`;
            advice += `• 避免冲动消费和高风险投资\n`;
            advice += `• 必要时寻求专业理财建议`;
        } else {
            advice += `• 识别阻碍因素，制定解决方案\n`;
            advice += `• 调整期望，保持耐心和坚持\n`;
            advice += `• 寻求支持，不必独自承担`;
        }
    } else {
        advice = `顺应${cardName}正位的能量：\n`;
        
        if (questionType === 'love') {
            advice += `• 珍惜当前状态，持续投入和经营\n`;
            advice += `• 保持坦诚沟通，深化情感连接\n`;
            advice += `• 把握推进关系的契机`;
        } else if (questionType === 'career') {
            advice += `• 展示能力，把握出现的机会\n`;
            advice += `• 持续学习成长，为下一步准备\n`;
            advice += `• 扩展人脉，寻求导师指导`;
        } else if (questionType === 'decision') {
            advice += `• 信任判断，果断行动\n`;
            advice += `• 制定执行计划，稳步推进\n`;
            advice += `• 保持开放心态，灵活调整`;
        } else if (questionType === 'money') {
            advice += `• 把握理财机会，稳健投资\n`;
            advice += `• 持续积累，做好长期规划\n`;
            advice += `• 保持财务纪律，理性消费`;
        } else {
            advice += `• 积极行动，顺势而为\n`;
            advice += `• 保持信心，持续推进\n`;
            advice += `• 把握时机，实现目标`;
        }
    }
    
    return advice;
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
        const keywords = cardData.card.keywords.join(' · ');
        
        html += `
            <div class="card-reading">
                <h4>
                    ${cardData.card.name}${orientation}
                    <span class="position">— ${cardData.position.name}</span>
                </h4>
                <div class="card-title">${cardData.position.description}</div>
                <div class="card-keywords-display"><strong>关键词：</strong>${keywords}</div>
                <div class="interpretation">${detailedReading.replace(/\n/g, '<br>')}</div>
            </div>
        `;
    });
    
    if (drawnCards.length > 1 && userQuestion) {
        // 分析整体趋势
        let reversedCount = drawnCards.filter(c => c.isReversed).length;
        let positiveRatio = (drawnCards.length - reversedCount) / drawnCards.length;
        
        // 收集所有关键词
        let allKeywords = [];
        drawnCards.forEach(cardData => {
            allKeywords = allKeywords.concat(cardData.card.keywords);
        });
        
        // 找出重复的关键词
        let keywordCounts = {};
        allKeywords.forEach(k => {
            keywordCounts[k] = (keywordCounts[k] || 0) + 1;
        });
        let topKeywords = Object.entries(keywordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([k, count]) => k);
        
        html += `
            <div class="summary-reading">
                <h4><span class="section-icon">✨</span> 综合解读</h4>
                
                <div class="summary-section">
                    <strong>整体趋势：</strong>
                    ${positiveRatio >= 0.7 ? '牌面能量整体积极，正位占比高，显示当前发展方向顺畅，有利于推进目标。' : 
                      positiveRatio >= 0.4 ? '牌面能量呈现平衡态势，正逆位参半，提示需要同时关注机会与挑战。' : 
                      '牌面能量整体偏弱，逆位较多，警示当前存在阻碍需要解决，但这同时也是觉察和转化的契机。'}
                </div>
                
                <div class="summary-section">
                    <strong>核心主题：</strong>
                    整副牌反复出现的主题是${topKeywords.join('、')}，这指向你当前生命中最需要关注的层面。
                </div>
                
                <div class="summary-section">
                    <strong>发展脉络：</strong>
                    ${drawnCards.length === 3 ? 
                    `${drawnCards[0].card.name}（过去）→ ${drawnCards[1].card.name}（现在）→ ${drawnCards[2].card.name}（未来），显示了一条从过往经验到当前状态再到未来走向的完整轨迹。建议理解这个连续性，而非孤立看待每张牌。` :
                    `各张牌共同构成了当前情况的完整图景，每张牌从不同角度揭示了同一主题的不同面向。`}
                </div>
                
                <div class="summary-section">
                    <strong>关键洞察：</strong>
                    塔罗牌的指引基于当前能量状态，而非注定预言。你的觉察、选择和行动都有力量改变未来的走向。
                    牌面揭示的是：如果保持当前模式，可能的走向是什么；以及，如果想改变，需要在哪些层面下功夫。
                </div>
                
                <div class="summary-section" style="color: #d4af37; font-weight: 500;">
                    💡 建议将今天的解读记录下来，过一段时间回顾，会有新的领悟。塔罗的智慧往往在实践和反思中逐步显现。
                </div>
            </div>
        `;
    }
    
    readingContent.innerHTML = html;
    readingPanel.classList.add('show');
}
