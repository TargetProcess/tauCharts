dev.spec({
    type: 'bar',
    x: 'date',
    y: 'price',
    color: 'company',
    dimensions: {
        date: {type: 'measure', scale: 'time'},
        price: {type: 'measure', scale: 'linear'},
        company: {type: 'category', scale: 'ordinal'}
    },
    plugins: [
        Taucharts.api.plugins.get('diff-tooltip'),
        Taucharts.api.plugins.get('legend')
    ],
    data: [
        {
            company: 'MSFT',
            price: 39.81,
            date: '2000-01-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 36.35,
            date: '2000-02-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 43.22,
            date: '2000-03-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 28.37,
            date: '2000-04-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 25.45,
            date: '2000-05-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 32.54,
            date: '2000-06-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 28.4,
            date: '2000-07-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 28.4,
            date: '2000-08-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 24.53,
            date: '2000-09-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 28.02,
            date: '2000-10-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.34,
            date: '2000-11-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 17.65,
            date: '2000-12-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 24.84,
            date: '2001-01-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 24,
            date: '2001-02-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 22.25,
            date: '2001-03-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 27.56,
            date: '2001-04-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 28.14,
            date: '2001-05-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 29.7,
            date: '2001-06-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 26.93,
            date: '2001-07-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.21,
            date: '2001-08-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 20.82,
            date: '2001-09-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.65,
            date: '2001-10-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 26.12,
            date: '2001-11-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 26.95,
            date: '2001-12-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 25.92,
            date: '2002-01-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.73,
            date: '2002-02-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 24.53,
            date: '2002-03-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 21.26,
            date: '2002-04-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 20.71,
            date: '2002-05-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 22.25,
            date: '2002-06-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 19.52,
            date: '2002-07-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 19.97,
            date: '2002-08-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 17.79,
            date: '2002-09-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 21.75,
            date: '2002-10-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.46,
            date: '2002-11-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 21.03,
            date: '2002-12-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 19.31,
            date: '2003-01-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 19.34,
            date: '2003-02-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 19.76,
            date: '2003-03-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 20.87,
            date: '2003-04-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 20.09,
            date: '2003-05-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 20.93,
            date: '2003-06-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 21.56,
            date: '2003-07-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 21.65,
            date: '2003-08-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 22.69,
            date: '2003-09-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 21.45,
            date: '2003-10-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 21.1,
            date: '2003-11-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 22.46,
            date: '2003-12-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 22.69,
            date: '2004-01-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 21.77,
            date: '2004-02-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 20.46,
            date: '2004-03-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 21.45,
            date: '2004-04-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 21.53,
            date: '2004-05-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.44,
            date: '2004-06-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.38,
            date: '2004-07-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 22.47,
            date: '2004-08-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 22.76,
            date: '2004-09-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.02,
            date: '2004-10-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 24.6,
            date: '2004-11-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 24.52,
            date: '2004-12-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 24.11,
            date: '2005-01-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.15,
            date: '2005-02-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 22.24,
            date: '2005-03-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.28,
            date: '2005-04-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.82,
            date: '2005-05-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 22.93,
            date: '2005-06-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.64,
            date: '2005-07-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 25.35,
            date: '2005-08-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.83,
            date: '2005-09-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.8,
            date: '2005-10-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 25.71,
            date: '2005-11-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 24.29,
            date: '2005-12-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 26.14,
            date: '2006-01-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 25.04,
            date: '2006-02-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 25.36,
            date: '2006-03-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 22.5,
            date: '2006-04-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 21.19,
            date: '2006-05-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 21.8,
            date: '2006-06-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 22.51,
            date: '2006-07-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 24.13,
            date: '2006-08-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 25.68,
            date: '2006-09-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 26.96,
            date: '2006-10-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 27.66,
            date: '2006-11-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 28.13,
            date: '2006-12-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 29.07,
            date: '2007-01-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 26.63,
            date: '2007-02-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 26.35,
            date: '2007-03-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 28.3,
            date: '2007-04-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 29.11,
            date: '2007-05-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 27.95,
            date: '2007-06-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 27.5,
            date: '2007-07-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 27.34,
            date: '2007-08-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 28.04,
            date: '2007-09-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 35.03,
            date: '2007-10-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 32.09,
            date: '2007-11-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 34,
            date: '2007-12-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 31.13,
            date: '2008-01-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 26.07,
            date: '2008-02-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 27.21,
            date: '2008-03-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 27.34,
            date: '2008-04-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 27.25,
            date: '2008-05-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 26.47,
            date: '2008-06-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 24.75,
            date: '2008-07-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 26.36,
            date: '2008-08-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 25.78,
            date: '2008-09-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 21.57,
            date: '2008-10-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 19.66,
            date: '2008-11-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 18.91,
            date: '2008-12-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 16.63,
            date: '2009-01-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 15.81,
            date: '2009-02-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 17.99,
            date: '2009-03-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 19.84,
            date: '2009-04-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 20.59,
            date: '2009-05-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.42,
            date: '2009-06-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 23.18,
            date: '2009-07-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 24.43,
            date: '2009-08-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 25.49,
            date: '2009-09-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 27.48,
            date: '2009-10-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 29.27,
            date: '2009-11-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 30.34,
            date: '2009-12-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 28.05,
            date: '2010-01-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 28.67,
            date: '2010-02-01T00:00:00'
        },
        {
            company: 'MSFT',
            price: 28.8,
            date: '2010-03-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 64.56,
            date: '2000-01-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 68.87,
            date: '2000-02-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 67,
            date: '2000-03-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 55.19,
            date: '2000-04-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 48.31,
            date: '2000-05-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 36.31,
            date: '2000-06-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 30.12,
            date: '2000-07-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 41.5,
            date: '2000-08-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 38.44,
            date: '2000-09-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 36.62,
            date: '2000-10-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 24.69,
            date: '2000-11-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 15.56,
            date: '2000-12-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 17.31,
            date: '2001-01-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 10.19,
            date: '2001-02-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 10.23,
            date: '2001-03-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 15.78,
            date: '2001-04-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 16.69,
            date: '2001-05-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 14.15,
            date: '2001-06-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 12.49,
            date: '2001-07-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 8.94,
            date: '2001-08-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 5.97,
            date: '2001-09-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 6.98,
            date: '2001-10-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 11.32,
            date: '2001-11-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 10.82,
            date: '2001-12-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 14.19,
            date: '2002-01-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 14.1,
            date: '2002-02-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 14.3,
            date: '2002-03-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 16.69,
            date: '2002-04-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 18.23,
            date: '2002-05-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 16.25,
            date: '2002-06-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 14.45,
            date: '2002-07-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 14.94,
            date: '2002-08-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 15.93,
            date: '2002-09-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 19.36,
            date: '2002-10-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 23.35,
            date: '2002-11-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 18.89,
            date: '2002-12-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 21.85,
            date: '2003-01-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 22.01,
            date: '2003-02-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 26.03,
            date: '2003-03-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 28.69,
            date: '2003-04-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 35.89,
            date: '2003-05-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 36.32,
            date: '2003-06-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 41.64,
            date: '2003-07-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 46.32,
            date: '2003-08-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 48.43,
            date: '2003-09-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 54.43,
            date: '2003-10-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 53.97,
            date: '2003-11-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 52.62,
            date: '2003-12-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 50.4,
            date: '2004-01-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 43.01,
            date: '2004-02-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 43.28,
            date: '2004-03-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 43.6,
            date: '2004-04-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 48.5,
            date: '2004-05-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 54.4,
            date: '2004-06-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 38.92,
            date: '2004-07-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 38.14,
            date: '2004-08-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 40.86,
            date: '2004-09-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 34.13,
            date: '2004-10-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 39.68,
            date: '2004-11-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 44.29,
            date: '2004-12-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 43.22,
            date: '2005-01-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 35.18,
            date: '2005-02-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 34.27,
            date: '2005-03-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 32.36,
            date: '2005-04-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 35.51,
            date: '2005-05-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 33.09,
            date: '2005-06-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 45.15,
            date: '2005-07-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 42.7,
            date: '2005-08-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 45.3,
            date: '2005-09-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 39.86,
            date: '2005-10-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 48.46,
            date: '2005-11-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 47.15,
            date: '2005-12-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 44.82,
            date: '2006-01-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 37.44,
            date: '2006-02-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 36.53,
            date: '2006-03-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 35.21,
            date: '2006-04-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 34.61,
            date: '2006-05-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 38.68,
            date: '2006-06-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 26.89,
            date: '2006-07-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 30.83,
            date: '2006-08-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 32.12,
            date: '2006-09-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 38.09,
            date: '2006-10-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 40.34,
            date: '2006-11-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 39.46,
            date: '2006-12-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 37.67,
            date: '2007-01-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 39.14,
            date: '2007-02-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 39.79,
            date: '2007-03-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 61.33,
            date: '2007-04-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 69.14,
            date: '2007-05-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 68.41,
            date: '2007-06-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 78.54,
            date: '2007-07-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 79.91,
            date: '2007-08-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 93.15,
            date: '2007-09-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 89.15,
            date: '2007-10-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 90.56,
            date: '2007-11-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 92.64,
            date: '2007-12-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 77.7,
            date: '2008-01-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 64.47,
            date: '2008-02-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 71.3,
            date: '2008-03-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 78.63,
            date: '2008-04-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 81.62,
            date: '2008-05-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 73.33,
            date: '2008-06-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 76.34,
            date: '2008-07-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 80.81,
            date: '2008-08-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 72.76,
            date: '2008-09-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 57.24,
            date: '2008-10-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 42.7,
            date: '2008-11-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 51.28,
            date: '2008-12-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 58.82,
            date: '2009-01-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 64.79,
            date: '2009-02-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 73.44,
            date: '2009-03-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 80.52,
            date: '2009-04-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 77.99,
            date: '2009-05-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 83.66,
            date: '2009-06-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 85.76,
            date: '2009-07-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 81.19,
            date: '2009-08-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 93.36,
            date: '2009-09-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 118.81,
            date: '2009-10-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 135.91,
            date: '2009-11-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 134.52,
            date: '2009-12-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 125.41,
            date: '2010-01-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 118.4,
            date: '2010-02-01T00:00:00'
        },
        {
            company: 'AMZN',
            price: 128.82,
            date: '2010-03-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 100.52,
            date: '2000-01-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 92.11,
            date: '2000-02-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 106.11,
            date: '2000-03-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 99.95,
            date: '2000-04-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 96.31,
            date: '2000-05-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 98.33,
            date: '2000-06-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 100.74,
            date: '2000-07-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 118.62,
            date: '2000-08-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 101.19,
            date: '2000-09-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 88.5,
            date: '2000-10-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 84.12,
            date: '2000-11-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 76.47,
            date: '2000-12-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 100.76,
            date: '2001-01-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 89.98,
            date: '2001-02-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 86.63,
            date: '2001-03-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 103.7,
            date: '2001-04-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 100.82,
            date: '2001-05-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 102.35,
            date: '2001-06-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 94.87,
            date: '2001-07-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 90.25,
            date: '2001-08-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 82.82,
            date: '2001-09-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 97.58,
            date: '2001-10-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 104.5,
            date: '2001-11-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 109.36,
            date: '2001-12-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 97.54,
            date: '2002-01-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 88.82,
            date: '2002-02-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 94.15,
            date: '2002-03-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 75.82,
            date: '2002-04-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 72.97,
            date: '2002-05-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 65.31,
            date: '2002-06-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 63.86,
            date: '2002-07-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 68.52,
            date: '2002-08-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 53.01,
            date: '2002-09-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 71.76,
            date: '2002-10-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 79.16,
            date: '2002-11-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 70.58,
            date: '2002-12-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 71.22,
            date: '2003-01-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 71.13,
            date: '2003-02-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 71.57,
            date: '2003-03-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 77.47,
            date: '2003-04-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 80.48,
            date: '2003-05-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 75.42,
            date: '2003-06-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 74.28,
            date: '2003-07-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 75.12,
            date: '2003-08-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 80.91,
            date: '2003-09-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 81.96,
            date: '2003-10-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 83.08,
            date: '2003-11-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 85.05,
            date: '2003-12-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 91.06,
            date: '2004-01-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 88.7,
            date: '2004-02-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 84.41,
            date: '2004-03-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 81.04,
            date: '2004-04-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 81.59,
            date: '2004-05-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 81.19,
            date: '2004-06-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 80.19,
            date: '2004-07-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 78.17,
            date: '2004-08-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 79.13,
            date: '2004-09-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 82.84,
            date: '2004-10-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 87.15,
            date: '2004-11-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 91.16,
            date: '2004-12-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 86.39,
            date: '2005-01-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 85.78,
            date: '2005-02-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 84.66,
            date: '2005-03-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 70.77,
            date: '2005-04-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 70.18,
            date: '2005-05-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 68.93,
            date: '2005-06-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 77.53,
            date: '2005-07-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 75.07,
            date: '2005-08-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 74.7,
            date: '2005-09-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 76.25,
            date: '2005-10-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 82.98,
            date: '2005-11-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 76.73,
            date: '2005-12-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 75.89,
            date: '2006-01-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 75.09,
            date: '2006-02-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 77.17,
            date: '2006-03-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 77.05,
            date: '2006-04-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 75.04,
            date: '2006-05-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 72.15,
            date: '2006-06-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 72.7,
            date: '2006-07-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 76.35,
            date: '2006-08-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 77.26,
            date: '2006-09-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 87.06,
            date: '2006-10-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 86.95,
            date: '2006-11-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 91.9,
            date: '2006-12-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 93.79,
            date: '2007-01-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 88.18,
            date: '2007-02-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 89.44,
            date: '2007-03-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 96.98,
            date: '2007-04-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 101.54,
            date: '2007-05-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 100.25,
            date: '2007-06-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 105.4,
            date: '2007-07-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 111.54,
            date: '2007-08-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 112.6,
            date: '2007-09-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 111,
            date: '2007-10-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 100.9,
            date: '2007-11-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 103.7,
            date: '2007-12-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 102.75,
            date: '2008-01-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 109.64,
            date: '2008-02-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 110.87,
            date: '2008-03-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 116.23,
            date: '2008-04-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 125.14,
            date: '2008-05-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 114.6,
            date: '2008-06-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 123.74,
            date: '2008-07-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 118.16,
            date: '2008-08-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 113.53,
            date: '2008-09-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 90.24,
            date: '2008-10-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 79.65,
            date: '2008-11-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 82.15,
            date: '2008-12-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 89.46,
            date: '2009-01-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 90.32,
            date: '2009-02-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 95.09,
            date: '2009-03-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 101.29,
            date: '2009-04-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 104.85,
            date: '2009-05-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 103.01,
            date: '2009-06-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 116.34,
            date: '2009-07-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 117,
            date: '2009-08-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 118.55,
            date: '2009-09-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 119.54,
            date: '2009-10-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 125.79,
            date: '2009-11-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 130.32,
            date: '2009-12-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 121.85,
            date: '2010-01-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 127.16,
            date: '2010-02-01T00:00:00'
        },
        {
            company: 'IBM',
            price: 125.55,
            date: '2010-03-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 25.94,
            date: '2000-01-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 28.66,
            date: '2000-02-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 33.95,
            date: '2000-03-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 31.01,
            date: '2000-04-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 21,
            date: '2000-05-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 26.19,
            date: '2000-06-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 25.41,
            date: '2000-07-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 30.47,
            date: '2000-08-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 12.88,
            date: '2000-09-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 9.78,
            date: '2000-10-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 8.25,
            date: '2000-11-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 7.44,
            date: '2000-12-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 10.81,
            date: '2001-01-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 9.12,
            date: '2001-02-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 11.03,
            date: '2001-03-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 12.74,
            date: '2001-04-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 9.98,
            date: '2001-05-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 11.62,
            date: '2001-06-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 9.4,
            date: '2001-07-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 9.27,
            date: '2001-08-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 7.76,
            date: '2001-09-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 8.78,
            date: '2001-10-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 10.65,
            date: '2001-11-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 10.95,
            date: '2001-12-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 12.36,
            date: '2002-01-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 10.85,
            date: '2002-02-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 11.84,
            date: '2002-03-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 12.14,
            date: '2002-04-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 11.65,
            date: '2002-05-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 8.86,
            date: '2002-06-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 7.63,
            date: '2002-07-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 7.38,
            date: '2002-08-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 7.25,
            date: '2002-09-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 8.03,
            date: '2002-10-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 7.75,
            date: '2002-11-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 7.16,
            date: '2002-12-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 7.18,
            date: '2003-01-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 7.51,
            date: '2003-02-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 7.07,
            date: '2003-03-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 7.11,
            date: '2003-04-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 8.98,
            date: '2003-05-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 9.53,
            date: '2003-06-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 10.54,
            date: '2003-07-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 11.31,
            date: '2003-08-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 10.36,
            date: '2003-09-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 11.44,
            date: '2003-10-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 10.45,
            date: '2003-11-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 10.69,
            date: '2003-12-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 11.28,
            date: '2004-01-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 11.96,
            date: '2004-02-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 13.52,
            date: '2004-03-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 12.89,
            date: '2004-04-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 14.03,
            date: '2004-05-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 16.27,
            date: '2004-06-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 16.17,
            date: '2004-07-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 17.25,
            date: '2004-08-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 19.38,
            date: '2004-09-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 26.2,
            date: '2004-10-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 33.53,
            date: '2004-11-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 32.2,
            date: '2004-12-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 38.45,
            date: '2005-01-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 44.86,
            date: '2005-02-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 41.67,
            date: '2005-03-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 36.06,
            date: '2005-04-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 39.76,
            date: '2005-05-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 36.81,
            date: '2005-06-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 42.65,
            date: '2005-07-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 46.89,
            date: '2005-08-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 53.61,
            date: '2005-09-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 57.59,
            date: '2005-10-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 67.82,
            date: '2005-11-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 71.89,
            date: '2005-12-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 75.51,
            date: '2006-01-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 68.49,
            date: '2006-02-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 62.72,
            date: '2006-03-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 70.39,
            date: '2006-04-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 59.77,
            date: '2006-05-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 57.27,
            date: '2006-06-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 67.96,
            date: '2006-07-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 67.85,
            date: '2006-08-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 76.98,
            date: '2006-09-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 81.08,
            date: '2006-10-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 91.66,
            date: '2006-11-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 84.84,
            date: '2006-12-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 85.73,
            date: '2007-01-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 84.61,
            date: '2007-02-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 92.91,
            date: '2007-03-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 99.8,
            date: '2007-04-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 121.19,
            date: '2007-05-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 122.04,
            date: '2007-06-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 131.76,
            date: '2007-07-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 138.48,
            date: '2007-08-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 153.47,
            date: '2007-09-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 189.95,
            date: '2007-10-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 182.22,
            date: '2007-11-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 198.08,
            date: '2007-12-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 135.36,
            date: '2008-01-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 125.02,
            date: '2008-02-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 143.5,
            date: '2008-03-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 173.95,
            date: '2008-04-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 188.75,
            date: '2008-05-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 167.44,
            date: '2008-06-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 158.95,
            date: '2008-07-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 169.53,
            date: '2008-08-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 113.66,
            date: '2008-09-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 107.59,
            date: '2008-10-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 92.67,
            date: '2008-11-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 85.35,
            date: '2008-12-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 90.13,
            date: '2009-01-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 89.31,
            date: '2009-02-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 105.12,
            date: '2009-03-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 125.83,
            date: '2009-04-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 135.81,
            date: '2009-05-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 142.43,
            date: '2009-06-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 163.39,
            date: '2009-07-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 168.21,
            date: '2009-08-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 185.35,
            date: '2009-09-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 188.5,
            date: '2009-10-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 199.91,
            date: '2009-11-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 210.73,
            date: '2009-12-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 192.06,
            date: '2010-01-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 204.62,
            date: '2010-02-01T00:00:00'
        },
        {
            company: 'AAPL',
            price: 223.02,
            date: '2010-03-01T00:00:00'
        }
    ]
});