//********KNOWN ISSUES/FEATURE REQUESTS******
//Maximum final playlist size limited to 100 songs, (50 from each input). Need to make multiple requests for largest playlists
//Add a feature to input more playlists
//find songs that match in playlists and automatically add them

// GLOBAL VARIABLES FOR AUTHENTICATION AND USERID, DEVELOPMENT ONLY. REPLACE WITH PROPER AUTHENTICATION FLOW
const oAuth = 'Bearer BQA9kUNeMGGmS-RM8O3DXz5-UlVKguLo5UjWXi6VEZ4zXLv_n_P2iCUtw5bZq7PxL_adAEgB7OYWrU6puZ7YCs5IgZaNZk4FZAeh_K9MOSxDzW4T7oRBm9x8dpLd2UM7iOVZnE9z4UYigGhx4qJyjkB-azdJLro5HZcHNZNOQ823eI8IK23xhNtJFLJf_y9EoJmkudF4'
const user = 'mknoel7'

//function that takes the input from form on submit, slices the unneeded parts and assigns to variable
async function playlistCombine() {
    const play1 = document.querySelector("#play1").value.slice(34, 56)
    const play2 = document.querySelector("#play2").value.slice(34, 56)

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

    //create a new playlist
    createPlaylist(user, trackList)
}

//function to get playlist from spotify API
async function playlistFetch(listname) {
    const response = await fetch('https://api.spotify.com/v1/playlists/' + listname + '/tracks', {
        method: 'GET',
        headers: {
            "Authorization": oAuth
        }
    })
    const tracks = await response.json()
    return tracks
}

//function to create a new playlist with spotify API
async function createPlaylist(userID, tracks) {
    const response = await fetch('https://api.spotify.com/v1/users/' + userID + '/playlists', {
        method: 'POST',
        headers: {
            "Authorization": oAuth
        },
        body: "{\"name\":\"Party Playlist\",\"description\":\"New playlist description\",\"public\":true}"
    })
    const data = await response.json()

    playlistID = data.href.slice(37, 59)
    addToPlaylist(playlistID, tracks)
}

//function to add new songs to the new playlist with spotify API
function addToPlaylist(playlistID, tracks) {
    fetch('https://api.spotify.com/v1/playlists/' + playlistID + '/tracks', {
        method: 'POST',
        headers: {
            "Authorization": oAuth
        },
        body: JSON.stringify({ "uris": tracks })
    })

}
