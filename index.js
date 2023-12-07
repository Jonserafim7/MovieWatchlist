// global variables --------------------------------------------------------------------

// Array to store the watchlist retrieved from localStorage
let watchList = JSON.parse(localStorage.getItem("watchList")) || []

// Array to store movie data retrieved from the OMDB API
let moviesArray1 = []

// index.html elements
const movieSearchInputEl = document.getElementById("movie-search-input")
const backgroundLogoEl = document.getElementById("movie-icon-bg")
const backgroundLogoTextEl = document.getElementById("movie-icon-bg-text")
const moviesSectionEl = document.getElementById("movies-section")

// watchlist.html elements
const myWatchListMoviesSectionEl = document.getElementById("mywatchlist-movies-section")
const myWatchListBackgroundEl = document.getElementById("mywatchlist-movie-icon-bg")

// event listeners ----------------------------------------------------------------------

document.addEventListener("click", e => {
    // Check the dataset attribute of the clicked element and perform actions accordingly
    if (e.target.dataset.search) {
        // Trigger the function to render movies based on the search input
        renderMoviesArray()
    } else if (e.target.dataset.watchlist) {
        // Add movie to watchlist
        addMovieToLocalStorage(e.target.dataset.watchlist)
    } else if (e.target.dataset.remove) {
        // Remove movie from watchlist and re-render the watchlist
        removeMovieFromLocalStorage(e.target.dataset.remove)
        renderWatchlist()
    }
})

// functions ---------------------------------------------------------------------------

// Function to fetch movie data from the OMDB API based on search input
async function getMoviesArray() {
    // Clear movies section and show loading icon
    moviesSectionEl.innerHTML=""
    backgroundLogoEl.style.display = "flex"
    
    const response = await fetch(`http://www.omdbapi.com/?apikey=b66e6920&s=${movieSearchInputEl.value}&type=movie`)
    const data = await response.json()


    if (data.Response === "False") {
        // Display error message if no results are found
        backgroundLogoTextEl.textContent = `Unable to find what you’re looking for. Please try another search.`
        movieSearchInputEl.value = ""
    } else {
        // Hide loading icon
        backgroundLogoEl.style.display = "none"

        
        const movieIdsArray = data.Search.map(movie => movie.imdbID)

        // Fetch detailed information for each movie in the search results
        const moviesArray = await Promise.all(movieIdsArray.map(async movieImdbID => {
            const response = await fetch(`http://www.omdbapi.com/?apikey=b66e6920&i=${movieImdbID}`)
            const data = await response.json()
            return data
        }))


        return moviesArray
    }
}

// Function to generate HTML for displaying movies
const getMovieListInnerHTML = (arr) => {
    if (!arr) {
        console.error("Movie array is undefined or null.")
        return ""
    }

    let moviesListHTML = ""

    arr.forEach(movie => {
        const watchListIDs = watchList.map(item => item.imdbID)
        
        let iconSrc = "./icons/add.png"
        let watchlistAction = "Watchlist"

        if(watchListIDs.includes(movie.imdbID)){
            console.log("adicionado")
            iconSrc = "./icons/remove.png"
            watchlistAction = "Remove"
        }

        const dataset = watchlistAction.toLowerCase()

        moviesListHTML += `
        <div class="movies-list container flex-container">
            <img class="movie-img-container" src="${movie.Poster}">
            <div class="flex-container movie-text-container">
                <div class="flex-container movie-title">
                    <h2>${movie.Title}</h2>
                    <div class="flex-container movie-rating">
                        <img src="./icons/star-Icon.png">
                        <h3>${movie.imdbRating}</h3>
                    </div>
                </div>
                <div class="flex-container movie-info">
                    <h3>${movie.Runtime}</h3>
                    <h3>${movie.Genre}</h3>
                    <div class="flex-container add-to-watchlist" id="add-to-watchlist" data-${dataset}="${movie.imdbID}">
                        <img src="${iconSrc}" data-${dataset}="${movie.imdbID}">
                        <h3 data-${dataset}="${movie.imdbID}">${watchlistAction}</h3>
                    </div>
                </div>
                <p class="movie-description">
                    ${movie.Plot}
                </p>
            </div>
        </div>
        `
    })

    return moviesListHTML
}

// Function to render movies based on search input
async function renderMoviesArray() {
    // Fetch movies and render them in the movies section
    moviesArray1 = await getMoviesArray()
   
    moviesSectionEl.innerHTML = getMovieListInnerHTML(moviesArray1)
}

// Function to add a movie to the watchlist
function addMovieToLocalStorage(movieID) {
    // Find the target movie object in moviesArray1
    const targetMovieObj = moviesArray1.find(movie => movie.imdbID === movieID)

    if (targetMovieObj) {
        // Retrieve the existing watchlist array from local storage
        watchList = JSON.parse(localStorage.getItem("watchList")) || []

        // Add the target movie object to the watchlist array
        watchList.push(targetMovieObj)

        // Store the updated watchlist array in local storage
        localStorage.setItem("watchList", JSON.stringify(watchList))
        
        console.log("Movie added to watchlist:", targetMovieObj)
    } else {
        console.error("Movie not found in moviesArray1")
    }
}

// Function to render the watchlist
function renderWatchlist() {
    // Retrieve the watchlist from local storage
    watchList = JSON.parse(localStorage.getItem("watchList")) || []

    

    // Render the watchlist in the watchlist section
    myWatchListMoviesSectionEl.innerHTML = getMovieListInnerHTML(watchList)
    myWatchListBackgroundEl.style.display = "none"
}

// Render the watchlist when the watchlist page elements are present
if (myWatchListMoviesSectionEl && myWatchListBackgroundEl) {
    renderWatchlist()
}

// Function to remove a movie from the watchlist
function removeMovieFromLocalStorage(movieID) {
    // Retrieve the existing watchlist array from local storage
    watchList = JSON.parse(localStorage.getItem("watchList")) || []

    // Check if the movie is in the watchlist
    const index = watchList.findIndex(movie => movie.imdbID === movieID)

    if (index !== -1) {
        // Remove the movie from the watchlist array
        watchList.splice(index, 1)

        // Store the updated watchlist array in local storage
        localStorage.setItem("watchList", JSON.stringify(watchList))

        console.log("Movie removed from watchlist:", movieID)
    } else {
        console.error("Movie not found in watchlist")
    }
}
