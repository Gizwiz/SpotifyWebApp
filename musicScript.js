var searchType = "artist";

function checkForEnterKey(event){
	//check for enter key
	'use strict';
	
	if(event.keyCode === 13){
		//if enter key, search for data
		searchForEnteredData();	
	}
	
}

function selectSearchType(type){
	'use strict';
	
	var artist = document.getElementById("artist");
	var album = document.getElementById("album");
	var song = document.getElementById("track");
	
	//CHANGE CSS OF ACTIVE TYPE SEARCH TYPE BY ID
	//FADE NON-SELECTED CSS TYPES
	if(type === "artist"){
		artist.style.color = "white";
		album.style.color = "inherit";
		song.style.color = "inherit";
		searchType = "artist";
	}
	else if (type === "album"){
		artist.style.color = "inherit";
		album.style.color = "white";
		song.style.color = "inherit";
		searchType = "album";
	}
	else {
		artist.style.color = "inherit";
		album.style.color = "inherit";
		song.style.color = "white";
		searchType = "track";
	}

}

function searchForEnteredData(){
	
	'use strict';
	
	//replace spaces of search bar's information with + signs
	var searchTerm = document.getElementById("searchBar").value.split(' ').join('+');
	document.getElementById("searchBar").value = "";
	
	
	//if search is empty or null
	if(searchTerm === "" || searchTerm === " " ||searchTerm === null){
		document.getElementById("albumPadding").innerHTML = "<div class=\"col-lg-12\"><h1>Please enter a search term.</h1></div>";
	} else {
		//send ajax request	
		sendXMLHttpRequest(searchTerm, searchType);	
	}
	
}


function sendXMLHttpRequest(searchTerm, type){
	
	'use strict';
	
	//clear information display area
	document.getElementById("albumPadding").innerHTML = "";
	
	//set url
	//searchTerm is what was searched for, type is artist/album/track depending on what was selected
	var URL = "https://api.spotify.com/v1/search?q="+searchTerm+"&limit=20&type="+type;
	
	var xmlhttp = new XMLHttpRequest();

	xmlhttp.open("GET", URL, true);
	xmlhttp.send();

	xmlhttp.onreadystatechange = function(){

		//if everything is okay
		if(xmlhttp.readyState === 4 && xmlhttp.status === 200){
			
			var data = JSON.parse(xmlhttp.responseText); //json
			
			//SEARCH TYPE IS ARTIST
			if(type === "artist"){
				
				displayArtistsData(data);

			}
			
			//SEARCH TYPE ALBUM
			else if(type === "album"){
				
				displayAlbumsData(data);
					
				}
			
			//SEARCH TYPE TRACK
			else if(type === "track"){
				
				displayTrackData(data);
				
			}
			
			//SEARCH TYPE NULL OR UNIDENTIFIED
			else  {
				//nothing was found message
				document.getElementById("albumPadding").innerHTML = "<div class=\"col-lg-12\"><h1>Nothing was found.</h1></div>";
			}

		}
		
	}
}

function sendXMLHttpRequestWithId(searchTerm, type, id, albumImg){
	
	//searches for tracks of a certain album with a provded id. Called in searchForClickedInformation().
	
	'use strict';
	
	//clear area
	document.getElementById("albumPadding").innerHTML = "";
	//clear search bar
	document.getElementById("searchBar").value = "";
	//set url
	var URL = "https://api.spotify.com/v1/albums/"+id+"/tracks";
	
		var xmlhttp = new XMLHttpRequest();

	xmlhttp.open("GET", URL, true);

	xmlhttp.send();

	xmlhttp.onreadystatechange = function(){

		//if everything is okay
		if(xmlhttp.readyState === 4 && xmlhttp.status === 200){
			
			var data = JSON.parse(xmlhttp.responseText); //JSON
			
			//gets an album's tracks using the id
			displayTrackDataWithId(data, albumImg);
			
		}
	}
	
}

