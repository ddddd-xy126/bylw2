用户权限与状态管理
1、简要描述
（1）功能描述：用户权限与状态管理功能为管理员提供账号封禁/解封和用户删除操作。管理员可在后台用户管理页面对指定用户执行封禁、解封或删除操作。

（2）代码逻辑：管理员在后台用户管理页面点击“更多”下拉菜单，选择“封禁用户”或“解除封禁”，前端调用 `banUserApi` 或 `unbanUserApi`，分别请求 PUT /api/admin/users/:id/ban 和 PUT /api/admin/users/:id/unban 接口。后端在 `adminController` 的 `banUser` / `unbanUser` 方法中先查询目标用户并验证操作者不能对自己执行该操作（通过比对 `user.id` 和 `req.user.id`），随后更新用户记录的 `banned` 字段为 `true` 或 `false`，记录管理员操作（写入 `AdminActivity` 日志），并返回操作结果。删除用户时，前端先弹出确认对话框，确认后调用 `deleteUserApi` 请求 DELETE /api/admin/users/:id 接口，后端在 `deleteUser` 方法中查询目标用户并验证不能删除自己，执行删除用户记录的操作、记录管理员操作后返回成功响应，前端刷新列表并显示提示。

时序图描述
管理员 → 前端界面: 点击封禁/删除按钮
前端界面 → adminController: PUT/DELETE /api/admin/users/:id/\*
adminController → MySQL: 在事务中更新或删除用户并记录日志
MySQL → adminController: 返回操作结果
adminController → 前端界面: 返回成功响应
前端界面 → 管理员: 显示操作提示

**_时序图最新描述_**
管理员->>前端用户管理页面 UserManagePage.vue: ① 点击"封禁"按钮
前端用户管理页面->>API 层(admin.js): ② 调用封禁用户接口
API 层(admin.js)->>后端路由(admin.js): ③ PUT /admin/users/:id/ban
后端路由(admin.js)->>控制器(adminController.js): ④ 调用 banUser 方法
控制器(adminController.js)->>数据库: ⑤ 开启数据库事务
控制器(adminController.js)->>数据库: ⑥ 查询 User 记录并验证非自身
控制器(adminController.js)->>数据库: ⑦ 更新 User.banned=true
数据库-->>控制器(adminController.js): ⑩ 返回操作结果
控制器(adminController.js)-->>前端用户管理页面: ⑪ 返回封禁成功响应
前端用户管理页面->>管理员: ⑫ 显示"用户已封禁"提示

    管理员->>前端用户管理页面: ⑬ 点击"删除"按钮
    前端用户管理页面->>管理员: ⑭ 弹出确认对话框
    管理员->>前端用户管理页面: ⑮ 确认删除
    前端用户管理页面->>API层(admin.js): ⑯ 调用删除用户接口
    API层(admin.js)->>后端路由(admin.js): ⑰ DELETE /admin/users/:id
    后端路由(admin.js)->>控制器(adminController.js): ⑱ 调用deleteUser方法
    控制器(adminController.js)->>数据库: ⑲ 开启数据库事务
    控制器(adminController.js)->>数据库: ⑳ 查询User记录并验证非自身
    控制器(adminController.js)->>数据库: ㉑ 执行destroy()删除用户
    数据库-->>控制器(adminController.js): ㉔ 返回删除结果
    控制器(adminController.js)-->>前端用户管理页面: ㉕ 返回删除成功响应
    前端用户管理页面->>管理员: ㉖ 显示"用户删除成功"提示

**_end_**

2、接口定义
表 5-23 用户权限与状态管理接口表

接口名称 封禁/解封用户接口
接口描述 管理员封禁或解封用户账号时调用
URL {{baseurl}}/admin/users/:id/ban 或 /admin/users/:id/unban
method PUT
请求参数 无
返回参数 {"success": true, "message": "用户已封禁/已解封", "data": {"id": "USR001", "banned": true/false}}

接口名称 删除用户接口
接口描述 管理员删除用户账号时调用（物理删除）
URL {{baseurl}}/admin/users/:id
method DELETE
请求参数 无
返回参数 {"success": true, "message": "用户删除成功"}

3、关键代码
代码 5-23 用户权限与状态管理核心代码

// 封禁用户 (adminController.js)
exports.banUser = async (req, res, next) => {
const t = await sequelize.transaction();
try {
const user = await User.findByPk(req.params.id);
if (user.id === req.user.id) throw new Error("不能封禁自己");
await user.update({ banned: true }, { transaction: t });
await AdminActivity.create({ adminId: req.user.id, title: "封禁用户", type: "user_ban" }, { transaction: t });
await t.commit();
res.json({ success: true, message: "用户已封禁" });
} catch (error) {
await t.rollback();
next(error);
}
};

// 删除用户 (adminController.js)
exports.deleteUser = async (req, res, next) => {
const t = await sequelize.transaction();
try {
const user = await User.findByPk(req.params.id);
if (user.id === req.user.id) throw new Error("不能删除自己");
await user.destroy({ transaction: t });
await AdminActivity.create({ adminId: req.user.id, title: "删除用户", type: "user_delete" }, { transaction: t });
await t.commit();
res.json({ success: true, message: "用户删除成功" });
} catch (error) {
await t.rollback();
next(error);
}
};
