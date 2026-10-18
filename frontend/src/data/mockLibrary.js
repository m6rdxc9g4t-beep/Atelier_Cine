/**
 * Catalogue factice utilisé quand l'API n'est pas joignable.
 * Même forme que la réponse de GET /api/library (voir backend/src/services/libraryStore.js).
 * Tous les titres sont inventés.
 */

const daysAgo = (n) => new Date(Date.now() - n * 86_400_000).toISOString();

export const mockLibrary = {
  featuredId: 'm-orbit',
  movies: [
    {
      id: 'm-orbit',
      type: 'movie',
      title: 'ORBIT',
      titleStyle: 'slashed-o',
      year: 2024,
      rating: '13+',
      durationMin: 135,
      quality: ['4K Ultra HD', 'HDR'],
      genres: ['Science-fiction', 'Aventure'],
      synopsis:
        "En orbite basse autour d'une planète océan, l'équipage d'un cargo minier capte un signal qui n'aurait jamais dû exister. Pour rentrer chez eux, ils devront choisir entre la mission et la vérité.",
      art: { palette: 5, motif: 'planet' },
      progress: null,
      addedAt: daysAgo(1),
    },
    { id: 'm-01', type: 'movie', title: 'Les Lueurs du Nord', year: 2023, rating: 'Tous publics', durationMin: 118, quality: ['4K Ultra HD'], genres: ['Fantastique'], synopsis: "Une cartographe découvre que les aurores dessinent une carte vers un royaume oublié.", art: { palette: 2, motif: 'forest' }, progress: null, addedAt: daysAgo(3) },
    { id: 'm-02', type: 'movie', title: 'Point de Rupture', year: 2022, rating: '16+', durationMin: 109, quality: ['1080p'], genres: ['Action'], synopsis: "Un ingénieur doit empêcher l'effondrement d'un barrage en pleine tempête.", art: { palette: 4, motif: 'road' }, progress: 0.62, addedAt: daysAgo(12) },
    { id: 'm-03', type: 'movie', title: 'Ligne de Fuite', year: 2021, rating: '13+', durationMin: 101, quality: ['1080p'], genres: ['Thriller'], synopsis: "Une nuit, un chauffeur, un passager qui ne veut pas dire où il va.", art: { palette: 0, motif: 'skyline' }, progress: 0.38, addedAt: daysAgo(20) },
    { id: 'm-04', type: 'movie', title: 'Le Dernier Phare', year: 2020, rating: '13+', durationMin: 126, quality: ['4K Ultra HD', 'HDR'], genres: ['Drame'], synopsis: "Le gardien d'un phare condamné refuse de quitter son île.", art: { palette: 3, motif: 'waves' }, progress: 0.71, addedAt: daysAgo(40) },
    { id: 'm-05', type: 'movie', title: 'Sable Rouge', year: 2024, rating: '13+', durationMin: 131, quality: ['4K Ultra HD'], genres: ['Aventure'], synopsis: "Deux frères traversent le désert pour retrouver la caravane de leur père.", art: { palette: 6, motif: 'sun' }, progress: null, addedAt: daysAgo(2) },
    { id: 'm-06', type: 'movie', title: 'Haute Altitude', year: 2019, rating: 'Tous publics', durationMin: 97, quality: ['1080p'], genres: ['Aventure'], synopsis: "Une ascension hivernale qui tourne au huis clos.", art: { palette: 3, motif: 'mountains' }, progress: 0.55, addedAt: daysAgo(60) },
    { id: 'm-07', type: 'movie', title: 'Néon Vertical', year: 2025, rating: '16+', durationMin: 114, quality: ['4K Ultra HD', 'HDR'], genres: ['Science-fiction', 'Polar'], synopsis: "Dans une mégapole verticale, une enquêtrice traque un voleur de souvenirs.", art: { palette: 7, motif: 'skyline' }, progress: null, addedAt: daysAgo(5) },
    { id: 'm-08', type: 'movie', title: 'Braises', year: 2023, rating: '13+', durationMin: 122, quality: ['1080p'], genres: ['Drame'], synopsis: "Un été d'incendies, un village, et une famille qui se déchire.", art: { palette: 4, motif: 'forest' }, progress: null, addedAt: daysAgo(9) },
    { id: 'm-09', type: 'movie', title: 'Horizon Zéro', year: 2022, rating: '13+', durationMin: 140, quality: ['4K Ultra HD'], genres: ['Science-fiction'], synopsis: "La première colonie martienne perd le contact avec la Terre.", art: { palette: 1, motif: 'planet' }, progress: null, addedAt: daysAgo(30) },
    { id: 'm-10', type: 'movie', title: 'Marée Basse', year: 2018, rating: 'Tous publics', durationMin: 92, quality: ['720p'], genres: ['Comédie'], synopsis: "Une colonie de vacances, un trésor de pirates et beaucoup trop de crabes.", art: { palette: 5, motif: 'waves' }, progress: null, addedAt: daysAgo(90) },
  ],
  shows: [
    { id: 's-01', type: 'show', title: 'Les Veilleurs', year: 2023, rating: '16+', seasons: 2, episodes: 16, quality: ['4K Ultra HD'], genres: ['Thriller'], synopsis: "Une unité de nuit surveille une ville qui ne dort jamais.", art: { palette: 0, motif: 'skyline' }, progress: 0.44, addedAt: daysAgo(4) },
    { id: 's-02', type: 'show', title: 'Cap Sud', year: 2022, rating: 'Tous publics', seasons: 3, episodes: 24, quality: ['1080p'], genres: ['Aventure'], synopsis: "Un voilier, cinq inconnus, un tour du monde.", art: { palette: 5, motif: 'waves' }, progress: null, addedAt: daysAgo(15) },
    { id: 's-03', type: 'show', title: 'Station Kepler', year: 2025, rating: '13+', seasons: 1, episodes: 8, quality: ['4K Ultra HD', 'HDR'], genres: ['Science-fiction'], synopsis: "La vie, les secrets et les pannes d'une station orbitale.", art: { palette: 3, motif: 'planet' }, progress: 0.18, addedAt: daysAgo(1) },
    { id: 's-04', type: 'show', title: 'La Forêt Profonde', year: 2021, rating: '13+', seasons: 2, episodes: 12, quality: ['1080p'], genres: ['Fantastique'], synopsis: "Chaque automne, quelqu'un disparaît à la lisière.", art: { palette: 2, motif: 'forest' }, progress: null, addedAt: daysAgo(25) },
    { id: 's-05', type: 'show', title: 'Route 7', year: 2020, rating: '13+', seasons: 4, episodes: 40, quality: ['1080p'], genres: ['Drame'], synopsis: "Le quotidien d'un relais routier perdu au milieu de nulle part.", art: { palette: 6, motif: 'road' }, progress: null, addedAt: daysAgo(70) },
    { id: 's-06', type: 'show', title: 'Synthétique', year: 2024, rating: '16+', seasons: 1, episodes: 10, quality: ['4K Ultra HD'], genres: ['Science-fiction'], synopsis: "Des androïdes de compagnie commencent à rêver.", art: { palette: 7, motif: 'sun' }, progress: null, addedAt: daysAgo(6) },
    { id: 's-07', type: 'show', title: 'Sommets', year: 2019, rating: 'Tous publics', seasons: 3, episodes: 18, quality: ['1080p'], genres: ['Documentaire'], synopsis: "Les plus hautes montagnes du monde, filmées au plus près.", art: { palette: 3, motif: 'mountains' }, progress: null, addedAt: daysAgo(50) },
    { id: 's-08', type: 'show', title: 'Cendres', year: 2022, rating: '16+', seasons: 2, episodes: 14, quality: ['1080p'], genres: ['Polar'], synopsis: "Un pompier enquête sur une série d'incendies volontaires.", art: { palette: 4, motif: 'skyline' }, progress: 0.81, addedAt: daysAgo(35) },
  ],
};
