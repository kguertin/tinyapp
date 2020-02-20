const getUserByEmail = (userData, email) => {
  for (let id in userData) {
    if (userData[id].email === email){
      return userData[id];
    }
  }
};

module.exports = getUserByEmail;