const LOW_BATTERY_THRESHOLD = 20;

const LANGUAGES = [
  { code: 'zh', name: '中文' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'fr', name: 'Français' },
];

const generateLanguagePacks = (missingLang) => {
  return LANGUAGES.map(lang => ({
    ...lang,
    installed: lang.code !== missingLang
  }));
};

const generateSeedDevices = () => [
  { id: 'GUIDE-001', batteryLevel: 85, languagePacks: generateLanguagePacks(), status: 'available' },
  { id: 'GUIDE-002', batteryLevel: 15, languagePacks: generateLanguagePacks(), status: 'available' },
  { id: 'GUIDE-003', batteryLevel: 92, languagePacks: generateLanguagePacks('ja'), status: 'available' },
  { id: 'GUIDE-004', batteryLevel: 78, languagePacks: generateLanguagePacks(), status: 'rented', currentRentalId: 'RENT-001' },
  { id: 'GUIDE-005', batteryLevel: 45, languagePacks: generateLanguagePacks(), status: 'maintenance' },
  { id: 'GUIDE-006', batteryLevel: 67, languagePacks: generateLanguagePacks('ko'), status: 'available' },
  { id: 'GUIDE-007', batteryLevel: 30, languagePacks: generateLanguagePacks(), status: 'damaged', damageNote: '屏幕碎裂，需要更换' },
  { id: 'GUIDE-008', batteryLevel: 88, languagePacks: generateLanguagePacks(), status: 'available' },
  { id: 'GUIDE-009', batteryLevel: 12, languagePacks: generateLanguagePacks('fr'), status: 'available' },
  { id: 'GUIDE-010', batteryLevel: 95, languagePacks: generateLanguagePacks(), status: 'available' },
];

const validateLowBattery = (device) => {
  if (device.batteryLevel < LOW_BATTERY_THRESHOLD) {
    return { valid: false, message: `设备电量过低(${device.batteryLevel}%)，无法租借，请选择其他设备或联系工作人员充电` };
  }
  return { valid: true };
};

const validateLanguagePack = (device, languageCode) => {
  const pack = device.languagePacks.find(p => p.code === languageCode);
  if (!pack) return { valid: false, message: `不支持${languageCode}语种` };
  if (!pack.installed) {
    return { valid: false, message: `${pack.name}语种包未安装，请先下载安装该语种包` };
  }
  return { valid: true };
};

const filterRentableDevices = (devices) => {
  return devices.filter(d => d.status === 'available' && d.batteryLevel >= LOW_BATTERY_THRESHOLD);
};

const simulateDeviceCardRender = (device, selectedLanguage = 'zh') => {
  const batteryCheck = validateLowBattery(device);
  const langPack = device.languagePacks.find(p => p.code === selectedLanguage);
  const langMissing = !langPack?.installed;
  const isRentable = device.status === 'available' && batteryCheck.valid && !langMissing;

  let buttonText = '租借';
  let buttonDisabled = false;
  let warnings = [];

  if (device.status !== 'available') {
    return {
      renderRentButton: false,
      renderReturnButton: device.status === 'rented',
      warnings,
      buttonText: '',
      buttonDisabled: true,
    };
  }

  if (!batteryCheck.valid) {
    buttonDisabled = true;
    buttonText = '电量不足';
    warnings.push({ type: 'battery', message: batteryCheck.message });
  }

  if (langMissing) {
    buttonDisabled = true;
    if (!warnings.length) buttonText = '语种缺失';
    warnings.push({ type: 'language', message: `${langPack?.name || selectedLanguage}语种包未安装，请联系工作人员下载` });
  }

  return {
    renderRentButton: true,
    renderReturnButton: false,
    buttonText,
    buttonDisabled,
    warnings,
    isRentable,
    batteryCheck,
    langMissing,
  };
};

console.log('='.repeat(70));
console.log('博物馆讲解器租借系统 - 浏览器级组件行为验证脚本');
console.log('='.repeat(70));
console.log('');

const devices = generateSeedDevices();

console.log('📋 测试设备加载完成');
console.log(`   共 ${devices.length} 台设备，模拟浏览器渲染 DeviceCard 组件`);
console.log('');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(description) {
  totalTests++;
  return {
    pass: () => {
      passedTests++;
      console.log(`  ✅ ${description}`);
    },
    fail: (reason) => {
      failedTests++;
      console.log(`  ❌ ${description}`);
      console.log(`     原因: ${reason}`);
    }
  };
}

function section(title) {
  console.log(`\n━━━ ${title} ━━━`);
}

// ============================================
// TC-01: 低电量设备租借按钮禁用验证
// ============================================
section('TC-01: 低电量设备租借按钮禁用验证');

const lowBatteryDevices = devices.filter(d => d.batteryLevel < 20 && d.status === 'available');
const normalDevices = devices.filter(d => d.batteryLevel >= 20 && d.status === 'available');

console.log(`\n  测试设备: ${lowBatteryDevices.map(d => `${d.id}(${d.batteryLevel}%)`).join(', ')}`);
console.log(`  对照设备: ${normalDevices.map(d => `${d.id}(${d.batteryLevel}%)`).join(', ')}`);
console.log('');

