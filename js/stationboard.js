(function($) {
    $.QueryString = (function(a) {
        if (a == "") return {};
        var b = {};
        for (var i = 0; i < a.length; ++i)
        {
            var p=a[i].split('=');
            if (p.length != 2) continue;
            b[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
        }
        return b;
    })(window.location.search.substr(1).split('&'))
})(jQuery);

$(function() {

  var config = $.QueryString['c'];
  if (config && config.length > 0) {
    config = JSON.parse(config);
    for (var i = 0; i < config.stations.length; i++) {
      if (config.stations[i].station == '') {
        config.stations.splice(i, 1);
        i--;
      } 
    }
    for (var i = 0; i < config.routes.length; i++) {
      if (config.routes[i].von == '') {
        config.routes.splice(i, 1);
        i--;
      }
    }
  } else {
    config = {'stations':[], 'routes':[]};
  }
  if (config.stations.length == 0 && config.routes.length == 0) {
    config.stations.push({'station': 'Zürich HB', 'limit': 8});
    $('#routes').hide();
  } else if (config.stations.length == 0) {
    $('#stationboard').hide();
  }

  function get_timetable(station, limit) {
    $.get('https://transport.opendata.ch/v1/stationboard', {id: station, limit: limit}, function(data) {
      $('#' + normalize(station) + ' tbody').empty();
      $(data.stationboard).each(function () {
        var prognosis, departure, delay, line = '<tr><td>';
        departure = moment(this.stop.departure);
        if (this.stop.prognosis.departure) {
          prognosis = moment(this.stop.prognosis.departure);
          delay = (prognosis.valueOf() - departure.valueOf()) / 60000;
          line += departure.format('HH:mm') + ' <strong>+' + delay + ' min</strong>';
        } else {
          line += departure.format('HH:mm');
        }
        line += '</td><td>' + this.name + '</td>'
        line += '<td>' + this.stop.station.name + '</td>';
        line += '<td>' + this.to + '</td></tr>'
      $('#' + normalize(station) + ' tbody').append(line);
      });
      }, 'json');
  }
  function get_route(from, to, limit) {
    $.get('https://transport.opendata.ch/v1/connections', {from: from, to: to, limit: limit}, function(data) {
       var id = '#' + normalize(from) + '-' + normalize(to) + ' tbody';
       $(id).empty();
       $(data.connections).each(function() {
         var departure = moment(this.from.departure).format('HH:mm');
         var arrival = moment(this.to.arrival).format('HH:mm');
         var duration = this.duration;
         var transfers = this.transfers;
         var route = '';
         for (var i = 0; i < this.sections.length; i++) {
           var section = this.sections[i];
           route += section.departure.station.name + '&mdash;';
           if (section.journey) {
             route += '<em>' + section.journey.name.trim() + '</em>';
           } else {
             route += '<em>Walk</em>';
           }
           route += '&rarr;';
           if (i == this.sections.length - 1) {
             route += section.arrival.station.name.trim();
           }
         }
         var line = '<tr><td>' +
         departure + '</td><td>' +
         route + '</td><td>' +
         arrival + '</td></tr>';

         $(id).append(line);
       });
       }, 'json');
  }
  function normalize(id) {
    return id.replace(/[^a-zA-Z0-9]/g, '_');
  }
  function refresh() {
    $('#clock').text(moment().format('H:mm'));
    for (var i = 0; i < config.stations.length; i++) {
      get_timetable(config.stations[i].station, config.stations[i].limit);
    }
    for (var i = 0; i < config.routes.length; i++) {
      get_route(config.routes[i].von, config.routes[i].nach, config.routes[i].limit);
    }
  }
  // Station boards
  for (var i = 0; i < config.stations.length; i++) {
    var station = config.stations[i].station;
    var table = '<div id="' + normalize(station) + '">' +
      '<h3 class="station">' + station + '</h3>' +
      '<table>' +
      '<colgroup><col width="150"><col width="150"><col width="250"><col width="250"></colgroup>' +
      '<thead><tr><th align="left">Zeit</th>' +
      '<th align="left">Route</th>' +
      '<th align="left">Von</th>' +
      '<th align="left">Nach</th>' +
      '</tr></thead>' +
      '<tbody></tbody></table></div>';
    $('#stationboard').html(table);
  }
  // Routes
  for (var i = 0; i < config.routes.length; i++) {
    var route = config.routes[i];
    var id = normalize(route.von) + '-' + normalize(route.nach);
    var table = '<div id="' + id + '">' +
      '<h3 class="station">' + route.von + ' &rarr; ' + route.nach + '</h3>' +
      '<table>' +
      '<colgroup><col width="150"><col width="500"><col width="150"></colgroup>' +
      '<thead><tr><th align="left">Abfahrtszeit</th>' +
      '<th align="left">Route</th>' +
      '<th align="left">Ankunftszeit</th>' +
      '</tr></thead>' +
      '<tbody></tbody></table></div>';
    $('#routes').html(table);
  }
  // Weather
  for (var i = 0; i < config.weather.length; i++) {
    var loc = config.weather[i];
    $.simpleWeather({
      location: loc,
      unit: 'c',
      success: function(weather) {
        var html = '<h3>' + weather.temp + '&deg;' + weather.units.temp + '</h3>' +
          '<p>' +
          '<b>' + weather.city + ', ' + weather.region + '</b>' +
          '<br/>' + weather.currently +
          // First day of forceast.
          '<br/>' + weather.forecast[0].day + ': ' +
        weather.forecast[0].text + '</p>';
        $("#weather").html(html);
    },
    error: function(error) {
      $("#weather").html('<p>'+error+'</p>');
    }
  });

  setInterval(refresh, 30000);
  refresh();
});

