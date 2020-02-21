$('#signinbtn').click(function () {
    $.ajax({
      url: '/register',
      type: 'POST',
      cache: false,
      data: {
        name: $('#name').val(),
        email: $('#email').val(),
        password: $('#password').val(),
        fullname: $('#fullname').val()
      },
      success: function () {
        $('#error-group').css('display', 'none');
        alert('Your submission was successful');
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