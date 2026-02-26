import Booking from "../models/Booking.js";
import Show from "../models/Show.js";


const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);

    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats || {};

    const isAnySeatTaken = selectedSeats.some(
      (seat) => occupiedSeats[seat]
    );

    return !isAnySeatTaken;
  } catch (error) {
    console.error(error);
    return false;
  }
};

//Create Booking (Race-condition safe) 

export const createBooking = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { showId, selectedSeats } = req.body;

    if (!showId || !selectedSeats || selectedSeats.length === 0) {
      return res.json({
        success: false,
        message: "ShowId and selected seats are required",
      });
    }

    // Prepare atomic update object
    const seatUpdateObject = {};
    selectedSeats.forEach((seat) => {
      seatUpdateObject[`occupiedSeats.${seat}`] = userId;
    });

    // Prepare condition to ensure seats are not already taken
    const seatAvailabilityCondition = selectedSeats.reduce((acc, seat) => {
      acc[`occupiedSeats.${seat}`] = { $exists: false };
      return acc;
    }, {});

    // Atomic update (THIS prevents double booking)
    const updatedShow = await Show.findOneAndUpdate(
      {
        _id: showId,
        ...seatAvailabilityCondition,
      },
      {
        $set: seatUpdateObject,
      },
      { new: true }
    ).populate("movie");

    // If null → seats already taken
    if (!updatedShow) {
      return res.json({
        success: false,
        message: "Selected seats are not available",
      });
    }

    // Create booking
    await Booking.create({
      user: userId,
      show: showId,
      amount: updatedShow.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
    });

    return res.json({
      success: true,
      message: "Booking successful",
    });
  } catch (error) {
    console.error(error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};

//Get Occupied Seats
 
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;

    if (!showId) {
      return res.json({
        success: false,
        message: "ShowId is required",
      });
    }

    const showData = await Show.findById(showId);

    if (!showData) {
      return res.json({
        success: false,
        message: "Show not found",
      });
    }

    const occupiedSeats = Object.keys(showData.occupiedSeats || {});

    return res.json({
      success: true,
      occupiedSeats,
    });
  } catch (error) {
    console.error(error.message);
    return res.json({
      success: false,
      message: error.message,
    });
  }
};