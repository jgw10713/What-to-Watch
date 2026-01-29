// activates modal
$("#trailer-Btn").click(function () {
    $('.modal').addClass('is-active');
});

// exits modal with exit button
$("#exit-ModalBtn").click(function () {
    $('.modal').removeClass('is-active');
});

// exits modal while clicking on screen
$("#modal-Bg").click(function () {
    $('.modal').removeClass('is-active');
});

// stops the video when exiting the modal
$("#myModal").on('click', function () {
    $("#myModal iframe").attr("src", $("#myModal iframe").attr("src"));
});


// =======================
// COLOR PALETTE LOGIC
// =======================

// OLD (disabled – timing + duplicate ID issues)
// var thief = new ColorThief();
// function getPalette(selector) {
//     var img = document.querySelector(selector)
//     var colors = thief.getColor(img);
//     var pallete = thief.getPalette(img, 8);
//     var P1 = pallete[0]
//     var colorRGBP1 = "rgb(" + P1 + ")"
//     var red = colors[0]
//     var green = colors[1]
//     var blue = colors[2]
//     var colorRGB = "rgb(" + red + ", " + green + ", " + blue + ")"
//     document.body.style.backgroundColor = colorRGB
//     document.getElementById("footer").style.backgroundColor = colorRGBP1
//     document.getElementById("nav").style.backgroundColor = colorRGBP1
// }


// NEW (reliable – waits for image load)
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
        console.warn("Color palette failed:", err);
    }
}


// =======================
// RANDOM MOVIE FUNCTION
// =======================

function randomMovie() {

    var selected = localStorage.getItem('checked');

    var apiURL = `https://api.themoviedb.org/3/discover/movie?api_key=2d68f36569896b3eca3f4d442ec3c9a3&language=en-US&sort_by=popularity.desc&vote_count.gte=10&with_original_language=en&certification_country=US&include_adult=false&watch_region=US` + selected;

    fetch(apiURL)
        .then(res => res.json())
        .then(data => {

            var random = Math.floor(Math.random() * data.total_results);
            var randomPage = Math.ceil(random / 20);
            var randomResult = random % 20;

            fetch(`${apiURL}&page=${randomPage}`)
                .then(res => res.json())
                .then(data => {

                    // =======================
                    // POSTER + COLOR PALETTE
                    // =======================

                    $('#show_Poster').empty();

                    if (data.results[randomResult]) {

                        const posterPath = data.results[randomResult].poster_path;

                        // OLD (disabled)
                        // $('#show_Poster').append(`
                        //   <img src="https://image.tmdb.org/t/p/w300_and_h450_bestv2/${posterPath}"
                        //        id="img"
                        //        crossorigin="anonymous"
                        //        onerror=this.src="./assets/images/poster_not_found.png">
                        // `);
                        // setTimeout(() => getPalette("#img"), 500);

                        // NEW (safe)
                        const img = new Image();
                        img.crossOrigin = "anonymous";
                        img.id = "poster-img";

                        img.onload = function () {
                            getPalette(img);
                        };

                        img.onerror = function () {
                            img.src = "./assets/images/poster_not_found.png";
                        };

                        img.src = posterPath
                            ? `https://image.tmdb.org/t/p/w300_and_h450_bestv2${posterPath}`
                            : "./assets/images/poster_not_found.png";

                        $('#show_Poster').append(img);
                    }

                    // =======================
                    // BASIC MOVIE INFO
                    // =======================

                    $('#show_Title').empty().append(data.results[randomResult].title.toUpperCase());
                    $('#show_Desc').empty().append(data.results[randomResult].overview);
                    $('#show_Release').empty().append(`<p>${data.results[randomResult].release_date}</p>`);
                    $('#user_Rating').empty().append(`<p>${data.results[randomResult].vote_average}/10</p>`);

                    if (data.results[randomResult].backdrop_path) {
                        $("#bg").css(
                            "background-image",
                            `url(https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${data.results[randomResult].backdrop_path})`
                        );
                    } else {
                        $("#bg").css(
                            "background-image",
                            `url(https://wallpaperaccess.com/full/1129018.jpg)`
                        );
                    }

                    // =======================
                    // TRAILER
                    // =======================

                    var recURL = `https://wendy-cors.herokuapp.com/https://tastedive.com/api/similar?q=${data.results[randomResult].original_title.toUpperCase()}&type=movies&limit=1&verbose=1&k=410241-WhattoWa-74TU2L6X`;

                    fetch(recURL)
                        .then(res => res.json())
                        .then(query => {
                            $('#show_Trailer').empty();
                            if (query.Similar.Info) {
                                $('#show_Trailer').append(`
                                    <iframe width="560" height="315"
                                        src="${query.Similar.Info[0].yUrl}"
                                        frameborder="0"
                                        allowfullscreen>
                                    </iframe>
                                `);
                            } else {
                                $('#show_Trailer').append(`
                                    <img src="./assets/images/no_trailer.png">
                                `);
                            }
                        });

                });
        });
}

randomMovie();