function displayArtistsData(data){
	
	/*DISPLAYS FOUND ARTIST DATA ON PAGE*/

	var artistNamesArray = []; //used for small screens where there is space width-wise for full names

	var artistName = ""; 
	var artistId = "";
	var artistImg = "";
	var artistFollowers = "";
	var spotifyId = "";
	
	if(data.artists.items.length != 0){
	//for loop to iterate through json data
		for(var i = 0; i<data.artists.items.length; i++){
			//push artist name into array
			artistNamesArray.push( data.artists.items[i].name );

			//shortens length of string if over a character limit, else keep full name
			if(artistNamesArray[i].length > 36){
				artistName = (artistNamesArray[i].substring(0,36)+"...");
			} else {
				artistName = artistNamesArray[i];	
			}

			//set artistId
			artistId = data.artists.items[i].name;

			//try to set img url, catch error and use defaul img instead
			try{
			artistImg = data.artists.items[i].images[1].url;
			} catch (error){
			artistImg = "images/albumCoverDefault2.jpg";	
			}

			//set artistFollowers
			artistFollowers = data.artists.items[i].followers.total;
			//set spotify id
			spotifyId = data.artists.items[i].id;
			//if artist has unkown followers, set to show n/a instead of null
			if(artistFollowers == null){
				artistFollowers = "n/a";	
			}

			//create div for information
			document.getElementById("albumPadding").innerHTML += "<div class=\"col-lg-4\" name=\""+artistName+"\" id=\""+spotifyId+"\"><img class=\"img-responsive\" src="+artistImg+"> <p><strong>"+ artistName +"</strong><br>"+artistFollowers+" Followers</p></div>";	
			//fade all of them out instantly
			$(".col-lg-4").fadeOut(0);

		}
	} else {
		document.getElementById("albumPadding").innerHTML = "<div class=\"col-lg-12\"><h1>Nothing was found.</h1></div>";
	}

	//loop through every .col-lg-4
	$(".col-lg-4").each(function(index) {
		//adds click eventListeners to every single .col-lg-4 it finds, passing the album name to getInformation function
		$(this)[0].addEventListener("click", function() {searchForClickedInformation( $(this).attr('name'), "artist", $(this).attr('id') );	}, false);
		//every .col-lg-4, fade in at x ms speed and y*index delay
		$(this).delay(125*index).fadeIn(400);
	});	

}

function displayAlbumsData(data){

	/*DISPLAYS FOUND ALBUM DATA ON PAGE*/
	
	//JSON DATA EXAMPLE FOR PARSING
	// https://api.spotify.com/v1/search?query=Springsteen&offset=0&limit=20&type=album

	var albumNamesArray = []; //used for small screens where there is space width-wise for full names
	var albumName = ""; 
	var albumId = "";
	var albumImg = "";
	var artistName = "";
	var spotifyId = "";
	
	if(data.albums.items.length != 0){
		for(var i = 0; i<data.albums.items.length; i++){

			albumNamesArray.push( data.albums.items[i].name );

			//shortens length of string if over a character limit, else keep full name
			if(albumNamesArray[i].length > 36){
				albumName = (albumNamesArray[i].substring(0,36)+"...");
			} else {
				albumName = albumNamesArray[i];	
			}

			//albumName = data.albums.items[i].name;

			try{
				albumImg = data.albums.items[i].images[1].url;
			} catch (error) {
				albumImg = "images/albumCoverDefault2.jpg";
			}

			var spotifyId = data.albums.items[i].id;
			var artistName = data.albums.items[i].artists[0].name;
			
			//create div for information
			document.getElementById("albumPadding").innerHTML += "<div class=\"col-lg-4\" name=\""+albumImg+"\" id=\""+spotifyId+"\"><img class=\"img-responsive\" src="+albumImg+"> <p><strong>"+ albumName +"</strong><br>"+artistName+"</p></div>";

			$(".col-lg-4").fadeOut(0);

		}
	} else {
	   		
			document.getElementById("albumPadding").innerHTML = "<div class=\"col-lg-12\"><h1>Nothing was found.</h1></div>";
		
	   }


	$(".col-lg-4").each(function(index) {
			//adds click eventListeners to every single .col-lg-4 it finds, passing the album name to getInformation function
			$(this)[0].addEventListener("click", function() {searchForClickedInformation(  $(this).attr('name'), "album", $(this).attr('id') ); }, false);
			//loop through every .col-lg-4, fade in at x ms speed and y*index delay
			$(this).delay(125*index).fadeIn(400);
		});

	
}

function displayTrackData(data){

	var trackNamesArray = [];
	var albumNamesArray = [];
	var artistNamesArray = [];
	var trackName = "";
	var trackNumber = "";

	var duration = ""; //ms
	var artistName = "";
	var albumName = "";
	var albumImg = "";
	var spotifyId = "";
	
	try{
		albumImg = data.tracks.items[i].album.images[1].url;
	} catch (error){
		albumImg = "images/albumCoverDefault2.jpg";	
	}

	//show search results
	document.getElementById("albumPadding").innerHTML += "";
	if(data.tracks.items.length != 0){
		for(var i = 0; i< data.tracks.items.length; i++){
			
			//json data handling
			trackName = data.tracks.items[i].name;
			trackNumber = data.tracks.items[i].track_number;
			explicit = data.tracks.items[i].explicit;
			duration = data.tracks.items[i].duration_ms;
			artistName = data.tracks.items[i].artists[0].name;
			albumName = data.tracks.items[i].album.name;
			spotifyId = data.tracks.items[i].album.id;
			
			//try to get image, catch error and use defualt image instead
			try{
				albumImg = data.tracks.items[i].album.images[1].url;
			} catch (error){
				albumImg = "images/albumCoverDefault2.jpg";	
			}

			trackNamesArray.push( trackName );
			artistNamesArray.push( artistName);
			albumNamesArray.push( albumName );
			
			//string shortenings
			if(trackNamesArray[i].length > 25){
				trackName = (trackNamesArray[i].substring(0,36)+"...");
			} else {
				trackName = trackNamesArray[i];	
			}

			if(artistNamesArray[i].length > 25){
				artistName = (artistNamesArray[i].substring(0,36)+"...");
			} else {
				artistName = artistNamesArray[i];	
			}

			if(albumNamesArray[i].length > 25){
				albumName = (albumNamesArray[i].substring(0,36)+"...");
			} else {
				albumName = albumNamesArray[i];	
			}
			
			//creates information to show
			document.getElementById("albumPadding").innerHTML += "<div class=\"col-lg-4\" name=\""+albumImg+"\"  id=\""+spotifyId+"\"><img class=\"img-responsive\" src="+albumImg+"> <p><strong>"+ trackName +"</strong><br>"+artistName+"<br><i>"+albumName+"</i></p></div>";
			$(".col-lg-4").fadeOut(0);
		}
	} else {
		//nothing was found
		document.getElementById("albumPadding").innerHTML = "<div class=\"col-lg-12\"><h1>Nothing was found.</h1></div>";
	}
	
		$(".col-lg-4").each(function(index) {
			//adds click eventListeners to every single .col-lg-4 it finds, passing the album name to getInformation function
			$(this)[0].addEventListener("click", function() {searchForClickedInformation(  $(this).attr('name'), "album", $(this).attr('id') ); }, false);
			//loop through every .col-lg-4, fade in at x ms speed and y*index delay
			$(this).delay(125*index).fadeIn(400);
		});
	
}

