test = document.querySelectorAll('.list-group-item');

var isReservationLoaded = false;

var originalSelectedDay;
var originalSelectedBarber;

const reservationChoiches = {
    locations_location_id: null,
    barbers_barber_id: null,
    service_chosen: null,
    addon_chosen: null,
    date: null,
    time: null,
    datetime: null
}

//loadReservation();

//get_barbers(1)

async function get(endpoint){
    
    let response = await fetch(endpoint, {
        headers: {
           'Accept': 'application/json'
        }
     })
    
    return await response.json()
}

async function delete_reservation(reservation_id){
    let result = await postData('/AnnuleReservation', {id: reservation_id})
    location.reload();
    console.log(result)
    return result;
}

async function get_barbers(locationid){
    let barbers = await get(`/barbers?locationID=${locationid}`)
    console.log(barbers)
    return barbers;
}

async function get_locations(){
    return await get("/locations")
}

async function get_services(){
    return await get("/services")
}

async function get_addons(){
    return await get("/addons")
}

async function get_dates(id_barber){
    return await get(`/barber/${id_barber}/schedule/days`)
}

async function get_hours(id_barber, day){
    return await get(`/barber/${id_barber}/schedule/${day}/time-slots`) 
}


async function clearReservation(){
    isReservationLoaded = false;
    originalSelectedDay = undefined;
    originalSelectedBarber = undefined;

    reservationChoiches.booking_id = null
    reservationChoiches.locations_location_id = null
    reservationChoiches.barbers_barber_id = null
    reservationChoiches.service_chosen = null
    reservationChoiches.addon_chosen = null
    reservationChoiches.date = null
    reservationChoiches.time = null
    reservationChoiches.datetime = null

}

async function loadReservation(id_reservation){
    isReservationLoaded = true

    let resp = await get(`/reservations/${id_reservation}`)
    
    originalSelectedDay = resp.datetime.split(" ")[0]
    originalSelectedBarber = resp.barbers_barber_id

    reservationChoiches.booking_id = id_reservation
    reservationChoiches.locations_location_id = resp.locations_location_id
    reservationChoiches.barbers_barber_id = resp.barbers_barber_id
    reservationChoiches.service_chosen = resp.service_chosen
    reservationChoiches.addon_chosen = resp.addon_chosen
    reservationChoiches.date = resp.datetime.split(" ")[0]
    reservationChoiches.time = resp.datetime.split(" ").slice(1,3).join(" ")
    reservationChoiches.datetime = resp.datetime

}

async function addLocations(){
    let locations = await get_locations()

    let tempElem = '';
    
    locations.forEach(location => {
        let isactive = "";

        if(location.location_id == reservationChoiches.locations_location_id){
            isactive = "active"
        }

        tempElem += 
        `
        <a href="#"
            class="list-group-item list-group-item-action justify-content-between ${isactive}"
            data-id="location ${location.location_id}"
            onclick="addBarbers(${location.location_id})">
            <p class="mt-3 text-center"> 
                ${location.information} 
            </p>
        </a>
        `
    })
    
    document.querySelector("#locations_choice").innerHTML = tempElem;
    addListeners();

}

async function addBarbers(locations_id){

    document.querySelectorAll("[data-id^='location ']").forEach(elem => {elem.classList.remove("active")})
    document.querySelector(`[data-id='location ${locations_id}']`).classList.add("active")

    reservationChoiches.locations_location_id = locations_id
    let barbers = await get_barbers(locations_id)

    let tempElem = '';

    barbers.forEach(barber => {
        let isactive = "";

        if(barber.barber_id == reservationChoiches.barbers_barber_id){
            isactive = "active"
        }

        tempElem += 
            `
            <a href="#"
                class="list-group-item list-group-item-action d-flex justify-content-between ${isactive}"
                data-id="barber ${barber.barber_id}"
                onclick="addServices(${barber.barber_id})">
                <img src=${barber.image_url} class="rounded-circle mt-0" style="width: 50px; height: 50px;">
                <p class="mt-3">
                    ${barber.name}
                </p>
            </a>
            `
        }
    )
    document.querySelector("#barbers_choice").innerHTML = tempElem;
    addListeners();

}


async function addServices(barber_id){

    document.querySelectorAll("[data-id^='barber ']").forEach(elem => {elem.classList.remove("active")})
    document.querySelector(`[data-id='barber ${barber_id}']`).classList.add("active")

    reservationChoiches.barbers_barber_id = barber_id;
    let services = await get_services()

    let tempElem = '';

    services.forEach(service => {
        let isactive = "";

        if(service.id == reservationChoiches.service_chosen){
            isactive = "active"
        }

        tempElem += 
            `
            <a href="#"
            class="list-group-item list-group-item-action d-flex justify-content-between ${isactive}"
            data-id="service ${service.id}"
            onclick="addAddons(${service.id})">
                <img src=${service.img} class="rounded-circle mt-0"
                    style="width: 50px; height: 50px;">
                <p class="mt-3">${service.name}</p>
                <p class="mt-3">${service.price}</p>
            </a>
            `
        }
    )
    document.querySelector("#services_choice").innerHTML = tempElem;
    addListeners();

}

