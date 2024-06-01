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
              select: 'startTime endTime',
              populate: {
                path: 'airport',
                select: 'name',
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
    if (!data) {
      return next(new AppError('Fail to create', 400));
    }

    const doc = await populateInvoiceData(data);
    res.status(200).json({
      status: 'success',
      doc,
    });
  } catch (err) {
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
    const { status, boughtTicketId, invoiceId } = req.body;
    const invoice = await Invoice.findById(invoiceId);
    const boughtTicketIndex = invoice.boughtTickets.findIndex(
      (ticket) => ticket._id == boughtTicketId,
    );
    // Update the status of the boughtTicket
    invoice.boughtTickets[boughtTicketIndex].status = status;

    // Save the updated invoice
    await invoice.save();

    //Update Booked seat in flight
    const t = invoice.boughtTickets[boughtTicketIndex];
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
    return next(new AppError('Hủy vé không thành công', 400));
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

//Get a ticket by ticket id and invoice id
exports.getOneTicket = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.invoiceId);
    const temp = await populateInvoiceData(invoice);
    const ticket = temp.boughtTickets.find((t) => t.id == req.params.ticketId);
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticket.id}`;
    res.status(200).json({
      status: 'success',
      ticket,
      qr: qr,
    });
  } catch (err) {
    return next(AppError('Fail to get one invoice', 400));
  }
};
// Get all ticket
