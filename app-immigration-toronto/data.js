const DOC_TYPES = ["Identité", "Immigration", "Travail", "Logement", "Santé", "Transport", "Administration", "Autre"];
const DOC_STATUSES = ["À obtenir", "En cours", "Obtenu", "Expiré"];

const PATHWAYS = [
  { id: "rp", label: "Résidence permanente (Entrée express, PCP…)" },
  { id: "work", label: "Permis de travail" },
  { id: "study", label: "Permis d'études" },
  { id: "visitor", label: "Visiteur (visa / eTA)" }
];

const SEED = {
  version: 1,
  settings: { departureDate: null, pathway: "" },
  phases: [
    { id: "avant-depart", icon: "✈️", name: "Avant le départ" },
    { id: "premiers-jours", icon: "🛬", name: "Les premiers jours à Toronto" },
    { id: "installation", icon: "🏠", name: "Installation (1 à 3 mois)" },
    { id: "quotidien", icon: "🍁", name: "La vie au quotidien" }
  ],
  tasks: [
    { id: "t01", phase: "avant-depart", label: "Vérifier la validité du passeport (6 mois après l'arrivée prévue, idéalement)", done: false },
    { id: "t02", phase: "avant-depart", label: "Demander le visa, l'eTA ou le permis requis sur canada.ca (IRCC)", done: false },
    { id: "t03", phase: "avant-depart", label: "Si résidence permanente : évaluation des diplômes (ECA) par un organisme désigné", done: false },
    { id: "t04", phase: "avant-depart", label: "Constituer la preuve de fonds (montant à jour sur canada.ca)", done: false },
    { id: "t05", phase: "avant-depart", label: "Faire traduire et certifier les documents non anglais/français", done: false },
    { id: "t06", phase: "avant-depart", label: "Obtenir un certificat de police / casier judiciaire si requis", done: false },
    { id: "t07", phase: "avant-depart", label: "Passer l'examen médical de l'immigration si requis (médecin désigné par IRCC)", done: false },
    { id: "t08", phase: "avant-depart", label: "Prévoir une assurance santé privée temporaire (vérifier la couverture OHIP à jour)", done: false },
    { id: "t09", phase: "avant-depart", label: "Réserver un logement temporaire pour les 2 premières semaines", done: false },
    { id: "t10", phase: "avant-depart", label: "Prévoir une procuration pour gérer ses affaires restées au pays", done: false },
    { id: "t11", phase: "avant-depart", label: "Prévenir sa banque et activer les services internationaux", done: false },
    { id: "t12", phase: "avant-depart", label: "Acheter son billet d'avion (aller simple conseillé au début)", done: false },
    { id: "t13", phase: "avant-depart", label: "Préparer des copies numériques de tous les documents (nuage + clé USB)", done: false },
    { id: "t14", phase: "premiers-jours", label: "Acheter une carte SIM / activer un forfait cellulaire canadien", done: false },
    { id: "t15", phase: "premiers-jours", label: "Ouvrir un compte bancaire canadien", done: false },
    { id: "t16", phase: "premiers-jours", label: "Demander son numéro d'assurance sociale (NAS) à Service Canada", done: false },
    { id: "t17", phase: "premiers-jours", label: "Acheter une carte PRESTO pour les transports en commun (TTC)", done: false },
    { id: "t18", phase: "premiers-jours", label: "S'inscrire à l'école ou à la garderie si applicable", done: false },
    { id: "t19", phase: "premiers-jours", label: "Repérer épicerie, pharmacie et clinique sans rendez-vous du quartier", done: false },
    { id: "t20", phase: "premiers-jours", label: "Obtenir une carte-photo de l'Ontario si le permis de conduire n'est pas échangeable", done: false },
    { id: "t21", phase: "installation", label: "Trouver un logement permanent et signer un bail", done: false },
    { id: "t22", phase: "installation", label: "Demander la carte Santé de l'Ontario (OHIP) à ServiceOntario", done: false },
    { id: "t23", phase: "installation", label: "Échanger son permis de conduire étranger contre un permis ontarien (si admissible)", done: false },
    { id: "t24", phase: "installation", label: "S'inscrire auprès de l'Agence du revenu du Canada (ARC) pour les impôts", done: false },
    { id: "t25", phase: "installation", label: "Adapter son CV au marché du travail canadien et postuler", done: false },
    { id: "t26", phase: "installation", label: "Rejoindre des organismes francophones d'accueil à Toronto", done: false },
    { id: "t27", phase: "installation", label: "Acheter des vêtements d'hiver (manteau, bottes) avant les premières gelées", done: false },
    { id: "t28", phase: "installation", label: "Constituer un fonds d'urgence (3 à 6 mois de dépenses)", done: false },
    { id: "t29", phase: "quotidien", label: "Déclarer ses impôts chaque année avant le 30 avril", done: false },
    { id: "t30", phase: "quotidien", label: "Renouveler son permis ou sa carte de RP avant l'expiration", done: false },
    { id: "t31", phase: "quotidien", label: "Garder ses documents à jour (passeport, permis, carte Santé)", done: false },
    { id: "t32", phase: "quotidien", label: "Consulter régulièrement les mises à jour sur canada.ca et ontario.ca", done: false }
  ],
  documents: [
    { id: "d01", name: "Passeport", type: "Identité", status: "À obtenir", expiry: null, notes: "Renseigner la date d'expiration" },
    { id: "d02", name: "Visa de visiteur ou eTA", type: "Immigration", status: "À obtenir", expiry: null, notes: "" },
    { id: "d03", name: "Permis de travail ou de résidence permanente", type: "Immigration", status: "À obtenir", expiry: null, notes: "" },
    { id: "d04", name: "Évaluation des diplômes (ECA)", type: "Immigration", status: "À obtenir", expiry: null, notes: "Si résidence permanente" },
    { id: "d05", name: "Preuve de fonds (lettre bancaire)", type: "Immigration", status: "À obtenir", expiry: null, notes: "" },
    { id: "d06", name: "Lettre d'offre d'emploi", type: "Travail", status: "À obtenir", expiry: null, notes: "" },
    { id: "d07", name: "Acte de naissance (traduit si besoin)", type: "Identité", status: "À obtenir", expiry: null, notes: "" },
    { id: "d08", name: "Diplômes et relevés de notes", type: "Travail", status: "À obtenir", expiry: null, notes: "" },
    { id: "d09", name: "Certificat de police / casier judiciaire", type: "Immigration", status: "À obtenir", expiry: null, notes: "" },
    { id: "d10", name: "Photos d'identité au format requis", type: "Identité", status: "À obtenir", expiry: null, notes: "" },
    { id: "d11", name: "Contrat de location (bail)", type: "Logement", status: "À obtenir", expiry: null, notes: "" },
    { id: "d12", name: "Preuve d'adresse à Toronto", type: "Logement", status: "À obtenir", expiry: null, notes: "" },
    { id: "d13", name: "Carte Santé de l'Ontario (OHIP)", type: "Santé", status: "À obtenir", expiry: null, notes: "" },
    { id: "d14", name: "Numéro d'assurance sociale (NAS)", type: "Administration", status: "À obtenir", expiry: null, notes: "" }
  ],
  events: [
    { id: "e01", title: "Départ prévu pour Toronto (exemple — modifiez la date)", offsetDays: 90, note: "" },
    { id: "e02", title: "Examen médical IRCC, si requis (exemple)", offsetDays: 30, note: "Médecin désigné par IRCC" },
    { id: "e03", title: "Date limite de réponse à IRCC (exemple)", offsetDays: 45, note: "" },
    { id: "e04", title: "Demande de carte Santé OHIP à ServiceOntario (exemple)", offsetDays: 14, note: "" }
  ],
  budget: [
    { id: "b01", label: "Frais de dossier IRCC (visa / permis / RP)", planned: 1000, spent: 0 },
    { id: "b02", label: "Billet d'avion (aller)", planned: 900, spent: 0 },
    { id: "b03", label: "ECA, traductions et certificats", planned: 500, spent: 0 },
    { id: "b04", label: "Assurance santé privée temporaire", planned: 300, spent: 0 },
    { id: "b05", label: "Logement temporaire (2 semaines)", planned: 2500, spent: 0 },
    { id: "b06", label: "Caution + premier mois de loyer", planned: 4000, spent: 0 },
    { id: "b07", label: "Épicerie, transport et divers (3 mois)", planned: 2000, spent: 0 },
    { id: "b08", label: "Forfait cellulaire + internet", planned: 150, spent: 0 },
    { id: "b09", label: "Vêtements d'hiver", planned: 400, spent: 0 },
    { id: "b10", label: "Fonds d'urgence", planned: 3000, spent: 0 }
  ],
  resources: [
    { id: "r01", tag: "général", title: "IRCC — Portail de l'immigration (visas, permis, RP)", desc: "Toutes les démarches officielles du gouvernement fédéral canadien.", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete.html" },
    { id: "r02", tag: "visa", title: "Visiter le Canada — visa et eTA", desc: "Vérifier si un visa ou une eTA est requis, puis faire la demande en ligne.", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/visiter-canada.html" },
    { id: "r03", tag: "travail", title: "Travailler au Canada — permis de travail", desc: "Types de permis (ouvert, fermé), admissibilité et étapes de la demande.", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/travailler-canada.html" },
    { id: "r04", tag: "etude", title: "Étudier au Canada — permis d'études", desc: "Conditions d'admissibilité et demande de permis d'études.", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/etudier-canada.html" },
    { id: "r05", tag: "rp", title: "Entrée express — résidence permanente", desc: "Créer un profil, recevoir une invitation, présenter la demande de RP.", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/entree-express.html" },
    { id: "r06", tag: "rp", title: "Preuve de fonds suffisants — montants à jour", desc: "Tableau officiel des montants exigés selon la taille de la famille.", url: "https://www.canada.ca/fr/immigration-refugies-citoyennete/services/immigrer-canada/entree-express/documents/preuve-fonds-suffisants.html" },
    { id: "r07", tag: "admin", title: "Barème des frais d'IRCC", desc: "Frais officiels à jour pour chaque type de demande d'immigration.", url: "https://ircc.canada.ca/francais/information/frais/bareme.asp" },
    { id: "r08", tag: "admin", title: "Numéro d'assurance sociale (NAS) — Service Canada", desc: "Comment et où demander son NAS à l'arrivée au Canada.", url: "https://www.canada.ca/fr/emploi-developpement-social/services/numero-assurance-sociale.html" },
    { id: "r09", tag: "admin", title: "Agence du revenu du Canada (ARC)", desc: "Déclaration d'impôts, prestations et « Mon dossier ARC ».", url: "https://www.canada.ca/fr/agence-revenu.html" },
    { id: "r10", tag: "sante", title: "Carte Santé de l'Ontario (OHIP)", desc: "Inscription à l'Assurance-santé de l'Ontario ; vérifiez les règles à jour selon votre statut.", url: "https://www.ontario.ca/fr/page/sinscrire-lassurance-sante-de-lontario-et-obtenir-une-carte-sante" },
    { id: "r11", tag: "général", title: "S'établir en Ontario — guide des nouveaux résidents", desc: "Santé, logement, emploi, écoles : le guide officiel de la province pour les nouveaux arrivants.", url: "https://www.ontario.ca/fr/page/setablir-en-ontario" },
    { id: "r12", tag: "transport", title: "Échanger un permis de conduire étranger", desc: "Pays avec accord d'échange (dont la France) et démarches auprès de DriveTest.", url: "https://www.ontario.ca/fr/page/echange-dun-permis-de-conduire-non-delivre-par-la-province-de-lontario" },
    { id: "r13", tag: "transport", title: "Permis de conduire de l'Ontario", desc: "Obtenir, renouveler ou remplacer un permis de conduire ontarien.", url: "https://www.ontario.ca/fr/page/permis-de-conduire" },
    { id: "r14", tag: "admin", title: "ServiceOntario", desc: "Carte Santé, carte-photo, permis : localiser un centre et voir les services en personne.", url: "https://www.ontario.ca/fr/page/serviceontario" },
    { id: "r15", tag: "transport", title: "Carte PRESTO", desc: "Carte rechargeable pour le TTC et les transports en commun de la région de Toronto.", url: "https://www.prestocard.ca/" },
    { id: "r16", tag: "transport", title: "TTC — Toronto Transit Commission", desc: "Métro, bus et streetcars : horaires, tarifs et plan du réseau.", url: "https://www.ttc.ca/" },
    { id: "r17", tag: "logement", title: "Ville de Toronto — logement et location", desc: "Rubrique logement de la Ville. Attention aux arnaques : aucune annonce sérieuse n'exige un paiement avant la visite.", url: "https://www.toronto.ca/" },
    { id: "r18", tag: "ville", title: "Ville de Toronto — services en français", desc: "Services municipaux offerts en français (Ontario au travail, aide à l'emploi, etc.).", url: "https://www.toronto.ca/community-people/employment-social-support/support-for-people-in-financial-need/assistance-through-ontario-works/services-en-francais/" },
    { id: "r19", tag: "communaute", title: "211 Ontario — aide communautaire", desc: "Ligne d'aide gratuite 24 h/24 (composez le 2-1-1), en plus de 150 langues, pour trouver des services près de chez vous.", url: "https://211ontario.ca/" }
  ]
};
