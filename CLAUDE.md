# frontend-rules

包管理工具:pnpm

## component-rules（组件规范）

### naming（命名）

* file：`kebab-case.tsx`
* component：`PascalCase`
* page-entry：`index.tsx`

### export（导出）

* 组件必须 **default export**
* 类型使用 **named export**

### design（设计规则）

* 单一职责
* UI 组件无业务逻辑
* 页面负责协调 API / Store / UI

---


## abbreviation-rules（常用简写规范）

以下为项目中允许的 **20 个固定简写**，用于变量名、函数名、store 字段等：

| Full          | Abbrev |
| ------------- | ------ |
| request       | req    |
| response      | res    |
| parameter     | param  |
| configuration | config |
| information   | info   |
| message       | msg    |
| error         | err    |
| previous      | prev   |
| current       | curr   |
| temporary     | temp   |
| identifier    | id     |
| options       | opts   |
| properties    | props  |
| reference     | ref    |
| initialize    | init   |
| update        | upd    |
| delete        | del    |
| environment   | env    |
| application   | app    |
| callback      | cb     |

尽量不要自定义请求接口req,响应接口res,以及重新命名接口!

## 输出规则
1. 禁止输出不必要的内容
   - 不要写注释（除非明确要求）
   - 不要写文档说明
   - 不要写README
   - 不要生成测试代码（除非明确要求）
   - 不要做代码总结
   - 不要写使用说明
   - 不要添加示例代码（除非明确要求）

2. 禁止废话
   - 不要解释为什么这样做
   - 不要说"好的，我来帮你"这类套话
   - 不要问是否需要，直接给出最佳方案
   - 不要列举多个方案让我选择,直接给我最优解
   - 不要重复我说过的话

3. 直接给代码
   - 我要什么就给什么,多一个字不要
   - 代码能跑就行,别整花里胡哨的

## 行为准则
* 只做我要求做的事
* 不要自作主张添加额外功能
* 不要过度优化(除非我要求)
* 不要重构我没让你改的代码
* 如果我要求不清楚,问一个最关键的问题,而不是一堆假设

## 违规后果
- 每多输出100字，就会有一只小动物死掉