const Flight = require('../models/flightModel');
const Invoice = require('../models/invoiceModel');
const AppError = require('../utils/appError');
// poppulate invoice data
const populateInvoiceData = async (data) => {
  const doc = await Invoice.populate(data, [
    {
      path: 'user',
      select: 'name email phoneNumber',
    },

    {
      path: 'boughtTickets',
      populate: [
        {
          path: 'ticketClass',
          select: 'name',
        },
        {
          path: 'flight',
          select: 'takeoffTime landingTime ',
          populate: [
            {
              path: 'departureAirport destinationAirport',
              select: 'name city cityCode',
            },
            {
              path: 'transitAirports',
              select: 'startTime endTime ',
              populate: {
                path: 'airport',
                select: 'name city',
              },
            },
          ],
        },
      ],
    },
  ]);

  return doc;
};
//Create a invoice
exports.createInvoice = async (req, res, next) => {
  try {
    const data = await Invoice.create(req.body);
    console.log(data);
    if (!data) {
      return next(new AppError('Fail to create', 400));
    }

    const doc = await populateInvoiceData(data);
    res.status(200).json({
      status: 'success',
      doc,
    });
  } catch (err) {
    console.log(err);
    return next(new AppError('Fail to create invoice', 400));
  }
};

//Get all invoice (admin)
exports.getAllInvoices = async (req, res, next) => {
  try {
    const data = await Invoice.find();
    const doc = await Invoice.populate(data, [
      {
        path: 'user',
        select: 'name email phoneNumber',
      },
      {
        path: 'boughtTickets',
        populate: [
          {
            path: 'ticketClass',
            select: 'name',
          },
        ],
      },
    ]);
    const result = doc.map((invoice) => ({
      user: invoice.user,
      createdAt: invoice.createdAt,
      total: invoice.total,
      id: invoice.id,
      code: invoice.code,
    }));
    res.status(200).json({
      status: 'success',
      result,
    });
  } catch (err) {
    return next(new AppError('Fail to get all invoices', 400));
  }
};

//Update a ticket status
exports.updateTicketStatus = async (req, res, next) => {
  try {
    // Lấy tất cả các invoice
    const invoices = await Invoice.find();
    //
    let foundInvoice = null;

    // Khai báo biến để chứa ticket nếu tìm thấy
    let foundTicket = null;

    // Duyệt qua từng invoice
    for (const invoice of invoices) {
      // Tìm ticket trong danh sách boughtTickets của invoice hiện tại
      const ticket = invoice.boughtTickets.find(
        (t) => t.id == req.params.ticketId,
      );

      // Nếu tìm thấy ticket, gán giá trị cho foundTicket và thoát vòng lặp
      if (ticket) {
        foundTicket = ticket;
        foundInvoice = invoice;

        break;
      }
    }
    console.log(foundInvoice.id);
    const boughtTicketIndex = foundInvoice.boughtTickets.findIndex(
      (ticket) => ticket._id == foundTicket.id,
    );
    // Update the status of the boughtTicket
    foundInvoice.boughtTickets[boughtTicketIndex].status = false;

    // Save the updated invoice
    await foundInvoice.save();

    //Update Booked seat in flight
    const t = foundInvoice.boughtTickets[boughtTicketIndex];
    const flight = await Flight.findById(t.flight);
    const ticketIndex = flight.tickets.findIndex(
      (ticket) => ticket.class == t.ticketClass,
    );

    await Flight.updateOne(
      { _id: flight, 'tickets._id': flight.tickets[ticketIndex]._id },
      { $pull: { 'tickets.$.seatsBooked': t.seatNo } },
    );

    res.status(200).json({
      success: true,
      message: 'Bought ticket status updated successfully',
    });
  } catch (err) {
    return next(new AppError('Failed to cancel ticket', 400));
  }
};

//Get a invoice
exports.getOneInvoice = async (req, res, next) => {
  try {
    const data = await Invoice.findById(req.params.id);
    const doc = await populateInvoiceData(data);
    console.log(doc);
    res.status(200).json({
      status: 'success',
      doc,
    });
  } catch (err) {
    return next(AppError('Fail to get one invoice', 400));
  }
};

//Get all ticket buy by a user (History)
exports.ticketsHistory = async (req, res, next) => {
  try {
    const doc = [];
    console.log(req.params.id);
    const invoices = await Invoice.find({ user: req.params.id });
    console.log(invoices);
    for (const invoice of invoices) {
      const i = await populateInvoiceData(invoice);
      doc.push(...i.boughtTickets);
    }
    console.log(doc);
    // Xử lý dữ liệu ở đây
    res.status(200).json({
      status: 'success',
      data: doc,
    });
  } catch (err) {
    return next(new AppError('Fail to get history', 400));
  }
};

//Get a ticket by ticket id
exports.getOneTicket = async (req, res, next) => {
  try {
    // Lấy tất cả các invoice
    const invoices = await Invoice.find();

    // Khai báo biến để chứa ticket nếu tìm thấy
    let foundTicket = null;

    // Duyệt qua từng invoice
    for (const invoice of invoices) {
      // Sử dụng hàm populateInvoiceData để lấy thông tin chi tiết của invoice
      const populatedInvoice = await populateInvoiceData(invoice);
      if (invoice.user._id == req.params.id) {
        // Tìm ticket trong danh sách boughtTickets của invoice hiện tại
        const ticket = populatedInvoice.boughtTickets.find(
          (t) => t.id == req.params.ticketId,
        );

        // Nếu tìm thấy ticket, gán giá trị cho foundTicket và thoát vòng lặp
        if (ticket) {
          foundTicket = ticket;
          break;
        }
      }
    }

    // Nếu không tìm thấy ticket, trả về lỗi
    if (!foundTicket) {
      return next(new AppError('Ticket not found', 404));
    }

    // Tạo QR code URL
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${foundTicket.id}`;

    // Trả về kết quả
    res.status(200).json({
      status: 'success',
      ticket: foundTicket,
      qr: qr,
    });
  } catch (err) {
    // Xử lý lỗi
    return next(new AppError('Fail to get one ticket', 400));
  }
};
// Get all ticket
