class CoveringArray {
    constructor(strength, parameters, values) {
        this.strength = strength;
        this.parameters = parameters;
        this.values = values;
        this.combinations = this.generateCombinations();
    }

    generateCombinations() {
        // 生成所有需要覆盖的组合
        let combinations = new Set();
        let indices = Array(this.strength).fill(0);
        
        const generate = (pos, start) => {
            if (pos === this.strength) {
                combinations.add(indices.join(','));
                return;
            }
            for (let i = start; i < this.parameters; i++) {
                indices[pos] = i;
                generate(pos + 1, i + 1);
            }
        };
        
        generate(0, 0);
        return combinations;
    }

    calculateCoverage(array) {
        let covered = 0;
        for (let combination of this.combinations) {
            let indices = combination.split(',').map(Number);
            let values = new Set();
            
            for (let row of array) {
                values.add(indices.map(i => row[i]).join(','));
            }
            
            if (values.size === Math.pow(this.values, indices.length)) {
                covered++;
            }
        }
        return covered / this.combinations.size;
    }
}

class Particle {
    constructor(size, parameters, values) {
        this.position = Array(size).fill().map(() => 
            Array(parameters).fill().map(() => 
                Math.floor(Math.random() * values)
            )
        );
        this.velocity = Array(size).fill().map(() => 
            Array(parameters).fill().map(() => 
                Math.random() * 2 - 1
            )
        );
        this.bestPosition = JSON.parse(JSON.stringify(this.position));
        this.bestFitness = -Infinity;
    }

    updateVelocity(w, c1, c2, globalBest) {
        for (let i = 0; i < this.position.length; i++) {
            for (let j = 0; j < this.position[i].length; j++) {
                let r1 = Math.random();
                let r2 = Math.random();
                this.velocity[i][j] = w * this.velocity[i][j] +
                    c1 * r1 * (this.bestPosition[i][j] - this.position[i][j]) +
                    c2 * r2 * (globalBest[i][j] - this.position[i][j]);
            }
        }
    }

    updatePosition(values) {
        for (let i = 0; i < this.position.length; i++) {
            for (let j = 0; j < this.position[i].length; j++) {
                this.position[i][j] = Math.floor(this.position[i][j] + this.velocity[i][j]);
                // 边界处理
                if (this.position[i][j] >= values) {
                    this.position[i][j] = values - 1;
                }
                if (this.position[i][j] < 0) {
                    this.position[i][j] = 0;
                }
            }
        }
    }
}

class PSO {
    constructor() {
        // 覆盖数组参数
        this.strength = 2;
        this.parameters = 5;
        this.values = 3;
        this.arraySize = 20;

        // PSO参数
        this.numParticles = 80;
        this.w = 0.9;
        this.c1 = 1.3;
        this.c2 = 1.3;
        
        this.coveringArray = new CoveringArray(this.strength, this.parameters, this.values);
        this.particles = [];
        this.globalBest = null;
        this.globalBestFitness = -Infinity;
        this.iteration = 0;
        this.maxIterations = 250;
        this.isRunning = false;

        this.initializeParticles();
        this.updateUI();
    }

