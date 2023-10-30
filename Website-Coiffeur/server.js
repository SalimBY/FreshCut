// const express = require('express')
// const bodyParser = require('body-parser')
//const app = express()
// const mysql = require('mysql')
// const bcrypt = require('bcrypt')


// fix dirname pour un module
//https://stackoverflow.com/questions/64383909/dirname-is-not-defined-error-in-node-14-version
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


// default libraries
import express from 'express';
import bodyParser from 'body-parser';
import bcrypt, { hash } from 'bcrypt';
import session from 'express-session';
import nodemailer from 'nodemailer';
import mailjetTransport from 'nodemailer-mailjet-transport';
import Mailjet from 'node-mailjet';
const app = express()


// custom modules
import {connectToMongo, getCollection} from "./modules/connection.js";
import * as reservations from "./modules/reservations.js";
import { Console, time } from 'console';

// Method to get all bookings for a given barber ID
async function getAllBarberBookings(barberId, db) {
    const bookings = await db.collection("bookings").find({ barbers_barber_id: barberId }).toArray();
    return bookings;
  }
  
  // Method to get customer information for a given customer ID
  async function getCustomerInfo(customerId, db) {
    const customer = await db.collection("customers").findOne({ client_id: customerId });
    return customer;
  }
    // Method to get barber information for a given barber ID
    async function getBarberInfo(barberId, db) {
        const barber = await db.collection("barbers").findOne({ barber_id: barberId });
        return barber;
      }
  // Method to get service information for a given service ID
  async function getServiceInfo(serviceId, db) {
    const service = await db.collection("services").findOne({ id: serviceId });
    return service;
  }
  
  // Method to get addon information for a given addon ID
  async function getAddonInfo(addonId, db) {
    const addon = await db.collection("addons").findOne({ id: addonId });
    return addon;
  }
  
  // Method to get location information for a given location ID
  async function getLocationInfo(locationId, db) {
    const location = await db.collection("locations").findOne({ location_id: locationId });
    return location;
  }

// init express app
app.set('view engine', 'ejs')

app.use(session({
    secret: 'thefartheadsmasterplan',
    resave: false,
    saveUninitialized: false
}));

// fonctions utilisés dans ejs
const isEmployeeLoggedIn = (customer) => {
    try{
        return customer.hasOwnProperty('barber_id');
    }
    catch {
        return false;
    }
}


const isSuperAdminLoggedIn = (customer) => {
    try{
        if (isEmployeeLoggedIn(customer)){
            return customer.barber_id === 0;
        }
    }
    catch {
        return false;
    }
}

const isCustomerLoggedIn = (customer) => {
    try{
        return customer.hasOwnProperty('client_id');
    }
    catch {
        return false;
    }
}

app.locals.isSuperAdminLoggedIn = isSuperAdminLoggedIn;
app.locals.isEmployeeLoggedIn = isEmployeeLoggedIn;
app.locals.isCustomerLoggedIn = isCustomerLoggedIn;

// fin fonctions utilisés dans le ejs

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/checkEmail/:email', async (req, res) => {
    const connection = await connectToMongo();
    const BD = connection.db("bookingdb")

    let customersBD = BD.collection("customers")
    
    customersBD = await getCollection("customers");

    const email = req.params.email

    let emailAlreadyExist = await customersBD.findOne({ email: email })
    console.log(email)

    res.end(JSON.stringify({"used": Boolean(emailAlreadyExist)}))

})
app.post('/addBarber', async (req, res) => {
    const name = req.body.name
    const password = await bcrypt.hash(req.body.password, 10)
    const location_id = parseInt(req.body.location_id)

    const connection = await connectToMongo();
    const BD = connection.db("bookingdb")

    let barbersBD = BD.collection("barbers")

    // check the name, password and location_id
    const nameRegex = /[a-zA-Z ]{3,32}$/;
    const passwordRegex = /[a-zA-Z]{6,32}$/;

    if (!nameRegex.test(name)) {
        res.end("Entrez un nom valide.");
    }
    
    if (!passwordRegex.test(req.body.password)) {
        res.end("Entrez un mot de passe valide.");
    }

    let maxBarberIDQuery = await barbersBD.find({}, { sort: { barber_id: -1 }, limit: 1 }, "barber_id").toArray()

    const nextBarberID = parseInt(maxBarberIDQuery[0].barber_id) + 1;

    let queryReq = {
        name: name,
        password: password,
        barber_id: nextBarberID,
        locations_location_id: location_id,
        schedule: []
    }

    barbersBD.insertOne(queryReq)
        .then((docs) => {
            console.log("inserted document !")
            console.log(docs);
            res.redirect('/gererEmployes')
        }).catch((err) => {
            throw err
        })
});


