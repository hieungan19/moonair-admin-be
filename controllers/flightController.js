const factory = require('../handlers/factoryHandler');
const Airport = require('../models/airportModel');
const Flight = require('../models/flightModel');

const formattedFlight = (flight) => {
  return {
    _id: flight.id,
    departureAirport: {
      name: flight.departureAirport.name,
      city: flight.departureAirport.city,
      country: flight.departureAirport.country,
    },
    destinationAirport: {
      name: flight.destinationAirport.name,
      city: flight.destinationAirport.city,
      country: flight.departureAirport.country,
    },
    takeoffTime: flight.takeoffTime,
    landingTime: flight.landingTime,
    duration: flight.duration,
    availableSeats: flight.availableSeats,
    flightCode: flight.code,
    transitAirportCount: flight.transitAirports.length,
  };
};

//Create flight with transit Airport
exports.createFlight = factory.createOne(Flight);

//select all flight by from city to city by time
async function selectFlightsByFromToCityAndDate(from, to, takeoffDate) {
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
    const flights = await Flight.find({
      departureAirport: departureAirport._id,
      destinationAirport: destinationAirport._id,
      takeoffTime: {
        $gte: new Date(takeoffDate),
        $lt: new Date(new Date(takeoffDate).getTime() + 24 * 60 * 60 * 1000), // Kết thúc ngày
      },
    })
      .populate('departureAirport', 'name city country') // Chỉ hiển thị thông tin cần thiết của sân bay xuất phát
      .populate('destinationAirport', 'name city country') // Chỉ hiển thị thông tin cần thiết của sân bay đến
      .select(
        'code departureAirport destinationAirport takeoffTime landingTime tickets transitAirports',
      ); // Chỉ lấy các trường cần thiết
    return flights;
  } catch (error) {
    console.error('Lỗi khi lựa chọn các chuyến bay:', error);
    throw error;
  }
}

exports.getFlights = async (req, res) => {
  try {
    const { fromAirport, toAirport, takeoffDate } = req.query;
    let flights;

    // Kiểm tra xem các tham số có tồn tại không
    if (!fromAirport || !toAirport || !takeoffDate) {
      flights = await Flight.find()
        .populate('departureAirport', 'name city country')
        .populate('destinationAirport', 'name city country')
        .select(
          'code departureAirport destinationAirport takeoffTime landingTime tickets transitAirports',
        );
    } else {
      // Gọi hàm selectFlightsByFromToCityAndDate từ service
      flights = await selectFlightsByFromToCityAndDate(
        fromAirport,
        toAirport,
        takeoffDate,
      );
    }
    // Chuẩn bị dữ liệu trả về
    const formattedFlights = flights.map((flight) => {
      return formattedFlight(flight);
    });

    // Trả về kết quả
    return res.status(200).json(formattedFlights);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách chuyến bay:', error);
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
        populate: { path: 'class', select: 'name ratio' }, // Populate thông tin của hạng vé
      })
      .populate({
        path: 'transitAirports',
        populate: { path: 'airport ', select: 'name ' }, // Populate thông tin của hạng vé
      })
      .populate('aircraft', 'name code') // Populate thông tin của máy bay
      .populate('departureAirport destinationAirport', 'name city'); // Populate thông tin của sân bay xuất phát và sân bay đích

    // Kiểm tra xem chuyến bay có tồn tại không
    if (!flight) {
      return res.status(404).json({ message: 'Không tìm thấy chuyến bay.' });
    }

    // Trả về thông tin chuyến bay
    res.status(200).json({ flight });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin chuyến bay:', error);
    res
      .status(500)
      .json({ message: 'Đã xảy ra lỗi khi lấy thông tin chuyến bay.' });
  }
};

//Update (for admin)
exports.updateFlight = factory.updateOne(Flight);

//Delete (for admin)
exports.deleteFlight = factory.deleteOne(Flight);
