$(document).ready(function() {
  $("#showPasswordForm").click(function() {
    $("#formAuthPassword").toggle();
  });
});

$('#list-tab a').on('click', function (e) {
  e.preventDefault()
  $(this).tab('show')
})