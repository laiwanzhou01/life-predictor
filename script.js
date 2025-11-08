// 基准寿命数据（基于中国平均预期寿命）
const BASE_LIFESPAN = {
    male: 75,
    female: 80
};

// 人类寿命的生理极限
const LIFESPAN_LIMITS = {
    min: 30,    // 理论最小寿命（当前年龄+极端不良生活习惯）
    max: 122,   // Jeanne Calment 人类有记录的最长寿命
    realistic_max: 115  // 现实可达的最大寿命
};

// ACM值到寿命变化的转换函数
// 根据指南中的公式: ΔLifeSpan = (1/(1+ΔACM)-1)*10
function acmToLifespanChange(acmChange) {
    // acmChange 为百分比形式，如 -10 表示降低10%
    const acmDecimal = acmChange / 100;
    const lifespanChange = (1 / (1 + acmDecimal) - 1) * 10;
    return lifespanChange;
}

// 应用寿命上下限限制
function applyLifespanLimits(lifespan, currentAge) {
    // 确保不低于当前年龄
    lifespan = Math.max(lifespan, currentAge);
    
    // 应用现实最大寿命限制
    lifespan = Math.min(lifespan, LIFESPAN_LIMITS.realistic_max);
    
    // 极端情况下的下限
    const minimumLifespan = Math.max(currentAge + 1, LIFESPAN_LIMITS.min);
    lifespan = Math.max(lifespan, minimumLifespan);
    
    return lifespan;
}

