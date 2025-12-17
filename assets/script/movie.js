

// activates modal
$("#trailer-Btn").click(function () {
    $('.modal').addClass('is-active');

})
// exits modal with exit button
$("#exit-ModalBtn").click(function () {
    $('.modal').removeClass('is-active');

})
// exits modal while clicking on screen
$("#modal-Bg").click(function () {
    $('.modal').removeClass('is-active');

})

// stops the video when exiting the modal
$("#myModal").on('click', function (e) {
    $("#myModal iframe").attr("src", $("#myModal iframe").attr("src"));
});


// Generates color pallet from poster img, gets called in function randomMovie
var thief = new ColorThief();
function getPalette(selector) {
    var img = document.querySelector(selector)
    var colors = thief.getColor(img);
    var pallete = thief.getPalette(img, 8);
    console.log(colors);
    console.log(pallete);
    var P1 = pallete[0]
    var P2 = pallete[1]
    var P3 = pallete[2]
    var colorRGBP1 = "rgb" + "(" + P1 + ")"
    var red = colors[0]
    var green = colors[1]
    var blue = colors[2]
    var colorRGB = "rgb" + "(" + red + ", " + green + ", " + blue + ")"
    document.body.style.backgroundColor = colorRGB
    document.getElementById("footer").style.backgroundColor = colorRGBP1
    document.getElementById("nav").style.backgroundColor = colorRGBP1
}

