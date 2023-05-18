/*******************************************************************************
    Sauvegarde et récupération des données (localStorage)
*******************************************************************************/
// [CODE LOCALSTORAGE]
// La variable historique qu'on mettra à jour durant le quiz.
// Initialement, elle aura la valeur retournée par recupererHistorique()
let historique = recupererHistorique();
// console.log(historique)
/**
 * Récupère et retourne le tableau de l'historique de quiz de localStorage
 * s'il y en a un (retourne un tableau vide sinon.)
 * @returns {Array} Tableau contenant l'historique du jeu (réponses au quiz)
 */
function recupererHistorique() {
    // On vérifie s'il y a un historique dans localStorage
    let historiqueChaine = localStorage.getItem('historique-quiz');
    // On retourne l'historique décodé en JS ou un tableau vide
    return JSON.parse(historiqueChaine) || []; //Parse transforme une chaine en élément javascript
}

/*///////////////////////////////////////////////////////////////////////
                     LES VARIABLES DU QUIZ
///////////////////////////////////////////////////////////////////////*/

//Variables du quiz
let noQuestion = 0; //Le no de la prochaine question
let nombrePoint = 0; //Le no de bonne réponses

//index de l'image de fond pour lesChoixDeReponses
let indexImageFond = 0;
//Tableau pour changer l'image de fond de lesChoixDeReponses dynamiquement
let imageDeFond = new Array(
    "/images/fi1.jpg",
    "/images/fi2.jpg",
    "/images/fi3.jpg",
    "/images/fi4.jpg",
    "/images/fi5.jpg",
);


//La section du quiz et sa position sur l'axe des X
let laSection = document.querySelector("section");
let positionX = 100;
//Les balises pour afficher les titres des questions et les choix de
let titreQuestion = document.querySelector(".titre-question");
let lesChoixDeReponses = document.querySelector(".les-choix-de-reponse");
//La balise pour afficher le nombre de points
let leNombreDePoints = document.querySelector(".nombre-points");

//L'audio (source: https://mixkit.co/free-sound-effects/)
let audio = {
    vrai: new Audio('sons/vrai.wav'),
    faux: new Audio('sons/faux.wav')
};

//Variables pour le curseur personnalisé
let leRoot = document.querySelector(":root");
let leCurseur = document.querySelector(".curseur");
//Mettre un gestionnaire d'événement sur le document pour le déplacement de la souris
document.addEventListener("mousemove", deplacerCurseur);

/*///////////////////////////////////////////////////////////////////////
                            DÉBUT DU QUIZ
///////////////////////////////////////////////////////////////////////*/

//Gérer la fin de l'animation d'intro
let titreIntro = document.querySelector(".anim-titre-intro");
//Gestionnaire d'événement pour détecter la fin de l'animation d'intro
titreIntro.addEventListener("animationend", afficherConsignePourDebuterLeJeu);

/*///////////////////////////////////////////////////////////////////////
                            LES FONCTIONS
///////////////////////////////////////////////////////////////////////*/

/**
 * Fonction permettant de déplacer le curseur à l'endroit du
 * pointeur de la souris dans l'écran
 */
    function deplacerCurseur(event) {
    //Coordonnées X et Y du pointeur officiel de la souris
    //On change ici les valeurs des variables CSS déclarées
    leRoot.style.setProperty("--mouse-x", event.clientX + "px");
    leRoot.style.setProperty("--mouse-y", event.clientY + "px");
}


/**
 * Fonction pour afficher les consignes pour débuter le jeu
 *
 * @param {Event} event : objet AnimationEvent de l'événement distribué
 */
function afficherConsignePourDebuterLeJeu(event) {
    //On affiche la consigne si c'est la fin de la deuxième animation: montrer-mot
    if (event.animationName == "monter-mot") {
        //On affiche un message dans le pied de page
        let piedDePage = document.querySelector("footer");
        piedDePage.innerHTML = "<h1>Clique n'importe ou pour commencer le quiz</h1>";

        //On met un écouteur sur la fenêtre pour enlever l'intro et commencer le quiz
        window.addEventListener("click", commencerLeQuiz);
    }
}

/**
    Fonction pour enlever les éléments de l'intro et commencer le quiz
*/
function commencerLeQuiz() {
    // Nouvelle partie : on consigne dans la variable historique en créant
    // et initialisant un nouvel objet dans le tableau historique.
    historique.push(
        {
            date: new Date().toLocaleDateString('fr-CA'),
            reponses: []
        }
    );

    // Modifier la valeur stockée dans localStorage
    localStorage.setItem('historique-quiz', JSON.stringify(historique))

    //On enlève le conteneur de l'intro
    let intro = document.querySelector("main.intro");
    intro.remove();

    //On enlève l'écouteur qui gère le début du quiz
    window.removeEventListener("click", commencerLeQuiz);

    //On met le conteneur du quiz visible
    document.querySelector(".quiz").style.display = "flex";

    //On affiche la première question
    afficherQuestion();
}

/**
 * Fonction permettant d'afficher chaque question
 *
 */