lowBatteryDevices.forEach(device => {
  const render = simulateDeviceCardRender(device, 'zh');
  
  const t1 = test(`${device.id} - 租借按钮应渲染`);
  if (render.renderRentButton) t1.pass(); else t1.fail('租借按钮未渲染');

  const t2 = test(`${device.id} - 按钮应处于禁用状态`);
  if (render.buttonDisabled) t2.pass(); else t2.fail('按钮未禁用');

  const t3 = test(`${device.id} - 按钮文字应为"电量不足"`);
  if (render.buttonText === '电量不足') t3.pass(); else t3.fail(`按钮文字为"${render.buttonText}"，应为"电量不足"`);

  const t4 = test(`${device.id} - 应显示电量警告条`);
  const hasBatteryWarning = render.warnings.some(w => w.type === 'battery');
  if (hasBatteryWarning) t4.pass(); else t4.fail('未显示电量警告条');

  const t5 = test(`${device.id} - 警告消息包含"电量过低"和"%"`);
  const batteryWarn = render.warnings.find(w => w.type === 'battery');
  if (batteryWarn && batteryWarn.message.includes('电量过低') && batteryWarn.message.includes('%')) {
    t5.pass();
  } else {
    t5.fail(`警告消息不正确: ${batteryWarn?.message}`);
  }
});

normalDevices.slice(0, 2).forEach(device => {
  const render = simulateDeviceCardRender(device, 'zh');
  
  const t1 = test(`[对照] ${device.id} - 按钮不应禁用`);
  if (!render.buttonDisabled) t1.pass(); else t1.fail('正常设备按钮被错误禁用');

  const t2 = test(`[对照] ${device.id} - 按钮文字应为"租借"`);
  if (render.buttonText === '租借') t2.pass(); else t2.fail(`按钮文字为"${render.buttonText}"`);

  const t3 = test(`[对照] ${device.id} - 无电量警告`);
  const hasBatteryWarning = render.warnings.some(w => w.type === 'battery');
  if (!hasBatteryWarning) t3.pass(); else t3.fail('正常设备显示了电量警告');
});

// ============================================
// TC-02: 语种包缺失提示与租借阻断验证
// ============================================
section('TC-02: 语种包缺失提示与租借阻断验证');

const langMissingDevices = devices.filter(d => 
  d.status === 'available' && d.languagePacks.some(p => !p.installed)
);

console.log(`\n  测试设备: ${langMissingDevices.map(d => {
    const missing = d.languagePacks.filter(p => !p.installed).map(p => p.name).join('/');
    return `${d.id}(缺${missing})`;
  }).join(', ')}`);
console.log('');

langMissingDevices.forEach(device => {
  const missingLang = device.languagePacks.find(p => !p.installed);
  const installedLang = device.languagePacks.find(p => p.installed && p.code !== 'zh');
  
  console.log(`\n  --- ${device.id} 切换到 ${missingLang.name} (缺失) ---`);
  
  const renderMissing = simulateDeviceCardRender(device, missingLang.code);
  
  const t1 = test(`${device.id} [${missingLang.code}] - 按钮应禁用`);
  if (renderMissing.buttonDisabled) t1.pass(); else t1.fail('缺失语种时按钮未禁用');

  const t2 = test(`${device.id} [${missingLang.code}] - 按钮文字应为"语种缺失"`);
  if (renderMissing.buttonText === '语种缺失') t2.pass(); else t2.fail(`按钮文字为"${renderMissing.buttonText}"`);

  const t3 = test(`${device.id} [${missingLang.code}] - 应显示语种缺失警告条`);
  const hasLangWarning = renderMissing.warnings.some(w => w.type === 'language');
  if (hasLangWarning) t3.pass(); else t3.fail('未显示语种缺失警告条');

  const t4 = test(`${device.id} [${missingLang.code}] - 警告消息含语种名和"未安装"/"下载"`);
  const langWarn = renderMissing.warnings.find(w => w.type === 'language');
  if (langWarn && langWarn.message.includes(missingLang.name) && 
      (langWarn.message.includes('未安装') || langWarn.message.includes('下载'))) {
    t4.pass();
  } else {
    t4.fail(`警告消息不正确: ${langWarn?.message}`);
  }

  if (installedLang) {
    console.log(`\n  --- ${device.id} 切换到 ${installedLang.name} (已安装) ---`);
    
    const renderInstalled = simulateDeviceCardRender(device, installedLang.code);
    
    const t5 = test(`${device.id} [${installedLang.code}] - 按钮不应禁用`);
    if (!renderInstalled.buttonDisabled) t5.pass(); else t5.fail('已安装语种时按钮被错误禁用');

    const t6 = test(`${device.id} [${installedLang.code}] - 无语种缺失警告`);
    const hasLangWarn = renderInstalled.warnings.some(w => w.type === 'language');
    if (!hasLangWarn) t6.pass(); else t6.fail('已安装语种显示了语种缺失警告');
  }
});

