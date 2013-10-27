
function set_autocomplete() {
  $('input[name=s]').autocomplete({
    source: function(request, response) {
              $.get('http://transport.opendata.ch/v1/locations', {query: request.term, type: 'station'}, function(data) {
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
})

function generate_config() {
  config = {'stations': {} };
  var station;
  $('#stations div').each(function() {
    station = $(this).children('input[name=s]')[0].value;
    limit = $(this).children('input[name=l]')[0].value;
    config.stations[station] = limit;
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
  $('#remove').show();
}

function remove_station() {
  var idx = $('#stations>div').length - 1;
  $('#station' + idx).remove();
  if (idx == 1) {
    $('#remove').hide();
  }
}

function set_configuration() {
  var url = location.protocol + "//" + location.host + "/?config=" + encodeURIComponent(JSON.stringify(generate_config()));
  $("#config_link").empty();
  $("#config_link").append('Click or bookmark this link: <a href="' +
      url + '">' + url + '</a>.');
}
