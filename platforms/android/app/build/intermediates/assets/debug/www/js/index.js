var map;
$.mobile.changePage("#three");
$.mobile.changePage("#one");

var db = null;
function remplirListe(){
	db.executeSql('SELECT rowid, * FROM pointsInteret', [],
		function(res) {
			for(var i = 0; i < res.rows.length; i++) {
				console.log(res.rows.item(i).rowid+" "+res.rows.item(i).nom);
				
				var strhtml = '<li><a href ="#two" data-nom="';
				strhtml += res.rows.item(i).nom;
				strhtml += '" data-description="';
				strhtml += res.rows.item(i).description;
				strhtml += '" data-gpslat="';
				strhtml += res.rows.item(i).gpslat;
				strhtml += '" data-gpslng="';
				strhtml += res.rows.item(i).gpslng;
				strhtml += '" data-rowid="';
				strhtml += res.rows.item(i).rowid;
				strhtml += '">';
				strhtml += res.rows.item(i).nom;
				strhtml += ' - ';
				strhtml += res.rows.item(i).description;
				strhtml += ' ';
				strhtml += res.rows.item(i).gpslat;
				strhtml += ' ';
				strhtml += res.rows.item(i).gpslng;
				strhtml += '</a></li>';
				
				//Ajouter la chaine à la liste
				$("#listeLieux").append(strhtml);
			}
			
			//Rafraichir graphiquement la liste
			$("#listeLieux").listview("refresh");
			
			//Ajouter la commande clic
			$("#listeLieux a").click(clicListe);			
		},
		function(error) {
			console.log('SELECT SQL statement ERROR: ' + error.message);
		}
	);
};

document.addEventListener('deviceready', function() {
  db = window.sqlitePlugin.openDatabase({
    name: 'pointsInteret.db',
    location: 'default',
  });
  db.transaction(function(tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS pointsInteret (nom TEXT, description TEXT, gpslat FLOAT, gpslng FLOAT)');
	}, function(error) {
		console.log('Transaction ERROR: ' + error.message);
	}, function() {
		console.log('Create database OK');
		
		db.transaction(function(tx) {
			tx.executeSql('INSERT INTO pointsInteret VALUES(?,?,?,?)' , ["toto","totodescription", 47.5, 127.5]);
		}, function(error) {
			console.log('Transaction ERROR: ' + error.message);
		}, function() {
			console.log('Populated database OK');
			
			remplirListe();
		});
	});
});



var ptrLieux = null;

function clicListe(){
	$("#lieuxNom").val($(this).data("nom"));
	$("#lieuxDec").val($(this).data("description"));
	$("#latitude").val($(this).data("gpslat"));
	$("#longitude").val($(this).data("gpslng"));

	ptrLieux = $(this);
};

$("#ajouter").click(function(){
	$("#lieuxNom").val('');
	$("#lieuxDec").val('');
	$("#latitude").val('');
	$("#longitude").val('');
	
	ptrLieux = null;
});

$("#validation").click(function(){
	if(ptrLieux !== null){
			if ($("#lieuxNom").val().length>0) {
				if ($("#latitude").val().length>0) {
					if ($("#latitude").val().length>0) {
						if ($("#longitude").val().length>0) {

				$(ptrLieux).data("nom", $("#lieuxNom").val());
				$(ptrLieux).data("description", $("#lieuxDec").val());
				$(ptrLieux).data("gpslat", $("#latitude").val());
				$(ptrLieux).data("gpslng", $("#longitude").val());

				db.executeSql("UPDATE pointsInteret SET nom = ?, description = ?, gpslat = ?, gpslng = ? WHERE rowid = ?", 
				[$("#lieuxNom").val(), $("#lieuxDec").val(), $("#latitude").val(), $("#longitude").val(), $(ptrLieux).data("rowid")],
				function() { console.log("update OK"); },
				function(error) { console.log("update Error "+error.message); });

				var strResultat = $("#lieuxNom").val()+" - ";
				strResultat += $("#lieuxDec").val()+' ';
				strResultat += $("#latitude").val()+' ';
				strResultat += $("#longitude").val();
				
				$(ptrLieux).html(strResultat);

				$.mobile.changePage("#one");
				
					} else {
						alert("Pas de longitude !");
					}
				} else {
					alert("Pas de latitude !");
				}
			} else {
				alert("Pas de description !");
			}
		} else {
			alert("Pas de nom !");
		}
		
	}
	else
	{
			if ($("#lieuxNom").val().length>0) 
			{
				if ($("#lieuxDec").val().length>0) 
				{
					if ($("#latitude").val().length>0) 
					{
						if ($("#longitude").val().length>0) 
						{
					db.executeSql("INSERT INTO pointsInteret VALUES(?, ?, ?, ?)",
					[$("#lieuxNom").val(), $("#lieuxDec").val(), $("#latitude").val(), $("#longitude").val()],
					function(){ console.log("Insert OK"); },
					
					function(error){ console.log("Insert error"+error.message); });
					
					$("#listeLieux").empty();
					remplirListe();
					$.mobile.changePage("#one");
					} 
					else 
					{
						navigator.notification.alert("longitude manquante",function(){});
					}
				} else 
				{
					navigator.notification.alert("latitude manquante",function(){});
				}
			} else 
			{
				navigator.notification.alert("description manquante",function(){});
			}
		} else 
		{
			navigator.notification.alert("nom manquant",function(){});
		}
	}
})
;

