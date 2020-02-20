const { assert } = require('chai')

const  getUserByEmail = require('../helpers.js');

//Test Data
const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

// Tests
describe('getUserByEmail', () => {
  it('should return true when passed a matching email to email match', () => {
    const user = getUserByEmail(testUsers, 'user@example.com');
    const expectedOutput = 'userRandomID';
    assert.equal(user.id, expectedOutput);
  });
  it('should returned true when passed an email that doesn\'t exist', () => {
    const user = getUserByEmail(testUsers, 'beep@boop.com');
    const expectedOutput = undefined;
    assert.equal(user, expectedOutput);
  })
})