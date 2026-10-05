let cl = console.log;
const BASE_URL = `https://crud-firebase-e248a-default-rtdb.firebaseio.com/`;
const MOVIE_URL = `${BASE_URL}/movies.json`;

let form = document.getElementById('movieModel');
let backDrop = document.getElementById('backdrop');
let addmovie = document.getElementById('addmovie');
let closeMovieModel = [...document.getElementsByClassName('closeMovieModel')];
let movieForm = document.getElementById('movieForm');
let movieNameControl = document.getElementById('movieName');
let movieImageControl = document.getElementById('movieImage');
let movieDesciptionControl = document.getElementById('movieDesciption');
let movieRatingControl = document.getElementById('movieRating');
let addMoviebtn = document.getElementById('addMoviebtn');
let updateMoviebtn = document.getElementById('updateMoviebtn');
let movieContainer = document.getElementById('movieContainer');
let closeBtn = document.getElementById('closeBtn');
let closeMark = document.getElementById('closeMark');
let spinner = document.getElementById('spinner');

//=====================================================================================
function onToggle() {
    form.classList.toggle('active');
    backDrop.classList.toggle('active');
    movieForm.reset();
    updateMoviebtn.classList.add('d-none');
}
//======================================================================================
function snackBar(msg, icon) {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 3000
    })
}
//=====================================================================================
function handleSpinner(flag) {
    if (flag) {
        spinner.classList.remove('d-none');
    } else {
        spinner.classList.add('d-none');
    }
}
//====================================================================================
let state = {
    movieArray: [],
    movieEditId: null
}
//=====================================================================================
function movieRating(rating) {
    if (rating >= 4) {
        return 'badge badge-success';
    } else if (rating < 4 && rating >= 3) {
        return 'badge badge-warning'
    } else {
        return 'badge badge-danger'
    }
}
//=====================================================================================
function makeApiCall(url, methodName, body) {
    let data = body ? JSON.stringify(body) : null
    return fetch(url, {
        method: methodName,
        body: data,
        headers: {
            "content-type": "application/json",
            "auth": "JWT Token"
        }
    })
        .then(res => {
            if (!res.ok) {
                throw new Error("API Error");
            }
            return res.json();
        })
        .catch(err => {
            snackBar('unble to server connect', 'error');
        })
}
//======================================================================================
function onCreateMovieCard(eve) {
    if(movieNameControl.value === '' || movieImageControl.value === '' || movieRatingControl.value === '' || movieDesciptionControl === ''){
        snackBar('please fill all filed');
    }else{
    eve.preventDefault();
    let movieObj = {
        name: movieNameControl.value,
        image: movieImageControl.value,
        descripation: movieDesciptionControl.value,
        rating: movieRatingControl.value
    }
    cl(movieObj);
    handleSpinner(true);
    makeApiCall(MOVIE_URL, "POST", movieObj)
        .then(res => {
            movieObj.id = res.name;
            state.movieArray.unshift(movieObj);
            let div = document.createElement('div');
            div.className = "col-md-3 mt-3";
            div.id = movieObj.id;
            div.innerHTML = ` <div class="card movieCard">
                    <div class="card-header">
                        <div class="row">
                            <div class="col-10">
                                <h4>
                                    ${movieObj.name}
                                </h4>
                            </div>
                            <div class="col-2">
                                <span class=" text-center p-2 ${movieRating(movieObj.rating)}">${movieObj.rating}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <figure>
                            <img src="${movieObj.image}" alt="${movieObj.name}">
                            <figcaption>
                                <p>
                                   ${movieObj.descripation}
                                </p>
                            </figcaption>
                        </figure>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button type="button" onclick="onEditMovie(this)" class="btn btn-sm net-sec-btn">Edit</button>
                        <button type="button" onclick="onDeleteMovie(this)" class="btn btn-sm net-pri-btn">Remove</button>
                    </div>
                </div>`
            movieContainer.prepend(div);
            movieForm.reset();
            onToggle();
            handleSpinner();
            snackBar('MovieCard Added Successfully!!', 'success');
        })
        .catch(err => {
            handleSpinner();
            snackBar(`Unable to add movieCard`, 'error');
        })
    }
}
//=======================================================================================
function objtoArr(res) {
    for (let key in res) {
        res[key].id = key;
        state.movieArray.unshift(res[key]);
    }
}
//======================================================================================
function fetchMovieCard() {
    handleSpinner(true);
    makeApiCall(MOVIE_URL, "GET")
        .then(res => {
            objtoArr(res);
            templatingMovieCards(state.movieArray);
            handleSpinner();
            snackBar('MovieCards Fetched Successfully', 'success')
        })
        .catch(err => {
            handleSpinner();
            snackBar('unble to server connect', 'error');
        })
}
fetchMovieCard();
//=======================================================================================
function templatingMovieCards(arr) {
    let result = '';
    arr.forEach(mov => {
        result += `<div class="col-md-3 mt-3" id="${mov.id}">
                <div class="card movieCard">
                    <div class="card-header">
                        <div class="row">
                            <div class="col-10">
                                <h4>${mov.name}</h4>
                            </div>
                            <div class="col-2">
                                <span class="text-center p-2 ${movieRating(mov.rating)}">${mov.rating}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <figure>
                            <img src="${mov.image}" alt="${mov.title}">
                            <figcaption>
                                <p>${mov.descripation}</p>
                            </figcaption>
                        </figure>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button type="button" onclick="onEditMovie(this)" class="btn btn-sm net-sec-btn">Edit</button>
                        <button type="button" onclick="onDeleteMovie(this)" class="btn btn-sm net-pri-btn">Remove</button>
                    </div>
                </div>
            </div>  `
    })
    movieContainer.innerHTML = result;
}
//=======================================================================================
function onEditMovie(ele) {
    let editId = ele.closest('.col-md-3').id;
    state.movieEditId = editId;
    const EDIT_URL = `${BASE_URL}/movies/${editId}.json`;
    handleSpinner(true);
    makeApiCall(EDIT_URL, "GET")
        .then(res => {
            onToggle();
            movieNameControl.value = res.name;
            movieImageControl.value = res.image;
            movieDesciptionControl.value = res.descripation;
            movieRatingControl.value = res.rating;
            updateMoviebtn.classList.remove('d-none');
            addMoviebtn.classList.add('d-none');
            closeBtn.disabled = true;
            closeMark.classList.add('d-none');
            document.querySelector('.card-header h3').innerText = 'Edit Movie';
            handleSpinner();
            // snackBar('MovieCard Edited Successfully', 'success')

        })
        .catch(err => {
            snackBar(`Unable to edit movieCard`, 'error');
            handleSpinner();
        })
}
//=======================================================================================
function onUpdateMovieCard() {
    let updateId = state.movieEditId;
    cl(updateId);
    state.movieEditId = null;
    let updateMovieObj = {
        name: movieNameControl.value,
        image: movieImageControl.value,
        descripation: movieDesciptionControl.value,
        rating: movieRatingControl.value,
        id: updateId
    }
    const UPDATE_URL = `${BASE_URL}/movies/${updateId}.json`;
    handleSpinner(true);
    makeApiCall(UPDATE_URL, "PATCH", updateMovieObj)
        .then(res => {
            let findIndex = state.movieArray.findIndex(mov => mov.id === updateId);
            state.movieArray[findIndex] = updateMovieObj;
            let div = document.getElementById(updateId);
            div.innerHTML = `<div class="card movieCard">
                    <div class="card-header">
                        <div class="row">
                            <div class="col-10">
                                <h4>${updateMovieObj.name}</h4>
                            </div>
                            <div class="col-2">
                                <span class="text-center p-2 ${movieRating(updateMovieObj.rating)}">${updateMovieObj.rating}</span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <figure>
                            <img src="${updateMovieObj.image}" alt="${updateMovieObj.title}">
                            <figcaption>
                                <p>${updateMovieObj.descripation}</p>
                            </figcaption>
                        </figure>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button type="button" onclick="onEditMovie(this)" class="btn btn-sm net-sec-btn">Edit</button>
                        <button type="button" onclick="onDeleteMovie(this)" class="btn btn-sm net-pri-btn">Remove</button>
                    </div>
                </div>`
            addMoviebtn.classList.remove('d-none');
            closeBtn.disabled = false;
            closeMark.classList.remove('d-none');
            document.querySelector('.card-header h3').innerText = 'Add Movie';
            onToggle();
            handleSpinner()
            snackBar('MovieCard Updated Successfully', 'success')

        })
        .catch(err => {
            handleSpinner();
            snackBar(`Unable to update movieCard`, 'error');
        })
}
//=======================================================================================
function onDeleteMovie(ele) {
    let deleteId = ele.closest('.col-md-3').id;
    Swal.fire({
        title: "Are you sure?",
        text: `You want to delete employee ID ${deleteId}?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Delete",
        cancelButtonText: "Cancel"
    })
        .then(function (result) {
            if (result.isConfirmed) {
                handleSpinner(true);
                const DELETE_URL = `${BASE_URL}/movies/${deleteId}.json`;
                makeApiCall(DELETE_URL, "DELETE")
                    .then(res => {
                        let findIndex = state.movieArray.findIndex(mov => mov.id === deleteId);
                        state.movieArray.splice(findIndex, 1);
                        ele.closest('.col-md-3').remove();
                        handleSpinner();
                        snackBar('Delete MovieCard Successfully!!', 'success')
                    })
                    .catch(err => {
                        handleSpinner();
                        snackBar(`Unable to delete student ID ${deleteId}`, 'error');
                    })
            }
        })
}
//=======================================================================================
addmovie.addEventListener('click', onToggle);
closeMovieModel.forEach(ele => {
    ele.addEventListener('click', onToggle)
})
movieForm.addEventListener('submit', onCreateMovieCard);
updateMoviebtn.addEventListener('click', onUpdateMovieCard);