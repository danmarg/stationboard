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
  
  var stations = ($.QueryString['stations'] || 'Zürich HB').split(';');
  var limit = $.QueryString['limit'] || 8;

  function get_station(station) {
    $.get('http://transport.opendata.ch/v1/stationboard', {id: station, limit: limit}, function(data) {
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
  function normalize(id) {
    return id.replace(/[^a-zA-Z0-9]/g, '_');
  }
  function refresh() {
    $('#clock').text(moment().format('H:mm'));
    for (var i = 0; i < stations.length; i++) {
      station = stations[i];
      get_station(station);
    }
  }
  for (var i = 0; i < stations.length; i++) {
    station = stations[i];
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
    $('#stationboard').append(table);
  }
  setInterval(refresh, 30000);
  refresh();
});

