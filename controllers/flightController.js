const factory = require('../handlers/factoryHandler');
const Airport = require('../models/airportModel');
const Flight = require('../models/flightModel');

const formattedFlight = (flight) => {
  // Initialize variables to track the class with the smallest ratio
  let smallestRatioClass = null;
  let smallestRatio = Infinity;

  // Loop through the tickets and find the class with the smallest ratio
  flight.tickets.forEach((ticket) => {
    if (ticket.class && ticket.class.ratio < smallestRatio) {
      smallestRatio = ticket.class.ratio;
      smallestRatioClass = ticket.class.name;
    }
  });
  return {
    _id: flight.id,
    departureAirport: {
      name: flight.departureAirport.name,
      city: flight.departureAirport.city,
      country: flight.departureAirport.country,
      cityCode: flight.departureAirport.cityCode,
    },
    destinationAirport: {
      name: flight.destinationAirport.name,
      city: flight.destinationAirport.city,
      country: flight.departureAirport.country,
      cityCode: flight.destinationAirport.cityCode,
    },
    takeoffTime: flight.takeoffTime,
    landingTime: flight.landingTime,
    duration: flight.duration,
    availableSeats: flight.availableSeats,
    flightCode: flight.code,
    transitAirportCount: flight.transitAirports.length,
    price: flight.price,
    aircraftName: flight.aircraft.name,
    minPrice: flight.price * smallestRatio,
    nameMinPrice: smallestRatioClass,
    transitAiports: flight.transitAirports,
  };
};

//Create flight with transit Airport
exports.createFlight = factory.createOne(Flight);

//select all flight by from city to city by time
async function selectFlightsByFromToCityAndDate(from, to, takeoffDate, seats) {
  try {
    // Lấy thông tin về sân bay xuất phát và sân bay đến dựa trên mã sân bay
    const departureAirport = await Airport.findOne({ _id: from });
    const destinationAirport = await Airport.findOne({ _id: to });

    // Kiểm tra xem có sân bay tương ứng với mã sân bay không
    if (!departureAirport) {
      throw new Error(`Không tìm thấy sân bay với mã ${from}`);
    }
    if (!destinationAirport) {
      throw new Error(`Không tìm thấy sân bay với mã ${to}`);
    }

    // Tìm các chuyến bay dựa trên thông tin sân bay và ngày khởi hành
    let flights = await Flight.find({
      departureAirport: departureAirport._id,
      destinationAirport: destinationAirport._id,
      takeoffTime: {
        $gte: new Date(takeoffDate),
        $lt: new Date(new Date(takeoffDate).getTime() + 24 * 60 * 60 * 1000), // Kết thúc ngày
      },
    })
      .populate({
        path: 'transitAirports',
        populate: { path: 'airport ', select: 'name city cityCode ' }, // Populate thông tin sân bay
      })
      .populate({
        path: 'tickets',
        populate: { path: 'class', select: 'name ratio' }, // Populate thông tin của hạng vé máy bay
      })
      .populate('departureAirport', 'name city country cityCode') // Chỉ hiển thị thông tin cần thiết của sân bay xuất phát
      .populate('destinationAirport', 'name city country cityCode') // Chỉ hiển thị thông tin cần thiết của sân bay đến
      .populate('aircraft', 'name code')
      .select(
        'code departureAirport destinationAirport takeoffTime landingTime tickets transitAirports tickets price',
      ); // Chỉ lấy các trường cần thiết
    flights = flights.filter((flight) => flight.availableSeats >= seats);

    return flights;
  } catch (error) {
    console.error('Lỗi khi lựa chọn các chuyến bay:', error);
    throw error;
  }
}

exports.getFlights = async (req, res) => {
  try {
    const { fromAirport, toAirport, takeoffDate, seats } = req.query;
    let flights;

    // Kiểm tra xem các tham số có tồn tại không
    if (!fromAirport || !toAirport || !takeoffDate) {
      flights = await Flight.find()
        .populate({
          path: 'transitAirports',
          populate: { path: 'airport ', select: 'name city cityCode ' }, // Populate thông tin sân bay
        })
        .populate({
          path: 'tickets',
          populate: { path: 'class', select: 'name ratio' }, // Populate thông tin của hạng vé máy bay
        })
        .populate('departureAirport', 'name city country cityCode')
        .populate('destinationAirport', 'name city country cityCode')
        .populate('aircraft', 'name') // Populate thông tin của máy bay
        .select(
          'code departureAirport destinationAirport takeoffTime landingTime tickets transitAirports aircraft price tickets ',
        );
      flights = flights.filter((flight) => flight.availableSeats > 0);
    } else {
      // Gọi hàm selectFlightsByFromToCityAndDate từ service
      flights = await selectFlightsByFromToCityAndDate(
        fromAirport,
        toAirport,
        takeoffDate,
        seats,
      );
    }

    // Chuẩn bị dữ liệu trả về
    const formattedFlights = flights.map((flight) => {
      return formattedFlight(flight);
    });

    // Trả về kết quả
    return res.status(200).json(formattedFlights);
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Đã xảy ra lỗi khi lấy danh sách chuyến bay.' });
  }
};

//Select by id
exports.getFlightById = async (req, res) => {
  const flightId = req.params.id;

  try {
    // Lấy thông tin của chuyến bay dựa trên ID và populate thông tin liên quan
    const flight = await Flight.findById(flightId)
      .populate({
        path: 'tickets',
        populate: { path: 'class', select: 'name ratio' }, // Populate thông tin của hạng vé máy bay
      })
      .populate({
        path: 'transitAirports',
        populate: { path: 'airport ', select: 'name city cityCode ' }, // Populate thông tin sân bay
      })
      .populate('aircraft', 'name code') // Populate thông tin của máy bay
      .populate(
        'departureAirport destinationAirport',
        'name city country cityCode',
      ); // Populate thông tin của sân bay xuất phát và sân bay đích

    // Kiểm tra xem chuyến bay có tồn tại không
    if (!flight) {
      return res.status(404).json({ message: 'Không tìm thấy chuyến bay.' });
    }
    console.log(flight.availableSeats);

    // Trả về thông tin chuyến bay
    res.status(200).json({ flight });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Đã xảy ra lỗi khi lấy thông tin chuyến bay.' });
  }
};

//Update (for admin)
exports.updateFlight = factory.updateOne(Flight);

//Delete (for admin)
exports.deleteFlight = factory.deleteOne(Flight);