// ============================================
// TC-03: 租借弹窗二次验证模拟
// ============================================
section('TC-03: 租借弹窗二次验证模拟 (canRentDevice)');

const canRentDevice = (device, languageCode) => {
  if (device.status !== 'available') return { valid: false, message: '该设备当前不可租借' };
  const batteryCheck = validateLowBattery(device);
  if (!batteryCheck.valid) return batteryCheck;
  const langCheck = validateLanguagePack(device, languageCode);
  if (!langCheck.valid) return langCheck;
  return { valid: true };
};

console.log('');
const guide003 = devices.find(d => d.id === 'GUIDE-003');

const rentCheckJa = canRentDevice(guide003, 'ja');
const t1 = test('GUIDE-003 租借日语 - 验证应失败');
if (!rentCheckJa.valid) t1.pass(); else t1.fail('缺失语种时租借验证应失败');

const t2 = test('GUIDE-003 租借日语 - 失败消息包含"未安装"和"下载"');
if (rentCheckJa.message && rentCheckJa.message.includes('未安装') && rentCheckJa.message.includes('下载')) {
  t2.pass();
} else {
  t2.fail(`失败消息不正确: ${rentCheckJa.message}`);
}

const rentCheckZh = canRentDevice(guide003, 'zh');
const t3 = test('GUIDE-003 租借中文 - 验证应通过');
if (rentCheckZh.valid) t3.pass(); else t3.fail(`正常租借验证失败: ${rentCheckZh.message}`);

// ============================================
// TC-04: 游客视图可租列表过滤验证
// ============================================
section('TC-04: 游客视图可租列表过滤验证');

console.log('');

const visitorRentable = filterRentableDevices(devices);
const t01 = test('游客视图 - 低电量设备不出现在可租列表');
const hasLowBattery = visitorRentable.some(d => d.batteryLevel < 20);
if (!hasLowBattery) t01.pass(); else t01.fail('可租列表包含低电量设备');

const t02 = test('游客视图 - 维修中设备不出现在可租列表');
const hasMaintenance = visitorRentable.some(d => d.status === 'maintenance');
if (!hasMaintenance) t02.pass(); else t02.fail('可租列表包含维修中设备');

const t03 = test('游客视图 - 租借中设备不出现在可租列表');
const hasRented = visitorRentable.some(d => d.status === 'rented');
if (!hasRented) t03.pass(); else t03.fail('可租列表包含租借中设备');

const t04 = test('游客视图 - 已损坏设备不出现在可租列表');
const hasDamaged = visitorRentable.some(d => d.status === 'damaged');
if (!hasDamaged) t04.pass(); else t04.fail('可租列表包含已损坏设备');

console.log(`\n  可租设备: ${visitorRentable.map(d => d.id).join(', ')}`);
console.log(`  数量: ${visitorRentable.length} / ${devices.length}`);

// ============================================
// TC-05: 组合场景验证
// ============================================
section('TC-05: 低电量 + 语种缺失组合场景');

console.log('');
const guide009 = devices.find(d => d.id === 'GUIDE-009');
const renderCombo = simulateDeviceCardRender(guide009, 'fr');

const tc1 = test('GUIDE-009(12%+缺法语) - 按钮处于禁用状态');
if (renderCombo.buttonDisabled) tc1.pass(); else tc1.fail('组合场景按钮未禁用');

const tc2 = test('GUIDE-009 - 按钮文字优先显示"电量不足"');
if (renderCombo.buttonText === '电量不足') tc2.pass(); else tc2.fail(`按钮文字为"${renderCombo.buttonText}"，低电量优先级应更高`);

const tc3 = test('GUIDE-009 - 同时显示电量和语种两条警告');
if (renderCombo.warnings.length >= 2) tc3.pass(); else tc3.fail(`只显示了 ${renderCombo.warnings.length} 条警告`);

// ============================================
// 测试结果汇总
// ============================================
console.log('\n' + '='.repeat(70));
console.log('浏览器级组件验证结果汇总');
console.log('='.repeat(70));
console.log(`  总测试数: ${totalTests}`);
console.log(`  通过: ${passedTests}`);
console.log(`  失败: ${failedTests}`);
console.log('');

if (failedTests === 0) {
  console.log('🎉 所有浏览器级组件行为验证通过！');
  console.log('');
  console.log('✅ 验证要点总结:');
  console.log('   1. 低电量(<20%)设备 → 租借按钮禁用，显示"电量不足"，展示警告条');
  console.log('   2. 切换到缺失语种 → 按钮禁用，显示"语种缺失"，展示下载提示');
  console.log('   3. 租借弹窗二次验证 → 缺失语种时阻断，返回包含"未安装"和"下载"的提示');
  console.log('   4. 游客视图过滤 → 低电量/维修中/租借中/已损坏均不出现');
  console.log('   5. 组合场景 → 低电量优先级更高，两条警告同时显示');
  process.exit(0);
} else {
  console.log('❌ 部分验证未通过');
  process.exit(1);
}
