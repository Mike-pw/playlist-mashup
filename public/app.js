
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
        const trackCount = lists[x].tracks.total

        //truncate long playlist names
        function truncatePlaylist(playlist) {
            if (playlist.length > 25) {
                return playlist.slice(0, 25) + "..."
            } else {
                return playlist
            }
        }
        a.innerHTML = truncatePlaylist(listName)

        //add event listener to handle selected playlists
        a.addEventListener("click", function selectPlaylist() {
            //add heading when playlist is selected
            document.querySelector("#selected-heading").style.display = 'block'
            //display form inputs and submit button when second playlist added
            if (selectedPlaylists.length == 1) {
                document.querySelector("#generate").style.display = 'block'
            }
            //send playlist name and ID to selectedPlaylists array
            const newPlaylistObject = { name: listName, id: listID, count: trackCount }
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
                if (selectedPlaylists.length == 1) {
                    document.querySelector("#generate").style.display = 'none'
                }
                //hide generate form if no playlists are selected
                if (selectedPlaylists.length == 0) {
                    document.querySelector("#selected-heading").style.display = 'none'
                }
            })
            li.innerHTML = truncatePlaylist(listName)
            li.appendChild(cancel)
            ol.appendChild(li)
        })
        li.appendChild(a)
        ol.appendChild(li)
    }
}

//function to get playlist from spotify API
async function playlistFetch(listname, offset) {
    const response = await fetch(`https://api.spotify.com/v1/playlists/${listname}/tracks?offset=${offset}`, {
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
        const listID = selectedPlaylists[x].id
        const maxCount = Math.ceil(selectedPlaylists[x].count / 100)
        let count = 0
        const tracks = []
        while (count < maxCount) {
            let data = await playlistFetch(listID, count * 100)
            for (y in data.items) {
                tracks.push(data.items[y].track.uri)

            }
            count++
        }
        combinedPlaylists.push(tracks)
    }


    //Find the length of the shortest playlist and assign to variable
    const lengths = []
    let minLength
    // NEED TO COMPLETE MINIMUM LENGTH AND MAKE SHUFFLING RANDOM (DEAL ONE SONG FROM EACH PLAYLIST RANDOMLY)
    for (x in combinedPlaylists) {
        lengths.push(combinedPlaylists[x].length)
        minLength = Math.min(...lengths)
    }

    //if a song appears more than once in any two playlists, automatically add it
    let trackList = combinedPlaylists.reduce((a, b) => a.filter(c => b.includes(c)))


    //combine the playlists randomly, removing from combinedPlaylists so no doubles
    let i = 0
    while (i < minLength) {
        for (x in combinedPlaylists) {
            const index = Math.floor(Math.random() * combinedPlaylists[x].length)
            trackList.push(combinedPlaylists[x][index])
            combinedPlaylists[x].splice(index, 1)
        }
        i++
    }
    //remove any duplicates
    const uniqueTrackList = [...new Set(trackList)]

    //create a new playlist, and add new songs to playlist
    createPlaylist(user, uniqueTrackList)
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
            "description": "Created by Playlist Mashup",
            "public": true
        })
    })
    const data = await response.json()
    playlistURL = data.external_urls.spotify
    userName = data.owner.display_name
    playlistID = data.id

    playlistURL = data.external_urls.spotify
    window.location = playlistURL

    alert('New playlist named "' + newplay + '" created for user: ' + userName)

    //make multiple requests if more than 100 songs to be added
    //addToPlaylist(playlistID, tracks.slice(0, 100))

    const repeat = Math.ceil(tracks.length / 100)
    let i = 0
    while (i < (repeat - 1)) {
        await addToPlaylist(playlistID, tracks.slice(i * 100, (i + 1) * 100))
        i++
    }
    await addToPlaylist(playlistID, tracks.slice(i * 100, tracks.length))
}

//function to add new songs to the new playlist with spotify API
async function addToPlaylist(playlistID, tracks) {
    await fetch(`https://api.spotify.com/v1/playlists/${playlistID}/tracks`, {
        method: 'POST',
        headers: {
            "Authorization": "Bearer " + access_token
        },
        body: JSON.stringify({ "uris": tracks })
    })
}
