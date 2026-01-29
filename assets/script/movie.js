// activates modal
$("#trailer-Btn").click(function () {
    $('.modal').addClass('is-active');

    // Move the trailer iframe inside the modal
    var trailer = $('#show_Trailer iframe').clone();
    $('#myModal .modal-content').html(trailer);
});

// exits modal with exit button
$("#exit-ModalBtn").click(function () {
    $('.modal').removeClass('is-active');
    $("#myModal .modal-content").empty(); // stop video
});

// exits modal while clicking on screen
$("#modal-Bg").click(function () {
    $('.modal').removeClass('is-active');
    $("#myModal .modal-content").empty(); // stop video
});

// Generates color palette from poster img
var thief = new ColorThief();
function getPalette(selector) {
    var img = document.querySelector(selector);
    var colors = thief.getColor(img);
    var palette = thief.getPalette(img, 8);
    console.log(colors);
    console.log(palette);
    var P1 = palette[0];
    var colorRGBP1 = "rgb(" + P1 + ")";
    var colorRGB = "rgb(" + colors[0] + ", " + colors[1] + ", " + colors[2] + ")";
    document.body.style.backgroundColor = colorRGB;
    document.getElementById("footer").style.backgroundColor = colorRGBP1;
    document.getElementById("nav").style.backgroundColor = colorRGBP1;
}

function randomMovie() {
    // Clear old data
    $('#show_Poster, #show_Title, #show_Desc, #show_Release, #user_Rating, #show_Genre, #runTime, #actor1, #actor2, #actor3, #actor4, #actor5, #actor6, #character1, #character2, #character3, #character4, #character5, #character6, #img_Actor1, #img_Actor2, #img_Actor3, #img_Actor4, #img_Actor5, #img_Actor6, #platform_Name, #platform_Logo, #show_Trailer').empty();

    var selected = localStorage.getItem('checked') || '';
    var apiURL = `https://api.themoviedb.org/3/discover/movie?api_key=2d68f36569896b3eca3f4d442ec3c9a3&language=en-US&sort_by=popularity.desc&vote_count.gte=10&with_original_language=en&certification_country=US&include_adult=false&watch_region=US${selected}`;

    // Step 1: fetch first page to get total pages
    fetch(`${apiURL}&page=1`)
        .then(res => res.json())
        .then(data => {
            var totalPages = Math.min(data.total_pages, 500); // TMDB max page = 500
            var randomPage = Math.floor(Math.random() * totalPages) + 1;

            // Step 2: fetch random page
            fetch(`${apiURL}&page=${randomPage}`)
                .then(res => res.json())
                .then(data => {
                    // Step 3: pick a random movie that has a poster
                    var moviesWithPosters = data.results.filter(m => m.poster_path);
                    if (moviesWithPosters.length === 0) return;

                    var movie = moviesWithPosters[Math.floor(Math.random() * moviesWithPosters.length)];
                    console.log("Random movie:", movie);

                    // Poster
                    var posterImg = document.createElement('img');
                    posterImg.src = `https://www.themoviedb.org/t/p/w300_and_h450_bestv2/${movie.poster_path}`;
                    posterImg.id = "img";
                    posterImg.crossOrigin = "anonymous";
                    posterImg.onerror = function() { this.src = './assets/images/poster_not_found.png'; }
                    posterImg.onload = function() { getPalette("#img"); }
                    $('#show_Poster').append(posterImg);

                    // Title
                    $('#show_Title').append(movie.title.toUpperCase());

                    // Description
                    $('#show_Desc').append(movie.overview);

                    // Background
                    $("#bg").css("background-image", movie.backdrop_path 
                        ? `url(https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${movie.backdrop_path})`
                        : `url(https://wallpaperaccess.com/full/1129018.jpg)`);

                    // Release date
                    $('#show_Release').append(`<p>${movie.release_date}</p>`);

                    // User rating
                    $('#user_Rating').append(`<p>${movie.vote_average}/10</p>`);

                    // Movie details: cast, runtime, genres, trailer, watch providers
                    var movieURL = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=2d68f36569896b3eca3f4d442ec3c9a3&language=en-US&append_to_response=credits,videos,watch/providers`;
                    fetch(movieURL)
                        .then(res => res.json())
                        .then(response => {
                            console.log(response);

                            // Genres
                            var genreNames = response.genres.map(g => g.name).join(', ');
                            $('#show_Genre').append(`<p>${genreNames}</p>`);

                            // Runtime
                            var hours = Math.floor(response.runtime / 60);
                            var min = response.runtime % 60;
                            $('#runTime').append(`<p>${hours}hr ${min}min</p>`);

                            // Cast names, characters, images
                            for (let i = 0; i < 6; i++) {
                                let castMember = response.credits.cast[i];
                                $(`#actor${i+1}`).append(castMember ? castMember.name : 'no-cast').css('font-weight', 'bold');
                                $(`#character${i+1}`).append(castMember ? castMember.character : '');
                                $(`#img_Actor${i+1}`).append(`
                                    <img src="${castMember && castMember.profile_path ? `https://www.themoviedb.org/t/p/w138_and_h175_face/${castMember.profile_path}` : './assets/images/altheadshot.jpg'}" class="card-img-top" onerror=this.src="./assets/images/altheadshot.jpg">
                                `);
                            }

                            // Watch providers
                            if(response["watch/providers"].results.US) {
                                ['flatrate','ads','rent'].forEach(type => {
                                    if(response["watch/providers"].results.US[type]) {
                                        let provider = response["watch/providers"].results.US[type][0];
                                        $('#platform_Name').append(`<h1 class="is-size-5">${provider.provider_name}</h1>`);
                                        $('#platform_Logo').append(`<img src="https://www.themoviedb.org/t/p/original${provider.logo_path}" alt="provider logo">`);
                                    }
                                });
                            } else {
                                $('#platform_Name').append(`<h1 class="is-size-5">Not available.</h1>`);
                            }

                            // Trailer
                            $('#show_Trailer').empty();
                            if(response.videos && response.videos.results.length > 0) {
                                const trailer = response.videos.results.find(v => v.type === "Trailer" && v.site === "YouTube");
                                if(trailer) {
                                    $('#show_Trailer').append(`
                                        <iframe width="560" height="315" src="https://www.youtube.com/embed/${trailer.key}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                                    `);
                                } else {
                                    $('#show_Trailer').append(`<img src="./assets/images/no_trailer.png" alt="no trailer">`);
                                }
                            } else {
                                $('#show_Trailer').append(`<img src="./assets/images/no_trailer.png" alt="no trailer">`);
                            }
                        });
                });
        });
}

// Run on page load
randomMovie();
