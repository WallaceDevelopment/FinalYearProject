// This JavaScript code toggles the password change form for an authenticated user.

$(document).ready(function() {
  $("#showPasswordForm").click(function() {
    $("#formAuthPassword").toggle();
  });
});


$('#list-tab a').on('click', function (e) {
  e.preventDefault()
  $(this).tab('show')
})

$(function () {
  $('[data-toggle="tooltip"]').tooltip()
})




// This AJAX code makes a call to the express backend for form validation.

$('#register-btn').click(function () {
  $.ajax({
    url: '/register',
    type: 'POST',
    cache: false,
    data: {
      username: $('#username').val(),
      fullname: $('#fullname').val(),
      email: $('#email').val(),
      password: $('#password').val(),
      confirmPassword: $('#confirmPassword').val()
    },
    success: function () {
      $('#error-group').css('display', 'none');
      console.log('Script.js : Successful Registration')
    },
    error: function (data) {
      $('#error-group').css('display', 'block');
      var errors = JSON.parse(data.responseText);
      var errorsContainer = $('#errors');
      errorsContainer.innerHTML = '';
      var errorsList = '';

      for (var i = 0; i < errors.length; i++) {
        errorsList += '<li>' + errors[i].msg + '</li>';
      }
      errorsContainer.html(errorsList);
    }
  });
});