function displayTrackDataWithId(data, albumImg){
	
	//Displays data of certain album that was searched for with an id.
	//Called in searchForClickedInformation() -> sendXMLHttpRequestWithId(searchTerm, "track", id);
	

	//variables
	var trackName = "";
	var trackNumber = "";
	var explicit = "";
	var duration = ""; //ms
	var artistName = "";
	var albumName = "";
	var whitespaces = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	var explicit = "";
	var audioPlayer;
	artistName = data.items[0].artists[0].name;
	albumName = data.items[0].name;
	
	//creates album information
	document.getElementById("albumPadding").innerHTML += "<div class=\"row\"><div class=\"col-xs-2\"></div><div class=\"col-xs-8\"><div class=\"col-xs-6\"><img class=\"img-responsive\"src="+albumImg+"></div><div class=\"col-xs-6\"><h1><strong>"+artistName+"</strong></h1><br><h3>"+albumName+"</h3></div></div><div class=\"col-xs-2\"></div></div>";
	
	//if something was found
	if(data.items.length != 0){
		for(var i = 0 ; i<data.items.length; i++){
			trackName = data.items[i].name;
			duration = data.items[i].duration_ms;

			//format duration to mm:ss using date
			var date = new Date(duration);
			var min = date.getMinutes();
			var sec = date.getSeconds();

			if(min<10){
				min = "0"+min;	
			}
			if(sec<10){
				sec = "0"+sec;	
			}
			var time = min+":"+sec;
			
			//check if explicit
			explicit = data.items[i].explicit;
			
			//if explicit change to ecplicit else change to empty string and display nothing
			if(explicit){
				explicit = "(Explicit)";	
			} else {
				explicit = "";	
			}
			
			//creates audioPlayer with url as source
			audioPlayer = createAudioPlayer((data.items[i].preview_url));

			//creates information to show
			document.getElementById("albumPadding").innerHTML += "<div class=\"row\"><div class=\"col-xs-2\"></div><div class=\"col-xs-8\"><p>"+trackName+whitespaces+time+whitespaces+explicit+whitespaces+audioPlayer+"</p></div><div class=\"col-xs-2\"></div></div>";
			$(".col-xs-8").fadeOut(0);
		}
	} else {
		//create nothing was found message
		document.getElementById("albumPadding").innerHTML = "<div class=\"col-lg-12\"><h1>Nothing was found.</h1></div>";	
	}
			//loop
			$(".col-xs-8").each(function(index) {
			//loop through every .col-lg-4, fade in at x ms speed and y*index delay
			$(this).delay(125*index).fadeIn(400);
		});
}

function createAudioPlayer(source){

	//creates audio player
	var player = "<audio controls><source src=\""+source+"\" type=\"audio/mp3\"</audio>";
	return player;
}

function searchForClickedInformation(information, type, id){

	'use strict';
	//this function receives information and uses it to forward the user to another place
	//ie if the user clicks on an artist, it will automatically search for that artist's albums
	//if albums have been searched, it will display the songs of the album
	
	var URL;
	
	//replace spaces with + signs
	var searchTerm = information.split(' ').join('+');
	
	//opens albums. This is performed with the sendXMLHttpRequest(searchFor) function that is used by the search button.
	if(type === "artist"){
		//send new xmlhttprequest with album as type
		
		sendXMLHttpRequest(searchTerm, "album");

	}
	
	else if(type === "album"){
		//ajax with id
		sendXMLHttpRequestWithId(searchTerm, "track", id, information);
		
	}

	
}

		
	

