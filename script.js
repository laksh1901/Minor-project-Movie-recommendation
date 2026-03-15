async function loadMovies(){

const response = await fetch("movies.json");

const movies = await response.json();

return movies;

}


async function recommendMovie(){

const genre = document.getElementById("genreSelect").value;

const movieContainer = document.getElementById("movieResults");

movieContainer.innerHTML = "Loading movies...";

const movies = await loadMovies();

const filtered = movies.filter(movie =>

movie.genre.toLowerCase() === genre.toLowerCase()
);

movieContainer.innerHTML = "";


if(filtered.length === 0){

movieContainer.innerHTML = "<p>No movies found</p>";

return;

}


filtered.forEach(movie => {

const card = document.createElement("div");

card.classList.add("movie-card");

card.innerHTML = `

<img src="${movie.poster}" alt="${movie.title}">

<h3>${movie.title}</h3>

<p>⭐ Rating: ${movie.rating}</p>

<p>📅 Year: ${movie.year}</p>

`;

movieContainer.appendChild(card);

});

}