    initializeParticles() {
        this.particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push(new Particle(this.arraySize, this.parameters, this.values));
        }
        this.globalBest = null;
        this.globalBestFitness = -Infinity;
    }

    calculateFitness(position) {
        return this.coveringArray.calculateCoverage(position);
    }

    update() {
        if (!this.isRunning || this.iteration >= this.maxIterations) return;

        // 更新全局最优
        for (let particle of this.particles) {
            let fitness = this.calculateFitness(particle.position);
            
            if (fitness > particle.bestFitness) {
                particle.bestFitness = fitness;
                particle.bestPosition = JSON.parse(JSON.stringify(particle.position));
            }

            if (fitness > this.globalBestFitness) {
                this.globalBestFitness = fitness;
                this.globalBest = JSON.parse(JSON.stringify(particle.position));
            }
        }

        // 更新所有粒子
        for (let particle of this.particles) {
            particle.updateVelocity(this.w, this.c1, this.c2, this.globalBest);
            particle.updatePosition(this.values);
        }

        this.iteration++;
        this.updateUI();
        
        requestAnimationFrame(() => this.update());
    }

    updateUI() {
        // 更新统计信息
        document.getElementById('iterations').textContent = this.iteration;
        document.getElementById('coverage').textContent = 
            (this.globalBestFitness * 100).toFixed(2) + '%';
        document.getElementById('best-size').textContent = 
            this.globalBest ? this.globalBest.length : 0;

        // 更新覆盖网格
        const grid = document.getElementById('coverage-grid');
        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${this.parameters}, 20px)`;

        if (this.globalBest) {
            for (let row of this.globalBest) {
                for (let value of row) {
                    const cell = document.createElement('div');
                    cell.className = 'cell' + (value ? ' covered' : '');
                    cell.textContent = value;
                    grid.appendChild(cell);
                }
            }
        }
    }

    start() {
        this.isRunning = true;
        this.update();
    }

    pause() {
        this.isRunning = false;
    }

    reset() {
        this.iteration = 0;
        this.initializeParticles();
        this.updateUI();
    }
}

class PSODemo {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                title: "初始化",
                description: "1. 初始化参数设置\n2. 随机生成初始粒子群\n3. 设置初始速度和位置",
                code: `// 初始化粒子
particles = new Array(numParticles);
for (let i = 0; i < numParticles; i++) {
    particles[i] = {
        position: randomPosition(),
        velocity: randomVelocity(),
        bestPosition: null,
        bestFitness: -Infinity
    };
}`
            },
            {
                title: "评估适应度",
                description: "计算每个粒子的适应度值，并更新个体最优位置",
                code: `// 计算适应度
for (let particle of particles) {
    let fitness = calculateFitness(particle.position);
    if (fitness > particle.bestFitness) {
        particle.bestFitness = fitness;
        particle.bestPosition = particle.position;
    }
}`
            },
            {
                title: "更新全局最优",
                description: "比较所有粒子的适应度，更新全局最优位置",
                code: `// 更新全局最优
if (particle.bestFitness > globalBestFitness) {
    globalBestFitness = particle.bestFitness;
    globalBestPosition = particle.bestPosition;
}`
            },
            {
                title: "更新速度",
                description: "根据PSO速度更新公式计算新的速度",
                code: `// 速度更新公式
v = w*v + c1*r1*(pBest - x) + c2*r2*(gBest - x)
where:
w = 惯性权重
c1, c2 = 加速常数
r1, r2 = 随机数[0,1]`
            },
            {
                title: "更新位置",
                description: "根据新速度更新粒子位置，并处理边界约束",
                code: `// 位置更新
position += velocity;

// 边界处理
if (position > maxBound) 
    position = maxBound;