app.post('/inscription', async (req, res) => {
    const email = req.body.email
    const username = req.body.username
    const phone = req.body.phone
    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const connection = await connectToMongo();
    const BD = connection.db("bookingdb")

    let customersBD = BD.collection("customers")

    //check if email already exists in db
    let emailAlreadyExist = await customersBD.findOne({ email: email })

    // check les emails, usernames, phone, hashedpassword
    const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    const usernameRegex = /[a-zA-Z]{6,32}$/;
    const telRegex = /[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
    const passwordRegex = /[a-zA-Z]{6,32}$/;

    if (!emailRegex.test(email)) {
        res.end("Entrez un email valide.");
    }

    if (!usernameRegex.test(username)) {
        res.end("Entrez un username valide.");
    }

    if (!telRegex.test(phone)) {
        res.end("Entrez un telephone valide.");
    }
    
    if (!passwordRegex.test(req.body.password)) {
        res.end("Entrez un password valide.");
    }

    if (emailAlreadyExist){
        res.end("L'email existe déjà.")
    } else {

        let maxClientIDQuery = await customersBD.find({}, { sort: { client_id: -1 }, limit: 1 }, "client_id").toArray()

        const nextClientID = parseInt(maxClientIDQuery[0].client_id) + 1;
    
        let queryReq = {
            username: username,
            email: email,
            phonenumber: phone,
            password: hashedPassword,
            client_id: nextClientID,
            create_time: new Date()
        }
    
        customersBD.insertOne(queryReq)
            .then((docs) => {
                console.log("inserted document !")
                console.log(docs);
                res.redirect('/connexion')
    
            }).catch((err) => {
                throw err
            }
        )
    }

});

app.post('/connexion', async (req, res) => {
    const connection = await connectToMongo();
    const BD = connection.db("bookingdb")
    const customersDB = BD.collection("customers")
    const emailRequest = req.body.email;
    const password = req.body.password;
    //const errorMessage = "<p style='color: red;'>Invalid email or password.</p>";
    var result = false;
    //the point was to make the alert appear in the client but this temporary solution makes a new page saying invalid password or username
    // retrieve the customer with the given email
    const input = await customersDB.findOne({ email: emailRequest })
    if (!input) {
        res.end(JSON.stringify({result}));
        return
    } else {
        const hashedPassword = input.password
        console.log('Input : ' + password + ' hashedpassword : ' + hashedPassword)
        const passwordMatch = await bcrypt.compare(password, hashedPassword);

        if (passwordMatch) {
            req.session.customer = input;
            res.end(JSON.stringify({"result": true}));
            //res.redirect('reservation');

        } else {
            // Password is incorrect
            res.end(JSON.stringify({result}));
        }
    }
})

app.post('/connexionAdmin', async (req, res) => {
    const connection = await connectToMongo();
    const bd = connection.db("bookingdb")
    const barbersCollection = bd.collection("barbers")
    const idBarber = parseInt(req.body.barber_id)
    const passwordBarber = req.body.password
    const errorMessage = "<p style='color: red;'>Invalid email or password.</p>";
    const input = await barbersCollection.findOne({ barber_id: idBarber })
    if (!input) {
        res.end(errorMessage);
    } else {
        const hashedPassword = input.password
        console.log(passwordBarber)
        console.log(hashedPassword)
        const passwordMatch =  await bcrypt.compare(passwordBarber, hashedPassword)
        console.log(passwordMatch)
        if (passwordMatch) {
            req.session.customer = input
            res.redirect('indexAdmin')
        } else {
            // Password is incorrect
            res.end(errorMessage);
        }
    }
})

app.get('/indexAdmin', async (req, res) => {
    const admin = req.session.customer;
    if (!isEmployeeLoggedIn(admin)) {
      res.redirect('/connexionAdmin');
    } else {
        const adminName = admin.name;
      if(isSuperAdminLoggedIn(admin)) {
        res.render('./employee/indexSuperAdmin', {
        data: { isClientLoggedIn: true },
        adminName: adminName,
        isSuperAdmin: true
      });
      } else{
        res.render('./employee/indexAdmin', {
          data: { isClientLoggedIn: true },
          adminName: adminName
        });
      }  
    }
  });
  

app.get('/', (req, res) => {
    if (!req.session.customer) {
        res.render("./customer/index", { data: { isClientLoggedIn: false} });
    }
    else {
        res.render("./customer/index", { data: { isClientLoggedIn: true, customer: req.session.customer} });
    }
})

app.get('/profil', (req, res) => {
    if(isEmployeeLoggedIn(req.session.customer) || !isCustomerLoggedIn(req.session.customer)){
        res.redirect("/connexion")
        return
    }

    if (!req.session.customer) {
        res.render("./customer/profil", { data: { isClientLoggedIn: false} });
    }
    else {
        res.render("./customer/profil", { data: { isClientLoggedIn: true, customer: req.session.customer} });
    }
})

// Main route method to handle rendering of reservations for an admin
app.get('/reservationsAdmin', async (req, res) => {
    const admin = req.session.customer;
    if (!admin) {
      res.redirect('/connexionAdmin');
    } else if (admin.barber_id == null) {
      res.redirect('/connexionAdmin');
    } else {
      const adminName = admin.name;
      const connection = await connectToMongo();
      const db = connection.db("bookingdb");
  
      const allBookings = [];
  
      if(isSuperAdminLoggedIn(admin)) {
        const allBarberBookings = await getAllBarberBookingsForAllBarbers(db);
          for(let i = 0; i < allBarberBookings.length; i++) {
          const barber = await getBarberInfo(allBarberBookings[i].barbers_barber_id, db);
          const customer = await getCustomerInfo(allBarberBookings[i].customers_client_id, db);
          const service = await getServiceInfo(allBarberBookings[i].service_chosen, db);
          const addon = await getAddonInfo(allBarberBookings[i].addon_chosen, db);
          const location = await getLocationInfo(allBarberBookings[i].locations_location_id, db);
          const price = parseFloat(service.price) + parseFloat(addon.price) + "$";
  
          const booking = {
            client: customer.username,
            service: service.name,
            addon: addon.name,
            location: location.address,
            date: displayHours(allBarberBookings[i].datetime),
            prix: price,
            barber: barber.name,
            id: allBarberBookings[i].booking_id
          };
  
          allBookings.push(booking);
        }
      } 
      else {
      const barberBookings = await getAllBarberBookings(admin.barber_id, db);
  
      for (let i = 0; i < barberBookings.length; i++) {
        const customer = await getCustomerInfo(barberBookings[i].customers_client_id, db);
        const service = await getServiceInfo(barberBookings[i].service_chosen, db);
        const addon = await getAddonInfo(barberBookings[i].addon_chosen, db);
        const location = await getLocationInfo(barberBookings[i].locations_location_id, db);
        const price = parseFloat(service.price) + parseFloat(addon.price) + "$";
  
        const booking = {
          client: customer.username,
          service: service.name,
          addon: addon.name,
          location: location.address,
          date: displayHours(barberBookings[i].datetime),
          prix: price,
          barber: adminName,
          id: barberBookings[i].booking_id
        };
        allBookings.push(booking);
      }
      }
  
      res.render('employee/reservationsAdmin.ejs', { adminName: admin.name, bookings: allBookings });
    }
});
app.get('/gererEmployes', async (req, res) => {
    const admin = req.session.customer;
    if (!admin) {
      res.redirect('/connexionAdmin');
    } else if (admin.barber_id == null) {
      res.redirect('/connexionAdmin');
    } else if (!isSuperAdminLoggedIn(admin)){
      res.redirect('/indexAdmin');
    } else {
      const adminName = admin.name;
      const connection = await connectToMongo();
      const db = connection.db("bookingdb");
      
      const barbercollection = await db.collection('barbers').find({}).toArray();
      const allBarbers = [];
          for(let i = 0; i < barbercollection.length; i++) {
        const location = await db.collection('locations').findOne({location_id : barbercollection[i].locations_location_id});
        
        const barber = {
            name: barbercollection[i].name,
            id: barbercollection[i].barber_id,
            location: location.address
        };
  
          allBarbers.push(barber);
      } 
      let locations = await db.collection('locations').find().toArray();
      
      res.render('employee/gererEmployes.ejs', { adminName: admin.name, barbers: allBarbers, data: {
        locations: locations
    }, });
    }
});
async function getAllBarberBookingsForAllBarbers(db) {
    const allBarbers = await db.collection('barbers').find({}).toArray();
  
    const allBookings = [];
  
    for(let i = 0; i < allBarbers.length; i++) {
      const barberBookings = await getAllBarberBookings(allBarbers[i].barber_id, db);
  
      for(let j = 0; j < barberBookings.length; j++) {
        allBookings.push({...barberBookings[j], barbers_barber_id: allBarbers[i].barber_id});
      }
    }
  
    return allBookings;
}

function displayHours(hour) {
    let hourDisplay;
    if (hour >= 12) {
      hourDisplay = hour + " PM";
    } else {
      hourDisplay = hour + " AM";
    }
    return hourDisplay;
};

app.get('/horaireAdmin', async (req,res) => {
    const admin = req.session.customer;
    if (!admin) {
      res.redirect('/connexionAdmin');
    } else if (admin.barber_id == null) {
      res.redirect('/connexionAdmin');
    } else {
        const admin = req.session.customer
        const connection = await connectToMongo();
        const bd = connection.db("bookingdb")
        const barbersCollection = bd.collection("barbers")
        let location = await getCollection("locations").then(resp => resp.findOne({location_id: admin.locations_location_id}))
        location = JSON.stringify(location)
        console.log(location)
        if (!admin) {
            res.redirect('connexionAdmin')
        } else {
            if (admin.barber_id == null) {
                res.redirect('/connexionAdmin');
            } 
            const schedule = admin.schedule
            const adminName = admin.name
            res.render('./employee/horaireAdmin', {
                data: {isClientLoggedIn: true},
                adminName: adminName,
                schedule: schedule,
                locationSchedule: location
            })
        }
    }
})

app.post('/deleteHour', async (req, res) => {
    const connection = await connectToMongo();
    let BD = connection.db("bookingdb");
    const barbersCollection = BD.collection("barbers");
  
    const barberId = req.session.customer.barber_id;
    const day = req.body.day;
    const hour = parseInt(req.body.hour);

    let barber = await barbersCollection.findOne({barber_id: barberId})
    
    console.log(barber.schedule[0].timeSlots);

    barber.schedule.forEach(item => {
        if(item.day == day){
            item.timeSlots.forEach(hourTimeslots => {
                if(hourTimeslots == hour){
                    let index = item.timeSlots.indexOf(hour)
                    item.timeSlots.splice(index, 1);
                }
            })
            if(item.timeSlots.length == 0){
                const index = barber.schedule.indexOf(item);
                barber.schedule.splice(index, 1)
            }
        }
    });

    //console.log(barber.schedule[0].timeSlots);

    let result = await barbersCollection.replaceOne({barber_id: barberId}, barber)
    req.session.customer = barber;
    res.json(JSON.stringify(result))
    return;
});

app.post('/addHour', async (req, res) => {
    const connection = await connectToMongo();
    const BD = connection.db("bookingdb");
    const barbersCollection = BD.collection("barbers");
    
    const barberId = req.session.customer.barber_id;
    const day = req.body.day;
    const hours = req.body.hours;

    let barber = await barbersCollection.findOne({barber_id: barberId})
    
    let found = false;

    barber.schedule.forEach(item => {
        if(item.day == day){
            item.timeSlots = hours
            found = true
        }
    });

    if(!found){
        barber.schedule.push({"day": day, "timeSlots": hours})
    }

    let result = await barbersCollection.replaceOne({barber_id: barberId}, barber)
    req.session.customer = barber;
    console.log(result);
    res.json(JSON.stringify(result))
    return;
});


app.post('/horaireAdmin', async (req,res) => {
    const connection = await connectToMongo()
    const BD = connection.db("bookingdb")
    const barbersCollection = bd.collection("barbers")
    barbersCollection.deleteOne()
})

app.get('/logout', (req, res) => {
    req.session.customer = "";
    res.redirect('/');
})

app.get('/barbers', async (req, res) => {
    const locationID = req.query.locationID;
    let barbers = await reservations.getBarbers(locationID);

    res.end(JSON.stringify(barbers));
});

app.get('/services', async (req, res) => {
    let services = await reservations.getService();
    res.end(JSON.stringify(services));
})

app.get('/addons', async (req, res) => {
    let addon = await reservations.getAddOn();
    res.end(JSON.stringify(addon));
})

app.get("/locations", async(req, res) => {
    
    let locations = await reservations.getLocations();

    res.end(JSON.stringify(locations));
})

app.get('/reservations/:id', async (req, res) => {

    let reservation = await reservations.getReservationsInfo(req.params.id)

    res.end(JSON.stringify(reservation));
})


app.get('/reservation', async (req, res) => {

    console.log(isEmployeeLoggedIn(req))

    if (isEmployeeLoggedIn(req.session.customer)) {
        res.redirect("/")
        return
    }

    let dataRender = {
        isClientLoggedIn: false,
        reservations: []
    }

    if (req.session.customer) {
        dataRender.isClientLoggedIn = true;
        
        let client_id = req.session.customer.client_id;

        dataRender.reservations = await reservations.getReservations(client_id)
        dataRender.reservations.forEach(reservation => {
            console.log(parseInt(reservation.datetime.split(' ')[1]))
            let reservationTime;

            if(parseInt(reservation.datetime.split(' ')[1]) >= 12){
                reservationTime = " PM";
            }
            else{
                reservationTime = " AM";
            }

            reservation.datetime += reservationTime
        })

    }

    

    dataRender.locations = await reservations.getLocations()
    dataRender.customer = req.session.customer

    res.render("./customer/reservation", {data: dataRender})
});

app.post('/modifierReservation', async (req, res) => {
    const connection = await connectToMongo();
    const BD = connection.db("bookingdb")

    let bookingsBD = BD.collection("bookings")

    let booking = {
        locations_location_id: req.body.locations_location_id,
        barbers_barber_id: req.body.barbers_barber_id,
        service_chosen: req.body.service_chosen,
        addon_chosen: req.body.addon_chosen,
        datetime: req.body.date + " " + req.body.heure,
        booking_id: parseInt(req.body.booking_id),
        customers_client_id: req.session.customer.client_id
    }

    let result = await bookingsBD.replaceOne({ booking_id: booking.booking_id }, booking)
    
    console.log(result);

    console.log(`Modified booking ${booking.id}`);

    res.end(JSON.stringify(result));
})
app.post('/DeleteBarber', async (req, res) => {
    const connection = await connectToMongo();
    const BD = connection.db("bookingdb")
    let barbersBD = BD.collection("barbers")

    let barber = await barbersBD.find({barber_id :req.body.id})
    console.log(req.body);
    if (isSuperAdminLoggedIn(req.session.customer)) {
        if (req.body.id == "0"){
            console.log('You cannot delete the superadmin account !');
            res.send({"success": false})
            return;
        }else {
            let result = await barbersBD.deleteOne({barber_id: parseInt(req.body.id)})
            console.log(result);

            console.log(`Deleted barber ${req.body.id}`);
            res.send({"success": true})
        }
        return
    }
});
app.post('/AnnuleReservation', async (req, res) => {
    const connection = await connectToMongo();
    const BD = connection.db("bookingdb")
    let bookingsBD = BD.collection("bookings")

    let booking = await reservations.getReservationsInfo(req.body.id);
    console.log(req.body);
    if (isEmployeeLoggedIn(req.session.customer)) {

        let result = await bookingsBD.deleteOne({ booking_id: parseInt(req.body.id)})
        
        console.log(result);

        console.log(`Deleted booking ${req.body.id}`);
        res.send({"success": true})
        return
    }
    if(booking != undefined){
        if (booking.customers_client_id === req.session.customer.client_id){

            let result = await bookingsBD.deleteOne({ booking_id: parseInt(req.body.id)})
            
            console.log(result);
    
            console.log(`Deleted booking ${req.body.id}`);
            res.send({"success": true})
            return
        }
        res.redirect("/reservation");
        return
    }

    console.log('Client is not the owner of the booking ${req.params.id} !');
    res.send({"success": false})
    res.redirect("/reservation");
});

app.get('/profilEmp', async (req, res) => {
    const admin = req.session.customer;
    if (!admin) {
        res.redirect('/connexionAdmin');
    } else if (admin.barber_id == null) {
        res.redirect('/connexionAdmin');
    } else if (admin.barber_id == 0){
        res.redirect('/indexAdmin');
    } else {

        const connection = await connectToMongo();
        const BD = connection.db("bookingdb")
        let locationsBD = BD.collection("locations")
        
        let location = await locationsBD.findOne({location_id: req.session.customer.locations_location_id})
        let locations = await locationsBD.find().toArray();
        console.log(location)

        res.render("./employee/profil", {

            data: {
                isClientLoggedIn: true,
                customer: req.session.customer,
                location: location,
                locations: locations
            },
            adminName : admin.name 
        });
    }
})

app.post("/modifierProfilEmp", async(req, res) => {
    if(!isEmployeeLoggedIn(req.session.customer) || isCustomerLoggedIn(req.session.customer)){
        res.redirect("/connexion")
        return
    }

    const connection = await connectToMongo();
    const BD = connection.db("bookingdb")

    let barbersBD = BD.collection("barbers")

    var name1 = req.body.name
    var locationID = parseInt(req.body.location)
    var password = req.body.password

    let oldCustomer = await barbersBD.findOne({ barber_id : req.session.customer.barber_id})

    let customerChange = {}

    // check les name, password
    const nameRegex = /[a-zA-Z]{4,32}$/;
    const passwordRegex = /[a-zA-Z]{6,32}$/;

    if (!nameRegex.test(name1)) {
        res.end(JSON.stringify({"success": false, "message": "Svp entrez un nom valide."}))
        return;
    }

    let locationExist = await getLocationInfo(locationID, BD)

    if(!locationExist){
        res.end(JSON.stringify({"success": false, "message": "Svp entrez une location valide."}))
        return;   
    }
    
    if(password){
        if (!passwordRegex.test(password)) {
            res.end(JSON.stringify({"success": false, "message": "Svp entrez un password valide."}))
            return;
        }

        customerChange.password = await bcrypt.hash(password, 10)
    }
    else {
        customerChange.password = oldCustomer.password
    }

    customerChange.barber_id = oldCustomer.barber_id
    customerChange.name = name1 != oldCustomer.name ? name1 : oldCustomer.name
    customerChange.locations_location_id = locationID != oldCustomer.locations_location_id ? locationID : oldCustomer.locations_location_id
    customerChange.schedule = oldCustomer.schedule
    customerChange.image_url = oldCustomer.image_url

    barbersBD.replaceOne(oldCustomer, customerChange)
        .then((docs) => {
            console.log("document modifier !")
            req.session.customer = customerChange; // reload le customer logged in
            res.end(JSON.stringify({"success": true}))

        }).catch((err) => {
            throw err
        }
    )
});

app.post("/modifierProfil", async(req, res) => {
    if(isEmployeeLoggedIn(req.session.customer) || !isCustomerLoggedIn(req.session.customer)){
        res.redirect("/connexion")
        return
    }

    const connection = await connectToMongo();
    const BD = connection.db("bookingdb")

    let customersBD = BD.collection("customers")

    var email = req.body.email
    var username = req.body.username
    var phonenumber = req.body.phone
    var password = req.body.password

    let oldCustomer = await customersBD.findOne({ client_id : req.session.customer.client_id})

    let customerChange = {}

    // check les emails, usernames, phone, hashedpassword
    const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    const usernameRegex = /[a-zA-Z0-9]{6,32}$/;
    const telRegex = /[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
    const passwordRegex = /[a-zA-Z]{6,32}$/;

    if (!emailRegex.test(email)) {
        res.end(JSON.stringify({"success": false, "message": "Svp entrez un email valide"}))
        return;
    }

    if (!usernameRegex.test(username)) {
        res.end(JSON.stringify({"success": false, "message": "Svp entrez un username valide."}))
        return;
    }

    if (!telRegex.test(phonenumber)) {
        res.end(JSON.stringify({"success": false, "message": "Svp entrez un telephone valide."}))
        return;
    }
    
    if(password){
        if (!passwordRegex.test(password)) {
            res.end(JSON.stringify({"success": false, "message": "Svp entrez un password valide."}))
            return;
        }
        console.log(oldCustomer.password,"\n")
        console.log(password)
        customerChange.password = await bcrypt.hash(password, 10)
        console.log(customerChange.password)
    }
    else {
        customerChange.password = oldCustomer.password
    }

    customerChange.client_id = oldCustomer.client_id
    customerChange.create_time = oldCustomer.create_time
    customerChange.email = email != oldCustomer.email ? email : oldCustomer.email
    customerChange.username = username != oldCustomer.username ? username : oldCustomer.username
    customerChange.phonenumber = phonenumber != oldCustomer.phonenumber ? phonenumber : oldCustomer.phonenumber

    customersBD.replaceOne(oldCustomer, customerChange)
        .then((docs) => {
            console.log("document modifier !")
            req.session.customer = customerChange; // reload le customer logged in
            res.end(JSON.stringify({"success": true}))

        }).catch((err) => {
            throw err
        }
    )
});



app.post('/reservation', async (req, res) => {
    const connection = await connectToMongo();
    const BD = connection.db("bookingdb")

    let bookingsBD = BD.collection("bookings")

    let maxBookingID = await bookingsBD.find({}, { sort: { booking_id: -1 }, limit: 1 }, "booking_id").toArray()

    let booking = {
        locations_location_id: req.body.locations_location_id,
        barbers_barber_id: req.body.barbers_barber_id,
        service_chosen: req.body.service_chosen,
        addon_chosen: req.body.addon_chosen,
        datetime: req.body.date + " " + req.body.heure
    }

    if(maxBookingID[0] != undefined){
        booking.booking_id = maxBookingID[0].booking_id + 1;
    }
    else{
        booking.booking_id = 1;
    }

    booking.customers_client_id = req.session.customer.client_id;
    let result = await reservations.addReservation(booking);

    console.log(result);

    console.log('Inserted new booking into database');
    res.redirect('/confirmation');
});

app.get('/email', (req,res) => {
    res.end(JSON.stringify({'email': req.session.customer.email, 'username': req.session.customer.username}))
})

app.get('/connexionAdmin', (req, res) => {
    res.render("./employee/connexionAdmin", { data: { isClientLoggedIn: false } })
})

app.get('/connexion', (req, res) => {
    res.render("./customer/connexion", { data: { isClientLoggedIn: false } })
})

app.get('/inscription', (req, res) => {
    res.render("./customer/inscription", { data: { isClientLoggedIn: false } })
})
//When a client picks a barber_id, it returns all the days in the schedule.
app.get('/barber/:id/schedule/days', async (req, res) => {

    let barber = await reservations.getBarberFromId(req.params.id)
    console.log(req.params.id)

    if (!barber) {
        res.status(404).send('Barber not found');
        return;
    }

    const days = barber.schedule.map(day => day.day);
    
    reservations.findAvailableDays(req.params.id, days).then(daysValid => {
        res.send(daysValid);
    });
    
});
//When a client picks a day, it returns all the time slots in that specific day.
app.get('/barber/:id/schedule/:day/time-slots', async (req, res) => {
    const day = req.params.day;
    const barber = await reservations.getBarberFromId(req.params.id)
    
    if (!barber) {
        res.status(404).send('Barber not found');
        return;
    }

    const selectedDay = barber.schedule.find(scheduleDay => scheduleDay.day === day);
    if (!selectedDay) {
        res.status(404).send('Day not found');
        return;
    }

    var timeSlots = [];

    const promises = selectedDay.timeSlots.map(slot => {
        return reservations.checkIfTimeSlotTaken(req.params.id, selectedDay.day, slot).then(slot => {
            if (slot) {
                return slot.toString();
            } else {
                return null;
            }
        });
    });
    
    Promise.all(promises).then(results => {
        results.forEach(slot => {
            if (slot) {
                timeSlots.push(slot);
            }
            
        });
        res.send(timeSlots);

    });

});



app.listen(5000);


app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap-icons/font'));
app.use('/css', express.static(__dirname + '/node_modules/boxicons/css'));
app.use('/fonts', express.static(__dirname + '/node_modules/boxicons/fonts'));

app.use('/css', express.static(__dirname + '/node_modules/glightbox/dist/css'));
app.use('/css', express.static(__dirname + '/node_modules/remixicon/fonts'));
app.use('/css', express.static(__dirname + '/views/assets/css'));
app.use('/img', express.static(__dirname + '/views/assets/img'));


app.use('/js', express.static(__dirname + '/node_modules/aos/dist'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/glightbox/dist/js/'));
app.use('/js', express.static(__dirname + '/node_modules/isotope-layout/dist/'));
app.use('/js', express.static(__dirname + '/node_modules/swiper/'));
app.use('/js', express.static(__dirname + '/node_modules/waypoints/lib/'));
app.use('/js', express.static(__dirname + '/views/assets/js/'));

app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));

  
