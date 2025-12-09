用户权限与状态管理
1、简要描述
（1）功能描述：用户权限与状态管理功能为管理员提供账号封禁/解封和用户删除操作。管理员可在后台用户管理页面对指定用户执行封禁、解封或删除操作。

（2）代码逻辑：管理员在后台用户管理页面，点击封禁/解封，前端分别调用PUT /api/admin/users/:id/ban和PUT /api/admin/users/:id/unban 接口，后端中查询目标用户验证操作者不能封禁自己后更新banne为true或false。在删除用户时，在前端点击删除用户后，后端调用DELETE /api/admin/users/:id接口，验证不能删除自己后执行destroy方法删除用户记录，返回成功响应。

时序图描述
管理员 → 前端界面: 点击封禁/删除按钮
前端界面 → adminController: PUT/DELETE /api/admin/users/:id/\*
adminController → MySQL: 在事务中更新或删除用户并记录日志
MySQL → adminController: 返回操作结果
adminController → 前端界面: 返回成功响应
前端界面 → 管理员: 显示操作提示

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
