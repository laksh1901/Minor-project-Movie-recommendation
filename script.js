let allMovies = [];

let isSignup = false;

/* LOAD */
async function loadMovies() {
    const res = await fetch("./movies.json");
    allMovies = await res.json();
}

/* DISPLAY */
function displayMovies(movies) {
    const container = document.getElementById("movieResults");
    container.innerHTML = "";

    if (!movies.length) {
        container.innerHTML = "<p>No movies found 😢</p>";
        return;
    }

    const currentUser = localStorage.getItem("currentUser");
    const users = JSON.parse(localStorage.getItem("users")) || {};
    const favs = currentUser && users[currentUser] ? users[currentUser].favorites : [];

    movies.forEach(movie => {
        const isFav = favs.includes(movie.title);

        const card = document.createElement("div");
        card.classList.add("movie-card");

        card.innerHTML = `
            <img src="${movie.poster}">
            <h4>${movie.title}</h4>
            <p>⭐ ${movie.rating} | ${movie.year}</p>
            <button onclick="event.stopPropagation(); addToFav(\`${movie.title}\`)">
                ${isFav ? "💚" : "❤️"}
            </button>
        `;

        card.onclick = () => openMovieModal(movie);

        container.appendChild(card);
    });
}

/* RECOMMEND */
function recommendMovie() {
    const selected = document.getElementById("genreSelect").value;
    const rating = document.getElementById("ratingSelect").value;

    if (!selected) return alert("Select genre");

    const filtered = allMovies.filter(movie => {
        const genres = movie.genre.toLowerCase().split(",").map(g => g.trim());
        const matchGenre = genres.includes(selected.toLowerCase());
        const matchRating = rating ? movie.rating >= rating : true;
        return matchGenre && matchRating;
    });

    displayMovies(filtered);

    document.querySelector(".recommendations").scrollIntoView({
        behavior: "smooth"
    });
}

/* SEARCH */
function toggleSearch() {
    document.querySelector(".search-container").classList.toggle("active");
}

const searchInput = document.getElementById("searchInput");
const suggestionsBox = document.getElementById("suggestions");

searchInput.addEventListener("input", function () {
    const value = this.value.toLowerCase().trim();

    if (!value) {
        suggestionsBox.style.display = "none";
        return;
    }

    const filtered = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(value)
    );

    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "block";

    filtered.slice(0, 5).forEach(movie => {
        const div = document.createElement("div");
        div.innerText = movie.title;

        div.onclick = () => {
            displayMovies([movie]);
            document.querySelector(".recommendations").scrollIntoView({ behavior: "smooth" });
            suggestionsBox.style.display = "none";
        };

        suggestionsBox.appendChild(div);
    });
});

/* ENTER SEARCH */
searchInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        const value = this.value.toLowerCase().trim();

        const filtered = allMovies.filter(movie =>
            movie.title.toLowerCase().includes(value)
        );

        displayMovies(filtered);
        document.querySelector(".recommendations").scrollIntoView({ behavior: "smooth" });
        suggestionsBox.style.display = "none";
    }
});

/* CLICK OUTSIDE */
document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
        suggestionsBox.style.display = "none";
    }

    const profileMenu = document.querySelector(".profile-menu");
    if (profileMenu && !profileMenu.contains(e.target)) {
        document.getElementById("profileDropdown").style.display = "none";
    }
});

/* AUTH TOGGLE FIXED */
function toggleAuthMode() {
    isSignup = !isSignup;

    const title = document.getElementById("formTitle");
    const btn = document.querySelector(".modal-content button");
    const text = document.getElementById("toggleText");
    const toggleBtn = document.getElementById("toggleBtn");

    if (isSignup) {
        title.innerText = "Sign Up";
        btn.innerText = "Create Account";
        text.innerText = "Already have an account?";
        toggleBtn.innerText = "Sign In";
    } else {
        title.innerText = "Sign In";
        btn.innerText = "Login";
        text.innerText = "Don't have an account?";
        toggleBtn.innerText = "Sign Up";
    }
}

/* AUTH FIXED */
function handleAuth() {
    const username = document.getElementById("usernameInput").value.trim();
    const password = document.getElementById("passwordInput").value.trim();

    if (!username || !password) {
        alert("Enter username & password");
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || {};

    if (isSignup) {
        if (users[username]) {
            alert("User already exists ❌");
            return;
        }

        users[username] = {
            password: password,
            favorites: []
        };

        localStorage.setItem("users", JSON.stringify(users));
        alert("Account created ✅");
    } else {
        if (!users[username]) {
            alert("User not found ❌");
            return;
        }

        if (users[username].password !== password) {
            alert("Wrong password ❌");
            return;
        }
    }

    localStorage.setItem("currentUser", username);

    closeModal();
    updateUserUI();

    document.getElementById("usernameInput").value = "";
    document.getElementById("passwordInput").value = "";
}

/* UI */
function updateUserUI() {
    const user = localStorage.getItem("currentUser");
    const btn = document.querySelector(".signin-btn");
    btn.innerText = user ? "👤 " + user : "👤 Sign In";
}

function logout() {
    localStorage.removeItem("currentUser");
    updateUserUI();
}

/* FAVORITES */
function addToFav(title) {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return alert("Login first");

    let users = JSON.parse(localStorage.getItem("users"));
    let favs = users[currentUser].favorites;

    if (favs.includes(title)) {
        favs = favs.filter(t => t !== title);
    } else {
        favs.push(title);
    }

    users[currentUser].favorites = favs;
    localStorage.setItem("users", JSON.stringify(users));

    const currentMovies = document.querySelectorAll(".movie-card h4");
    const visibleTitles = Array.from(currentMovies).map(el => el.innerText);

    const filtered = allMovies.filter(m => visibleTitles.includes(m.title));
    displayMovies(filtered);
}

function showFavorites() {
    const currentUser = localStorage.getItem("currentUser");
    if (!currentUser) return alert("Login first");

    const users = JSON.parse(localStorage.getItem("users"));
    const favs = users[currentUser].favorites;

    const filtered = allMovies.filter(m => favs.includes(m.title));
    displayMovies(filtered);

    document.querySelector(".recommendations").scrollIntoView({
        behavior: "smooth"
    });
}

/* MOVIE POPUP */
function openMovieModal(movie) {
    document.getElementById("movieModal").style.display = "flex";
    document.getElementById("movieTitle").innerText = movie.title;
    document.getElementById("movieInfo").innerText =
        "⭐ " + movie.rating + " | " + movie.year;
}

function closeMovieModal() {
    document.getElementById("movieModal").style.display = "none";
}

/* MODAL */
function openModal() {
    document.getElementById("loginModal").style.display = "flex";
}

function closeModal() {
    document.getElementById("loginModal").style.display = "none";
}

function handleUserClick() {
    const user = localStorage.getItem("currentUser");
    user ? toggleProfile() : openModal();
}

function toggleProfile() {
    const d = document.getElementById("profileDropdown");
    d.style.display = d.style.display === "block" ? "none" : "block";
}

/* INIT */
document.addEventListener("DOMContentLoaded", async () => {
    await loadMovies();
    updateUserUI();
});
function togglePassword() {
    const input = document.getElementById("passwordInput");

    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}
