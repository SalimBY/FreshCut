const displayInfo = document.querySelectorAll('.form-container-display');
const inputInfo = document.querySelectorAll('.form-container-input');

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

function modifiyMode(){
    
    displayInfo.forEach(info => {
        info.setAttribute("hidden", true);
    })

    inputInfo.forEach(info => {
        info.removeAttribute("hidden");
    })

}

async function save(endpoint){
    
    displayInfo.forEach(info => {
        info.removeAttribute("hidden");
    })

    inputInfo.forEach(info => {
        info.setAttribute("hidden", true);
    })

    const formData = {} ;

    document.querySelectorAll('.form-container-input #input-box').forEach(item => {
        formData[item.getAttribute("placeholder")] = item.value;
    });

    console.log(formData)

    let result = await postData(endpoint, formData);
    
    if(result["success"]){
        location.reload();
    }
    else{
        alert(result["message"])
    }

}

function display(){

}