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

  var config = $.QueryString['c'];
  if (config && config.length > 0) {
    config = JSON.parse(config);
  } else {
    config = {'stations':[], 'routes':[], 'weather':[]};
  }
  load_config(config);
})

function generate_config() {
  config = {'stations': [], 'routes':[], 'weather':[],'display':[]};
  for (var key in config) {
    $('#' + key).each(function(){
      var v = Object();
      $(this).children('div').each(function(){
        $(this).children('input').each(function(){
          v[$(this).attr('name')] = $(this).val();
        });
      });
      config[key].push(v);       
    });
  }
  return config;
}

function load_config(config) {
  var elm = $('#stations');
  elm.empty();
  for (var i in config['stations']) {
    var v = config['stations'][i];
    var s = add_station();
    s.children('input[name=s]').val(v.s);
    s.children('input[name=l]').val(v.l);
  }
  elm = $('#routes');
  elm.empty();
  for (var i in config['routes']) {
    var v = config['routes'][i];
    var s = add_route();
    s.children('input[name=v]').val(v.v);
    s.children('input[name=n]').val(v.n);
    s.children('input[name=l]').val(v.l);
  }
  if (config.weather != null && config.weather.length) {
    $('#weather0>input[name=l]').val(config.weather[0].l);
  }
  if (config.display != null && config.display.length) {
   $('#display0>input[name=i]').attr('checked', config.display[0].i=='on');
  }
}

function add_station() {
  var idx = $('#stations>div').length;
  $('#stations').append('<div id="station' + idx + '"> <br/>' +
      'Station: <input type="text" name="s" />' +
      'Show next: <input type="number" name="l" value="4" size="2"/> ' +
      '</div>');
  
  set_autocomplete();
  $('#remove_station').show();
  return $('#stations>div[id=station' + idx + ']');
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
      'To: <input type="text" name="n" />' +
      'Show next: <input type="number" name="l" value="4" max="10"/>' +
      'Add minutes to departure: <input type="number" name="m" value="0" max="120"/>' +
      '</div>');
  
  set_autocomplete();
  $('#remove_route').show();
  return $('#routes>div[id=route' + idx + ']');
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
