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

    var userProfileSource = document.getElementById('user-profile-template').innerHTML,
        userProfileTemplate = Handlebars.compile(userProfileSource),
        userProfilePlaceholder = document.getElementById('user-profile');

    oauthSource = document.getElementById('oauth-template').innerHTML,
        oauthTemplate = Handlebars.compile(oauthSource),
        oauthPlaceholder = document.getElementById('oauth');

    var params = getHashParams();

    access_token = params.access_token,
        state = params.state,
        storedState = localStorage.getItem(stateKey);

    if (access_token && (state == null || state !== storedState)) {
        alert('Authentication error, please retry');
    } else {
        localStorage.removeItem(stateKey);
        if (access_token) {
            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function (response) {
                    userProfilePlaceholder.innerHTML = userProfileTemplate(response);
                    user = response.display_name
                    document.getElementById("user").value = user;
                    $('#login').hide();
                    $('#loggedin').show();
                    $('header').show();
                }
            });
        } else {
            $('#login').show();
            $('#loggedin').hide();
            $('header').hide();
        }

        if (document.querySelector("#login").style.display == "block") {

            window.addEventListener('load', function () {

                var client_id = 'f4d501136b224ab4b3827b1e63e3e047'; // Your client id
                var redirect_uri = 'http://localhost:8888'; // Your redirect uri

                var state = generateRandomString(16);

                localStorage.setItem(stateKey, state);
                var scope = 'user-read-private user-read-email playlist-modify-public playlist-modify-private';

                var url = 'https://accounts.spotify.com/authorize';
                url += '?response_type=token';
                url += '&client_id=' + encodeURIComponent(client_id);
                url += '&scope=' + encodeURIComponent(scope);
                url += '&redirect_uri=' + encodeURIComponent(redirect_uri);
                url += '&state=' + encodeURIComponent(state);

                window.location = url;
            }, false);
        }
    }
})();