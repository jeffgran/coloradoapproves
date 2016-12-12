
var placeSearch, autocomplete;
var componentForm = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'short_name',
  country: 'long_name',
  postal_code: 'short_name'
};

function initAutocomplete() {
  // Create the autocomplete object, restricting the search to geographical
  // location types.
  autocomplete = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */(document.getElementById('address-autocomplete')),
    {types: ['geocode']});

  // When the user selects an address from the dropdown, populate the address
  // fields in the form.
  autocomplete.addListener('place_changed', fillInAddress);
}

function fillInAddress() {
  hideError();

  var place = autocomplete.getPlace();
  console.log(place.formatted_address);
  window.fetch('https://www.googleapis.com/civicinfo/v2/representatives?address='+window.encodeURIComponent(place.formatted_address)+'&key='+'AIzaSyCuK5G6R3_yBIR9-zMWCSw2xmSc7vNM9yQ&levels=administrativeArea1&roles=legislatorLowerBody&roles=legislatorUpperBody')
    .then(function(response) {
      return response.json();
    }).then(function(json) {
      showResult(json);
    })
    .catch(function(err) {
      // TODO display error
      console.error(err);
      showError();
    });
}

// Bias the autocomplete object to the user's geographical location,
// as supplied by the browser's 'navigator.geolocation' object.
function geolocate() {
  var colorado = new google.maps.Rectangle({
    bounds: {
      north: 41,
      south: 37,
      east: -102,
      west: -109.5
    }
  });
  autocomplete.setBounds(colorado.getBounds());
};

var officialTemplate;
$(function() {
  officialTemplate = Handlebars.compile($("#official-template").html());

  $('#step-nav-tabs a').click(function (e) {
    e.preventDefault();
    if ($(this).parent().hasClass('disabled')) return;
    $(this).tab('show');
  });

});

function showError() {
  $('#error').show();
}
function hideError() {
  $('#error').hide();
}


function showResult(civicdata) {
  var rep = function(official)  {
    return {
      name: official.name,
      urls: official.urls,
      photoUrl: official.photoUrl,
      party: official.party,
      emails: official.emails,
      phones: official.phones,
      twitter: official.channels.find(function(o) { return o.type == "Twitter"; }),
      facebook: official.channels.find(function(o) { return o.type == "Facebook"; }),
      address: "C/O " + official.name + ', 200 E Colfax Ave, Denver CO 80203',
      isRepublican: official.party == "Republican"
    };
  };

  var official1 = civicdata.officials[civicdata.offices[0].officialIndices[0]];
  var official2 = civicdata.officials[civicdata.offices[1].officialIndices[0]];

  var rep1 = {
    districtName: civicdata.offices[0].name,
    official: rep(official1)
  };
  var rep2 = {
    districtName: civicdata.offices[1].name,
    official: rep(official2)
  };

  // console.log(rep1);
  // console.log(rep2);

  $('#rep1').html(officialTemplate(rep1));
  $('#rep2').html(officialTemplate(rep2));


  $('#tab-step2').removeClass('disabled');
  $('#tab-step2 a').tab('show');

  FB.XFBML.parse(document.getElementById('tab-step2-content'));

}
