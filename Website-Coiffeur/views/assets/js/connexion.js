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

async function validateForm(event) {
    event.preventDefault(); // prevent form from submitting before validation
    
    const form = document.getElementById("formC");
    const email = form.elements["email"].value;
    const password = form.elements["password"].value;
  
    // Regular expression for email validation
    const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    const passwordRegex = /[a-zA-Z]{6,32}$/;


    if (!emailRegex.test(email)) {
        alert("Svp entrez un email valide");
        return false;
    }
    
    if (!passwordRegex.test(password)) {
        alert("Svp entrez un password valide.");
        return false;
    }

    let result = await postData("/connexion", {"email": email, "password": password})
    console.log(result);

    if(result["result"]){
        window.location.href = "reservation";
    } else {
        alert("password invalide")
    }
}