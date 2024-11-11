class CoverageDemo {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                title: "初始化",
                description: "创建一个5个参数，每个参数有3个值的测试模型 (CA(N;2,3^5))。\n需要覆盖所有2-way组合。",
                code: `// example.model的内容
2    // 覆盖强度
5    // 参数个数
3 3 3 3 3    // 每个参数的取值个数`,
                action: this.initializeGrid.bind(this)
            },
            {
                title: "计算需要覆盖的组合",
                description: "计算所有需要覆盖的2-way组合数。\n对于5个参数，每个参数3个值，共需覆盖：C(5,2) × 3 × 3 = 90个组合。",
                code: `// 在SUT.cpp中计算组合数
int SCount = 0;
vector<int*> allP = allPos(parameter, tway);
for (auto pos : allP) {
    int allcomb = 1;
    for (int p = 0; p < tway; p++)
        allcomb = allcomb * value[pos[p]];
    SCount += allcomb;
}`,
                action: this.showCombinations.bind(this)
            },
            {
                title: "生成初始解",
                description: "随机生成一个初始测试用例，检查其覆盖了哪些组合。",
                code: `// 在PSO.h中初始化粒子
void randomInit() {
    for (int i = 0; i < dimension; i++)
        position[i] = rand() % range[i];
}`,
                action: this.generateInitialSolution.bind(this)
            },
            {
                title: "DPSO迭代优化",
                description: "使用DPSO算法不断优化测试用例，提高覆盖率。",
                code: `// 在PSO.h中的速度更新
void velocityUpdate(...) {
    velocity[v] = weight * velocity[v] +
                  factor1 * r1 * (pbest[v] - position[v]) +
                  factor2 * r2 * (gbest[v] - position[v]);
}`,
                action: this.showOptimization.bind(this)
            },
            {
                title: "完成覆盖",
                description: "当所有组合都被覆盖，或达到最大迭代次数时停止。",
                code: `// 在PSO.h中的终止条件
if (fit == sut->testcaseCoverMax) {
    // 所有组合都已覆盖
    return best;
}`,
                action: this.showFinalResult.bind(this)
            }
        ];
        
        this.initializeEventListeners();
        this.showStep(0);
    }

    initializeEventListeners() {
        document.getElementById('prevBtn').addEventListener('click', () => this.prevStep());
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('autoBtn').addEventListener('click', () => this.autoPlay());
    }

    // 初始化覆盖网格
    initializeGrid() {
        const grid = document.getElementById('coverage-grid');
        grid.innerHTML = '';
        // 创建5×3的网格，表示5个参数，每个参数3个值
        for (let i = 0; i < 5; i++) {
            for (let j = 0; j < 3; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.textContent = j;
                cell.dataset.param = i;
                cell.dataset.value = j;
                grid.appendChild(cell);
            }
        }
    }

    // 显示需要覆盖的组合
    showCombinations() {
        const view = document.getElementById('covered-pairs');
        view.innerHTML = '';
        // 显示一些示例组合
        const combinations = this.generateCombinations();
        combinations.slice(0, 5).forEach(comb => {
            const div = document.createElement('div');
            div.textContent = `参数${comb[0]}-${comb[1]}的组合`;
            view.appendChild(div);
        });
    }

    // 生成所有2-way组合
    generateCombinations() {
        const combinations = [];
        for (let i = 0; i < 5; i++) {
            for (let j = i + 1; j < 5; j++) {
                combinations.push([i, j]);
            }
        }
        return combinations;
    }

    // 生成初始解
    generateInitialSolution() {
        const grid = document.getElementById('coverage-grid');
        const cells = grid.getElementsByClassName('cell');
        // 随机标记一些单元格为已覆盖
        Array.from(cells).forEach(cell => {
            if (Math.random() < 0.3) {
                cell.classList.add('covered');
            }
        });
        this.updateCoverageInfo(30);
    }

    // 显示优化过程
    showOptimization() {
        const grid = document.getElementById('coverage-grid');
        const cells = grid.getElementsByClassName('cell');
        // 模拟优化过程，逐步增加覆盖率
        let coverage = 30;
        const interval = setInterval(() => {
            if (coverage < 80) {
                coverage += 5;
                this.updateCoverageInfo(coverage);
                Array.from(cells).forEach(cell => {
                    if (Math.random() < coverage/100) {
                        cell.classList.add('covered');
                    }
                });
            } else {
                clearInterval(interval);
            }
        }, 500);
    }

    // 显示最终结果
    showFinalResult() {
        const grid = document.getElementById('coverage-grid');
        const cells = grid.getElementsByClassName('cell');
        Array.from(cells).forEach(cell => {
            cell.classList.add('covered');
        });
        this.updateCoverageInfo(100);
    }

    // 更新覆盖信息
    updateCoverageInfo(percentage) {
        document.getElementById('coverage-percentage').textContent = `${percentage}%`;
        document.getElementById('covered-combinations').textContent = 
            Math.floor(percentage * 90 / 100);
        document.getElementById('total-combinations').textContent = '90';
        document.getElementById('progress').style.width = `${percentage}%`;
    }

    showStep(stepNumber) {
        const step = this.steps[stepNumber];
        document.getElementById('step-description').textContent = step.description;
        document.getElementById('current-code').textContent = step.code;
        step.action();
        
        // 更新按钮状态
        document.getElementById('prevBtn').disabled = stepNumber === 0;
        document.getElementById('nextBtn').disabled = stepNumber === this.steps.length - 1;
    }

    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.showStep(this.currentStep);
        }
    }

    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.showStep(this.currentStep);
        }
    }

    async autoPlay() {
        document.getElementById('autoBtn').disabled = true;
        while (this.currentStep < this.steps.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 3000));
            this.nextStep();
        }
        document.getElementById('autoBtn').disabled = false;
    }
}

// 页面加载完成后初始化演示
document.addEventListener('DOMContentLoaded', () => {
    const demo = new CoverageDemo();
}); 