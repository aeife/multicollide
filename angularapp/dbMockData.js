conn = new Mongo();
db = conn.getDB("multicollide");

// remove old db
db.users.remove();

var defaults = {
  signupDate: new Date(),
  language: 'en-US',
  games: 0,
  ratio: 50,
  elo: 50,
  wins: 0,
  date: new Date(),
};

var usernames = [
  'Ted',
  'Barney',
  'Robin',
  'Marshall',
  'Lily',
  'Homer',
  'Marge',
  'Bart',
  'Lisa',
  'Maggie',
  'Al',
  'Peggy',
  'Kelly',
  'Bud',
  'Charlie',
  'Alan',
  'Jake',
  'Doug',
  'Carrie',
  'Arthur'
];

var userCount = usernames.length;

// generate users
var users = [];
for (var i = 0; i < userCount; i++){
  users.push({
    name: usernames[i],
    password: 'ee26b0dd4af7e749aa1a8ee3c10ae9923f618980772e473f8819a5d4940e0db27ac185f8a0e1d5f84f88bc887fd67b143732c304cc5fa9ad8e6f57f50028a8ff',
    email: 'test@multicollide.de',
    signupDate: defaults.signupDate,
    language: defaults.language,
    games: 0,
    gamesParticipated: [],
    ratio: defaults.ratio,
    elo: defaults.elo,
    wins: defaults.wins,
    friends: [],
    requests: []
  });
}

// make friends
for (var i = 0; i < userCount * 2; i++){
  makeFriend(users[Math.floor(Math.random() * userCount)], users[Math.floor(Math.random() * userCount)]);
}

// insert users
for (var i = 0; i < userCount; i++){
  db.users.insert(users[i]);
}

function makeFriend(user1, user2){
  if (user1.name !== user2.name && user1.friends.indexOf(user2.name) === -1) {
    user1.friends.push(user2.name);
    user2.friends.push(user1.name);
  }
}
