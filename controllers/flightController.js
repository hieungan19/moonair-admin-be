const factory = require('../handlers/factoryHandler');
const Airport = require('../models/airportModel');
const Flight = require('../models/flightModel');

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
      departureAirportId: departureAirport._id,
      destinationAirportId: destinationAirport._id,
      takeoffTime: {
        $gte: new Date(takeoffDate),
        $lt: new Date(new Date(takeoffDate).getTime() + 24 * 60 * 60 * 1000), // Kết thúc ngày
      },
    })
      .populate('departureAirportId', 'name city country') // Chỉ hiển thị thông tin cần thiết của sân bay xuất phát
      .populate('destinationAirportId', 'name city country') // Chỉ hiển thị thông tin cần thiết của sân bay đến
      .select(
        'code departureAirportId destinationAirportId takeoffTime landingTime tickets transitAirports',
      ); // Chỉ lấy các trường cần thiết

    return flights;
  } catch (error) {
    console.error('Lỗi khi lựa chọn các chuyến bay:', error);
    throw error;
  }
}

exports.getFlightsByFromToCityAndDate = async (req, res) => {
  try {
    const { fromAirport, toAirport, takeoffDate } = req.query;
    console.log('Hehe', fromAirport, toAirport, takeoffDate);

    // Kiểm tra xem các tham số có tồn tại không
    if (!fromAirport || !toAirport || !takeoffDate) {
      return res.status(400).json({ message: 'Thiếu thông tin đầu vào.' });
    }

    // Gọi hàm selectFlightsByFromToCityAndDate từ service
    const flights = await selectFlightsByFromToCityAndDate(
      fromAirport,
      toAirport,
      takeoffDate,
    );

    console.log(flights);
    // Chuẩn bị dữ liệu trả về
    const formattedFlights = flights.map((flight) => {
      const durationInMinutes =
        (flight.landingTime - flight.takeoffTime) / (1000 * 60); // Tính độ dài chuyến bay trong phút
      const availableSeats = flight.tickets.reduce(
        (total, ticket) => total + ticket.numOfTic - ticket.seatBooked,
        0,
      ); // Tính số chỗ còn trống
      return {
        departureAirport: {
          name: flight.departureAirportId.name,
          city: flight.departureAirportId.city,
          country: flight.departureAirportId.country,
        },
        destinationAirport: {
          name: flight.destinationAirportId.name,
          city: flight.destinationAirportId.city,
          country: flight.departureAirportId.country,
        },
        takeoffTime: flight.takeoffTime,
        landingTime: flight.landingTime,
        duration: durationInMinutes,
        availableSeats: availableSeats,
        flightCode: flight.code,
        transitAirportCount: flight.transitAirports.length,
      };
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

//Select all

//Select by id

//Update

//Delete
