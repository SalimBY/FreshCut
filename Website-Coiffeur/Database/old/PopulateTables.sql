INSERT INTO `bookingdb`.`barbers` (`barber_id`, `name`, `locations_location_id`) VALUES ('2', 'Jean-Francois Brodeur', '2');
INSERT INTO `bookingdb`.`services` (`service_id`, `name`, `price`) VALUES ('1', 'Cut', '20');
INSERT INTO `bookingdb`.`services` (`service_id`, `name`, `price`) VALUES ('2', 'Beard', '10');
INSERT INTO `bookingdb`.`services` (`service_id`, `name`, `price`) VALUES ('3', 'Fades', '10');
INSERT INTO `bookingdb`.`services` (`service_id`, `name`, `price`) VALUES ('4', 'Interlocks', '80');
INSERT INTO `bookingdb`.`services` (`service_id`, `name`, `price`) VALUES ('5', 'Twists', '50');
INSERT INTO `bookingdb`.`services` (`service_id`, `name`, `price`) VALUES ('6', 'Braids', '50');
INSERT INTO `bookingdb`.`locations` (`location_id`, `address`, `information`, `open_hour`, `close_hour`) VALUES ('1', 'Pont-Viau', 'Laval - 1234 Adresse', '9', '17');
INSERT INTO `bookingdb`.`customers` (`client_id`, `username`, `email`, `phonenumber`, `password`, `create_time`) VALUES ('1', 'S4l1m', 'salim@gmail.com', '514-123-4567', 'password12345', '2023/02/23');
INSERT INTO `bookingdb`.`barbers`  (`barber_id`, `name`, `locations_location_id`, `image_url`) VALUES ('1', 'Wololoy', '1', './img/team/team-3.jpg');
INSERT INTO `bookingdb`.`barbers` (`barber_id`, `name`, `locations_location_id`, `image_url`) VALUES ('2', 'Jean-Martin', '2', './img/team/team-4.jpg');
INSERT INTO `bookingdb`.`bookings` (`barbers_barber_id`, `booking_id`, `locations_location_id`, `datetime`, `customers_client_id`, `services_chosen`) VALUES ('1', '1', '1', '2024/12/12', '1', 'Hair');


