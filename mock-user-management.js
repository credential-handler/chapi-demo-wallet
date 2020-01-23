/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict'

/**
 * UI Management
 */

function login() {
  saveCurrentUser('JaneDoe');
  refreshUserArea();
}

function logout() {
  resetCurrentUser();
  clearWalletDisplay();
  clearWalletStorage();
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

  // Refresh the user's list of wallet contents
  clearWalletDisplay();
  const walletContents = loadWalletContents();

  if(!walletContents) {
    return addToWalletDisplay('none');
  }

  for(const id in walletContents) {
    const vp = walletContents[id];
    // TODO: Add support for multi-credential VPs
    const vc = Array.isArray(vp.verifiableCredential)
      ? vp.verifiableCredential[0]
      : vp.verifiableCredential;
    addToWalletDisplay(`${getCredentialType(vc)} from ${vc.issuer}`);
  }
}

/**
 * Wallet Storage / Persistence
 */

function loadWalletContents() {
  const walletContents = Cookies.get('walletContents');
  if(!walletContents) {
    return null;
  }
  return JSON.parse(atob(walletContents));
}

function clearWalletStorage() {
  Cookies.remove('walletContents', {path: ''});
}

function storeInWallet(verifiablePresentation) {
  const walletContents = loadWalletContents() || {};
  const id = getCredentialId(verifiablePresentation);
  walletContents[id] = verifiablePresentation;

  // base64 encode the serialized contents (verifiable presentations)
  const serialized = btoa(JSON.stringify(walletContents));
  Cookies.set('walletContents', serialized, {path: '', secure: true, sameSite: 'None'});
}

function clearWalletDisplay() {
  const contents = document.getElementById('walletContents');
  while(contents.firstChild)
    contents.removeChild(contents.firstChild);
}

function addToWalletDisplay(description) {
  const li = document.createElement('li');
  li.appendChild(document.createTextNode(description));

  document.getElementById('walletContents')
    .appendChild(li);
}

function getCredentialId(vp) {
  const vc = Array.isArray(vp.verifiableCredential)
    ? vp.verifiableCredential[0]
    : vp.verifiableCredential;
  return vc.id;
}

function getCredentialType(vc) {
  const types = vc.type;
  return types.slice(1).join('/');
}

/**
 * User Storage / Persistence
 */

function loadCurrentUser() {
  return Cookies.get('username') || '';
}

function saveCurrentUser(name) {
  console.log('Setting login cookie.');
  Cookies.set('username', name, {path: '', secure: true, sameSite: 'None'});
}

function resetCurrentUser() {
  console.log('Clearing login cookie.');
  Cookies.remove('username', {path: ''});
}


