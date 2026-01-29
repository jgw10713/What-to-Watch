// =======================
// MODAL CONTROLS
// =======================

$("#trailer-Btn").click(function () {
    $('.modal').addClass('is-active');
});

$("#exit-ModalBtn").click(function () {
    $('.modal').removeClass('is-active');
});

$("#modal-Bg").click(function () {
    $('.modal').removeClass('is-active');
});

$("#myModal").on('click', function () {
    $("#myModal iframe").attr("src", $("#myModal iframe").attr("src"));
});


// =======================
// COLOR PALETTE
// =======================

// OLD (disabled)
// var thief = new ColorThief();
// function getPalette(selector) {
//     var img = document.querySelector(selector);
//     var colors = thief.getColor(img);
//     var palette = thief.getPalette(img, 8);
//     var colorRGB = `rgb(${colors[0]}, ${colors[1]}, ${colors[2]})`;
//     var accent = `rgb(${palette[0]})`;
//     document.body.style.backgroundColor = colorRGB;
//     document.getElementById("footer").style.backgroundColor = accent;
//     document.getElementById("nav").style.backgroundColor = accent;
// }

// NEW (reliable)
var thief = new ColorThief();

function getPalette(img) {
    try {
        const colors = thief.getColor(img);
        const palette = thief.getPalette(img, 8);

        const dominant = `rgb(${colors[0]}, ${colors[1]}, ${colors[2]})`;
        const accent = `rgb(${palette[0][0]}, ${palette[0][1]}, ${palette[0][2]})`;

        document.body.style.backgroundColor = dominant;
        document.getElementById("footer").style.backgroundColor = accent;
        document.getElementById("nav").style.backgroundColor = accent;

    } catch (err) {
        console.warn("Palette failed:", err);
    }
}


// =======================
// RANDOM MOVIE
// =======================

