/*******************************************************************************
    Sauvegarde et récupération des données (localStorage)
*******************************************************************************/
// [CODE LOCALSTORAGE]
// La variable historique qu'on mettra à jour durant le quiz.
// Initialement, elle aura la valeur retournée par recupererHistorique()
let historique = recupererHistorique();
console.log(historique)
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
let bonneReponse = 0; //La no de la position de la bonne réponse

//La section du quiz et sa position sur l'axe des X
let laSection = document.querySelector("section");
let positionX = 100;
//Les balises pour afficher les titres des questions et les choix de
let titreQuestion = document.querySelector(".titre-question");
let lesChoixDeReponses = document.querySelector(".les-choix-de-reponse");

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
    //console.log(event.animationName);
    //On affiche la consigne si c'est la fin de la deuxième animation: etirer-mot
    if (event.animationName == "monter-mot") {
        //On affiche un message dans le pied de page
        let piedDePage = document.querySelector("footer");
        piedDePage.innerHTML = "<h1>Clique nimporte ou pour commencer le quiz</h1>";

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
    //Récupérer l'objet de la question en cours
    let objetQuestion = lesQuestions[noQuestion];
    // console.log(objetQuestion);

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

        //On met un écouteur pour vérifier la réponse choisie
        unChoix.addEventListener("mousedown", verifierReponse);

        //Enfin on affiche ce choix
        lesChoixDeReponses.append(unChoix);
    }

    //Modifier la valeur de la position de la section sur l'axe des X
    //pour son animation
    positionX = 100;

    //Partir la première requête pour l'animation de la section
    requestAnimationFrame(animerSection);
}

/**
 * Fonction permettant d'animer l'arrivée de la section
 *
 */
function animerSection() {
    //On décrémente la position de 2
    positionX -= 2;
    laSection.style.transform = `translateX(${positionX}vw)`;

    //On part une autre requête  d'animation si la position n'est pas atteinte
    if (positionX > 0) {
        requestAnimationFrame(animerSection);
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
    historique[historique.length-1].reponses.push(event.target.indexChoix);

    // On sauvegarde le nouvel historique dans localStorage.
    localStorage.setItem('historique-quiz', JSON.stringify(historique));

    //Récupérer l'objet de la question en cours
    let objetQuestion = lesQuestions[noQuestion];
    //Comparer la réponse donner à la bonne réponse
    if (event.target.indexChoix == objetQuestion.bonneReponse) {
        nombrePoint++;//Si la réponse est bonne on augmente le nombre de points
    }
    console.log(objetQuestion.bonneReponse)

    //Plusiers choses peuvent être effectuées ici, mais pour l'instant
    //on va uniquement afficher la prochaine question
    gererProchaineQuestion();
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
    // historique;
    let nombreParties = historique.length;
    zoneFinQuiz.innerHTML = `<p>Nombre de partie(s) jouée(s) : ${nombreParties}</p>`;
    zoneFinQuiz.innerHTML += `<p>Liste des réponses à toutes les parties jouées : </p>`;
    //zoneFinQuiz.innerHTML += "<ol>";
    for (let partie of historique) {
        zoneFinQuiz.innerHTML += "<p>";
        zoneFinQuiz.innerHTML += `Date : ${partie.date}`;
        zoneFinQuiz.innerHTML += `Réponses : ${partie.reponses}`;
        zoneFinQuiz.innerHTML += "</p>";
    }
    //zoneFinQuiz.innerHTML += "</ol>";
}