async function addAddons(service_id){

    document.querySelectorAll("[data-id^='service ']").forEach(elem => {elem.classList.remove("active")})
    document.querySelector(`[data-id='service ${service_id}']`).classList.add("active")

    reservationChoiches.service_chosen = service_id;
    let addons = await get_addons()
    console.log(addons)

    let tempElem = '';

    addons.forEach(addon => {
        let isactive = "";

        if(addon.id == reservationChoiches.addon_chosen){
            isactive = "active"
        }
        
        tempElem += 
            `
            <a href="#"
            class="list-group-item list-group-item-action d-flex justify-content-between ${isactive}"
            data-id="add-on ${addon.id}"
            onclick="addDates(${addon.id})">
                <img src=${addon.img} class="rounded-circle mt-0"
                    style="width: 50px; height: 50px;">
                <p class="mt-3">${addon.name}</p>
                <p class="mt-3">${addon.price}</p>
            </a>
            `
            
        }
    )
    document.querySelector("#addons_choice").innerHTML = tempElem;
    addListeners();

}

async function addDates(addon_id){

    document.querySelectorAll("[data-id^='add-on ']").forEach(elem => {elem.classList.remove("active")})
    document.querySelector(`[data-id='add-on ${addon_id}']`).classList.add("active")

    reservationChoiches.addon_chosen = addon_id;
    let dates = await get_dates(reservationChoiches.barbers_barber_id)

    console.log(dates);
    
    let tempElem = '';

    dates.forEach(date => {
        let isactive = "";

        if(reservationChoiches.date){
            if(date == reservationChoiches.date && originalSelectedBarber == reservationChoiches.barbers_barber_id){
                isactive = "active"
            }
        }

        tempElem += 
            `
            <a href="#"
            class="list-group-item list-group-item-action d-flex justify-content-center ${isactive}"
            data-id="Date ${date}"
            onclick="addHours('${date}')">
                <p class="mt-3">${date}</p>
            </a>
            `
            
        }
    )
    document.querySelector("#dates_choice").innerHTML = tempElem;
    addListeners();

}


async function addHours(day){

    document.querySelectorAll("[data-id^='Date ']").forEach(elem => {elem.classList.remove("active")})
    document.querySelector(`[data-id='Date ${day}']`).classList.add("active")

    let hours = await get_hours(reservationChoiches.barbers_barber_id, day)

    if (reservationChoiches.time && originalSelectedDay == day && originalSelectedBarber == reservationChoiches.barbers_barber_id){
        hours.push(reservationChoiches.time)
    }

    reservationChoiches.date = day
    
    hours = hours.sort((a, b) => (a - b));

    let tempElem = '';

    hours.forEach(hour => {
        let isactive = "";
        
        if(hour == reservationChoiches.time && originalSelectedDay == day && originalSelectedBarber == reservationChoiches.barbers_barber_id){
            isactive = "active"
        }

        let hourDisplay;

        if(hour >= 12){
            hourDisplay = hour + " PM";
        }
        else{
            hourDisplay = hour + " AM";
        }

        tempElem += 
            `
            <a href="#"
            class="list-group-item list-group-item-action d-flex justify-content-center ${isactive}"
            data-id="${hour.id}"
            onclick="addThis('${hour}')">
                <p class="mt-3">${hourDisplay}</p>
            </a>
            `
            
        }
    )
    document.querySelector("#hours_choice").innerHTML = tempElem;
    addListeners();

}

async function postData(url = "", data = {}) {
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

async function addThis(hour) {
    let to = await get('/email')
    console.log(to)
    console.log("test2 : " + to['email'])
    reservationChoiches.heure = hour;

    if(isReservationLoaded){
        //reservation.id = reservationChoiches.id;
        let response = await postData('/modifierReservation', reservationChoiches)
        
        console.log(response)
        return response
    }
    else{
        Email.send({
            SecureToken: "44a76298-45c9-4e0c-b642-6a79f8bf384f",
            To: to['email'],
            From: "abdxrra@gmail.com",
            Subject: "Confirmation de la réservation",
            Body: `
              <h1>Merci d'avoir réservé avec FreshCut!</h1>
              <p>Bonjour ${to['username']},</p>
              <p>Nous confirmons votre réservation pour : </p>
              <p><b><h2>${reservationChoiches.date} - ${reservationChoiches.heure}H</h2></b></p>
              <p>Si vous avez des questions ou besoin d'apporter des modifications à votre réservation, veuillez contacter le salon directement.</p>
              <p>Merci de votre confiance, et à bientôt chez FreshCut!</p>
              <p>Cordialement,</p>
              <p>L'équipe de FreshCut</p>
            `,
          }).then(
            message => alert(message)
          );
          
        console.log("clicked")
        let response = await postData('/reservation', reservationChoiches)
        
        console.log(response)
        return response
    }

}
document.querySelectorAll('#locations_choice a').forEach(el => el.addEventListener('click', 
    function(){
        console.log(el)
    }
));