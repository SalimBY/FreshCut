// script pour la navigations
var form_next_btn = document.querySelector(".btn_next");
var form_back_btn = document.querySelector(".btn_back");
var form_done_btn = document.querySelector(".btn_done");
var btn_reservation = document.querySelector(".btn_reservation");

var form_progessbar = document.getElementsByClassName("progress-bar")[0];

var form_steps = document.getElementsByClassName("step");
var form_tacker = 0;

function current_form(){
  return form_steps[form_tacker];
}

function clamp(min, num, max){
  return num < min ? min : max < num ? max : num;
}

function update_tracker(num){
  form_tacker = clamp(0, num, form_steps.length - 1);
  form_progessbar.style.width = (form_tacker/(form_steps.length - 1)) * 100 + "%";
  
  console.log(form_tacker);
  
  switch(form_tacker){
    case 0:
      form_back_btn.style.display = "none";
      break;
    case form_steps.length - 1:
      form_next_btn.style.display = "none";
      form_back_btn.style.display = "none";
      //form_done_btn.style.display = "";
      break;
    default:
      form_done_btn.style.display = "none";
      form_next_btn.style.display = "none";

      if(form_tacker <= countSelectedOptions() - 1){
        form_next_btn.style.display = "";
      }

      form_back_btn.style.display = "";
      break;
  }

  return form_tacker;
}

form_next_btn.addEventListener("click", nextForm)

form_back_btn.addEventListener("click", backForm)

btn_reservation.addEventListener("click", nextForm)

form_done_btn.addEventListener("click", function(){
  // coder bouton done

})

function nextForm(){
  current_form().style.display = "none";
  update_tracker(form_tacker+1);
  current_form().style.display = "";
}

function backForm(){
  current_form().style.display = "none";
  update_tracker(form_tacker-1);
  current_form().style.display = "";
  showButtonLogin();
}

// script pour la reservation detection des clicks
let selectedOptions = {
  "New-reservation":"",
  "Reservation" : "",
  "location": "",
  "barber": "",
  "service": "",
  "add-on": "",
  "Journee": "",
  "Heure": ""
};

function addListeners(){
  const rows = document.querySelectorAll('.list-group-item');
  rows.forEach(row => row.addEventListener('click', clicked));  
}

addListeners();

function clicked(){
  selectedOptions[this.dataset.id.split(" ")[0]] = this
  console.log("clicked on day " + this)
  nextForm();
}

function countSelectedOptions(){
  let count = 0;

  for(var key in selectedOptions){
    if(selectedOptions[key] != ""){
      count++
    }
  }

  return count
}

function hideButtonLogin(){
  document.querySelector(".buttons_conn_inscr").style.display = "none";
}

function showButtonLogin(){
  document.querySelector(".buttons_conn_inscr").style.display = "";
  document.querySelector(".connexion_form").style.display = "none";
  document.querySelector(".inscription_form").style.display = "none";
}


document.querySelectorAll(".btn_connexion").forEach(el => el.addEventListener('click', 
  function(){
    form_tacker++
    hideButtonLogin();
    document.querySelector(".connexion_form").style.display = "";

  }
));

document.querySelector(".btn_inscription").addEventListener("click",
  function(){
    form_tacker++
    hideButtonLogin();
    document.querySelector(".inscription_form").style.display = "";
  }
)