// 获取所有影响因素的ACM值
function getImpactFactors(formData) {
    const impacts = [];
    
    // 饮食 - 固体
    const meatImpact = {
        white: { value: -7, label: '白肉摄入', category: '饮食-固体' },
        mixed: { value: 0, label: '混合肉类', category: '饮食-固体' },
        red: { value: 7, label: '红肉摄入', category: '饮食-固体' }
    }[formData.meatType];
    impacts.push(meatImpact);
    
    const vegImpact = {
        high: { value: -21, label: '蔬果摄入充足' },
        medium: { value: -10, label: '蔬果摄入中等' },
        low: { value: 0, label: '蔬果摄入不足' }
    }[formData.vegetableFruit];
    impacts.push(vegImpact);
    
    const chiliImpact = {
        regular: { value: -23, label: '经常吃辣' },
        sometimes: { value: -10, label: '偶尔吃辣' },
        never: { value: 0, label: '不吃辣' }
    }[formData.chili];
    impacts.push(chiliImpact);
    
    const nutsImpact = {
        daily: { value: -20, label: '每日坚果' },
        weekly: { value: -15, label: '每周坚果' },
        occasionally: { value: -7, label: '偶尔坚果' },
        never: { value: 0, label: '不吃坚果' }
    }[formData.nuts];
    impacts.push(nutsImpact);
    
    const processedImpact = {
        rare: { value: -40, label: '很少吃加工食品' },
        sometimes: { value: -20, label: '偶尔吃加工食品' },
        regular: { value: 0, label: '经常吃加工食品' },
        frequent: { value: 25, label: '频繁吃加工食品' }
    }[formData.ultraProcessed];
    impacts.push(processedImpact);
    
    // 饮食 - 液体
    const coffeeImpact = {
        optimal: { value: -17, label: '最优咖啡摄入' },
        moderate: { value: -10, label: '适量咖啡' },
        light: { value: -5, label: '少量咖啡' },
        none: { value: 0, label: '不喝咖啡' }
    }[formData.coffee];
    impacts.push(coffeeImpact);
    
    const milkImpact = {
        high: { value: -17, label: '充足牛奶' },
        medium: { value: -10, label: '适量牛奶' },
        low: { value: -5, label: '少量牛奶' },
        none: { value: 0, label: '不喝牛奶' }
    }[formData.milk];
    impacts.push(milkImpact);
    
    const teaImpact = {
        daily: { value: -12, label: '每日饮茶' },
        regular: { value: -8, label: '经常饮茶' },
        occasionally: { value: -4, label: '偶尔饮茶' },
        never: { value: 0, label: '不喝茶' }
    }[formData.tea];
    impacts.push(teaImpact);
    
    const sugaryImpact = {
        none: { value: 0, label: '不喝含糖饮料' },
        rare: { value: 3, label: '偶尔含糖饮料' },
        daily: { value: 7, label: '每日含糖饮料' },
        multiple: { value: 21, label: '大量含糖饮料' }
    }[formData.sugaryDrinks];
    impacts.push(sugaryImpact);
    
    const alcoholImpact = {
        none: { value: 0, label: '不饮酒' },
        light: { value: 10, label: '少量饮酒' },
        moderate: { value: 30, label: '中等饮酒' },
        heavy: { value: 50, label: '大量饮酒' }
    }[formData.alcohol];
    impacts.push(alcoholImpact);
    
    // 吸烟和光照
    const smokingImpact = {
        never: { value: 0, label: '从不吸烟' },
        quit: { value: 10, label: '已戒烟' },
        light: { value: 17, label: '轻度吸烟' },
        heavy: { value: 54, label: '重度吸烟' }
    }[formData.smoking];
    impacts.push(smokingImpact);
    
    const sunlightImpact = {
        regular: { value: -40, label: '经常晒太阳' },
        sometimes: { value: -20, label: '偶尔晒太阳' },
        rare: { value: 0, label: '很少晒太阳' }
    }[formData.sunlight];
    impacts.push(sunlightImpact);
    
    // 运动
    const racquetImpact = {
        regular: { value: -47, label: '规律挥拍运动' },
        sometimes: { value: -25, label: '偶尔挥拍运动' },
        rare: { value: -10, label: '很少挥拍运动' },
        never: { value: 0, label: '不做挥拍运动' }
    }[formData.racquetSports];
    impacts.push(racquetImpact);
    
    const intenseImpact = {
        high: { value: -40, label: '高强度运动' },
        medium: { value: -25, label: '中等强度运动' },
        low: { value: -10, label: '低强度运动' },
        none: { value: 0, label: '不做剧烈运动' }
    }[formData.intenseExercise];
    impacts.push(intenseImpact);
    
    const stepsImpact = {
        high: { value: -50, label: '每日步数充足' },
        medium: { value: -30, label: '每日步数中等' },
        low: { value: -15, label: '每日步数较少' },
        veryLow: { value: 0, label: '每日步数很少' }
    }[formData.dailySteps];
    impacts.push(stepsImpact);
    
    const teethImpact = {
        twice: { value: -25, label: '规律刷牙' },
        once: { value: -12, label: '每日刷牙一次' },
        irregular: { value: 0, label: '不规律刷牙' }
    }[formData.brushTeeth];
    impacts.push(teethImpact);
    
    const bathImpact = {
        daily: { value: -28, label: '每日泡澡' },
        regular: { value: -15, label: '经常泡澡' },
        sometimes: { value: -7, label: '偶尔泡澡' },
        rare: { value: 0, label: '很少泡澡' }
    }[formData.bathing];
    impacts.push(bathImpact);
    
    // 睡眠
    const sleepDurationImpact = {
        optimal: { value: 0, label: '最优睡眠时长' },
        six: { value: 7, label: '睡眠6小时' },
        eight: { value: 5, label: '睡眠8小时' },
        nine: { value: 15, label: '睡眠9小时' },
        ten: { value: 34, label: '睡眠≥10小时' }
    }[formData.sleepDuration];
    impacts.push(sleepDurationImpact);
    
    const sleepTimeImpact = {
        optimal: { value: 0, label: '最优入睡时间' },
        late: { value: 15, label: '晚睡' },
        early: { value: 43, label: '过早睡' }
    }[formData.sleepTime];
    impacts.push(sleepTimeImpact);
    
    const sittingImpact = {
        low: { value: 0, label: '久坐时间少' },
        medium: { value: 5, label: '中等久坐' },
        high: { value: 15, label: '久坐时间长' },
        veryHigh: { value: 25, label: '久坐时间很长' }
    }[formData.sitting];
    impacts.push(sittingImpact);
    
    // 心理和其他
    const emotionImpact = {
        optimistic: { value: 0, label: '乐观情绪' },
        neutral: { value: 5, label: '中性情绪' },
        pessimistic: { value: 13, label: '悲观情绪' }
    }[formData.emotion];
    impacts.push(emotionImpact);
    
    const weightImpact = {
        normal: { value: 0, label: '正常体重' },
        overweight: { value: 10, label: '超重' },
        obese: { value: 25, label: '肥胖' },
        lostWeight: { value: -54, label: '成功减重' }
    }[formData.weight];
    impacts.push(weightImpact);
    
    // 新增因素
    
    // 药物与补充剂
    const metforminImpact = {
        notApplicable: { value: 0, label: '二甲双胍-不适用' },
        taking: { value: -15, label: '服用二甲双胍' },
        notTaking: { value: 20, label: '糖尿病未控制' }
    }[formData.metformin];
    impacts.push(metforminImpact);
    
    const multivitaminImpact = {
        regular: { value: -8, label: '定期服用维生素' },
        sometimes: { value: -4, label: '偶尔服用维生素' },
        never: { value: 0, label: '不服用维生素' }
    }[formData.multivitamin];
    impacts.push(multivitaminImpact);
    
    const glucosamineImpact = {
        regular: { value: -39, label: '定期服用氨糖' },
        sometimes: { value: -20, label: '偶尔服用氨糖' },
        never: { value: 0, label: '不服用氨糖' }
    }[formData.glucosamine];
    impacts.push(glucosamineImpact);
    
    const spermidineImpact = {
        high: { value: -45, label: '高亚精胺摄入' },
        medium: { value: -30, label: '中等亚精胺摄入' },
        low: { value: -15, label: '低亚精胺摄入' },
        veryLow: { value: 0, label: '很少亚精胺' }
    }[formData.spermidine];
    impacts.push(spermidineImpact);
    
    // 做家务（老年男性）
    const houseworkImpact = {
        notApplicable: { value: 0, label: '做家务-不适用' },
        heavy: { value: -29, label: '经常做重型家务' },
        light: { value: -15, label: '做轻型家务' },
        rare: { value: 0, label: '很少做家务' }
    }[formData.housework];
    impacts.push(houseworkImpact);
    
    // 槟榔
    const betelNutImpact = {
        never: { value: 0, label: '不嚼槟榔' },
        quit: { value: 10, label: '已戒槟榔' },
        occasional: { value: 15, label: '偶尔嚼槟榔' },
        regular: { value: 21, label: '经常嚼槟榔' }
    }[formData.betelNut];
    impacts.push(betelNutImpact);
    
    // 碳水化合物
    const carbsImpact = {
        veryLow: { value: 20, label: '极低碳水' },
        low: { value: 8, label: '低碳水' },
        optimal: { value: 0, label: '最优碳水' },
        medium: { value: 3, label: '中等碳水' },
        high: { value: 7, label: '高碳水' }
    }[formData.carbs];
    impacts.push(carbsImpact);
    
    // 蛋白质来源
    const proteinImpact = {
        plantBased: { value: -10, label: '植物蛋白为主' },
        mixed: { value: 0, label: '混合蛋白' },
        animalBased: { value: 5, label: '动物蛋白为主' }
    }[formData.proteinSource];
    impacts.push(proteinImpact);
    
    return impacts;
}

