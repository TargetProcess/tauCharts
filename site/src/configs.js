export const configs = [{
    data: 'OscarNominees',
    type: 'scatterplot',
    x: 'Year',
    y: 'Runtime',
    color: 'isWinner',
    size: null,
    plugins: ['tooltip', 'legend'],
    description: ['How duration of Oscar\'s Best Picture Nominees was changing', 'Dataset about Oscar\'s Best Picture Nominees, including IMDB and Rotten Tomatoes ratings']
}, {
    data: 'Comets',
    type: 'scatterplot',
    x: 'Discovery Date',
    y: ['PHA', 'q (AU)'],
    color: 'Orbit Class',
    size: 'period (yr)',
    plugins: ['tooltip', 'legend'],
    description: ['Just a cool chart about comets', 'Source: data.nasa.gov']
}, {
    data: 'WorldBank',
    type: 'scatterplot',
    x: 'Adolescent fertility rate (births per 1,000 women ages 15-19)',
    y: 'Internet users (per 100 people)',
    color: 'Region',
    size: null,
    plugins: ['tooltip', 'legend', 'trendline'],
    description: ['How count of internet users correlates with adolescent fertility', 'A lot demographic data about countries from worldbank.org']
}, {
    data: 'EnglishPremierLeague',
    type: 'line',
    x: 'Year',
    y: 'Points',
    color: 'Position',
    size: null,
    plugins: ['tooltip', 'legend'],
    description: ['How much points had a team on a particular place in English Premier League', 'Dataset based on final standings of Barclays Premier League 1992—2015']
}];