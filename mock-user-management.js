/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict'

/**
 * Helper function
 */

async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}

/**
 * UI Management
 */

async function login() {
  alert('Sign-in with MetaMask')
  saveCurrentUser('did:ethr:0x08090640fd8253ada21e1a18d1226bd04d704698');
  await refreshUserArea();
}

async function logout() {
  resetCurrentUser();
  clearWalletDisplay();
  clearWalletStorage();
  await refreshUserArea();
}

async function refreshUserArea({shareButton} = {}) {
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
  const walletContents = await loadWalletContents();

  if(!walletContents) {
    return addToWalletDisplay({text: 'none'});
  }

  for(const entry of walletContents) {
    addToWalletDisplay({
      text: `${getCredentialType(entry.verifiableCredential)} Verifiable Credential from issuer ${entry.verifiableCredential.issuer.id}`,
      walletEntry: entry,
      button: shareButton
    });
  }
}

/**
 * Wallet Storage / Persistence
 */

async function loadWalletContents() {
  const response = await postData(VERAMO_AGENT_BASE_URL + '/agent/dataStoreORMGetVerifiableCredentials');
  return response;
}

function clearWalletStorage() {
  Cookies.remove('walletContents', {path: ''});
}

function clearWalletDisplay() {
  const contents = document.getElementById('walletContents');
  while(contents.firstChild)
    contents.removeChild(contents.firstChild);
}

function addToWalletDisplay({text, walletEntry, button}) {
  const li = document.createElement('li');

  if(button) {
    const buttonNode = document.createElement('a');
    buttonNode.classList.add('waves-effect', 'waves-light', 'btn-small');
    buttonNode.setAttribute('id', walletEntry.hash);
    buttonNode.appendChild(document.createTextNode(button.text));
    li.appendChild(buttonNode);
  }

  li.appendChild(document.createTextNode(' ' + text));

  document.getElementById('walletContents')
    .appendChild(li);

  if(button) {
    document.getElementById(walletEntry.hash).addEventListener('click', () => {

      const vpRequest = {
        presentation: {
          holder: walletEntry.verifiableCredential.credentialSubject.id,
          verifier: [],
          '@context': ['https://www.w3.org/2018/credentials/v1'],
          type: ['VerifiablePresentation'],
          issuanceDate: new Date().toISOString(),
          verifiableCredential: [walletEntry.verifiableCredential],
        },
        proofFormat: 'jwt'
      };
      console.log('create VP request:', JSON.stringify(vpRequest));

      const vp = {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://www.w3.org/2018/credentials/examples/v1"
        ],
        "type": "VerifiablePresentation",
        "verifiableCredential": walletEntry.verifiableCredential
      }
      console.log('wrapping and returning vc:', vp);

      button.sourceEvent
        .respondWith(Promise.resolve({dataType: 'VerifiablePresentation', data: vp}));
    });
  }
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