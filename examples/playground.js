const data = [{
    "time": "2018-06-24T15:30:01.904Z",
    "cpu": 23.145552105656076,
    "server": "demo-server"
},
    {
        "time": "2018-06-24T16:30:01.904Z",
        "cpu": 10.424267786483867,
        "server": "test-server"
    },
    {
        "time": "2018-06-24T17:30:01.904Z",
        "cpu": 23.691769196406714,
        "server": "demo-server"
    },
    {
        "time": "2018-06-24T18:30:01.904Z",
        "cpu": 23.27492418595674,
        "server": "demo-server"
    },
    {
        "time": "2018-06-24T19:30:01.904Z",
        "cpu": 23.271353786153327,
        "server": "test-server"
    },
    {
        "time": "2018-06-24T20:30:01.904Z",
        "cpu": 22.92074439315705,
        "server": "demo-server"
    },
    {
        "time": "2018-06-24T21:30:01.904Z",
        "cpu": 23.11210282740022,
        "server": "test-server"
    },
    {
        "time": "2018-06-24T22:30:01.904Z",
        "cpu": 22.888896455121,
        "server": "demo-server"
    },
    {
        "time": "2018-06-24T23:30:01.904Z",
        "cpu": 23.140232897680306,
        "server": "demo-server"
    },
    {
        "time": "2018-06-25T00:30:01.904Z",
        "cpu": 23.62603346139287,
        "server": "demo-server"
    },
    {
        "time": "2018-06-25T01:30:01.904Z",
        "cpu": 23.86456082089055,
        "server": "demo-server"
    },
    {
        "time": "2018-06-25T02:30:01.904Z",
        "cpu": 24.346851236707575,
        "server": "demo-server"
    },
    {
        "time": "2018-06-25T03:30:01.904Z",
        "cpu": 24.84186676949878,
        "server": "demo-server"
    },
    {
        "time": "2018-06-25T04:30:01.904Z",
        "cpu": 25.22250944107475,
        "server": "demo-server"
    },
    {
        "time": "2018-06-25T05:30:01.904Z",
        "cpu": 25.010413029796464,
        "server": "demo-server"
    },
    {
        "time": "2018-06-25T06:30:01.904Z",
        "cpu": 24.77313142288108,
        "server": "demo-server"
    },
    {
        "time": "2018-06-25T07:30:01.904Z",
        "cpu": 24.3613050455872,
        "server": "demo-server"
    },
    {
        "time": "2018-06-25T08:30:01.904Z",
        "cpu": 24.818728688705292,
        "server": "demo-server"
    },
    {
        "time": "2018-06-25T09:30:01.904Z",
        "cpu": 24.39876445385598,
        "server": "prod-server"
    },
    {
        "time": "2018-06-25T10:30:01.904Z",
        "cpu": 24.502432116686045,
        "server": "demo-server"
    },
    {
        "time": "2018-06-25T11:30:01.904Z",
        "cpu": 24.738301904226823,
        "server": "demo-server"
    },
    {
        "time": "2018-06-25T12:30:01.904Z",
        "cpu": 24.309983634585944,
        "server": "demo-server"
    },
    {
        "time": "2018-06-25T13:30:01.904Z",
        "cpu": 24.484520729822147,
        "server": "prod-server"
    },
    {
        "time": "2018-06-25T14:30:01.904Z",
        "cpu": 24.205860467958054,
        "server": "demo-server"
    }
];


const params = location.hash.match(/filter=(.+)/);
let selectedCategories = null;
if(params) {
    selectedCategories = JSON.parse(decodeURIComponent(params[1]));
}
let config = {
    type: 'line',
    x: 'time',
    y: 'cpu',
    color: 'server',
    dimensions: {
        time: {
            scale: 'time',
            type: 'measure'
        },
        cpu: {
            type: 'measure'
        },
        server: {
            type: 'category'
        }
    },
    plugins: [
        Taucharts.api.plugins.get('legend')({
            onSelect({selectedCategories}) {
                location.hash = 'filter=' + JSON.stringify(selectedCategories);
            },
            selectedCategories: selectedCategories
        }),
    ],

    data: data
};
const chart = new Taucharts.Chart(config);

chart.renderTo(document.body);

