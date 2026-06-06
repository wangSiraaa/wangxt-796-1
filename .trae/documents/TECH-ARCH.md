# 博物馆讲解器租借系统 - 技术架构文档

## 1. 技术选型

| 类别 | 技术选择 | 说明 |
|------|---------|------|
| 构建工具 | Vite 5 | 快速的前端构建工具 |
| 框架 | React 18 | 用户界面库 |
| 语言 | TypeScript | 类型安全 |
| 样式 | Tailwind CSS 4 | 原子化CSS框架 |
| 路由 | React Router | 单页应用路由 |
| 状态管理 | React Context + useReducer | 轻量级状态管理 |
| 本地存储 | localStorage + IndexedDB | 数据持久化 |
| 图标 | Lucide React | 现代化图标库 |
| 测试 | Vitest | 单元测试框架 |

## 2. 项目结构

```
museum-guide-rental/
├── src/
│   ├── components/          # 公共组件
│   │   ├── DeviceCard.tsx   # 设备卡片
│   │   ├── StatusBadge.tsx  # 状态标签
│   │   ├── Modal.tsx        # 弹窗组件
│   │   └── ...
│   ├── pages/               # 页面
│   │   ├── Visitor.tsx      # 游客视图
│   │   ├── ServiceDesk.tsx  # 服务台视图
│   │   └── Maintenance.tsx  # 维护员视图
│   ├── store/               # 状态管理
│   │   ├── AppContext.tsx   # 全局Context
│   │   ├── deviceReducer.ts # 设备状态reducer
│   │   └── rentalReducer.ts # 租借状态reducer
│   ├── types/               # TypeScript类型
│   │   ├── device.ts        # 设备类型
│   │   ├── rental.ts        # 租借类型
│   │   └── user.ts          # 用户类型
│   ├── utils/               # 工具函数
│   │   ├── storage.ts       # 本地存储
│   │   ├── validators.ts    # 业务规则验证
│   │   └── seedData.ts      # 样例数据
│   ├── hooks/               # 自定义Hooks
│   │   └── useDevices.ts    # 设备管理Hook
│   ├── App.tsx              # 应用入口
│   ├── main.tsx             # 渲染入口
│   └── index.css            # 全局样式
├── scripts/                 # 检查脚本
│   └── verify-rules.js      # 业务规则验证脚本
├── public/                  # 静态资源
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 3. 数据模型

### 3.1 设备 (Device)
```typescript
interface Device {
  id: string;              // 设备编号
  batteryLevel: number;    // 电量 0-100
  languagePacks: LanguagePack[]; // 语种包
  status: DeviceStatus;    // 设备状态
  damageNote?: string;     // 损坏备注
  currentRentalId?: string; // 当前租借ID
}

type DeviceStatus = 'available' | 'rented' | 'maintenance' | 'damaged';

interface LanguagePack {
  code: string;       // 语种代码 zh/en/ja/ko/fr
  name: string;       // 语种名称
  installed: boolean; // 是否已安装
}
```

### 3.2 租借记录 (RentalRecord)
```typescript
interface RentalRecord {
  id: string;
  deviceId: string;
  renterName: string;
  renterPhone: string;
  renterIdCard: string;
  deposit: number;      // 押金金额
  depositRefunded: boolean; // 是否已退还
  rentalTime: Date;
  expectedReturnTime: Date;
  actualReturnTime?: Date;
  language: string;     // 租借语种
  damageOnReturn?: boolean;
  damageNote?: string;
  status: 'active' | 'returned' | 'overdue';
}
```

### 3.3 维修队列 (RepairQueueItem)
```typescript
interface RepairQueueItem {
  id: string;
  deviceId: string;
  reportedTime: Date;
  issue: string;
  status: 'pending' | 'repairing' | 'completed';
  assignee?: string;
}
```

## 4. 业务规则引擎

### 4.1 验证器设计
```typescript
// 低电量验证 R001
export const validateLowBattery = (device: Device): ValidationResult => {
  if (device.batteryLevel < 20) {
    return { valid: false, message: `设备电量过低(${device.batteryLevel}%)，无法租借` };
  }
  return { valid: true };
};

// 语种包验证 R002
export const validateLanguagePack = (device: Device, languageCode: string): ValidationResult => {
  const pack = device.languagePacks.find(p => p.code === languageCode);
  if (!pack || !pack.installed) {
    return { valid: false, message: `语种包未安装，请先下载${pack?.name || languageCode}语种包` };
  }
  return { valid: true };
};

// 损坏备注验证 R003
export const validateDamageNote = (damageNote: string): ValidationResult => {
  if (!damageNote || damageNote.trim().length === 0) {
    return { valid: false, message: '设备损坏必须填写备注说明' };
  }
  return { valid: true };
};

// 押金删除验证 R004
export const validateDeleteRental = (record: RentalRecord): ValidationResult => {
  if (!record.depositRefunded) {
    return { valid: false, message: '押金未退还，无法删除该租借记录' };
  }
  return { valid: true };
};

// 可租设备过滤 R005
export const filterRentableDevices = (devices: Device[]): Device[] => {
  return devices.filter(d => 
    d.status === 'available' && 
    d.batteryLevel >= 20
  );
};
```

## 5. 界面设计

### 5.1 色彩方案
- 主色调：深青色 (#0891b2) - 博物馆专业感
- 辅助色：琥珀色 (#d97706) - 警告/低电量
- 成功色：翡翠绿 (#059669) - 正常/可用
- 危险色：赤红色 (#dc2626) - 损坏/错误
- 中性色：石板灰系列

### 5.2 字体
- 标题：Noto Serif SC - 典雅博物馆风格
- 正文：Noto Sans SC - 清晰易读

## 6. 验收测试脚本

`scripts/verify-rules.js` 将验证：
1. 选择低电量设备 → 租借按钮禁用
2. 切换到缺失语种包设备 → 显示下载提示，租借阻断
3. 损坏归还 → 强制填写备注
4. 押金未退记录 → 删除按钮禁用
5. 维修中设备 → 不在可租列表