// 为影响因素添加类别信息
function categorizeImpacts(impacts) {
    const categoryMap = {
        '白肉摄入': '饮食-固体', '混合肉类': '饮食-固体', '红肉摄入': '饮食-固体',
        '蔬果摄入充足': '饮食-固体', '蔬果摄入中等': '饮食-固体', '蔬果摄入不足': '饮食-固体',
        '经常吃辣': '饮食-固体', '偶尔吃辣': '饮食-固体', '不吃辣': '饮食-固体',
        '每日坚果': '饮食-固体', '每周坚果': '饮食-固体', '偶尔坚果': '饮食-固体', '不吃坚果': '饮食-固体',
        '很少吃加工食品': '饮食-固体', '偶尔吃加工食品': '饮食-固体', '经常吃加工食品': '饮食-固体', '频繁吃加工食品': '饮食-固体',
        '不嚼槟榔': '饮食-固体', '已戒槟榔': '饮食-固体', '偶尔嚼槟榔': '饮食-固体', '经常嚼槟榔': '饮食-固体',
        '极低碳水': '饮食-固体', '低碳水': '饮食-固体', '最优碳水': '饮食-固体', '中等碳水': '饮食-固体', '高碳水': '饮食-固体',
        '植物蛋白为主': '饮食-固体', '混合蛋白': '饮食-固体', '动物蛋白为主': '饮食-固体',
        
        '最优咖啡摄入': '饮食-液体', '适量咖啡': '饮食-液体', '少量咖啡': '饮食-液体', '不喝咖啡': '饮食-液体',
        '充足牛奶': '饮食-液体', '适量牛奶': '饮食-液体', '少量牛奶': '饮食-液体', '不喝牛奶': '饮食-液体',
        '每日饮茶': '饮食-液体', '经常饮茶': '饮食-液体', '偶尔饮茶': '饮食-液体', '不喝茶': '饮食-液体',
        '不喝含糖饮料': '饮食-液体', '偶尔含糖饮料': '饮食-液体', '每日含糖饮料': '饮食-液体', '大量含糖饮料': '饮食-液体',
        '不饮酒': '饮食-液体', '少量饮酒': '饮食-液体', '中等饮酒': '饮食-液体', '大量饮酒': '饮食-液体',
        
        '从不吸烟': '气体与光照', '已戒烟': '气体与光照', '轻度吸烟': '气体与光照', '重度吸烟': '气体与光照',
        '经常晒太阳': '气体与光照', '偶尔晒太阳': '气体与光照', '很少晒太阳': '气体与光照',
        
        '二甲双胍-不适用': '药物补充剂', '服用二甲双胍': '药物补充剂', '糖尿病未控制': '药物补充剂',
        '定期服用维生素': '药物补充剂', '偶尔服用维生素': '药物补充剂', '不服用维生素': '药物补充剂',
        '定期服用氨糖': '药物补充剂', '偶尔服用氨糖': '药物补充剂', '不服用氨糖': '药物补充剂',
        '高亚精胺摄入': '药物补充剂', '中等亚精胺摄入': '药物补充剂', '低亚精胺摄入': '药物补充剂', '很少亚精胺': '药物补充剂',
        
        '规律挥拍运动': '运动与日常', '偶尔挥拍运动': '运动与日常', '很少挥拍运动': '运动与日常', '不做挥拍运动': '运动与日常',
        '高强度运动': '运动与日常', '中等强度运动': '运动与日常', '低强度运动': '运动与日常', '不做剧烈运动': '运动与日常',
        '做家务-不适用': '运动与日常', '经常做重型家务': '运动与日常', '做轻型家务': '运动与日常', '很少做家务': '运动与日常',
        '每日步数充足': '运动与日常', '每日步数中等': '运动与日常', '每日步数较少': '运动与日常', '每日步数很少': '运动与日常',
        '规律刷牙': '运动与日常', '每日刷牙一次': '运动与日常', '不规律刷牙': '运动与日常',
        '每日泡澡': '运动与日常', '经常泡澡': '运动与日常', '偶尔泡澡': '运动与日常', '很少泡澡': '运动与日常',
        
        '最优睡眠时长': '睡眠与久坐', '睡眠6小时': '睡眠与久坐', '睡眠8小时': '睡眠与久坐', '睡眠9小时': '睡眠与久坐', '睡眠≥10小时': '睡眠与久坐',
        '最优入睡时间': '睡眠与久坐', '晚睡': '睡眠与久坐', '过早睡': '睡眠与久坐',
        '久坐时间少': '睡眠与久坐', '中等久坐': '睡眠与久坐', '久坐时间长': '睡眠与久坐', '久坐时间很长': '睡眠与久坐',
        
        '乐观情绪': '心理与体重', '中性情绪': '心理与体重', '悲观情绪': '心理与体重',
        '正常体重': '心理与体重', '超重': '心理与体重', '肥胖': '心理与体重', '成功减重': '心理与体重'
    };
    
    return impacts.map(impact => ({
        ...impact,
        category: categoryMap[impact.label] || '其他'
    }));
}