$("#suppression").click(function(){
	if (ptrLieux !== null) 
	{

		navigator.notification.confirm(
		"Voulez-vous supprimer le lieu "+$(ptrLieux).data("nom")+" ?",
		function(btnIndex)
		{
			if (btnIndex == 1) 
			{

				db.executeSql("DELETE FROM pointsInteret WHERE rowid = ?",
				[$(ptrLieux).data("rowid")],
				function(){ console.log("Delete ok"); $(ptrLieux).remove(); },
				function(){ console.log("Delete error"+error.message); });

				$.mobile.changePage("#one");
			}
		},
		"Supprimer un lieu",
		["Ok","Annuler"]);

	} 
	else 
	{
	$("#lieuxNom").val('');
	$("#lieuxDec").val('');
	$("#latitude").val('');
	$("#longitude").val('');
	}
});

$("#geolocaliseMoi").click(function(){
	navigator.geolocation.getCurrentPosition(
		function(position)
		{
			var gpslat= position.coords.latitude;
			var gpslng = position.coords.longitude;
			$("#latitude").val(gpslat);
			$("#longitude").val(gpslng);

		},
		function(){
			console.log("geolocation error");
		},
		{maximumAge: 3000, timeout: 5000, enableHighAccuracy: true}
	);
});
document.addEventListener("deviceready", function() {
  var div = document.getElementById("map_canvas");

  // Initialize the map view
  map = plugin.google.maps.Map.getMap(div);

  // Wait until the map is ready status.
  map.addEventListener(plugin.google.maps.event.MAP_READY, onMapReady);
}, false);

function onMapReady() {
  var button = document.getElementById("button");
  button.addEventListener("click", onButtonClick);
}
function onButtonClick() {
	var gpslat = 20.0;
	var gpslng = 27.3;
	
	navigator.geolocation.getCurrentPosition(
		function(position){
			//Succès
			gpslat = position.coords.latitude;
			gpslng = position.coords.longitude;
		},
		function(){
			//Erreur
			console.log("geolocation error");
		},
		{maximumAge: 3000, timeout: 5000, enableHighAccuracy: true}
	);
  // Move to the position with animation
  map.animateCamera({
    target: {lat: gpslat, lng: gpslng},
    zoom: 9,
    tilt: 60,
    bearing: 140,
    duration: 5000
  }, function() {

    // Add a maker
    map.addMarker({
      position: {lat: gpslat, lng: gpslng},
      title: "Welecome to \n" +
             "Cordova GoogleMaps plugin for iOS and Android",
      snippet: "This plugin is awesome!",
      animation: plugin.google.maps.Animation.BOUNCE
    }, function(marker) {

      // Show the info window
      marker.showInfoWindow();

      // Catch the click event
      marker.on(plugin.google.maps.event.INFO_CLICK, function() {

        // To do something...
        alert("Hello world!");

      });
    });
  });
}
/*var marker;
  function Mark(location) {
      if(marker)
	  {
          marker.setPosition(location);
      }
	  else
	  {
      marker = new google.maps.Marker({
      draggable:true,
      position: location,
      animation: google.maps.Animation.DROP,
     
    });
  }
  }*/

$("#ouSuisje").click(function() {
$.mobile.changePage("#three");
  // Move to the position with animation
  onMapReady();
  /*Mark({lat: $("#latitude").val(), lng: $("#longitude").val()});*/
  map.animateCamera({
    target: {lat: $("#latitude").val(), lng: $("#longitude").val()},
    zoom: 17,
    tilt: 60,
    bearing: 140,
    duration: 5000
  }, function() {

    // Add a maker
    map.addMarker({
      position: {lat: $("#latitude").val(), lng: $("#longitude").val()},
      title: $("#lieuxNom").val(),
      snippet: $("#lieuxDec").val(),
      animation: plugin.google.maps.Animation.DROP
    }, function(marker) {

      // Show the info window
      marker.showInfoWindow();

      // Catch the click event
      marker.on(plugin.google.maps.event.INFO_CLICK, function() {

        // To do something...
        alert("Hello world!");

      });
    });
  });
});

