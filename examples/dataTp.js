function getCountOfEntitiesByTeamOnMonth() {
    var datePrefix = "/Date";
    var dateRegExp = /^\/Date\((-?\d+)(([+-])(\d{2})(\d{2}))\)\//;
    var parseDate = function (dateString) {

        if (_.isString(dateString) && dateString.indexOf(datePrefix) === 0) {

            var res = dateString.match(dateRegExp);
            var serverTime = parseInt(res[1]);
            var serverOffsetMinutes = (parseInt(res[4]) * 60 + parseInt(res[5])) * parseInt(res[3] + '1');

            dateString = new Date(serverTime);
            // dateString.sourceOffset = serverOffsetMinutes;
        }

        return new Date(dateString);
    };
    var host = "https://plan.tpondemand.com";
    var url = host + "/api/v2/UserStory?where=(endDate!=null and (team.name == \"alaska\" or team.name == \"CAT\" or team.name == \"λ\" or team.name == \"NEW TEAM\"))&select={endDate,team:team.name}&take=10000";
    return $
        .ajax({
            url: url,
            data: {
                format: 'json',
                take: 1000
            },
            jsonp: "callback",
            dataType: "jsonp"
        })
        .then(function (data) {
            return _(data.items)
                .chain()
                .filter(function (x) {
                    return new Date('2013-09-31').getTime() < parseDate(x.endDate);
                })
                .map(function (x) {
                    return {
                        team: x.team || null,
                        endDate: parseDate(x.endDate)
                    };
                })
                .value();
        }).then(function (items) {
            var byTeams = _.groupBy(items, 'team');

            var getMonth = function (x) {
                var sd = x.endDate;
                var dd = Date.UTC(sd.getUTCFullYear(), sd.getUTCMonth(), 1);
                return dd;
            };

            var zzz = _.reduce(
                byTeams,
                function (memo, v, k) {
                    var teams = ['NEW TEAM', 'Alaska', 'NEW TEAM', 'CAT', 'λ'];
                    if (!_.contains(teams, k)) {
                        return memo
                    }
                    memo[k] = _(v)
                        .chain()
                        .groupBy(getMonth)
                        .reduce(function (res, value, key) {
                            res.push({x: parseInt(key, 10), y: value.length});
                            return res;
                        }, [])
                        .value();
                    return memo;
                },
                {});
            return zzz;
        }).then(function (data) {
            return _.flatten(_.map(data, function (values, key) {
                return _.map(values, function (element) {
                    return {
                        team: key,
                        count: element.y,
                        month: element.x
                    }
                })
            })).sort(function (a, b) {
                return a.month - b.month;
            }).map(function (e) {
                var date = new Date(e.month);
                var s = date.getUTCFullYear() + ' - ' + (date.getUTCMonth()+1);
                return {
                    team: e.team,
                    count: e.count,
                    month: s
                }
            })
        })
}