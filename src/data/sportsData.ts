import { MatchItem } from '../types/index.ts';

export const INITIAL_MATCHES: MatchItem[] = [
  {
    id: 'm-1',
    sport: 'football',
    competition: 'Ligue des Champions - 1/4 Finale',
    homeTeam: 'Real Madrid',
    awayTeam: 'Manchester City',
    startTime: 'Ce soir, 21:00',
    isLive: true,
    liveTime: '64\'',
    liveScore: '2 - 1',
    odds: {
      home: 2.35,
      draw: 3.40,
      away: 2.85,
    },
    aiPrediction: {
      recommendedBet: 'Plus de 2.5 Buts & Les deux équipes marquent',
      targetOdds: 1.88,
      confidence: 88,
      aiProbability: 82.5,
      isValueBet: true,
      edge: +14.2,
      riskLevel: 'FAIBLE',
      keyStats: [
        'xG moyen cumulé : 3.42 par rencontre',
        'Real Madrid invaincu à domicile lors des 14 derniers matchs européens',
        'Manchester City a concédé au moins 1 but dans 80% des déplacements récents'
      ],
      tacticalSummary: 'Transitions supersoniques madrilènes exploitant la ligne haute de Guardiola. City maintient la possession mais souffre sur les seconds ballons.'
    }
  },
  {
    id: 'm-2',
    sport: 'football',
    competition: 'Ligue 1 Uber Eats',
    homeTeam: 'Olympique de Marseille',
    awayTeam: 'Olympique Lyonnais',
    startTime: 'Dimanche, 20:45',
    odds: {
      home: 1.95,
      draw: 3.60,
      away: 3.75,
    },
    aiPrediction: {
      recommendedBet: 'Marseille Vainqueur (Remboursé si Nul)',
      targetOdds: 1.52,
      confidence: 81,
      aiProbability: 74.0,
      isValueBet: true,
      edge: +9.8,
      riskLevel: 'MODÉRÉ',
      keyStats: [
        'OM tourne à 2.15 buts marqués par match au Vélodrome',
        'Lyon en difficulté physique après le match de coupe en milieu de semaine',
        'Pressing haut marseillais gênant la relance lyonnaise'
      ],
      tacticalSummary: 'Avantage atmosphère Vélodrome et supériorité athlétique dans l\'entrejeu.'
    }
  },
  {
    id: 'm-3',
    sport: 'basketball',
    competition: 'NBA - Conférence Ouest',
    homeTeam: 'Boston Celtics',
    awayTeam: 'LA Lakers',
    startTime: 'Demain, 01:30',
    odds: {
      home: 1.55,
      away: 2.45,
    },
    aiPrediction: {
      recommendedBet: 'Boston Celtics -5.5 Handicap',
      targetOdds: 1.90,
      confidence: 84,
      aiProbability: 61.5,
      isValueBet: true,
      edge: +8.5,
      riskLevel: 'FAIBLE',
      keyStats: [
        'Offensive Rating Boston à domicile : 121.4 (1er NBA)',
        'Lakers en back-to-back avec déplacement transcontinental',
        'Défense extérieure des Celtics limitant les tirs à 33.1% à 3-pts'
      ],
      tacticalSummary: 'La fraîcheur physique des Celtics et leur profondeur de banc feront la différence dans le 3ème quart-temps.'
    }
  },
  {
    id: 'm-4',
    sport: 'tennis',
    competition: 'Roland-Garros - Finale Anticipée',
    homeTeam: 'Carlos Alcaraz',
    awayTeam: 'Jannik Sinner',
    startTime: 'Samedi, 15:00',
    odds: {
      home: 1.82,
      away: 2.05,
    },
    aiPrediction: {
      recommendedBet: 'Plus de 38.5 Jeux dans le match',
      targetOdds: 1.85,
      confidence: 89,
      aiProbability: 65.0,
      isValueBet: true,
      edge: +11.4,
      riskLevel: 'FAIBLE',
      keyStats: [
        'H2H ultra équilibré (5-4, 4 matchs en 5 sets)',
        'Taux de conversion de balles de break quasi identique (44% vs 46%)',
        'Vitesse de rebond sur terre battue favorisant les échanges longs'
      ],
      tacticalSummary: 'Duel d\'une intensité colossale. Match très probablement disputé en 4 ou 5 sets tendus avec au moins un tie-break.'
    }
  },
  {
    id: 'm-5',
    sport: 'mma',
    competition: 'UFC Main Event Titre Poids Lourds',
    homeTeam: 'Jon Jones',
    awayTeam: 'Stipe Miocic',
    startTime: 'Dimanche, 05:00',
    odds: {
      home: 1.35,
      away: 3.30,
    },
    aiPrediction: {
      recommendedBet: 'Jon Jones par Soumission ou Décision',
      targetOdds: 1.72,
      confidence: 86,
      aiProbability: 71.2,
      isValueBet: true,
      edge: +12.1,
      riskLevel: 'FAIBLE',
      keyStats: [
        'Allonge de Jon Jones supérieure de 21cm',
        'Défense contre amenées au sol : 95% pour Jones en carrière',
        'Inactivité de Miocic depuis plus de 18 mois'
      ],
      tacticalSummary: 'Contrôle à distance au jab oblique et oblique kicks, avant d\'amener le combat dans la zone de clinch et grappling.'
    }
  },
  {
    id: 'm-6',
    sport: 'esport',
    competition: 'CS2 Major Championship',
    homeTeam: 'Team Vitality',
    awayTeam: 'FaZe Clan',
    startTime: 'Ce soir, 19:30',
    odds: {
      home: 1.68,
      away: 2.15,
    },
    aiPrediction: {
      recommendedBet: 'Vitality Gagne Carte 1 (Pick Vitality)',
      targetOdds: 1.75,
      confidence: 80,
      aiProbability: 64.5,
      isValueBet: true,
      edge: +7.2,
      riskLevel: 'MODÉRÉ',
      keyStats: [
        'Winrate de ZywOo sur Mirage & Anubis : 82% en 2026',
        'FaZe a perdu son premier round d\'armure dans 65% des matchs récents',
        'Vitality affiche 74% de rounds CT convertis'
      ],
      tacticalSummary: 'Sur leur map de prédilection, le carry ZywOo et la cohésion de l\'équipe offrent une garantie statistique notable.'
    }
  },
  {
    id: 'm-7',
    sport: 'f1',
    competition: 'Grand Prix de Monaco',
    homeTeam: 'Charles Leclerc (Pole)',
    awayTeam: 'Max Verstappen',
    startTime: 'Dimanche, 15:00',
    odds: {
      home: 2.10,
      away: 1.85,
    },
    aiPrediction: {
      recommendedBet: 'Charles Leclerc réalise la Pole Position',
      targetOdds: 2.10,
      confidence: 76,
      aiProbability: 54.0,
      isValueBet: true,
      edge: +13.4,
      riskLevel: 'MODÉRÉ',
      keyStats: [
        'Vitesse de passage en courbe lente de la Ferrari supérieure de 3.2 km/h',
        'Historique de 3 poles à Monaco pour le pilote local',
        'Dégradation thermique nulle sur le pneu Soft en tour de qualif'
      ],
      tacticalSummary: 'Monaco se gagne le samedi. La maniabilité chirurgicale de la monoplace sur les vibreurs donne l\'avantage à Leclerc.'
    }
  }
];
