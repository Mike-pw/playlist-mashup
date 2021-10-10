
const selectedPlaylists = []

//function to get playlist from spotify API
async function getPlaylists(user) {
    const response = await fetch(`https://api.spotify.com/v1/users/${user}/playlists`, {
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + access_token
        }
    })
    const data = await response.json()
    const playlists = data.items
    return playlists
}

//function to display users playlists
async function displayPlaylists() {
    //display playlists
    document.querySelector("#playlists").style.display = 'block'
    const user = document.querySelector("#user").value;
    const lists = await getPlaylists(user)
    const ol = document.querySelector("#playlists")
    //empty out previous playlists when user is switched
    while (ol.firstChild) { ol.removeChild(ol.firstChild) }
    //loop over all the playlists for selected user
    for (x in lists) {
        const li = document.createElement("li")
        const a = document.createElement("a")

        const listName = lists[x].name
        const listID = lists[x].id

        a.innerHTML = listName
        //add event listener to handle selected playlists
        a.addEventListener("click", function selectPlaylist() {
            //display heading when first playlist added
            if (selectedPlaylists.length == 0) {
                document.querySelector("#selected").style.display = 'block'
            }
            //display form inputs and submit button when second playlist added
            if (selectedPlaylists.length == 1) {
                document.querySelector("#generate").style.display = 'block'
            }
            //send playlist name and ID to selectedPlaylists array
            const newPlaylistObject = { name: listName, id: listID }
            selectedPlaylists.push(newPlaylistObject);

            const ol = document.querySelector("#selected-playlists")
            const li = document.createElement("li")

            const cancel = document.createElement("a")
            cancel.innerHTML = "X"
            cancel.setAttribute("class", "cancel")
            cancel.addEventListener('click', function cancelPlaylist() {
                this.parentNode.remove()
                selectedPlaylists.splice(selectedPlaylists.indexOf(newPlaylistObject), 1)
                //hide generate form if no playlists are selected
                if (selectedPlaylists.length == 0) {
                    document.querySelector("#generate").style.display = 'none'
                }
                //hide heading if no playlists are selected
                if (selectedPlaylists.length == 0) {
                    document.querySelector("#selected").style.display = 'none'
                }
            })
            li.innerHTML = listName
            li.appendChild(cancel)
            ol.appendChild(li)
        })
        li.appendChild(a)
        ol.appendChild(li)
    }
}

//function to get playlist from spotify API
async function playlistFetch(listname) {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${listname}/tracks`, {
        method: 'GET',
        headers: {
            "Authorization": "Bearer " + access_token
        }
    })
    const tracks = await response.json()
    return tracks
}

//function to combine all playlists
async function combinePlaylist() {

    //call the playlist fetch function for each input playlist

    //make nested array of tracklists for all playlists
    const combinedPlaylists = []
    for (x in selectedPlaylists) {
        const results = await playlistFetch(selectedPlaylists[x].id)
        const tracks = []
        combinedPlaylists.push(tracks)
        for (y in results.items) {
            tracks.push(results.items[y].track.uri)
        }
    }

    //Find the length of the shortest playlist and assign to variable
    const lengths = []
    let minLength
    // NEED TO COMPLETE MINIMUM LENGTH AND MAKE SHUFFLING RANDOM (DEAL ONE SONG FROM EACH PLAYLIST RANDOMLY)
    for (x in combinedPlaylists) {
        lengths.push(combinedPlaylists[x].length)
        minLength = Math.min(...lengths)
    }

    //combine the playlists randomly, removing from combinedPlaylists so no doubles
    let trackList = []
    let i = 0
    while (i < minLength) {
        for (x in combinedPlaylists) {
            const index = Math.floor(Math.random() * combinedPlaylists[x].length)
            trackList.push(combinedPlaylists[x][index])
            combinedPlaylists[x].splice(index, 1)
        }
        i++
    }





    //create a new playlist, and add new songs to playlist
    createPlaylist(user1, trackList)
}

//function to create a new playlist with spotify API
async function createPlaylist(user, tracks) {
    const newplay = document.querySelector("#newplay").value
    const response = await fetch(`https://api.spotify.com/v1/users/${user}/playlists`, {
        method: 'POST',
        headers: {
            "Authorization": "Bearer " + access_token
        },
        body: JSON.stringify({
            "name": newplay,
            "description": "Created by Playlist Combine",
            "public": true
        })
    })
    const data = await response.json()
    playlistURL = data.external_urls.spotify
    userName = data.owner.display_name
    playlistID = data.id

    playlistURL = data.external_urls.spotify
    const urlLink = document.querySelector("#playlist-url")
    urlLink.textContent = "Link to New Playlist"
    urlLink.href = playlistURL

    alert('New playlist named "' + newplay + '" created for user: ' + userName)
    addToPlaylist(playlistID, tracks)
}

//function to add new songs to the new playlist with spotify API
function addToPlaylist(playlistID, tracks) {
    fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
        method: 'POST',
        headers: {
            "Authorization": "Bearer " + access_token
        },
        body: JSON.stringify({ "uris": tracks })
    })
}
