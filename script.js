// 茶言觀色·客戶流失風險評估器 - 主邏輯
// 數據來源：從 Colab 分析得出的結果：整體流失率 21%，關鍵因素為「距上次到店天數」（重要性 32.8%）

document.addEventListener('DOMContentLoaded', function() {
    // 獲取 DOM 元素
    const ageInput = document.getElementById('age');
    const totalSpendingInput = document.getElementById('total-spending');
    const visitFrequencySelect = document.getElementById('visit-frequency');
    const daysSinceLastVisitSlider = document.getElementById('days-since-last-visit');
    const daysValueDisplay = document.getElementById('days-value');
    const calculateBtn = document.getElementById('calculate-btn');
    
    // 結果顯示元素
    const riskLevelTitle = document.getElementById('risk-level-title');
    const riskPercentage = document.getElementById('risk-percentage');
    const riskProgress = document.getElementById('risk-progress');
    const recommendationsList = document.getElementById('recommendations-list');
    
    // 初始化滑塊顯示
    updateDaysValue();
    
    // 事件監聽器
    daysSinceLastVisitSlider.addEventListener('input', updateDaysValue);
    calculateBtn.addEventListener('click', calculateRisk);
    
    // 初始計算
    calculateRisk();
    
    // 更新天數顯示
    function updateDaysValue() {
        const value = daysSinceLastVisitSlider.value;
        daysValueDisplay.textContent = `${value} 天`;
    }
    
    // 計算流失風險
    function calculateRisk() {
        // 獲取輸入值
        const age = parseInt(ageInput.value) || 28;
        const totalSpending = parseInt(totalSpendingInput.value) || 1250;
        const visitFrequency = visitFrequencySelect.value;
        const daysSinceLastVisit = parseInt(daysSinceLastVisitSlider.value) || 14;
        
        // 計算各因素得分
        const ageScore = calculateAgeScore(age);
        const spendingScore = calculateSpendingScore(totalSpending);
        const frequencyScore = calculateFrequencyScore(visitFrequency);
        const daysScore = calculateDaysScore(daysSinceLastVisit);
        
        // 權重分配 (根據 Colab 分析結果)
        const weights = {
            daysSinceLastVisit: 0.328,  // 32.8%
            visitFrequency: 0.293,
            totalSpending: 0.234,
            age: 0.145
        };
        
        // 計算加權總分
        const weightedScore = 
            (daysScore * weights.daysSinceLastVisit) +
            (frequencyScore * weights.visitFrequency) +
            (spendingScore * weights.totalSpending) +
            (ageScore * weights.age);
        
        // 轉換為風險百分比 (0-100%)
        const riskPercent = Math.min(Math.max(Math.round(weightedScore * 100), 0), 100);
        
        // 確定風險等級
        const riskLevel = determineRiskLevel(riskPercent);
        
        // 更新 UI
        updateRiskDisplay(riskPercent, riskLevel);
        updateRecommendations(riskPercent, riskLevel, daysSinceLastVisit, visitFrequency);
        
        // 添加動畫效果
        animateRiskProgress(riskPercent);
    }
    
    // 計算年齡得分 (0-1，越低越好)
    function calculateAgeScore(age) {
        if (age < 25) return 0.3;
        if (age < 35) return 0.2;
        if (age < 50) return 0.4;
        return 0.6; // 50歲以上
    }
    
    // 計算消費得分 (0-1，越高越好)
    function calculateSpendingScore(spending) {
        if (spending < 500) return 0.7;
        if (spending < 1000) return 0.5;
        if (spending < 2000) return 0.3;
        return 0.1; // 2000以上
    }
    
    // 計算到店頻率得分 (0-1，越高越好)
    function calculateFrequencyScore(frequency) {
        const frequencyScores = {
            'weekly-multiple': 0.1,    // 每週多次
            'weekly-once': 0.2,        // 每週一次
            'monthly-multiple': 0.4,   // 每月多次
            'monthly-once': 0.7,       // 每月一次
            'rare': 0.9                // 罕見
        };
        return frequencyScores[frequency] || 0.5;
    }
    
    // 計算上次到店天數得分 (0-1，越低越好)
    function calculateDaysScore(days) {
        if (days < 7) return 0.1;
        if (days < 14) return 0.3;
        if (days < 30) return 0.5;
        if (days < 60) return 0.7;
        return 0.9; // 60天以上
    }
    
    // 確定風險等級
    function determineRiskLevel(percent) {
        if (percent < 30) return 'low';
        if (percent < 60) return 'medium';
        return 'high';
    }
    
    // 更新風險顯示
    function updateRiskDisplay(percent, level) {
        // 更新百分比
        riskPercentage.textContent = `${percent}%`;
        
        // 更新風險等級標題和顏色
        let levelText, levelColor;
        switch(level) {
            case 'low':
                levelText = 'LOW 低風險';
                levelColor = '#10b981'; // green-500
                break;
            case 'medium':
                levelText = 'MEDIUM 中風險';
                levelColor = '#f59e0b'; // yellow-500
                break;
            case 'high':
                levelText = 'HIGH 高風險';
                levelColor = '#ef4444'; // red-500
                break;
        }
        
        riskLevelTitle.textContent = levelText;
        riskLevelTitle.className = 'text-3xl font-black';
        riskLevelTitle.classList.add(`risk-${level}`);
        
        // 更新進度條
        const dashArray = `${percent}, 100`;
        riskProgress.setAttribute('stroke-dasharray', dashArray);
        riskProgress.setAttribute('stroke', levelColor);
        
        // 更新進度條顏色類
        riskProgress.classList.remove('stroke-green-500', 'stroke-yellow-500', 'stroke-red-500');
        if (level === 'low') riskProgress.classList.add('stroke-green-500');
        else if (level === 'medium') riskProgress.classList.add('stroke-yellow-500');
        else riskProgress.classList.add('stroke-red-500');
    }
    
    // 更新建議
    function updateRecommendations(percent, level, daysSinceLastVisit, visitFrequency) {
        // 清空現有建議
        recommendationsList.innerHTML = '';
        
        // 根據風險等級和天數生成建議
        const recommendations = [];
        
        // 通用建議
        if (percent > 40) {
            recommendations.push({
                text: `客戶已有 <strong>${daysSinceLastVisit} 天</strong>未到店，建議發送專屬優惠券吸引回流。`,
                priority: 1
            });
        }
        
        if (level === 'high') {
            recommendations.push({
                text: '流失風險高，建議指派專屬客戶經理進行關懷聯繫。',
                priority: 1
            });
            recommendations.push({
                text: '考慮提供限時升級會員等級優惠，提升客戶忠誠度。',
                priority: 2
            });
        } else if (level === 'medium') {
            recommendations.push({
                text: '風險處於中等水平，建議定期推播新品或活動資訊維持互動。',
                priority: 1
            });
            recommendations.push({
                text: '可邀請參加會員專屬活動，增強品牌歸屬感。',
                priority: 2
            });
        } else {
            recommendations.push({
                text: '客戶忠誠度良好，建議維持現有服務品質並適時給予驚喜回饋。',
                priority: 1
            });
            recommendations.push({
                text: '可考慮邀請成為品牌推薦大使，給予額外獎勵。',
                priority: 2
            });
        }
        
        // 根據到店頻率添加特定建議
        if (visitFrequency === 'rare' || visitFrequency === 'monthly-once') {
            recommendations.push({
                text: '到店頻率較低，建議推出「連續到店獎勵」計畫刺激消費頻率。',
                priority: 3
            });
        }
        
        // 根據天數添加特定建議
        if (daysSinceLastVisit > 30) {
            recommendations.push({
                text: '超過一個月未消費，建議進行客戶滿意度調查了解原因。',
                priority: 2
            });
        }
        
        // 排序並顯示建議 (優先級高的先顯示)
        recommendations.sort((a, b) => a.priority - b.priority);
        
        // 只顯示前3條建議
        const topRecommendations = recommendations.slice(0, 3);
        
        // 添加到列表
        topRecommendations.forEach(rec => {
            const li = document.createElement('li');
            li.className = 'flex gap-2';
            li.innerHTML = `
                <span class="text-primary">•</span>
                <span>${rec.text}</span>
            `;
            recommendationsList.appendChild(li);
        });
        
        // 如果沒有建議，添加默認建議
        if (topRecommendations.length === 0) {
            const li = document.createElement('li');
            li.className = 'flex gap-2';
            li.innerHTML = `
                <span class="text-primary">•</span>
                <span>繼續保持優質服務，定期關注客戶消費行為變化。</span>
            `;
            recommendationsList.appendChild(li);
        }
    }
    
    // 動畫顯示風險進度
    function animateRiskProgress(targetPercent) {
        // 重置動畫類
        riskProgress.classList.remove('risk-progress');
        
        // 觸發重排以重新啟動動畫
        void riskProgress.offsetWidth;
        
        // 添加動畫類
        riskProgress.classList.add('risk-progress');
        
        // 更新動畫屬性
        setTimeout(() => {
            const dashArray = `${targetPercent}, 100`;
            riskProgress.setAttribute('stroke-dasharray', dashArray);
        }, 10);
    }
    
    // 添加表單驗證
    function validateForm() {
        const age = parseInt(ageInput.value);
        const spending = parseInt(totalSpendingInput.value);
        
        let isValid = true;
        let errorMessage = '';
        
        if (isNaN(age) || age < 18 || age > 80) {
            isValid = false;
            errorMessage = '年齡必須在18-80歲之間';
            ageInput.classList.add('border-red-500');
        } else {
            ageInput.classList.remove('border-red-500');
        }
        
        if (isNaN(spending) || spending < 0) {
            isValid = false;
            errorMessage = '消費金額必須為正數';
            totalSpendingInput.classList.add('border-red-500');
        } else {
            totalSpendingInput.classList.remove('border-red-500');
        }
        
        if (!isValid) {
            alert(`輸入錯誤：${errorMessage}`);
            return false;
        }
        
        return true;
    }
    
    // 修改計算按鈕點擊處理
    calculateBtn.addEventListener('click', function(e) {
        e.preventDefault();
        if (validateForm()) {
            calculateRisk();
            
            // 添加按鈕反饋動畫
            calculateBtn.classList.add('opacity-80');
            setTimeout(() => {
                calculateBtn.classList.remove('opacity-80');
            }, 300);
        }
    });
    
    // 添加輸入框即時驗證
    ageInput.addEventListener('blur', validateForm);
    totalSpendingInput.addEventListener('blur', validateForm);
    
    // 添加鍵盤快捷鍵支持
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            calculateBtn.click();
        }
    });
    
    // 初始化工具提示
    initTooltips();
    
    // 初始化工具提示函數
    function initTooltips() {
        // 為輸入框添加工具提示
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            const label = input.previousElementSibling;
            if (label && label.tagName === 'LABEL') {
                input.title = `輸入${label.textContent.trim()}以進行風險評估`;
            }
        });
    }
    
    // 導出計算函數供測試使用
    window.calculateRisk = calculateRisk;
    
    console.log('茶言觀色·客戶流失風險評估器已初始化完成');
});