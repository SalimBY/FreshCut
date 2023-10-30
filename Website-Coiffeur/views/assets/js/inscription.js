async function get(endpoint){
    
    let response = await fetch(endpoint, {
        headers: {
           'Accept': 'application/json'
        }
     })
    
     return await response.json()
}

async function checkEmail(email){
    console.log(email)
    let barbers = await get(`/checkEmail/${email}`)
    console.log(barbers);

    if(barbers["used"]){
        alert("Email déjà utiliser !")
        return true;
    }

    return false;
}

async function validateForm(event) {
    event.preventDefault(); // prevent form from submitting before validation
    
    const form = document.getElementById("formI");
    const email = form.elements["email"].value;
    const username = form.elements["username"].value;
    const tel = form.elements["phone"].value;
    const password = form.elements["password"].value;
  
    // Regular expression for email validation
    const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    const usernameRegex = /[a-zA-Z]{6,32}$/;
    const telRegex = /[0-9]{3}-[0-9]{3}-[0-9]{4}$/;
    const passwordRegex = /[a-zA-Z]{6,32}$/;


    if (!emailRegex.test(email)) {
        alert("Svp entrez un email valide");
        return false;
    }

    if (!usernameRegex.test(username)) {
        alert("Svp entrez un username valide.");
        return false;
    }

    if (!telRegex.test(tel)) {
        alert("Svp entrez un telephone valide.");
        return false;
    }
    
    if (!passwordRegex.test(password)) {
        alert("Svp entrez un password valide.");
        return false;
    }

    let barbers = await get(`/checkEmail/${email}`)
    console.log(barbers);

    if(barbers["used"]){
        alert("Email déjà utiliser !")
        return true;
    }
    else{
        form.submit();
    }

    return false;
  }