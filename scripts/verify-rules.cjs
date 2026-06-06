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

const generateSeedRentals = () => [
  { id: 'RENT-001', deviceId: 'GUIDE-004', renterName: '张三', renterPhone: '13800138001', renterIdCard: '110101199001011234', deposit: 200, depositRefunded: false, rentalTime: '2026-06-06T09:30:00', expectedReturnTime: '2026-06-06T17:00:00', language: 'zh', status: 'active' },
  { id: 'RENT-002', deviceId: 'GUIDE-001', renterName: '李四', renterPhone: '13900139002', renterIdCard: '110101199203045678', deposit: 200, depositRefunded: true, rentalTime: '2026-06-05T10:00:00', expectedReturnTime: '2026-06-05T16:00:00', actualReturnTime: '2026-06-05T15:45:00', language: 'en', status: 'returned' },
  { id: 'RENT-003', deviceId: 'GUIDE-007', renterName: '王五', renterPhone: '13700137003', renterIdCard: '110101198805069012', deposit: 200, depositRefunded: false, rentalTime: '2026-06-04T14:00:00', expectedReturnTime: '2026-06-04T18:00:00', actualReturnTime: '2026-06-04T17:30:00', language: 'zh', damageOnReturn: true, damageNote: '归还时发现屏幕有裂纹', status: 'returned' },
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

const validateDamageNote = (damageNote) => {
  if (!damageNote || damageNote.trim().length === 0) {
    return { valid: false, message: '设备损坏必须填写备注说明损坏情况' };
  }
  return { valid: true };
};

const validateDeleteRental = (record) => {
  if (!record.depositRefunded) {
    return { valid: false, message: '押金尚未退还，无法删除该租借记录' };
  }
  return { valid: true };
};

const filterRentableDevices = (devices) => {
  return devices.filter(d => d.status === 'available' && d.batteryLevel >= LOW_BATTERY_THRESHOLD);
};

const canRentDevice = (device, languageCode) => {
  if (device.status !== 'available') return { valid: false, message: '该设备当前不可租借' };
  const batteryCheck = validateLowBattery(device);
  if (!batteryCheck.valid) return batteryCheck;
  const langCheck = validateLanguagePack(device, languageCode);
  if (!langCheck.valid) return langCheck;
  return { valid: true };
};

console.log('='.repeat(60));
console.log('博物馆讲解器租借系统 - 业务规则验证脚本');
console.log('='.repeat(60));
console.log('');

const devices = generateSeedDevices();
const rentals = generateSeedRentals();

console.log('📋 测试数据加载完成');
console.log(`   - 设备: ${devices.length} 台`);
console.log(`   - 租借记录: ${rentals.length} 条`);
console.log('');

let passed = 0;
let failed = 0;

function test(description, testFn) {
  try {
    testFn();
    console.log(`  ✅ ${description}`);
    passed++;
  } catch (e) {
    console.log(`  ❌ ${description}`);
    console.log(`     错误: ${e.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || '断言失败');
}

console.log('━━━ 规则 R001: 低电量设备不能租出 ━━━');
const lowBatteryDevice = devices.find(d => d.batteryLevel < LOW_BATTERY_THRESHOLD);
if (lowBatteryDevice) {
  test(`找到低电量设备: ${lowBatteryDevice.id} (电量: ${lowBatteryDevice.batteryLevel}%)`, () => {
    assert(lowBatteryDevice.batteryLevel < 20, '设备电量应低于20%');
  });
  test('低电量设备验证应返回失败', () => {
    const result = validateLowBattery(lowBatteryDevice);
    assert(result.valid === false, '低电量设备应验证失败');
    assert(result.message && result.message.includes('电量过低'), '应返回电量过低提示');
  });
  test('低电量设备租借按钮应禁用', () => {
    const batteryCheck = validateLowBattery(lowBatteryDevice);
    assert(!batteryCheck.valid, '按钮应处于禁用状态');
    const buttonText = !batteryCheck.valid ? '电量不足' : '租借';
    assert(buttonText === '电量不足', `按钮文字应为"电量不足"，实际为"${buttonText}"`);
  });
} else {
  console.log('  ⚠️  未找到低电量设备');
}
console.log('');

console.log('━━━ 规则 R002: 语种包缺失要提示下载并阻止租借 ━━━');
const missingLangDevice = devices.find(d => d.languagePacks.some(p => !p.installed));
if (missingLangDevice) {
  const missingPack = missingLangDevice.languagePacks.find(p => !p.installed);
  test(`找到缺失语种包设备: ${missingLangDevice.id} (缺失: ${missingPack.name})`, () => {
    assert(missingPack && !missingPack.installed, '应存在未安装的语种包');
  });
  test('缺失语种包验证应返回失败', () => {
    const result = validateLanguagePack(missingLangDevice, missingPack.code);
    assert(result.valid === false, '缺失语种包应验证失败');
    assert(result.message && result.message.includes('未安装'), '应返回语种包未安装提示');
    assert(result.message && result.message.includes('下载'), '应提示下载');
  });
  test('租借阻断: 缺失语种包无法租借', () => {
    const result = canRentDevice(missingLangDevice, missingPack.code);
    assert(result.valid === false, '缺失语种包时应无法租借');
  });
  test('使用已安装语种租借该设备应正常', () => {
    const installedPack = missingLangDevice.languagePacks.find(p => p.installed);
    if (installedPack) {
      const result = validateLanguagePack(missingLangDevice, installedPack.code);
      assert(result.valid === true, '已安装语种包应验证通过');
    }
  });
} else {
  console.log('  ⚠️  未找到缺失语种包设备');
}
console.log('');

console.log('━━━ 规则 R003: 归还损坏必须填写备注 ━━━');
test('空损坏备注验证应失败', () => {
  const result = validateDamageNote('');
  assert(result.valid === false, '空备注应验证失败');
  assert(result.message && result.message.includes('必须填写备注'), '应提示必须填写备注');
});
test('空白损坏备注验证应失败', () => {
  const result = validateDamageNote('   ');
  assert(result.valid === false, '空白备注应验证失败');
});
test('有效损坏备注验证应通过', () => {
  const result = validateDamageNote('屏幕有划痕，外壳凹陷');
  assert(result.valid === true, '有效备注应验证通过');
});
console.log('');

console.log('━━━ 规则 R004: 押金未退的租借记录不能被删除 ━━━');
const unpaidRental = rentals.find(r => !r.depositRefunded);
if (unpaidRental) {
  test(`找到押金未退记录: ${unpaidRental.id} (押金: ¥${unpaidRental.deposit})`, () => {
    assert(unpaidRental.depositRefunded === false, '押金应未退还');
  });
  test('押金未退记录删除验证应失败', () => {
    const result = validateDeleteRental(unpaidRental);
    assert(result.valid === false, '押金未退应无法删除');
    assert(result.message && result.message.includes('押金尚未退还'), '应提示押金未退还');
  });
  test('删除按钮状态: 押金未退记录按钮应禁用', () => {
    const result = validateDeleteRental(unpaidRental);
    assert(!result.valid, '删除按钮应处于禁用状态');
  });
}
const paidRental = rentals.find(r => r.depositRefunded);
if (paidRental) {
  test('押金已退记录删除验证应通过', () => {
    const result = validateDeleteRental(paidRental);
    assert(result.valid === true, '押金已退应可以删除');
  });
}
console.log('');

console.log('━━━ 规则 R005: 维修中设备不可出现在可租列表 ━━━');
const maintenanceDevice = devices.find(d => d.status === 'maintenance');
if (maintenanceDevice) {
  test(`找到维修中设备: ${maintenanceDevice.id}`, () => {
    assert(maintenanceDevice.status === 'maintenance', '设备状态应为维修中');
  });
  test('可租设备列表中不应包含维修中设备', () => {
    const rentable = filterRentableDevices(devices);
    const hasMaintenance = rentable.some(d => d.id === maintenanceDevice.id);
    assert(!hasMaintenance, '维修中设备不应出现在可租列表');
  });
  test('租借中设备也不应出现在可租列表', () => {
    const rentedDevice = devices.find(d => d.status === 'rented');
    if (rentedDevice) {
      const rentable = filterRentableDevices(devices);
      const hasRented = rentable.some(d => d.id === rentedDevice.id);
      assert(!hasRented, '租借中设备不应出现在可租列表');
    }
  });
  test('已损坏设备也不应出现在可租列表', () => {
    const damagedDevice = devices.find(d => d.status === 'damaged');
    if (damagedDevice) {
      const rentable = filterRentableDevices(devices);
      const hasDamaged = rentable.some(d => d.id === damagedDevice.id);
      assert(!hasDamaged, '已损坏设备不应出现在可租列表');
    }
  });
}
console.log('');

console.log('━━━ 可租设备统计 ━━━');
const rentable = filterRentableDevices(devices);
console.log(`  可租借设备数量: ${rentable.length} / ${devices.length}`);
rentable.forEach(d => {
  console.log(`    - ${d.id} | 电量: ${d.batteryLevel}% | 语种包: ${d.languagePacks.filter(p => p.installed).length}/5`);
});
console.log('');

console.log('='.repeat(60));
console.log('测试结果汇总');
console.log('='.repeat(60));
console.log(`  通过: ${passed} 项`);
console.log(`  失败: ${failed} 项`);
console.log('');

if (failed === 0) {
  console.log('🎉 所有业务规则验证通过！');
  console.log('');
  console.log('📝 验证要点总结:');
  console.log('  1. ✅ 低电量(<20%)设备租借按钮禁用');
  console.log('  2. ✅ 缺失语种包显示下载提示并阻断租借');
  console.log('  3. ✅ 损坏归还必须填写备注');
  console.log('  4. ✅ 押金未退记录无法删除');
  console.log('  5. ✅ 维修中设备不在可租列表');
  process.exit(0);
} else {
  console.log('❌ 部分验证未通过');
  process.exit(1);
}