function afficherQuestion() {
    //On retire la classe désactiver de la liste des choix de reponses
    lesChoixDeReponses.classList.remove("desactiver");
    //Récupérer l'objet de la question en cours
    let objetQuestion = lesQuestions[noQuestion];

    //On affiche le titre de la question
    titreQuestion.innerText = objetQuestion.titre;
    //console.log(objetQuestion)

    //On crée et on affiche les balises des choix de réponse
    //Mais d'abord on enlève le contenu actuel
    lesChoixDeReponses.innerHTML = "";

    let unChoix;
    for (let i = 0; i < objetQuestion.choix.length; i++) {
        //On crée la balise et on y affecte une classe CSS
        unChoix = document.createElement("div");
        unChoix.classList.add("choix");
        //On intègre la valeur du choix de réponse
        unChoix.innerText = objetQuestion.choix[i];

        //On affecte dynamiquement l'index de chaque choix
        unChoix.indexChoix = i;

        //On écoute si unChoix est cliquer
        unChoix.addEventListener("mousedown", function(event) {
            if (lesChoixDeReponses.classList.contains("desactiver")) {
              return; // Si unChoix a la classe desactiver, on fais rien, c'est pour éviter que l'utilisateur puisse donner plusieurs réponses à la même question
            }
            lesChoixDeReponses.classList.add("desactiver"); // Quand unChoix est cliquer, on lui applique la classe désactiver
        
            verifierReponse(event) // Quand unChoix est cliquer, on vérifie la réponse
        });
        lesChoixDeReponses.append(unChoix);
    }

    //Modifier la valeur de la position de la section sur l'axe des X
    //pour son animation
    positionX = 100;

    //Partir la première requête pour l'animation de la section
    requestAnimationFrame(animerSectionEntrer);
}

/*
    Fonction permettant d'animer l'arrivée de la section
*/
function animerSectionEntrer() {
    //On décrémente la position de 2
    positionX -= 2;
    laSection.style.transform = `translateX(${positionX}vw)`;

    //On part une autre requête d'animation si la position n'est pas atteinte
    if (positionX > 0) {
        requestAnimationFrame(animerSectionEntrer);
    }
}


/**
 * Fonction permettant de vérifier la réponse choisie et de gérer la suite
 *
 * @param {object} event Informations sur l'événement MouseEvent distribué
 */
function verifierReponse(event) {
    // [CODE LOCALSTORAGE]
    // On modifie l'historique pour ajouter ce choix dans le tableau des réponses
    // Remarquer qu'il faut modifier uniquement le dernier objet du tableau
    // historique.
    //On affecte la valeur du nombre du point au tableau des réponses
    historique[historique.length-1].reponses = nombrePoint;

    // On sauvegarde le nouvel historique dans localStorage.
    localStorage.setItem('historique-quiz', JSON.stringify(historique));

    //Récupérer l'objet de la réponse choisi
    let unChoix = event.target;

    //Récupérer l'objet de la question en cours
    let objetQuestion = lesQuestions[noQuestion];
    //Variable pour gerer les sons, au départ, on assume que la réponse est mauvaise
    let etatVerif = 'faux';
    //Comparer la réponse donner à la bonne réponse
    if (event.target.indexChoix == objetQuestion.bonneReponse) {
        nombrePoint++;//Si la réponse est bonne on augmente le nombre de points
        etatVerif = 'vrai';//On met le son de la bonne réponse
        unChoix.classList.add("choixVrai");//On met la classe qui correspond à la bonne réponse
    }
    else {
        unChoix.classList.add("choixFaux");//Sinon, la réponse est fausse, on met la classe qui correspond à la mauvaise réponse
    }

    // En fin de compte, on peut jouer le son correspondant à l'état de la 
    // vérification ('faux' ou 'vrai') ...
    audio[etatVerif].play();
    // ... on rembobine vite le son pour qu'il puisse être 're-joué' même en rafale :
    audio[etatVerif].currentTime = 0;

    //On afficher le nombre de points dans le header
    let messageScore = 'Ton score est de: '+nombrePoint+'/5';
    leNombreDePoints.innerText = messageScore;

    //On affiche la prochaine question avec un delai de 2 secondes
    setTimeout(gererProchaineQuestion, 2000)
}

/**
 * Fonction permettant de gérer l'affichage de la prochaine question
 *
 */
function gererProchaineQuestion() {
    //On incrémente lnoQuestion pour la  prochaine question à afficher
    noQuestion++;

    //S'il reste une question on l'affiche, sinon c'est la fin du jeu...
    if (noQuestion < lesQuestions.length) {
        lesChoixDeReponses.style.backgroundImage = 'url("'+imageDeFond[indexImageFond+1]+'")'; //On applique la nouvelle image de fond à lesChoixDeReponses
        indexImageFond++; //On augmente l'index 1 pour passer à l'image suivante

        //On affiche la prochaine question
        afficherQuestion();
    } else {
        //C'est la fin du quiz
        afficherFinQuiz();
    }
}

/**
 * Fonction permettant d'afficher l'interface de la fin du jeu
 *
 */
function afficherFinQuiz() {
    let zoneFinQuiz = document.querySelector(".fin");

    //On enlève le quiz de l'affichage et on affiche la fin du jeu
    document.querySelector(".quiz").style.display = "none";
    zoneFinQuiz.style.display = "flex";

    // [CODE LOCALSTORAGE]
    // Obtenir la dernière version sauvegardée de l'historique
    let nombreParties = historique.length;
    zoneFinQuiz.innerHTML = `<p>Fin du quiz !</p>`;
    zoneFinQuiz.innerHTML += `<p>Tu as jouée(s) : ${nombreParties} partie(s)</p>`;
    zoneFinQuiz.innerHTML += `<p>Liste des scores à toutes les parties jouées : </p>`;

    //Afficher les données 
    for (let partie of historique) {
        zoneFinQuiz.innerHTML += "<p>";
        zoneFinQuiz.innerHTML += `Tu as jouer une partie le : ${partie.date}&nbsp`;
        zoneFinQuiz.innerHTML += `Ton score étais de : ${partie.reponses}/5`;
        zoneFinQuiz.innerHTML += "</p>";
    }
}
