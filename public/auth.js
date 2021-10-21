let user
let access_token

(function () {

    var stateKey = 'spotify_auth_state';

    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    /**
     * Generates a random string containing numbers and letters
     * @param  {number} length The length of the string
     * @return {string} The generated string
     */
    function generateRandomString(length) {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (var i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    var params = getHashParams();
    //var redirect_uri = 'https://playlistmashup.com/'; //PRODUCTION
    var redirect_uri = 'http://localhost:8888/'; //DEVELOPMENT

    access_token = params.access_token,
        state = params.state,
        storedState = localStorage.getItem(stateKey);

    async function request() {
        const response = await fetch("https://api.spotify.com/v1/me", {
            method: 'GET',
            headers: {
                "Authorization": "Bearer " + access_token
            }
        })
        const data = await response.json()
        user = data.display_name
        document.getElementById("user").value = user;
        document.querySelector("#login").style.display = "none"
        document.querySelector("#loggedin").style.display = "block"
        displayPlaylists()
    }

    if (access_token && (state == null || state !== storedState)) {
        alert('Authentication error, please retry');
        window.location = redirect_uri
    } else {
        localStorage.removeItem(stateKey);
        if (access_token) {
            request()
        } else {
            document.querySelector("#loggedin").style.display = "none"
            document.querySelector("#login").style.display = "block"
        }

        document.querySelector("#login-button").addEventListener('click', function () {

            var client_id = 'f4d501136b224ab4b3827b1e63e3e047'; // Your client id

            var state = generateRandomString(16);

            localStorage.setItem(stateKey, state);
            var scope = 'playlist-read-private playlist-read-collaborative playlist-modify-public playlist-modify-private';

            var url = 'https://accounts.spotify.com/authorize';
            url += '?response_type=token';
            url += '&client_id=' + encodeURIComponent(client_id);
            url += '&scope=' + encodeURIComponent(scope);
            url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
            url += '&state=' + encodeURIComponent(state);

            window.location = url;
            document.querySelector("#login").style.display = "none"
        }, false);

    }
})();