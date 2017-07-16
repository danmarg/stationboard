
function set_autocomplete() {
  $('input[name=s], input[name=v], input[name=n]').autocomplete({
    source: function(request, response) {
              $.get('https://transport.opendata.ch/v1/locations', {query: request.term, type: 'station'}, function(data) {
                response($.map(data.stations, function(station) {
                  return {
                    label: station.name,
                station: station
                  }
                }));
                }, 'json');
            },
  select: function(event, ui) {
            station = ui.item.station.id;
          }
});
}

$(function() {
  set_autocomplete();
  $('#remove_station').hide();
  $('#remove_route').hide();
})

function generate_config() {
  config = {'stations': [], 'routes':[], weather:[] };
  var station;
  $('#stations div').each(function() {
    station = $(this).children('input[name=s]')[0].value;
    limit = $(this).children('input[name=l]')[0].value;
    config.stations.push({'station': station, 'limit': limit});
  });
  $('#routes div').each(function() {
    von = $(this).children('input[name=v]')[0].value;
    nach = $(this).children('input[name=n]')[0].value;
    limit = $(this).children('input[name=l]')[0].value
    config.routes.push({'von': von, 'nach': nach, 'limit': limit});
  });
  $('#weather input').each(function() {
    config.routes.push({'loc': $(this).value});
  });

  return config;
}

function add_station() {
  var idx = $('#stations>div').length;
  $('#stations').append('<div id="station' + idx + '"> <br/>' +
      'Station: <input type="text" name="s" />' +
      'Show next: <input type="number" name="l" value="4" size="2"/> ' +
      '</div>');
  
  set_autocomplete();
  $('#remove_station').show();
}

function remove_station() {
  var idx = $('#stations>div').length - 1;
  $('#station' + idx).remove();
  if (idx == 1) {
    $('#remove_station').hide();
  }
}

function add_route() {
  var idx = $('#routes>div').length;
  $('#routes').append('<div id="route' + idx + '"> ' +
      'From: <input type="text" name="v" />' +
      'To: <input type="text" name="n" /> ' +
      'Show next: <input type="number" name="l" value="4" size="2"/>' +
      '</div>');
  
  set_autocomplete();
  $('#remove_route').show();
}

function remove_route() {
  var idx = $('#routes>div').length - 1;
  $('#route' + idx).remove();
  if (idx == 1) {
    $('#remove_route').hide();
  }
}


function set_configuration() {
  var url = location.href.substr(0, location.href.lastIndexOf('/')) +"/?c=" +
            encodeURIComponent(JSON.stringify(generate_config()));
  $("#config_link").empty();
  $("#config_link").append('Click or bookmark this link: <a href="' +
      url + '">' + url + '</a>.');
}