// 计算类别统计
function getCategoryStats(impacts) {
    const categories = {};
    
    impacts.forEach(impact => {
        const cat = impact.category;
        if (!categories[cat]) {
            categories[cat] = {
                name: cat,
                totalACM: 0,
                count: 0,
                factors: []
            };
        }
        categories[cat].totalACM += impact.value;
        categories[cat].count += 1;
        if (impact.value !== 0) {
            categories[cat].factors.push(impact);
        }
    });
    
    // 转换为数组并排序
    return Object.values(categories).sort((a, b) => a.totalACM - b.totalACM);
}

// 生成改善建议
function generateRecommendations(impacts) {
    const recommendations = [];
    
    // 找出所有正面影响（ACM增加的因素）
    const negativeFactors = impacts.filter(impact => impact.value > 0);
    
    // 按影响程度排序
    negativeFactors.sort((a, b) => b.value - a.value);
    
    // 针对最严重的因素给出建议
    const adviceMap = {
        '重度吸烟': { advice: '立即戒烟！吸烟是导致死亡的最大单一可控因素，戒烟可以显著延长寿命。', priority: '高' },
        '轻度吸烟': { advice: '尽快戒烟。即使是轻度吸烟也会显著增加死亡风险。', priority: '高' },
        '已戒烟': { advice: '继续保持不吸烟的状态。', priority: '中' },
        '大量饮酒': { advice: '减少饮酒量，建议每周纯酒精摄入不超过100g，或考虑戒酒。', priority: '高' },
        '中等饮酒': { advice: '减少饮酒，每周酒精摄入建议不超过100g。', priority: '高' },
        '过早睡': { advice: '调整睡眠时间，建议在22:00-24:00之间入睡最佳。', priority: '高' },
        '睡眠≥10小时': { advice: '减少睡眠时间，每天7小时最优。过度睡眠可能是健康问题的信号。', priority: '中' },
        '睡眠9小时': { advice: '略微减少睡眠时间，7小时是最佳睡眠时长。', priority: '低' },
        '久坐时间很长': { advice: '每小时起身活动，增加日常活动量。久坐每增加1小时，死亡风险增加3%。', priority: '高' },
        '久坐时间长': { advice: '减少久坐时间，建议每天久坐不超过6小时。', priority: '中' },
        '大量含糖饮料': { advice: '戒除含糖饮料，改喝水、茶或咖啡。', priority: '高' },
        '每日含糖饮料': { advice: '减少含糖饮料摄入，每天多喝一杯就增加7%死亡风险。', priority: '中' },
        '频繁吃加工食品': { advice: '减少超加工食品摄入，多吃新鲜天然食物。', priority: '高' },
        '经常吃加工食品': { advice: '尽量避免超加工食品，选择天然食材。', priority: '中' },
        '肥胖': { advice: '制定减重计划。从肥胖减至超重可降低54%死亡率。', priority: '高' },
        '超重': { advice: '适当减重至正常体重，可降低死亡风险。', priority: '中' },
        '悲观情绪': { advice: '寻求心理咨询，培养积极心态。悲观情绪显著增加死亡风险。', priority: '中' },
        '红肉摄入': { advice: '用白肉（鸡肉、鱼肉）替代红肉，可降低死亡风险。', priority: '中' },
        '晚睡': { advice: '调整作息，尽量在24:00前入睡，最佳入睡时间是22:00-24:00。', priority: '中' },
        '糖尿病未控制': { advice: '糖尿病患者应咨询医生使用二甲双胍等药物控制病情。', priority: '高' },
        '经常嚼槟榔': { advice: '立即戒除槟榔！槟榔致癌风险极高，应完全避免。', priority: '高' },
        '偶尔嚼槟榔': { advice: '停止嚼槟榔，任何量的槟榔都会增加健康风险。', priority: '高' },
        '已戒槟榔': { advice: '继续保持不嚼槟榔。', priority: '低' },
        '极低碳水': { advice: '增加碳水摄入至45-55%。极低碳水饮食会增加死亡风险。', priority: '高' },
        '高碳水': { advice: '减少碳水摄入，建议占比45-55%为最优。', priority: '中' },
        '动物蛋白为主': { advice: '增加植物蛋白摄入（豆类、坚果等），减少动物蛋白。', priority: '低' }
    };
    
    negativeFactors.forEach(factor => {
        if (adviceMap[factor.label]) {
            recommendations.push({
                ...adviceMap[factor.label],
                factor: factor.label,
                currentImpact: factor.value
            });
        }
    });
    
    // 找出缺失的积极因素
    const positiveAdvice = [];
    
    if (!impacts.find(i => i.label.includes('挥拍运动') && i.value < 0)) {
        positiveAdvice.push({
            advice: '开始挥拍运动（网球、羽毛球、乒乓球），每周3次、每次45分钟可降低47%死亡率！',
            priority: '高',
            potentialGain: -47
        });
    }
    
    if (!impacts.find(i => i.label.includes('每日步数') && i.value <= -30)) {
        positiveAdvice.push({
            advice: '增加每日步数至8000步以上，可降低50%死亡率。',
            priority: '高',
            potentialGain: -50
        });
    }
    
    if (!impacts.find(i => i.label.includes('晒太阳') && i.value <= -20)) {
        positiveAdvice.push({
            advice: '增加户外活动，多晒太阳可降低40%死亡率。',
            priority: '中',
            potentialGain: -40
        });
    }
    
    if (!impacts.find(i => i.label.includes('坚果') && i.value < -10)) {
        positiveAdvice.push({
            advice: '每天吃一把坚果（核桃、杏仁等），可降低20%死亡率。',
            priority: '中',
            potentialGain: -20
        });
    }
    
    if (!impacts.find(i => i.label.includes('咖啡') && i.value < -10)) {
        positiveAdvice.push({
            advice: '适量饮用咖啡（每天2-3.5杯），可降低17%死亡率。',
            priority: '低',
            potentialGain: -17
        });
    }
    
    if (!impacts.find(i => i.label.includes('氨糖') && i.value < -20)) {
        positiveAdvice.push({
            advice: '考虑补充葡萄糖胺（氨糖），研究显示可降低39%死亡率，与定期运动效果相当。',
            priority: '中',
            potentialGain: -39
        });
    }
    
    if (!impacts.find(i => i.label.includes('亚精胺') && i.value < -30)) {
        positiveAdvice.push({
            advice: '多吃富含亚精胺的食物（纳豆、蘑菇、全谷物、苹果），可降低45%死亡率。',
            priority: '高',
            potentialGain: -45
        });
    }
    
    if (!impacts.find(i => i.label.includes('维生素') && i.value < 0)) {
        positiveAdvice.push({
            advice: '考虑补充复合维生素，可降低8%癌症风险。',
            priority: '低',
            potentialGain: -8
        });
    }
    
    if (!impacts.find(i => i.label.includes('植物蛋白') && i.value < 0)) {
        positiveAdvice.push({
            advice: '增加植物蛋白摄入（豆类、坚果、种子），可降低10%死亡率。',
            priority: '中',
            potentialGain: -10
        });
    }
    
    return { negativeRecommendations: recommendations, positiveRecommendations: positiveAdvice };
}

