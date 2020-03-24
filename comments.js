    
    
    /*

    // REGISTER POST FORM

    connection.query("select * from tbl_users_test where username = ?", [regUsername], function (err, result) { //values inserted into the query
      if (err) throw err;
      if (result) {
        console.log('Username exists')
        return res.redirect("/signin"); // Redirect user to the signin page
      }
    })
    */

    /*
   var checkSql = ("SELECT * FROM tbl_users_test WHERE username = ?", [regUsername]);
   var checkSqlRes = connection.query(checkSql, function(err,result) {
     console.log(result)
     return result;
     }
   );

   console.log(checkSqlRes)
   

    // Check if username already exists, if it does, return an message to user

    connection.query("select * from tbl_users_test where username = ?", [regUsername], function usrExist(err,result){
      if (err) throw err;

      if (result) {
        //console.log(result)
        var resultStringify = (JSON.stringify(result)); // JSON is stringified here
        //console.log(resultStringify)

        if (resultStringify.includes('id')) {
          console.log('contains ID');
          req.flash('message', 'Username already exists IN FUNCTION') // Display the password error
          res.sendStatus(500)
          return;
        } else {
          console.log('Does not contain ID')
        }
    } 
  });

  */

  /*

  .custom(async (email, {req, res}) =>{

    const usrCheckString = "SELECT * FROM tbl_users_test WHERE username = ?";
    return await connection.query(usrCheckString, [req.body.username], (err, result) => {
      if (err) {
        console.log(err)
      } else {
        var resultStringify = (JSON.stringify(result)); // JSON is stringified here

        if (resultStringify.includes(req.body.username)) {
          console.log('AWAIT CONNECTION HAS RETURNED AN EXISTING USER')
          req.flash('message', 'Existing USER') // Display the password error
          return false;
        } else {
          return req.body.username;
        }
      }
    })
  })



  */