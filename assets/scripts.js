const [inputEmail, inputPassword] = document.querySelectorAll(".form-control")
const form = document.querySelector("form")
const divContenido = document.querySelector("#divContenido")
const header = document.querySelector("#header")
const divInferior = document.querySelector("#parteInferior")
const btnCerrarSesion = document.querySelector("#btncerrarSesion")

form.addEventListener("submit", async (e)=>{
    e.preventDefault()
    let email = inputEmail.value
    let password = inputPassword.value
    console.log(email, password)
    let response = await fetch("/api/login",{
        method: "POST",
        body: JSON.stringify({email, password})
    })
    let data = await response.json() //el post devuelve un objeto solo con un token
    let token = data.token
    //persistir token
    localStorage.setItem("token",token)
    //pasar el token a /api/photos para obtener el arreglo con fotos
    let arregloFotos = await obtenerFotos(token)
    console.log(arregloFotos)
    //ocultar formulario
    form.classList.toggle("d-none")
    // form.classList.add("d-none")
    //agregar boton logout
    btnCerrarSesion.classList.remove("d-none");
    btnCerrarSesion.classList.add("d-inline")
    //agregar div de contenido
    divContenido.classList.remove("d-none")
    divContenido.classList.add("d-block")

    //mostrar 10 fotos
    renderizarDiezFotos(arregloFotos,10)
    let contadorFotos = 3; // parte en 3 porque las primeras 10 fotos ya fueron mostradas y "mostrar más fotos" agrega 5 más
    localStorage.setItem("contadorFotos",contadorFotos)
    //agregar boton
    divInferior.classList.remove("d-none")
    divInferior.classList.add("d-block")

    form.reset()

})

//obtener fotos pasando el jwt como authorization del header del GET
const obtenerFotos = async (jwt) =>{
    let response = await fetch("/api/photos",{
        method: 'GET',
        mode: 'cors',
        headers: {
            Authorization: `Bearer ${jwt}`
            
        }
    })
    let obj = await response.json()
    let arregloData = obj.data
    return arregloData
}

const renderizarDiezFotos = (fotos,n) => {
    let diezFotos = fotos.slice(0,n)
    diezFotos.forEach((foto)=> { 
        try{ //bloque try para que las url rotas no detengan la ejecucion
            divContenido.innerHTML += 
            `
            <div class="card my-3">
            <img class="card-img-top" src="${foto.download_url}">
            <div class="card-body">
              <p class="card-text">${foto.author}</p>
            </div>
          </div>        `
        }catch(e){
            console.log(e)
        }
    })
}

const cerrarSesion = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("contadorFotos")
    divContenido.textContent = ""

    form.classList.toggle("d-none")
    btnCerrarSesion.classList.remove("d-inline")
    btnCerrarSesion.classList.add("d-none")

    divInferior.classList.remove("d-block")
    divInferior.classList.add("d-none")
}

const mostrarMasFotos = async () => {
    let jwt = localStorage.getItem("token")
    let x = localStorage.getItem("contadorFotos") //valor actual del contador de página de fotos
    let response = await fetch(`/api/photos?page=${x}`,{
        method: 'GET',
        mode: 'cors',
        headers: {
            Authorization: `Bearer ${jwt}`
            
        }
    })
    let obj = await response.json()
    let arregloData = obj.data
    arregloData
    renderizarDiezFotos(arregloData,5)
    x++
    localStorage.setItem("contadorFotos",x)

}