console.log("Lets start javaScript");
let currentSong = new Audio();
let songs;
let currentFolder;
function convertSecondsToMinSec(seconds) {
    // Round the seconds to the nearest whole number
    seconds = Math.round(seconds);

    // Calculate minutes and remaining seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Pad single digits with a leading zero
    const paddedMinutes = String(minutes).padStart(2, '0');
    const paddedSeconds = String(remainingSeconds).padStart(2, '0');

    // Return formatted time
    return `${paddedMinutes}:${paddedSeconds}`;
}
async function getSongs(folder){
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    currentFolder = folder;
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for(let index = 0;index<as.length;index++){
        const element = as[index];
        if(element.href.endsWith(".mp3")){
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }
    //show all songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for(const song of songs){
        songUL.innerHTML = songUL.innerHTML + `
        <li>
                            <img src = "images/music.svg"class = "invert icon-size" >
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                            </div>
                            <div class="playNow">
                                <span>Play</span>
                                <img src = "images/play_logo.svg" class = "invert icon-size" >
                            </div>
        </li>`;
    }
    //Attach an event listener to every song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click",element=>{
            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    }); 
}
const playMusic = (track , pause = false)=>{
    currentSong.src = `/${currentFolder}/` + track;
    if(!pause){
        currentSong.play();
        play.src = "images/pause_logo.svg";
    }
    document.querySelector(".songInfo").innerHTML = track;
    document.querySelector(".songTime").innerHTML = "0:00 / 0:00";
};

async function displayAlbums(){
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let cardContainer = document.querySelector(".cardContainer");
    let anchors = div.getElementsByTagName("a");
    let array = Array.from(anchors)
    for(index = 0;index<array.length;index++){
        const e = array[index];
        if(e.href.includes("/songs")){
            let folder = e.href.split("/").slice(-2)[0];
            //get the meta data of the respective folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <i class="fa-solid fa-play icon-size"></i>
                        </div>
                        <img src = "/songs/${folder}/cover.jpeg" alt = "">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
        }
    };
     //load the playlist whenever card is clicked
     Array.from(document.getElementsByClassName("card")).forEach(e=>{
        console.log(e);
        e.addEventListener("click",async item=>{
            console.log(item, item.currentTarget.dataset);
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
        });
    });

    //add eventlistener to prev present and next
    play.addEventListener("click",()=>{
        if(currentSong.paused){
            currentSong.play();
            play.src = "images/pause_logo.svg";
        }
        else{
            currentSong.pause();
            play.src = "images/play_logo.svg";
        }
    });
}

async function main(){
    await getSongs("songs/animal");
    playMusic(songs[0],true);
    //display all the albums on the page
    displayAlbums();
    
    
    //listen for timeupdate event
    currentSong.addEventListener("timeupdate",()=>{
        console.log(currentSong.currentTime,currentSong.duration);
        document.querySelector(".songTime").innerHTML = `${convertSecondsToMinSec(currentSong.currentTime)}:${convertSecondsToMinSec(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    //add an eventlistener to seekbar
    document.querySelector(".seekBar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration*percent)/100;
    });

    //add an event listener to hamburger
    document.querySelector(".hamBurger").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "0%";
    });

     //add an event listener to close button
     document.querySelector(".close").addEventListener("click",()=>{
        document.querySelector(".left").style.left = "-120%";
    });

    //add an event listener to previous button
    previous.addEventListener("click",()=>{
        console.log("Prev clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if((index - 1) >= 0){
            playMusic(songs[index-1]);
        }
    });

    //add an event listener to next button
    next.addEventListener("click",()=>{
        console.log("Next clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if((index + 1)<= songs.length - 1){
            playMusic(songs[index+1]);
        }
    });

    //add eventlistener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
        console.log(e,e.target,e.target.value);
        currentSong.volume = parseInt(e.target.value)/100;
        if(currentSong.volume == 0){
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "/images/mute_logo.svg";
        }
        else{
            document.querySelector(".volume").getElementsByTagName("img")[0].src = "/images/volume_logo.svg";
        }
    });

    
   
}        
main();