// 计算结果
function calculateLifespan(formData) {
    let impacts = getImpactFactors(formData);
    
    // 添加类别信息
    impacts = categorizeImpacts(impacts);
    
    // 计算总ACM变化
    // 注意：这里使用简化的叠加模型，实际上各因素之间可能有交互作用
    const totalACM = impacts.reduce((sum, impact) => sum + impact.value, 0);
    
    // 计算寿命变化
    const lifespanChange = acmToLifespanChange(totalACM);
    
    // 基准寿命
    const baseLifespan = BASE_LIFESPAN[formData.gender];
    
    // 年龄因素调整
    const currentAge = parseInt(formData.age);
    
    // 预期剩余寿命
    const remainingYears = baseLifespan - currentAge + lifespanChange;
    
    // 预期总寿命（应用限制前）
    let totalLifespan = currentAge + remainingYears;
    
    // 应用人类寿命的生理极限
    const limitedLifespan = applyLifespanLimits(totalLifespan, currentAge);
    const limitedRemainingYears = limitedLifespan - currentAge;
    
    // 检查是否触及上限或下限
    let limitWarning = null;
    if (totalLifespan > LIFESPAN_LIMITS.realistic_max) {
        limitWarning = {
            type: 'max',
            message: `根据计算您的寿命可达${Math.round(totalLifespan)}岁，但已超过人类现实寿命极限(${LIFESPAN_LIMITS.realistic_max}岁)。结果已调整为${limitedLifespan}岁。`,
            originalValue: totalLifespan
        };
    } else if (totalLifespan < currentAge + 1) {
        limitWarning = {
            type: 'min',
            message: '您的生活习惯存在严重健康风险！建议立即咨询医生并改变生活方式。',
            originalValue: totalLifespan
        };
    }
    
    // 计算类别统计
    const categoryStats = getCategoryStats(impacts);
    
    return {
        totalLifespan: Math.round(limitedLifespan * 10) / 10,
        remainingYears: Math.round(limitedRemainingYears * 10) / 10,
        lifespanChange: Math.round(lifespanChange * 10) / 10,
        totalACM,
        impacts,
        baseLifespan,
        limitWarning,
        originalLifespan: Math.round(totalLifespan * 10) / 10,
        categoryStats
    };
}

