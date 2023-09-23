async function login(){
    var { data, error } = await supabaseClient.auth.signInWithPassword({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
    })

    if(!error){
        location.href = "../"
    } else {
        document.getElementById('error').hidden = false
    }
}