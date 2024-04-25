const Flight = require('../models/flightModel');
const Invoice = require('../models/invoiceModel');
const User = require('../models/userModel');
const AppError = require('../utils/appError');

const reportInfo = async (startPoint, endPoint, next) => {
  try {
    // số lượng user
    const userCount = await User.countDocuments({
      createdAt: {
        $gte: startPoint,
        $lt: endPoint,
      },
    });
    // số lượng chuyến bay
    const flightCount = await Flight.countDocuments({
      createdAt: {
        $gte: startPoint,
        $lt: endPoint,
      },
    });
    // số lượng vé tổng, số lượng vé bán ra.
    const flights = await Flight.find({
      createdAt: {
        $gte: startPoint,
        $lt: endPoint,
      },
    });
    let totalTickets = 0;
    let soldTickets = 0;

    flights.forEach((flight) => {
      flight.tickets.forEach((ticket) => {
        totalTickets += ticket.numOfTic;
        soldTickets += ticket.seatsBooked.length;
      });
    });

    //Doanh thu
    const invoices = await Invoice.find({
      createdAt: {
        $gte: startPoint,
        $lt: endPoint,
      },
    });

    let totalRevenue = 0;
    invoices.forEach((invoice) => {
      invoice.boughtTickets.forEach((boughtTicket) => {
        if (boughtTicket.status === true) {
          totalRevenue += boughtTicket.price;
        }
      });
    });
    const data = {
      userCount: userCount,
      flightCount: flightCount,
      totalTickets: totalTickets,
      soldTickets: soldTickets,
      revenue: totalRevenue,
    };
    return data;
  } catch (error) {
    throw new Error('Fail to get data');
  }
};

// Doanh thu, số lượng user đăng kí, số lượng vé bán ra, số chuyến bay.
exports.todayReport = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );
    const data = await reportInfo(startOfDay, endOfDay);
    res.status(200).json({
      status: 'success',
      data,
    });
  } catch (error) {
    return next(new AppError('Fail to get report for today', 400));
  }
};

exports.monthlyReport = async (req, res, next) => {
  try {
    const today = new Date();
    const currentYear = today.getFullYear();
    const doc = [];
    for (let month = 0; month < 12; month++) {
      const startOfMonth = new Date(currentYear, month, 1);
      const endOfMonth = new Date(currentYear, month + 1, 0);
      const data = await reportInfo(startOfMonth, endOfMonth);
      doc.push(data);
    }
    res.status(200).json({
      status: 'success',
      doc,
    });
  } catch (error) {
    return next(new AppError('Fail to get Monthly data'));
  }
};