// 获取类别图标
function getCategoryIcon(categoryName) {
    const icons = {
        '饮食-固体': '🍽️',
        '饮食-液体': '☕',
        '气体与光照': '🌞',
        '药物补充剂': '💊',
        '运动与日常': '🏃',
        '睡眠与久坐': '😴',
        '心理与体重': '💭'
    };
    return icons[categoryName] || '📌';
}

// 显示结果
function displayResults(results, formData) {
    const resultsSection = document.getElementById('resultsSection');
    
    const { negativeRecommendations, positiveRecommendations } = generateRecommendations(results.impacts);
    
    // 按ACM值排序影响因素
    const sortedImpacts = [...results.impacts].sort((a, b) => a.value - b.value);
    
    // 筛选出有影响的因素
    const significantImpacts = sortedImpacts.filter(impact => impact.value !== 0);
    
    resultsSection.innerHTML = `
        <div class="results-content">
            <div class="result-header">
                <h2>📊 您的寿命预测报告</h2>
            </div>
            
            <div class="lifespan-display">
                <div class="lifespan-label">预期寿命</div>
                <div class="lifespan-number">${results.totalLifespan}</div>
                <div class="lifespan-label">岁（还能活 ${results.remainingYears} 年）</div>
            </div>
            
            ${results.limitWarning ? `
                <div class="limit-warning ${results.limitWarning.type}">
                    <div style="font-size: 1.5rem; margin-bottom: 10px;">
                        ${results.limitWarning.type === 'max' ? '⚠️ 已达人类寿命极限' : '🚨 健康严重警告'}
                    </div>
                    <p style="margin: 0;">${results.limitWarning.message}</p>
                    ${results.limitWarning.type === 'max' ? `
                        <p style="margin-top: 10px; font-size: 0.9rem; opacity: 0.9;">
                            恭喜！您的生活习惯非常健康。继续保持，您有机会成为超级长寿者！
                        </p>
                    ` : ''}
                </div>
            ` : ''}
            
            <div class="acm-display">
                <div class="acm-label">全因死亡率变化 (ACM)</div>
                <div class="acm-value ${results.totalACM > 0 ? 'positive' : results.totalACM < 0 ? 'negative' : 'neutral'}">
                    ${results.totalACM > 0 ? '+' : ''}${results.totalACM}%
                </div>
                <div class="acm-sublabel">
                    ${results.totalACM > 0 ? '⚠️ 高于平均水平' : results.totalACM < 0 ? '✅ 低于平均水平' : '➡️ 平均水平'}
                </div>
            </div>
            
            <div class="comparison">
                <h3>📈 对比分析</h3>
                <div class="comparison-item">
                    <strong>基准寿命:</strong> ${results.baseLifespan} 岁（${formData.gender === 'male' ? '男性' : '女性'}平均）
                </div>
                <div class="comparison-item">
                    <strong>您的寿命:</strong> ${results.totalLifespan} 岁
                </div>
                <div class="comparison-item">
                    <strong>差异:</strong> ${results.lifespanChange > 0 ? '+' : ''}${results.lifespanChange} 年
                    ${results.lifespanChange > 0 ? '🎉' : results.lifespanChange < 0 ? '⚠️' : ''}
                </div>
            </div>
            
            <!-- 寿命对比图表 -->
            <div class="lifespan-chart">
                <h3>📊 寿命对比可视化</h3>
                <div class="chart-container">
                    <div class="chart-item">
                        <div class="chart-label">基准寿命</div>
                        <div class="chart-bar-wrapper">
                            <div class="chart-bar baseline" style="width: ${(results.baseLifespan / 120) * 100}%">
                                <span class="chart-value">${results.baseLifespan}岁</span>
                            </div>
                        </div>
                    </div>
                    <div class="chart-item">
                        <div class="chart-label">预期寿命</div>
                        <div class="chart-bar-wrapper">
                            <div class="chart-bar predicted ${results.totalLifespan > results.baseLifespan ? 'positive' : 'negative'}" 
                                 style="width: ${(results.totalLifespan / 120) * 100}%">
                                <span class="chart-value">${results.totalLifespan}岁</span>
                            </div>
                        </div>
                    </div>
                    ${results.limitWarning && results.limitWarning.type === 'max' ? `
                    <div class="chart-item">
                        <div class="chart-label">理论寿命</div>
                        <div class="chart-bar-wrapper">
                            <div class="chart-bar theoretical" style="width: ${(results.originalLifespan / 120) * 100}%">
                                <span class="chart-value">${results.originalLifespan}岁（已限制）</span>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                    <div class="chart-item">
                        <div class="chart-label">人类极限</div>
                        <div class="chart-bar-wrapper">
                            <div class="chart-bar limit" style="width: 100%">
                                <span class="chart-value">122岁</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 类别影响分析 -->
            <div class="category-analysis">
                <h3>🎯 类别影响分析</h3>
                <p class="section-desc">各个类别对您寿命的综合影响</p>
                ${results.categoryStats.map(cat => `
                    <div class="category-item">
                        <div class="category-header">
                            <span class="category-name">
                                ${getCategoryIcon(cat.name)} ${cat.name}
                            </span>
                            <span class="category-impact ${cat.totalACM > 0 ? 'negative' : cat.totalACM < 0 ? 'positive' : 'neutral'}">
                                ${cat.totalACM > 0 ? '+' : ''}${cat.totalACM}% ACM
                            </span>
                        </div>
                        <div class="category-bar-wrapper">
                            <div class="category-bar ${cat.totalACM > 0 ? 'negative' : 'positive'}" 
                                 style="width: ${Math.min(Math.abs(cat.totalACM) / 2, 100)}%"></div>
                        </div>
                        ${cat.factors.length > 0 ? `
                            <div class="category-factors">
                                ${cat.factors.map(f => `
                                    <span class="factor-tag ${f.value > 0 ? 'negative' : 'positive'}">
                                        ${f.label} (${f.value > 0 ? '+' : ''}${f.value}%)
                                    </span>
                                `).join('')}
                            </div>
                        ` : '<div class="category-factors"><span class="factor-tag neutral">该类别无显著影响</span></div>'}
                    </div>
                `).join('')}
            </div>
            
            ${significantImpacts.length > 0 ? `
                <div class="impact-summary">
                    <h3>📋 主要影响因素</h3>
                    ${significantImpacts.slice(0, 10).map(impact => `
                        <div class="impact-item">
                            <span class="impact-label">${impact.label}</span>
                            <span class="impact-value ${impact.value > 0 ? 'negative' : impact.value < 0 ? 'positive' : 'neutral'}">
                                ${impact.value > 0 ? '+' : ''}${impact.value}%
                            </span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${negativeRecommendations.length > 0 ? `
                <div class="recommendations">
                    <h3>⚠️ 需要改善的方面</h3>
                    ${negativeRecommendations.map(rec => `
                        <div class="recommendation-item">
                            <strong>${rec.factor}</strong>
                            <span class="recommendation-priority">${rec.priority}优先级</span>
                            <p>${rec.advice}</p>
                            <small>当前影响: +${rec.currentImpact}% ACM</small>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${positiveRecommendations.length > 0 ? `
                <div class="recommendations">
                    <h3>💡 增寿建议</h3>
                    ${positiveRecommendations.map(rec => `
                        <div class="recommendation-item" style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-left-color: ${rec.priority === '高' ? '#10b981' : '#6366f1'};">
                            <span class="recommendation-priority" style="background: ${rec.priority === '高' ? '#10b981' : '#6366f1'};">${rec.priority}优先级</span>
                            <p style="margin-top: 8px;">${rec.advice}</p>
                            <small style="color: #065f46;">潜在收益: ${rec.potentialGain}% ACM</small>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="recommendations">
                <h3>📚 温馨提示</h3>
                <div class="recommendation-item" style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left-color: #3b82f6;">
                    <p style="color: #1e40af;">
                        • 本预测基于大规模研究的统计相关性<br>
                        • 各因素间可能存在交互作用，实际影响可能不同<br>
                        • 建议定期体检，咨询专业医生<br>
                        • 改善生活习惯需要循序渐进，不要急于求成
                    </p>
                </div>
            </div>
        </div>
    `;
    
    // 滚动到结果区域（仅在移动端）
    if (window.innerWidth <= 1200) {
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// 表单提交处理
document.getElementById('lifespanForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // 收集表单数据
    const formData = {
        age: document.getElementById('age').value,
        gender: document.getElementById('gender').value,
        meatType: document.getElementById('meatType').value,
        vegetableFruit: document.getElementById('vegetableFruit').value,
        chili: document.getElementById('chili').value,
        nuts: document.getElementById('nuts').value,
        ultraProcessed: document.getElementById('ultraProcessed').value,
        coffee: document.getElementById('coffee').value,
        milk: document.getElementById('milk').value,
        tea: document.getElementById('tea').value,
        sugaryDrinks: document.getElementById('sugaryDrinks').value,
        alcohol: document.getElementById('alcohol').value,
        smoking: document.getElementById('smoking').value,
        sunlight: document.getElementById('sunlight').value,
        metformin: document.getElementById('metformin').value,
        multivitamin: document.getElementById('multivitamin').value,
        glucosamine: document.getElementById('glucosamine').value,
        spermidine: document.getElementById('spermidine').value,
        racquetSports: document.getElementById('racquetSports').value,
        intenseExercise: document.getElementById('intenseExercise').value,
        housework: document.getElementById('housework').value,
        dailySteps: document.getElementById('dailySteps').value,
        brushTeeth: document.getElementById('brushTeeth').value,
        bathing: document.getElementById('bathing').value,
        sleepDuration: document.getElementById('sleepDuration').value,
        sleepTime: document.getElementById('sleepTime').value,
        sitting: document.getElementById('sitting').value,
        emotion: document.getElementById('emotion').value,
        weight: document.getElementById('weight').value,
        betelNut: document.getElementById('betelNut').value,
        carbs: document.getElementById('carbs').value,
        proteinSource: document.getElementById('proteinSource').value
    };
    
    // 计算结果
    const results = calculateLifespan(formData);
    
    // 显示结果
    displayResults(results, formData);
});

// 页面加载完成后的初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('程序员寿命预测器已加载');
    console.log('数据来源：《程序员延寿指南》 https://github.com/geekan/HowToLiveLonger');
});

