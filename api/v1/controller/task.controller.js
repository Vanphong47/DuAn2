const Task = require("../models/task.model");
const paginationHelper = require("../../../helper/pagination.helper");

//[get] /api/v1/tasks
module.exports.index = async (req, res) => {
    const userId = res.locals.user.id;
    const find = {
      $or: [
        { createdBy: userId },
        { listUser: userId }
      ],
      deleted: false
    }
    // filter status 
    if(req.query.status){
        find.status = req.query.status;
    }

    // sort 
    const sort = {};
    if(req.query.sortKey && req.query.sortValue){
        sort[req.query.sortKey] = req.query.sortValue;
    }

    // pagination 
    const countTask = await Task.countDocuments(find);
    const objectPagination = paginationHelper(2, req.query, countTask);
    // end pagination  

    // search
    if(req.query.keyword) {
        const regex = new RegExp(req.query.keyword, "i");
        find.title = regex;
    }
    // end search    

    const tasks = await Task.find(find)
    .sort(sort)
    .limit(objectPagination.limitItem)
    .skip(objectPagination.skip);    

    res.json(tasks);
}

//[get] /api/v1/tasks/detail/:id
module.exports.detail = async (req, res) => {
    const id = req.params.id;
    const task = await Task.findOne({
        _id: id,
        deleted: false
    })
    res.json(task);
}
// [PATCH] /api/v1/tasks/change-status/:id
module.exports.changeStatus = async (req, res) => {
    try {
      const id = req.params.id;
      const status = req.body.status;
  
      await Task.updateOne({
        _id: id
      }, {
        status: status
      });
  
      res.json({
        code: 200,
        message: "Cập nhật trạng thái thành công!"
      });
    } catch (error) {
      res.json({
        code: 400,
        message: "Cập nhật trạng thái không thành công!"
      });
    }
}
// [PATCH] /api/v1/tasks/change-multi
module.exports.changeMulti = async (req, res) => {
  try {
    const { ids, key, value } = req.body;

    switch (key) {
      case "status":
        await Task.updateMany({
          _id: { $in: ids }
        }, {
          status: value
        });

        res.json({
          code: 200,
          message: "Cập nhật trạng thái thành công!"
        });
        break;

      default:
        res.json({
          code: 400,
          message: "Không tồn tại!"
        });
        break;
      case "delete":
        await Task.updateMany({
          _id: { $in: ids }
        }, {
          deleted: true,
          deletedAt: new Date()
        });

        res.json({
          code: 200,
          message: "Cập nhật trạng thái thành công!"
        });
        break;      
        
    }
  } catch (error) {
    res.json({
      code: 400,
      message: "Không tồn tại!"
    });
  }
};
// [POST] /api/v1/tasks/create
module.exports.create = async (req, res) => {
  try {
    req.body.createdBy = res.locals.user.id;
    const task = new Task(req.body);
    const data = await task.save();

    res.json({
      code: 200,
      message: "Tạo thành công!",
      data: data
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Lỗi!"
    });
  }
};
// [PATCH] /api/v1/tasks/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const id = req.params.id;

    await Task.updateOne({ _id: id }, req.body);

    res.json({
      code: 200,
      message: "Cập nhật thành công!"
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Lỗi!"
    });
  }
};
// [PATCH] /api/v1/tasks/delete/:id
module.exports.delete = async (req, res) => {
  try {
    const id = req.params.id;

    await Task.updateOne(
      { _id: id },
      {
        deleted: true,
        deletedAt: new Date()
      }
    );

    res.json({
      code: 200,
      message: "Xóa thành công!"
    });
  } catch (error) {
    res.json({
      code: 400,
      message: "Lỗi!"
    });
  }
};