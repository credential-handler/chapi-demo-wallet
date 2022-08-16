/*!
 * Copyright (c) 2020-2022 Digital Bazaar, Inc. All rights reserved.
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

function refreshUserArea({shareButton} = {}) {
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
    return addToWalletDisplay({text: 'none'});
  }

  for(const id in walletContents) {
    const vp = walletContents[id];
    // TODO: Add support for multi-credential VPs
    const vc = Array.isArray(vp.verifiableCredential)
      ? vp.verifiableCredential[0]
      : vp.verifiableCredential;
    addToWalletDisplay({
      text: `${getCredentialType(vc)} from ${vc.issuer}`,
      vc,
      button: shareButton
    });
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

function addToWalletDisplay({text, vc, button}) {
  const li = document.createElement('li');

  if(button) {
    const buttonNode = document.createElement('a');
    buttonNode.classList.add('waves-effect', 'waves-light', 'btn-small');
    buttonNode.setAttribute('id', vc.id);
    buttonNode.appendChild(document.createTextNode(button.text));
    li.appendChild(buttonNode);
  }

  li.appendChild(document.createTextNode(' ' + text));

  document.getElementById('walletContents')
    .appendChild(li);

  if(button) {
    document.getElementById(vc.id).addEventListener('click', () => {
      const vp = {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://www.w3.org/2018/credentials/examples/v1"
        ],
        "type": "VerifiablePresentation",
        "verifiableCredential": vc
      }
      console.log('wrapping and returning vc:', vp);
      button.sourceEvent
        .respondWith(Promise.resolve({dataType: 'VerifiablePresentation', data: vp}));
    });
  }
}

function getCredentialId(vp) {
  const vc = Array.isArray(vp.verifiableCredential)
    ? vp.verifiableCredential[0]
    : vp.verifiableCredential;
  return vc.id;
}

function getCredentialType(vc) {
  if(!vc) {
    return 'Credential'
  };
  const types = Array.isArray(vc.type) ? vc.type : [vc.type];
  return types.length > 1 ? types.slice(1).join('/') : types[0];
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