function randomMovie() {

    // gets the stored values from the checkboxes
    var selected = localStorage.getItem('checked');

    var apiURL = `https://api.themoviedb.org/3/discover/movie?api_key=2d68f36569896b3eca3f4d442ec3c9a3&language=en-US&sort_by=popularity.desc&vote_count.gte=10&with_original_language=en&certification_country=US&include_adult=false&watch_region=US` + selected;
    fetch(apiURL)
        .then(function (data) {
            return data.json();
        })
        .then(function (data) {
            console.log(data);
            var random = Math.floor(Math.random() * data.total_results);
            console.log(random);
            var randomPage = Math.ceil(random / 20);
            var ranUrlPage = '&page=';
            var randomResult = random % 20;
            fetch(`${apiURL}${ranUrlPage}${randomPage}`).then(function (data) {
                return data.json()
            }).then(function (data) {
                // appends the poster and sets color pallet
                if (data.results[randomResult]) {
                    $('#show_Poster').append(`
                <img src="https://image.tmdb.org/t/p/w300_and_h450_bestv2/${data.results[randomResult].poster_path}"  id="img" crossorigin="anonymous" onerror=this.src="./assets/images/poster_not_found.png" >
                 `);
                    setTimeout(function () {
                        getPalette("#img")
                    })
                    // if poster not found, it grabs out alt img.   
                } else {
                    $('#show_Poster').append(`
                <img src="./assets/images/poster_not_found.png"  id="img" crossorigin="anonymous">
                 `), 3000;
                }

                // appends the movie title
                $('#show_Title').append(`${data.results[randomResult].title.toUpperCase()}`);

                // append movie desc.
                $('#show_Desc').append(`${data.results[randomResult].overview}`);

                // append the movie background
                if (data.results[randomResult].backdrop_path) {
                    $(document).ready(function () {
                        $("#bg").css("background-image", `url(https://image.tmdb.org/t/p/w1920_and_h800_multi_faces/${data.results[randomResult].backdrop_path})`);
                    });
                } else {
                    $("#bg").css("background-image", `url(https://wallpaperaccess.com/full/1129018.jpg)`);
                }

                // appends the release date
                $('#show_Release').append(`<p>${data.results[randomResult].release_date}<p>`);

                // appends user rating
                $('#user_Rating').append(`<p>${data.results[randomResult].vote_average}/10<p>`);

                // appends movie trailer with 2nd API
                var recURL = `https://wendy-cors.herokuapp.com/https://tastedive.com/api/similar?q=${data.results[randomResult].original_title.toUpperCase()}&type=movies&limit=1&verbose=1&k=410241-WhattoWa-74TU2L6X`
                fetch(recURL)
                    .then(function (query) {
                        return query.json();
                    })
                    .then(function (query) {
                        console.log(query)
                        
                        if(query.Similar.Info){
                        $('#show_Trailer').append(`<iframe width="560" height="315" src="${query.Similar.Info[0].yUrl}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`)
                        }
                        else{
                            $('#show_Trailer').append(`
                            <img src="./assets/images/no_trailer.png"  alt = "no trailer">
                             `);
                        }   
                    })

                    // pulls the ID from data results above and pulls the extra details from the random movie (cast,characters ect.)
                var movieURL = `https://api.themoviedb.org/3/movie/${data.results[randomResult].id}?api_key=2d68f36569896b3eca3f4d442ec3c9a3&language=en-US&append_to_response=credits,videos,watch/providers,rating,similar`
                fetch(movieURL)
                    .then(function (response) {
                        return response.json();
                    })
                    .then(function (response) {
                        console.log(response);

                        // creating new array to set all tags in a single tag
                        var genreTag = []
                        for (var i = 0; i < response.genres.length; i++) {

                            genreTag.push(response.genres[i].name);
                        };

                        // joining array into a string
                        var genreNames = genreTag.join(', ');

                        // appending genre names
                        $('#show_Genre').append(`<p>${genreNames}</p>`);

                        // math to turn the runtime into hours and min. 
                        var totalMin = response.runtime
                        var hours = Math.floor(totalMin / 60);
                        var min = totalMin % 60;

                        // appending runtime into moviepage
                        $('#runTime').append(`<p>${hours}hr ${min}min<p>`);

                        // appending cast names
                        if (response.credits.cast[0]) {
                            $('#actor1').append(response.credits.cast[0].name).css('font-weight', 'bold');
                        } else { $('#actor1').append('no-cast').css('font-weight', 'bold'); }

                        if (response.credits.cast[1]) {
                            $('#actor2').append(response.credits.cast[1].name).css('font-weight', 'bold');
                        } else { $('#actor2').append('no-cast').css('font-weight', 'bold'); }

                        if (response.credits.cast[2]) {
                            $('#actor3').append(response.credits.cast[2].name).css('font-weight', 'bold');
                        } else { $('#actor3').append('no-cast').css('font-weight', 'bold'); }

                        if (response.credits.cast[3]) {
                            $('#actor4').append(response.credits.cast[3].name).css('font-weight', 'bold');
                        } else { $('#actor4').append('no-cast').css('font-weight', 'bold'); }

                        if (response.credits.cast[4]) {
                            $('#actor5').append(response.credits.cast[4].name).css('font-weight', 'bold');
                        } else { $('#actor5').append('no-cast').css('font-weight', 'bold'); }

                        if (response.credits.cast[5]) {
                            $('#actor6').append(response.credits.cast[5].name).css('font-weight', 'bold');
                        } else { $('#actor6').append('no-cast').css('font-weight', 'bold'); }


                        // appending characters the actors are playing. 
                        if (response.credits.cast[0]) {
                            $('#character1').append(response.credits.cast[0].character);
                        } else { }
                        if (response.credits.cast[1]) {
                            $('#character2').append(response.credits.cast[1].character);
                        } else { }
                        if (response.credits.cast[2]) {
                            $('#character3').append(response.credits.cast[2].character);
                        } else { }
                        if (response.credits.cast[3]) {
                            $('#character4').append(response.credits.cast[3].character);
                        } else { }
                        if (response.credits.cast[4]) {
                            $('#character5').append(response.credits.cast[4].character);
                        } else { }
                        if (response.credits.cast[5]) {
                            $('#character6').append(response.credits.cast[5].character);
                        } else { }


                        // appending movie actor poster
                        if (response.credits.cast[0]) {
                            $('#img_Actor1').append(`
                            <img src="https://www.themoviedb.org/t/p/w138_and_h175_face/${response.credits.cast[0].profile_path}" class="card-img-top" alt="..." onerror=this.src="./assets/images/altheadshot.jpg">
                             `);
                        } else {
                            $('#img_Actor1').append(`
                            <img src="./assets/images/altheadshot.jpg" class="card-img-top" >
                             `);
                        }

                        if (response.credits.cast[1]) {
                            $('#img_Actor2').append(`
                            <img src="https://www.themoviedb.org/t/p/w138_and_h175_face/${response.credits.cast[1].profile_path}" class="card-img-top" alt="..." onerror=this.src="./assets/images/altheadshot.jpg" >
                             `);
                        } else {
                            $('#img_Actor2').append(`
                            <img src="./assets/images/altheadshot.jpg" class="card-img-top" >
                             `);
                        }

                        if (response.credits.cast[2]) {
                            $('#img_Actor3').append(`
                            <img src="https://www.themoviedb.org/t/p/w138_and_h175_face/${response.credits.cast[2].profile_path}" class="card-img-top" alt="..." onerror=this.src="./assets/images/altheadshot.jpg"> 
                             `);
                        } else {
                            $('#img_Actor3').append(`
                            <img src="./assets/images/altheadshot.jpg" class="card-img-top" >
                             `);
                        }

                        if (response.credits.cast[3]) {
                            $('#img_Actor4').append(`
                            <img src="https://www.themoviedb.org/t/p/w138_and_h175_face/${response.credits.cast[3].profile_path}" class="card-img-top" alt="..." onerror=this.src="./assets/images/altheadshot.jpg">
                             `);
                        } else {
                            $('#img_Actor4').append(`
                            <img src="./assets/images/altheadshot.jpg" class="card-img-top" >
                             `);
                        }

                        if (response.credits.cast[4]) {
                            $('#img_Actor5').append(`
                            <img src="https://www.themoviedb.org/t/p/w138_and_h175_face/${response.credits.cast[4].profile_path}" class="card-img-top" alt="..." onerror=this.src="./assets/images/altheadshot.jpg" >
                             `);
                        } else {
                            $('#img_Actor5').append(`
                            <img src="./assets/images/altheadshot.jpg" class="card-img-top" >
                             `);
                        }

                        if (response.credits.cast[5]) {
                            $('#img_Actor6').append(`
                            <img src="https://www.themoviedb.org/t/p/w138_and_h175_face/${response.credits.cast[5].profile_path}" class="card-img-top" alt="..." onerror=this.src="./assets/images/altheadshot.jpg" >
                             `);
                        } else {
                            $('#img_Actor6').append(`
                            <img src="./assets/images/altheadshot.jpg" class="card-img-top" >
                             `);
                        }

                        // appending watch provider logo and name
                        if (response["watch/providers"].results.US) {

                            if (response["watch/providers"].results.US.flatrate) {
                                $('#platform_Name').append(`<h1 class ="is-size-5">${response["watch/providers"].results.US.flatrate[0].provider_name}</h1>`);

                                $('#platform_Logo').append(`
                         <img src="https://www.themoviedb.org/t/p/original${response["watch/providers"].results.US.flatrate[0].logo_path}"  alt="..." >
                          `);
                            } else { }

                            if (response["watch/providers"].results.US.ads) {
                                $('#platform_Name').append(`<h1 class ="is-size-5">${response["watch/providers"].results.US.ads[0].provider_name}</h1>`);

                                $('#platform_Logo').append(`
                         <img src="https://www.themoviedb.org/t/p/original${response["watch/providers"].results.US.ads[0].logo_path}"  alt="..." >
                          `);
                            } else { }

                            if (response["watch/providers"].results.US.rent) {
                                $('#platform_Name').append(`<h1 class ="is-size-5">${response["watch/providers"].results.US.rent[0].provider_name}</h1>`);

                                $('#platform_Logo').append(`
                         <img src="https://www.themoviedb.org/t/p/original${response["watch/providers"].results.US.rent[0].logo_path}"  alt="..." >
                          `);
                            } else { }
                        } else { $('#platform_Name').append(`<h1 class ="is-size-5">Not avaiable.</h1>`); }


                    });


            })

        })

};


randomMovie();
