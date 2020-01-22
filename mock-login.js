/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict'

function refreshUsername() {
  const currentUser = Cookies.get('username') || '';
  document.getElementById('username').innerHTML = currentUser;

  if(currentUser) {
    document.getElementById('logged-in').classList.remove('hide');
    document.getElementById('logged-out').classList.add('hide');
  } else {
    // not logged in
    document.getElementById('logged-in').classList.add('hide');
    document.getElementById('logged-out').classList.remove('hide');
  }
}

function login() {
  console.log('Setting login cookie.');
  Cookies.set('username', 'JaneDoe', { path: '', secure: true, sameSite: 'None' });
  refreshUsername();
}

function logout() {
  console.log('Clearing login cookie.');
  Cookies.remove('username', { path: '' });
  refreshUsername();
}