if (position < minBound)
    position = minBound;`
            },
            {
                title: "收敛判断",
                description: "检查是否达到终止条件（最大迭代次数或目标适应度）",
                code: `if (iteration >= maxIterations || 
    bestFitness >= targetFitness) {
    return globalBestPosition;
} else {
    iteration++;
    goto Step 2;
}`
            }
        ];
        
        this.setupEventListeners();
        this.updateUI();
    }

    setupEventListeners() {
        document.getElementById('prev-step').addEventListener('click', () => this.prevStep());
        document.getElementById('next-step').addEventListener('click', () => this.nextStep());
        document.getElementById('play-all').addEventListener('click', () => this.playAll());
    }

    async playAll() {
        document.getElementById('play-all').disabled = true;
        while (this.currentStep < this.steps.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            this.nextStep();
        }
        document.getElementById('play-all').disabled = false;
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateUI();
        }
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.updateUI();
        }
    }

    updateUI() {
        // 更新步骤指示器
        document.querySelectorAll('.step-dot').forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index === this.currentStep) {
                dot.classList.add('active');
            } else if (index < this.currentStep) {
                dot.classList.add('completed');
            }
        });

        // 更新步骤内容
        const step = this.steps[this.currentStep];
        document.getElementById('step-title').textContent = step.title;
        document.getElementById('step-description').textContent = step.description;
        document.getElementById('step-code').textContent = step.code;

        // 更新进度
        document.getElementById('current-step').textContent = 
            `${this.currentStep + 1}/${this.steps.length}`;
        const progress = ((this.currentStep + 1) / this.steps.length) * 100;
        document.querySelector('.progress-bar-fill').style.width = `${progress}%`;

        // 更新按钮状态
        document.getElementById('prev-step').disabled = this.currentStep === 0;
        document.getElementById('next-step').disabled = this.currentStep === this.steps.length - 1;

        // 更新可视化
        this.updateVisualization();
    }

    updateVisualization() {
        const viz = document.getElementById('visualization');
        viz.innerHTML = '';

        // 根据当前步骤创建不同的可视化效果
        switch(this.currentStep) {
            case 0: // 初始化
                this.createParticles(viz, 10, true);
                break;
            case 1: // 评估适应度
                this.createParticles(viz, 10, false);
                this.showFitnessEvaluation(viz);
                break;
            case 2: // 更新全局最优
                this.createParticles(viz, 10, false);
                this.showGlobalBest(viz);
                break;
            case 3: // 更新速度
                this.createParticles(viz, 10, false);
                this.showVelocityUpdate(viz);
                break;
            case 4: // 更新位置
                this.createParticles(viz, 10, false);
                this.showPositionUpdate(viz);
                break;
            case 5: // 收敛判断
                this.createParticles(viz, 10, false);
                this.showConvergence(viz);
                break;
        }
    }

    createParticles(container, count, initial = true) {
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = `${Math.random() * 80 + 10}%`;
            particle.style.top = `${Math.random() * 80 + 10}%`;
            container.appendChild(particle);
        }
    }

    showFitnessEvaluation(container) {
        const particles = container.querySelectorAll('.particle');
        particles.forEach(p => {
            const fitness = Math.random();
            p.style.opacity = 0.3 + fitness * 0.7;
        });
    }

    showGlobalBest(container) {
        const particles = container.querySelectorAll('.particle');
        const bestIndex = Math.floor(Math.random() * particles.length);
        particles[bestIndex].classList.add('best');
    }

    showVelocityUpdate(container) {
        const particles = container.querySelectorAll('.particle');
        particles.forEach(p => {
            const arrow = document.createElement('div');
            arrow.className = 'velocity-arrow';
            arrow.style.width = '20px';
            arrow.style.height = '2px';
            arrow.style.background = '#2196F3';
            arrow.style.position = 'absolute';
            arrow.style.left = p.style.left;
            arrow.style.top = p.style.top;
            container.appendChild(arrow);
        });
    }

    showPositionUpdate(container) {
        const particles = container.querySelectorAll('.particle');
        particles.forEach(p => {
            const newLeft = parseFloat(p.style.left) + (Math.random() * 20 - 10);
            const newTop = parseFloat(p.style.top) + (Math.random() * 20 - 10);
            p.style.left = `${Math.max(10, Math.min(90, newLeft))}%`;
            p.style.top = `${Math.max(10, Math.min(90, newTop))}%`;
        });
    }

    showConvergence(container) {
        const particles = container.querySelectorAll('.particle');
        const centerX = 50;
        const centerY = 50;
        particles.forEach(p => {
            p.style.left = `${centerX + (Math.random() * 10 - 5)}%`;
            p.style.top = `${centerY + (Math.random() * 10 - 5)}%`;
        });
    }
}

// 初始化演示
const demo = new PSODemo();

// 初始化
let pso = new PSO();

function startSimulation() {
    pso.start();
}

function pauseSimulation() {
    pso.pause();
}

function resetSimulation() {
    pso.reset();
}

// 参数更新事件监听
document.getElementById('numParticles').addEventListener('change', (e) => {
    pso.numParticles = parseInt(e.target.value);
    pso.reset();
});

document.getElementById('inertia').addEventListener('change', (e) => {
    pso.w = parseFloat(e.target.value);
});

document.getElementById('acceleration').addEventListener('change', (e) => {
    pso.c1 = pso.c2 = parseFloat(e.target.value);
});

document.getElementById('algorithm').addEventListener('change', (e) => {
    // 根据不同算法设置默认参数
    switch(e.target.value) {
        case 'DPSO':
            pso.w = 0.5;
            break;
        case 'CPSO':
            pso.w = 0.9;
            break;
        // ... 其他算法的参数设置
    }
    document.getElementById('inertia').value = pso.w;
    pso.reset();
}); 