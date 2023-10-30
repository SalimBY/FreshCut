let selectedHour = null
let hours;
var selectedDay;


async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data),
  }).catch(error => {
    console.error('There was a network error:', error);
  });

  if (response && response.ok) {
    console.log(response)
    const jsonResponse = await response.json();
    console.log(jsonResponse); // log the response from the server
    return jsonResponse;
  } else {
    const textResponse = await response.text();
    console.log(textResponse); // log the response from the server
    return textResponse;
  }
}

async function supprimerHeure() {
    if (!selectedHour || !jour) {
        console.log("Invalid selectedHour or jour");
        return;
    }
    console.log("entered")
    let result = await postData("/deleteHour", {hour: selectedHour, day: jour});
    console.log(result);
    location.reload();
    return result
}

async function ajouterHeure(data, location, day){
  selectedDay = day
  location = JSON.parse(location)
  hours = parseInt(location.close_hour - location.open_hour)
  data = data.split(",")
  checkBox = "";

  for (let i = 0; i <= hours; i++) {
    const item = i + parseInt(location.open_hour);
    let isChecked = data.includes(`${i + parseInt(location.open_hour)}`) ? "checked disabled" : ""

    checkBox += 
      `
        <div class="form-check form-check-inline">
          <input class="form-check-input" type="checkbox" value="${item}" id="flexCheckDefault" ${isChecked}>
          <label class="form-check-label" for="flexCheckDefault">${item}</label>
        </div>
      `
  }
  document.querySelectorAll("#addHours .modal-body div")[0].innerHTML = checkBox
}

async function AddHours(){

  var hoursArray = [];

  document.querySelectorAll('.form-check-input').forEach(item => {
    if(item.checked){
      hoursArray.push(parseInt(item.value));
    }
  })

  let result = await postData("/addHour", {day: selectedDay, hours: hoursArray});

  location.reload();
  console.log(result);
}

function handleClick(event, lundi, day) {
    hours = lundi
    jour = day
    lundi = lundi.split(',')
    const clickedLink = event.target
    const timeSlot = clickedLink.textContent.slice(0, -1)
    scheduleInfo = lundi.find(slot => slot === timeSlot)
    selectedHour = scheduleInfo
    console.log(timeSlot)
}