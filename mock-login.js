/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict'

function refreshUsername() {
  document.getElementById('username').innerHTML = Cookies.get('username') || '';
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
