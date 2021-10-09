
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
            //display heading 
            document.querySelector("#selected-heading").style.display = 'block'
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
                if (selectedPlaylists.length == 0) {
                    document.querySelector("#selected-heading").style.display = 'none'
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

function newUser() {


    //Select form area on page
    const form = document.getElementById("form")
    const position = form.childElementCount;

    //counter variable
    const count = (form.childElementCount - 1) / 2

    if (count <= 5) {

        //create new input field
        const new_user = document.createElement("input")
        new_user.setAttribute("type", "text")
        new_user.setAttribute("name", `input_${count}`)
        new_user.setAttribute("id", `input_${count}`)
        //create new input label
        const new_label = document.createElement("label")
        new_label.textContent = `User #${count}`
        new_label.setAttribute("for", `input_${count}`)
        //insert mew field and label

        form.insertBefore(new_user, form.childNodes[position]);
        form.insertBefore(new_label, form.childNodes[position]);
    }
}

//   <label for="newplay">New playlist name: </label>

//function that takes the input from form on submit, slices the unneeded parts and assigns to variable
async function combinePlaylist() {
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
            "description": "New playlist description",
            "public": true
        })
    })
    const data = await response.json()
    playlistID = data.id
    alert('New playlist named "' + newplay + '" created for user: ' + userID)
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
