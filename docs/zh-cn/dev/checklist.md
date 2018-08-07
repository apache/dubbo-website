# 检查列表

## 发布前 checklist

* jira ticket 过一遍
* svn change list
* ticket 关联 code
* test code
* find bugs

## 修复时 checklist

* 修复代码前先建 ticket 
* 修复代码前先写测试用例
* 需要伙伴检查
* test code(正常流程/异常流程)
* 讲一遍逻辑
* 契约文档化
* 以上内容都写到ticket的评论上
* 代码注释写清楚，用中文无妨
* 每个版本要有 owner，确保 scope 和 check

## Partner Check

* Partner 以用户的方式运行一下功能
* Partner 发现问题、添加测试（集成测试）复现总是；Owner 完成实现。（保证两方的时间投入 PatternerCheck 的给予时间保证）
* Owner 向 Partner 讲述一遍实现。