# 博物馆讲解器租借系统

面向游客、服务台和设备维护员的博物馆讲解器租借管理Web前端。

## 功能特性

### 👤 游客视图
- 查看可租借设备列表
- 按语种筛选设备
- 查看设备电量和语种包状态
- 了解租借须知

### 🏢 服务台视图
- 设备租借登记
- 设备归还检查
- 押金管理
- 租借记录查询
- 损坏备注登记

### 🔧 维护员视图
- 设备状态总览
- 维修队列管理
- 语种包下载安装
- 电量监控与充电
- 设备详情查看

## 业务规则

| 规则 | 描述 |
|------|------|
| R001 | 低电量(<20%)设备不能租出，租借按钮禁用 |
| R002 | 语种包缺失提示下载，阻止对应语种租借 |
| R003 | 归还损坏设备必须填写备注 |
| R004 | 押金未退的租借记录不能被删除 |
| R005 | 维修中设备不可出现在可租列表 |

## 本地数据存储

系统使用 localStorage 持久化存储以下数据：
- 讲解器编号、电量、语种包
- 租借人信息、押金
- 损坏状态、归还记录
- 维修队列

## 快速开始

### 开发模式

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000

### Docker 部署

```bash
# 使用 docker-compose
docker-compose up -d

# 或单独构建运行
docker build -t museum-guide-rental .
docker run -p 3000:80 museum-guide-rental
```

### 运行验证脚本

```bash
# 执行业务规则验证
npm run verify
```

## 项目结构

```
src/
├── components/       # 公共组件
│   ├── DeviceCard.tsx
│   ├── StatusBadge.tsx
│   ├── BatteryIndicator.tsx
│   ├── LanguagePills.tsx
│   └── Modal.tsx
├── pages/           # 页面
│   ├── Visitor.tsx      # 游客视图
│   ├── ServiceDesk.tsx  # 服务台视图
│   └── Maintenance.tsx  # 维护员视图
├── store/           # 状态管理
│   └── AppContext.tsx
├── types/           # TypeScript 类型
├── utils/           # 工具函数
│   ├── storage.ts       # 本地存储
│   ├── validators.ts    # 业务规则验证
│   └── seedData.ts      # 样例数据
├── App.tsx
├── main.tsx
└── index.css
```

## 技术栈

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- React Router v6
- Lucide React 图标
- localStorage 数据持久化