$(document).ready(function() {

    function randomMovie() {

        // clear previous data
        $('#show_Poster, #show_Title, #show_Desc, #show_Release, #user_Rating').empty();
        $('#show_Genre, #runTime').empty();
        $('#actor1,#actor2,#actor3,#actor4,#actor5,#actor6').empty();
        $('#character1,#character2,#character3,#character4,#character5,#character6').empty();
        $('#img_Actor1,#img_Actor2,#img_Actor3,#img_Actor4,#img_Actor5,#img_Actor6').empty();
        $('#platform_Name,#platform_Logo').empty();
        $('#show_Trailer').empty();

        var selected = localStorage.getItem('checked');

        var apiURL =
            `https://api.themoviedb.org/3/discover/movie?api_key=2d68f36569896b3eca3f4d442ec3c9a3` +
            `&language=en-US&sort_by=popularity.desc&vote_count.gte=10` +
            `&with_original_language=en&certification_country=US` +
            `&include_adult=false&watch_region=US` +
            selected;

        fetch(apiURL)
            .then(res => res.json())
            .then(data => {

                var random = Math.floor(Math.random() * data.total_results);
                var randomPage = Math.ceil(random / 20);
                var randomResult = random % 20;

                fetch(`${apiURL}&page=${randomPage}`)
                    .then(res => res.json())
                    .then(data => {

                        const movie = data.results[randomResult];
                        if (!movie) return;

                        // =======================
                        // POSTER + PALETTE
                        // =======================

                        $('#show_Poster').empty();

                        const img = new Image();
                        img.crossOrigin = "anonymous";
                        img.id = "poster-img";

                        img.onload = function () {
                            getPalette(img);
                        };

                        img.onerror = function () {
                            img.src = "./assets/images/poster_not_found.png";
                        };

                        img.src = movie.poster_path
                            ? `https://image.tmdb.org/t/p/w300_and_h450_bestv2${movie.poster_path}`
                            : "./assets/images/poster_not_found.png";

                        $('#show_Poster').append(img);

                        // =======================
                        // BASIC INFO
                        // =======================

                        $('#show_Title').text(movie.title.toUpperCase());
                        $('#show_Desc').text(movie.overview);
                        $('#show_Release').html(`<p>${movie.release_date}</p>`);
                        $('#user_Rating').html(`<p>${movie.vote_average}/10</p>`);

                        if (movie.backdrop_path) {
                            $("#bg").css(
                                "background-image",
                                `url(https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${movie.backdrop_path})`
                            );
                        } else {
                            $("#bg").css(
                                "background-image",
                                `url(https://wallpaperaccess.com/full/1129018.jpg)`
                            );
                        }

                        // =======================
                        // MOVIE DETAILS (CAST + PROVIDERS + TRAILER + GENRE + RUNTIME)
                        // =======================

                        var movieURL =
                            `https://api.themoviedb.org/3/movie/${movie.id}?api_key=2d68f36569896b3eca3f4d442ec3c9a3` +
                            `&language=en-US&append_to_response=credits,watch/providers,videos`;

                        fetch(movieURL)
                            .then(res => res.json())
                            .then(response => {

                                // --- TRAILER ---
                                $('#show_Trailer').empty(); // clear old trailer

                                if (response.videos && response.videos.results.length > 0) {
                                    const trailer = response.videos.results.find(v => v.type === "Trailer" && v.site === "YouTube");
                                    if (trailer) {
                                        $('#show_Trailer').append(`
                                            <iframe width="560" height="315" 
                                                src="https://www.youtube.com/embed/${trailer.key}" 
                                                title="YouTube video player" frameborder="0" 
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
                                            </iframe>
                                        `);
                                    } else {
                                        $('#show_Trailer').append(`<img src="./assets/images/no_trailer.png" alt="no trailer">`);
                                    }
                                } else {
                                    $('#show_Trailer').append(`<img src="./assets/images/no_trailer.png" alt="no trailer">`);
                                }
                                // --- END TRAILER ---

                                // --- GENRES ---
                                if (response.genres && response.genres.length > 0) {
                                    const genreNames = response.genres.map(g => g.name).join(', ');
                                    $('#show_Genre').text(genreNames);
                                } else {
                                    $('#show_Genre').text('No genres available');
                                }

                                // --- RUNTIME ---
                                if (response.runtime) {
                                    const hours = Math.floor(response.runtime / 60);
                                    const minutes = response.runtime % 60;
                                    $('#runTime').text(`${hours}h ${minutes}m`);
                                } else {
                                    $('#runTime').text('Runtime not available');
                                }

                                // CAST
                                for (let i = 0; i < 6; i++) {
                                    if (response.credits?.cast?.[i]) {
                                        $(`#actor${i + 1}`).text(response.credits.cast[i].name).css('font-weight', 'bold');
                                        $(`#character${i + 1}`).text(response.credits.cast[i].character);

                                        $(`#img_Actor${i + 1}`).append(`
                                            <img src="https://www.themoviedb.org/t/p/w138_and_h175_face/${response.credits.cast[i].profile_path}"
                                                 class="card-img-top"
                                                 onerror="this.src='./assets/images/altheadshot.jpg'">
                                        `);
                                    } else {
                                        $(`#actor${i + 1}`).text('no-cast');
                                    }
                                }

                                // WATCH PROVIDERS
                                const providers = response["watch/providers"]?.results?.US;

                                if (!providers) {
                                    $('#platform_Name').html(`<h1 class="is-size-5">Not available</h1>`);
                                    return;
                                }

                                const service =
                                    providers.flatrate?.[0] ||
                                    providers.ads?.[0] ||
                                    providers.rent?.[0];

                                if (service) {
                                    $('#platform_Name').html(`<h1 class="is-size-5">${service.provider_name}</h1>`);
                                    $('#platform_Logo').html(`
                                        <img src="https://www.themoviedb.org/t/p/original${service.logo_path}">
                                    `);
                                } else {
                                    $('#platform_Name').html(`<h1 class="is-size-5">Not available</h1>`);
                                }
                            });
                    });
            });
    }

    randomMovie();

});


