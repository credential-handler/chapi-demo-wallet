/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict'

function login() {
  saveCurrentUser('JaneDoe');
  refreshUserArea();
}

function logout() {
  resetCurrentUser();
  clearCredentialsList();
  refreshUserArea();
}

function refreshUserArea() {
  const currentUser = loadCurrentUser();
  document.getElementById('username').innerHTML = currentUser;

  if(currentUser) {
    document.getElementById('logged-in').classList.remove('hide');
    document.getElementById('logged-out').classList.add('hide');
  } else {
    // not logged in
    document.getElementById('logged-in').classList.add('hide');
    document.getElementById('logged-out').classList.remove('hide');
  }

  // Refresh the user's list of credentials
  clearCredentialsList();
  const credentials = loadCredentials() || ['none'];
  for(const cred of credentials) {
    addToCredentialsList(cred);
  }
}

function loadCredentials() {
  return null;
}

function clearCredentialsList() {
  const creds = document.getElementById('credentialsList');
  while(creds.firstChild)
    creds.removeChild(creds.firstChild);
}

function addToCredentialsList(txt) {
  const li = document.createElement('li');
  li.appendChild(document.createTextNode(txt));

  document.getElementById('credentialsList')
    .appendChild(li);
}

function loadCurrentUser() {
  return Cookies.get('username') || '';
}

function saveCurrentUser(name) {
  console.log('Setting login cookie.');
  Cookies.set('username', name, { path: '', secure: true, sameSite: 'None' });
}

function resetCurrentUser() {
  console.log('Clearing login cookie.');
  Cookies.remove('username', { path: '' });
}


