console.log("hello world");
let songs;
let currFolder;
let currentSong = new Audio();
let play = document.getElementById("play")
let next = document.getElementById("next")
let previous = document.getElementById("previous")

function secondsToMinutesAndSeconds(seconds) {
    // Calculate minutes and remaining seconds
    var minutes = Math.floor(seconds / 60);
    var remainingSeconds = Math.floor(seconds % 60);

    // Format the result with leading zeros
    var formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    var formattedSeconds = remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds;

    // Return the result in the desired format
    return formattedMinutes + ':' + formattedSeconds;
}

//when someone clik on ply btn then music is play
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    // let audio = new Audio("/songs/" + track);
    if (!pause) {
        let APlay = document.querySelector(".playNow").getElementsByTagName("img")[0];
        currentSong.play();
        play.src = "/images/paused.svg"
        APlay.src = "/images/paused.svg"
    }
    document.querySelector(".songInfo").innerHTML = decodeURI(track)
    document.querySelector(".songTime").innerHTML = "00:00 / 00:00"
}

//get all the songs
async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`${currFolder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {

            songs.push(element.href.split(`/${currFolder}/`)[1])
        }
    }

    //show all the songs in the playlist...
    let songUl = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li> 
                                <img class="inverted" src="images/music.svg" alt="Music">
                                <div class="info">
                                    <div>${song.replaceAll("%20", " ")}</div>
                                    <div class="songArtist">Priyam</div>
                                </div>
                                <div class="playNow">
                                    <span>Play Now</span>
                                    <img class="inverted"src="images/play2.svg" alt="play">
                                </div></li>`

    }

    //attach an event listner to each songs

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach((e) => {
        e.addEventListener("click", () => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
            // playIcon(e.querySelector(".info").firstElementChild.innerHTML);
        })

    });

    return songs
}

// display all the album on the page function...
async function displayAlbum() {
    let a = await fetch(`/songs`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchor = div.getElementsByTagName("a");
    let cardContainer = document.querySelector('.cardContainer')
    let array = Array.from(anchor)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            // get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `
            <div data-folder="${folder}" class="card bodr-rad">
                <div class="play">
                    <img src="images/play.svg" alt="play">
                </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${response.title}</h2>
                <p>${response.discription}</p>
            </div>`

        }
    }
}

//start main function
async function main() {
    //get the song list form all song
    songs = await getSongs("songs/all");
    playMusic(songs[0], true)

    //Display all the album on the page...
    await displayAlbum();

    //attach an event listner to play 
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "/images/paused.svg"
        } else {
            currentSong.pause();
            play.src = "/images/play2.svg";
        }
    })

    //listen for time update event
    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".songTime").innerHTML = `${secondsToMinutesAndSeconds(currentSong.currentTime)} / ${secondsToMinutesAndSeconds(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";


    })

    //add a event listener to seekbar

    document.querySelector(".seekbar").addEventListener("click", (e) => {

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";

        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    //add a event listner to menu btn

    document.querySelector(".menu").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    document.querySelector(".cancel").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-122%"
    })

    //add a event listner to previous and next

    previous.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
            console.log("previous")
        } else {
            playMusic(songs[songs.length - 1])
        }

    })

    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
            console.log("next")
        } else {
            playMusic(songs[0])
        }
    })

    //add event listner to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to " + e.target.value + " out of 100")
        currentSong.volume = parseInt(e.target.value) / 100

    })

    //load the playlist whenever the card was clicked...

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async (iteam) => {
            songs = await getSongs(`songs/${iteam.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
        
    })

    //add event listner to the muted the track
    document.querySelector('.volume>img').addEventListener("click", (e) => {
        if (e.target.src.includes("/images/volume.svg")) {
            e.target.src = e.target.src.replace("/images/volume.svg", "/images/muted.svg");
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        } else {
            e.target.src = e.target.src.replace("/images/muted.svg", "/images/volume.svg");
            currentSong.volume = 0.5;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 50

        }

    })

}

main();
