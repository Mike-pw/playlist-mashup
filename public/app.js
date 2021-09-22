
//remove beginning of hash fragment / query string
const hash = window.location.hash.substring(14)

//remove end of hash fragment / query string
const auth = "Bearer " + hash.substring(0, hash.indexOf('&'))

//function that takes the input from form on submit, slices the unneeded parts and assigns to variable
async function playlistCombine() {
    const play1 = document.querySelector("#play1").value.slice(34, 56)
    const play2 = document.querySelector("#play2").value.slice(34, 56)
    const user = document.getElementById('display-name').textContent

    //call the playlist fetch function for each input playlist
    const playlist1 = await playlistFetch(play1)
    const playlist2 = await playlistFetch(play2)

    //empty array for final tracklist
    let trackList = []

    //check if playlist2 is shortest (or lengths equal)
    if (playlist1.items.length >= playlist2.items.length) {
        //use playlist2's length as the counter for loop
        for (x in playlist2.items) {
            //combine track lists one at a time
            trackList.push('spotify:track:' + playlist1.items[x].track.id)
            trackList.push('spotify:track:' + playlist2.items[x].track.id)
        }
    } else {
        //use playlist1's length as the counter for loop
        for (x in playlist1.items) {
            //combine track lists one at a time
            trackList.push('spotify:track:' + playlist1.items[x].track.id)
            trackList.push('spotify:track:' + playlist2.items[x].track.id)
        }
    }

    //create a new playlist, and add new songs to playlist
    createPlaylist(user, trackList)
}

//function to get playlist from spotify API
async function playlistFetch(listname) {
    const response = await fetch('https://api.spotify.com/v1/playlists/' + listname + '/tracks', {
        method: 'GET',
        headers: {
            "Authorization": auth
        }
    })
    const tracks = await response.json()
    return tracks
}

//function to create a new playlist with spotify API
async function createPlaylist(userID, tracks) {
    const newplay = document.querySelector("#newplay").value
    const response = await fetch('https://api.spotify.com/v1/users/' + userID + '/playlists', {
        method: 'POST',
        headers: {
            "Authorization": auth
        },
        body: JSON.stringify({
            "name": newplay,
            "description": "New playlist description",
            "public": true
        })
    })
    const data = await response.json()
    userName = data.owner.display_name
    playlistID = data.id

    alert('New playlist named "' + newplay + '" created for user: ' + userName)

    addToPlaylist(playlistID, tracks)
}

//function to add new songs to the new playlist with spotify API
function addToPlaylist(playlistID, tracks) {
    fetch('https://api.spotify.com/v1/playlists/' + playlistID + '/tracks', {
        method: 'POST',
        headers: {
            "Authorization": auth
        },
        body: JSON.stringify({ "uris": tracks })
    })
}
