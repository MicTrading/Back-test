# Toronto Prêt — Organisateur d'immigration

Application web en français, 100 % locale (aucun serveur, aucun compte, aucune dépendance) pour organiser et préparer une immigration à Toronto.

## Lancer l'application

- Ouvrez simplement `index.html` dans votre navigateur (double-clic), ou
- servez le dossier : `python3 -m http.server 8000` puis ouvrez http://localhost:8000

## Fonctionnalités

- **Tableau de bord** : progression globale et par phase, prochaine échéance, documents à surveiller (expiration à moins de 60 jours), résumé du budget, compte à rebours avant le départ.
- **Tâches** : 32 tâches pré-remplies réparties en 4 phases (avant le départ, premiers jours à Toronto, installation 1–3 mois, vie au quotidien) — cases à cocher, ajout, modification, suppression, barres de progression.
- **Documents** : suivi avec type, statut (à obtenir / en cours / obtenu / expiré), date d'expiration avec alerte visuelle, et notes.
- **Calendrier** : échéances avec compte à rebours (en retard / aujourd'hui / dans X jours), triées par date.
- **Budget** : en dollars canadiens — montant prévu vs dépensé par poste, restant, totaux et barre de progression.
- **Ressources** : liens officiels vérifiés (IRCC, Entrée express, preuve de fonds, barème des frais, NAS, ARC, OHIP, permis de conduire, ServiceOntario, PRESTO/TTC, Ville de Toronto, 211 Ontario…), filtrables par thème.
- **Paramètres** : date de départ prévue, voie d'immigration envisagée, export/import de toutes les données en JSON, réinitialisation.

## Confidentialité

Toutes les données sont stockées uniquement dans le `localStorage` de votre navigateur. Rien n'est transmis sur Internet. Exportez régulièrement vos données en JSON (Paramètres) pour garder une sauvegarde.

## Structure

- `index.html` — structure des 7 vues
- `styles.css` — mise en page responsive
- `data.js` — contenus pré-remplis (tâches, documents, échéances, budget, ressources)
- `app.js` — logique de l'application (état, stockage local, rendu)

## Avertissement

Cette application est un outil d'organisation personnel. Elle ne constitue pas un conseil juridique ni en immigration : vérifiez toujours les exigences et montants à jour sur canada.ca et ontario.ca avant toute démarche.
