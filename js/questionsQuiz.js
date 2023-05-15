/*////////////////////////////////////////////////////////////////////////////////////////////
                            LES QUESTIONS DU QUIZ
    Banque de questions dans une "structure de données" JavaScript : le tableau contient
    une collection de questions, et chaque question à trouver est un objet JavaScript
    qui contient TROIS valeurs : la chaîne du titre de la question, un tableau (Array) pour les
    choix de réponse et un nombre indiauqnt l'index de la bonne réponse...
///////////////////////////////////////////////////////////////////////////////////////////////*/

let lesQuestions = [
    {
        titre: "En quelle année Pluton n'étais plus considérer comme une planète ?",
        choix: [2006, 2002, 2010],
        bonneReponse: 0,
    },
    {
        titre: "Quelle est la distance entre la terre et la lune (en 1000km) ?",
        choix: [245, 860, 384],
        bonneReponse: 2,
    },
    {
        titre: "Combien de lune la planète Mars possède t'elle ?",
        choix: [0, 2, 4],
        bonneReponse: 1,
    },
    {
        titre: "Quelle est la température à la surface du soleil en °C ?",
        choix: [2700, 4600, 5500],
        bonneReponse: 2,
    },
    {
        titre: "Quelle est la durée d'une année sur Neptune (en année terrestre)",
        choix: [165, 30, 365],
        bonneReponse: 0,
    }
]