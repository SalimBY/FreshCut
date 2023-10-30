import { connectToMongo, getCollection } from "./connection.js";

export async function addReservation(reservation, email) {

  const bookingsBD = await getCollection("bookings");

  try {
    const result = await bookingsBD.insertOne(reservation);
    console.log(`Reservation added with ID ${result.insertedId}`);
    return result.insertedId;
  } catch (error) {
    console.error(error);
    return null;
  }

}

export async function getReservationsInfo(reservation_id) {

  let bookingsBD = await getCollection("bookings")

  return await bookingsBD.findOne({ booking_id: parseInt(reservation_id) })
}

export async function getReservations(client_id) {

  let bookingsBD = await getCollection("bookings")

  console.log({ customers_client_id: client_id });

  return await bookingsBD.find({ customers_client_id: parseInt(client_id) }).toArray();

}

export async function getBookingsFromDate(dateTime) {

  let bookingsBD = await getCollection("bookings")

  return await bookingsBD.findOne({ datetime: dateTime })
}

export async function getLocations() {

  let locationsBD = await getCollection("locations")

  return await locationsBD.find({}).toArray()
}

export async function getBarbers(location_id) {

  let barbersDB = await getCollection("barbers")

  let barbersAll = await barbersDB.find({ locations_location_id: parseInt(location_id)}).toArray()

  const result = barbersAll.filter(item => item.barber_id !== 0);

  return await result
}

export async function getService() {

  let serviceBD = await getCollection("services")

  return await serviceBD.find({}).toArray()
}

export async function getAddOn() {

  let addon = await getCollection("addons")

  return await addon.find({}).toArray()
}


export async function getBarberFromId(barberId) {

  let barbersDB = await getCollection("barbers")

  return await barbersDB.findOne({ barber_id: parseInt(barberId) })
}

export async function getHeures() {

  let barbersDB = await getCollection("barbers")

  return await barbersDB.findOne({ barber_id: parseInt(barberId) })
}

export async function getNextDate(dayOfWeek, hourString) {
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hours = parseInt(hourString.split(' ')[0]);
  const isPM = hourString.indexOf('PM') !== -1;

  let today = new Date();
  let todayWeekday = today.getDay();
  let targetWeekday = weekdays.indexOf(dayOfWeek);
  if (todayWeekday === targetWeekday && today.getHours() >= hours) {
    targetWeekday = (targetWeekday + 7) % 7;
  } else {
    while (todayWeekday !== targetWeekday) {
      today = new Date(today.getTime() + 24 * 60 * 60 * 1000);
      todayWeekday = today.getDay();
    }
  }
  const targetDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours + (isPM && hours !== 12 ? 12 : 0));
  return targetDate;
}

export async function findAvailableDays(barberId, days) {
  const daysValid = [];
  const barber = await getBarberFromId(barberId);
  for (let day of days) {

    const selectedDay = barber.schedule.find(scheduleDay => scheduleDay.day === day);

    console.log(selectedDay.timeSlots);

    const result = await isDayAvailable(barberId, selectedDay);

    if (result) {
      console.log(result, selectedDay.day);
      daysValid.push(selectedDay.day);
    }
  }

  return daysValid;
}

export async function isDayAvailable(barberId, selectedDay) {
  for (let i = 0; i < selectedDay.timeSlots.length; i++) {
    const timeSlot = selectedDay.timeSlots[i];
    const isAvailable = await checkIfTimeSlotTaken(barberId, selectedDay.day, timeSlot);
    if (isAvailable) {
      return true;
    }
  }
  return false;
}

export async function checkIfTimeSlotTaken(barberId, day, timeSlot) {

  let bookingBD = await getCollection("bookings")

  let found = await bookingBD.findOne({ barbers_barber_id: parseInt(barberId), datetime: `${day} ${timeSlot}` });

  if (!found) {
    return timeSlot;
  }

  return null;
}