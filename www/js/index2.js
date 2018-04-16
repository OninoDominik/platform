var db = null;
var gpslat = 48.0;
var gpslng = 7.0;

document.addEventListener('deviceready', function() {
  db = window.sqlitePlugin.openDatabase({
    name: 'pointsInteret.db',
    location: 'default',
  });
  
  db.transaction(function(tx) {
	tx.executeSql('CREATE TABLE IF NOT EXISTS lieuxImportant(nom TEXT, desc TEXT, gpslat TEXT, gpslng TEXT)');
	}, function(error) {
		console.log('Transaction ERROR: ' + error.message);
	}, function() {
		console.log('Create database OK');
		
		db.transaction(function(tx) {
			tx.executeSql('INSERT INTO lieuxImportant VALUES(?,?,?,?)' , ["toto","aaaaa", "47.5", "127.5"]);
		}, function(error) {
			console.log('Transaction ERROR: ' + error.message);
		}, function() {
			console.log('Populated database OK');
			
			remplirListe();
		});
	});
});

function remplirListe(){
	db.executeSql('SELECT rowid, * FROM lieuxImportant', [],
		function(res) {
			for(var i = 0; i < res.rows.length; i++) {
				console.log(res.rows.item(i).rowid+" "+res.rows.item(i).nom);
				
				var strhtml = '<li><a href ="#two" data-nom="';
				strhtml += res.rows.item(i).nom;
				strhtml += '" data-desc="';
				strhtml += res.rows.item(i).desc;
				strhtml += '" data-gpslat="';
				strhtml += res.rows.item(i).gpslat;
				strhtml += '" data-gpslng="';
				strhtml += res.rows.item(i).gpslng;
				
				strhtml += '" data-rowid="';
				strhtml += res.rows.item(i).rowid;
				
				strhtml += '">';
				strhtml += res.rows.item(i).nom;
				strhtml += ' - ';
				strhtml += res.rows.item(i).desc;
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

var ptrLieux = null;

function clicListe(){
	$("#lieuNom").val($(this).data("nom"));
	$("#lieuDesc").val($(this).data("desc"));
	$("#latitude").val($(this).data("gpslat"));
	$("#longitude").val($(this).data("gpslng"));

	ptrLieux = $(this);
};

$("#ajout").click(function(){
	//Remise a zero des champs pour ajouter un nouvel article
	videChampsSaisie();
	
	ptrLieux = null;
});

$("#btn_valide").click(function(){
	if(ptrLieux !== null){
			if ($("#lieuNom").val().length>0) {
				if ($("#latitude").val().length>0) {
					if ($("#latitude").val().length>0) {
						if ($("#longitude").val().length>0) {
									
				//Data
				$(ptrLieux).data("nom", $("#lieuNom").val());
				$(ptrLieux).data("desc", $("#lieuDesc").val());
				$(ptrLieux).data("gpslat", $("#latitude").val());
				$(ptrLieux).data("gpslng", $("#longitude").val());
				
				//Update BDD
				db.executeSql("UPDATE lieuxImportant nom = ?, desc = ?, gpslat = ?, gpslng = ? WHERE rowid = ?", 
				[$("#lieuNom").val(), $("#lieuDesc").val(), $("#latitude").val(), $("#longitude").val(), $(ptrLieux).data("rowid")],
				function() { console.log("update OK"); },
				function(error) { console.log("update Error "+error.message); });
				
				//Chaine affichée
				var stringRes = $("#lieuNom").val()+" - ";
				stringRes += $("#lieuDesc").val()+' ';
				stringRes += $("#latitude").val()+' ';
				stringRes += $("#longitude").val();
				
				$(ptrLieux).html(stringRes);
				
				//Changer de page
				$.mobile.changePage("#one");
				
					} else {
						alert("Pas de longitude !");
					}
				} else {
					alert("Pas de latitude !");
				}
			} else {
				alert("Pas de desc !");
			}
		} else {
			alert("Pas de nom !");
		}
		
	}
	else{
		//Ajout
			if ($("#lieuNom").val().length>0) {
				if ($("#lieuDesc").val().length>0) {
					if ($("#latitude").val().length>0) {
						if ($("#longitude").val().length>0) {
					//Ajout BDD
					db.executeSql("INSERT INTO lieuxImportant VALUES(?, ?, ?, ?)",
					[$("#lieuNom").val(), $("#lieuDesc").val(), $("#latitude").val(), $("#longitude").val()],
					function(){ console.log("Insert OK"); },
					function(error){ console.log("Insert error"+error.message); });
					
					//Flush listStyleType
					$("#liste_courses").empty();
					
					//Remplissage de la liste					
					//Sychronisation de la liste					
					//Ajout du clique
					remplirListe();
					
					//changer de page
					$.mobile.changePage("#one");
					
					} else {
						alert("Pas de longitude !");
					}
				} else {
					alert("Pas de latitude !");
				}
			} else {
				alert("Pas de desc !");
			}
		} else {
			alert("Pas de nom !");
		}
	}
});

$("#btn_suppr").click(function(){
	if (ptrLieux !== null) {
		//On est en édition
		//Supprimer l'article
		
		navigator.notification.confirm(
		"Voulez-vous supprimer le lieu "+$(ptrLieux).data("nom")+" ?",
		function(btnIndex){
			if (btnIndex == 1) {
				//2 manières de faire :
				//soit on supprime dans la BDD et on rafraichit toute la liste
				//soit on supprime dans la BDD et on supprime juste l'élément pointé
				db.executeSql("DELETE FROM lieuxImportantWHERE rowid = ?",
				[$(ptrLieux).data("rowid")],
				function(){ console.log("Delete ok"); $(ptrLieux).remove(); },
				function(){ console.log("Delete error"+error.message); });
		
				//Retour page1
				$.mobile.changePage("#one");
			}
		},
		"Supprimer un lieu",
		["OUI","NON"]);

	} else {
		//On est en création
		//Effacer les champs
		videChampsSaisie();
	}
});

function videChampsSaisie(){
	$("#lieuNom").val('');
	$("#lieuDesc").val('');
	$("#latitude").val('');
	$("#longitude").val('');
};


var map;
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
  //  var gpslat = 48.0;
  //  var gpslng = 7.0;

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

/*var toto =1;
toto = "1";
tata=toto.toString();

if (toto == tata)
{
	//alert("C'est pareil");
}

var titre = document.getElementById("titre");
titre.style.color = "red";

//alert($("#titre").css("color"));

var valNum= 123;

$("#valeur").val(valNum);
$("#titre").css("color","blue");
/*
$(document).ready(function(){
	alert($("#valeur").val());
}
);

$(window).load(function(){
	alert($("#valeur").val());
}
);

var i=1;
while (i<10)
{
	console.log("coucou");
	i=i+1;
}

$("#bouton").click(logCoucou);
$("#bouton").on("click",function(){
	console.log("Coucou=anonyme");
});

function logCoucou()
{
	console.log("Log Coucou");
}

$("#lancer").click(function(){
	var de = (Math.floor((Math.random()*10) %6 +1));
	$("#de").empty(); // vide
	//$("#de").append(de); // a la fin
	//$("#de").prepend(de); // avant le premier element 
	$("#de").html(de);
});*/

/*var objfonction = function(){
	console.log("objet= fonction");
};



var mode_edit=0;
var editItem;
$("#fait").click(function(){
	
	switch(mode_edit)
	{
		case 0:
			
	
	
	var todoTitre= $("#todoTitre").val();
	if (todoTitre.length>0)
	{
		var chainehtml ='<li><a href="#two">'+todoTitre+'</a></li>'
		
		$("#todoList").append(chainehtml);
		$("#todoList").listview("refresh");//rafraichir list
		$.mobile.changePage("#one"); // changer page
		$("#todoList li:last-child a").click(todoListClick);//ajout evenement todoListClick sur le derniers enfants
	}else {
		alert("Pas de Titre !");
	}
	break;
		case 1:
		var todoTitre= $("#todoTitre").val();
	if (todoTitre.length>0)
	{
		$(editItem).html(todoTitre);
		$.mobile.changePage("#one");
	}
			break;
		
	}
});
	
function todoListClick(){
	mode_edit=1;
	editItem=$(this);
	$("#todoTitre").val($(this).html());
}

$("#plus").click(function(){
	$("#todoTitre").val("");
	$("#todoText").val("");
});

$("#delete").click(function(){
	switch (mode_edit)
	{
		case 0:
		$.mobile.changePage("#one");
		break;
		
		case 1:
		$(editItem).parent().remove();
		$.mobile.changePage("#one");
		break;
	}
});

/*$("document").ready*/

/*$(window).load(function(){
	$.mobile.changePage("#one");
});*/

/*$("#todoList a").click(function(){
	mode_edit=1;
	$("#todoTitre").val($(this).html());
});*/

/*$("#todoList a").click(todoListClick);*/

//------------------------
/* function ecrisToto(){
	return "toto";
};

function toto(){
	alert("toto");
};
$("#delete").click(toto)
*/

//--------------------------------------------------
/*
function pileface(){
	var res=(Math.floor((Math.random()*10) %2 +1));
	$("#resultat").empty();
	if (res==2)
		{
		$("#resultat").html('<img " src="./img/pile.png" alt="pile" class="resize">');
		}
	else
		{
		$("#resultat").html('<img src="./img/face.png" alt="face" class="resize">');
		}
};

$("#lancer").click(pileface);
*/