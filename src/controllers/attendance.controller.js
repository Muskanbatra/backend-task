const Attendance = require('../models/Attendance');
const Task = require('../models/task.model');
const { Auth } = require('../models');

exports.checkIn = async (req, res) => {
  const record = await Attendance.create(req.body);
  res.send(record);
};

exports.checkOut = async (req, res) => {
  const record = await Attendance.findOne({
    userId: req.body.userId,
    status: 'CHECKED_IN',
  });

  if (!record) {
    return res.status(404).json({
      message: 'No active check-in found',
    });
  }

  record.checkOutTime = req.body.checkOutTime;
  record.checkOutLocation = req.body.checkOutLocation;
  record.status = 'CHECKED_OUT';

  record.totalHours =
    (new Date(record.checkOutTime) -
      new Date(record.checkInTime)) /
    (1000 * 60 * 60);

  await record.save();

  res.send(record);
};

exports.getTodayAttendance = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      checkInTime: {
        $gte: start,
        $lte: end,
      },
    });

    res.send(records);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }
};

exports.getAttendanceStatus = async (req, res) => {
  try {
    const record = await Attendance.findOne({
      userId: req.params.userId,
    }).sort({ checkInTime: -1 });

    res.send(record);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });

  }
};

exports.getTodayReport = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const users = await Auth.find({
      role: { $not: /^admin$/i },
    })
      .select('_id name email role')
      .lean();

    const attendance = await Attendance.find({
      checkInTime: {
        $gte: start,
        $lte: end,
      },
    }).lean();

    const completedTasks = await Task.find({
      status: 'completed',
      completedAt: {
        $gte: start.toISOString(),
        $lte: end.toISOString(),
      },
    })
      .select('_id title assignedTo completedAt')
      .populate('assignedTo', '_id')
      .lean();

    const activeTasks = await Task.find({
      status: 'in_progress',
    })
      .select('_id title assignedTo')
      .lean();

    const pendingTasks = await Task.find({
      status: 'pending',
    })
      .select('_id title assignedTo')
      .lean();

    const usersMap = {};

    users.forEach(user => {
      usersMap[String(user._id)] = {
        userId: String(user._id),
        userName: user.name || user.email || String(user._id),
        role: user.role,
        attendance: [],
        completedTasks: [],
        activeTasks: [],
        pendingTasks: [],
        totalHours: 0,
      };
    });

    attendance.forEach(item => {
      const userId = String(item.userId);

      if (!usersMap[userId]) return;

      usersMap[userId].attendance.push(item);
      usersMap[userId].totalHours += item.totalHours || 0;
    });

    completedTasks.forEach(task => {
      const userId = String(task.assignedTo?._id);

      if (!userId || !usersMap[userId]) return;

      usersMap[userId].completedTasks.push({
        id: task._id,
        title: task.title,
        completedAt: task.completedAt,
      });
    });

    activeTasks.forEach(task => {
      // const userId = String(task.assignedTo);
      const userId = String(task.assignedTo?._id || task.assignedTo);

      if (!usersMap[userId]) return;

      usersMap[userId].activeTasks.push({
        id: task._id,
        title: task.title,
      });
    });

    pendingTasks.forEach(task => {
      const userId = String(task.assignedTo?._id || task.assignedTo);
      if (!usersMap[userId]) return;

      usersMap[userId].pendingTasks.push({
        id: task._id,
        title: task.title,
      });
    });

    return res.json({
      success: true,
      data: Object.values(usersMap),
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};
