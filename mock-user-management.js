/*!
 * Copyright (c) 2020 Digital Bazaar, Inc. All rights reserved.
 */
'use strict'

/**
 * Helper function
 */

async function postData(url = '', data = {}) {
  // Default options are marked with *
  return fetch(url, {
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
  //return response.json(); // parses JSON response into native JavaScript objects
}

/**
 * UI Management
 */

async function connect() {  
  saveCurrentVeramoAgent(VERAMO_AGENT_BASE_URL);
  await refreshAgentArea();
}

async function disconnect() {
  resetCurrentVeramoAgent();
  clearWalletDisplay();
  clearWalletStorage();
  await refreshAgentArea();
}

async function refreshAgentArea({shareButton} = {}) {
  const veramoAgentUrl = loadCurrentVeramoAgent();
  document.getElementById('veramoAgent').innerHTML = veramoAgentUrl;

  if(veramoAgentUrl) {
    document.getElementById('connected').classList.remove('hide');
    document.getElementById('disconnected').classList.add('hide');
  } else {
    // not logged in
    document.getElementById('connected').classList.add('hide');
    document.getElementById('disconnected').classList.remove('hide');
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
      shareButton: shareButton
    });
  }
}

/**
 * Wallet Storage / Persistence
 */

async function loadWalletContents() {
  const url = VERAMO_AGENT_BASE_URL + '/agent/dataStoreORMGetVerifiableCredentials';
  const response = await postData(url);
  return response.json();
}

async function createVerifiablePresentation({holder, verifiableCredential}) {

  const data = 
  {
    presentation: {
      holder: holder,
      '@context': ['https://www.w3.org/2018/credentials/v1'],
      type: ['VerifiablePresentation'],
      issuanceDate: new Date().toISOString(),
      verifiableCredential: [verifiableCredential],
    },
    proofFormat: 'jwt'
  }  

  const url = VERAMO_AGENT_BASE_URL + '/agent/createVerifiablePresentation';
  const response = await postData(url, data);
  return response.json();
}

function clearWalletStorage() {
  Cookies.remove('walletContents', {path: ''});
}

function clearWalletDisplay() {
  const contents = document.getElementById('walletContents');
  while(contents.firstChild)
    contents.removeChild(contents.firstChild);
}

function addToWalletDisplay({text, walletEntry, shareButton}) {
  const li = document.createElement('li');

  if(shareButton) {
    const shareButtonNode = document.createElement('a');
    shareButtonNode.classList.add('waves-effect', 'waves-light', 'btn-small');
    shareButtonNode.setAttribute('id', walletEntry.hash);
    shareButtonNode.appendChild(document.createTextNode(shareButton.text));
    li.appendChild(shareButtonNode);
    li.appendChild(document.createTextNode(' '));
  }
  
  const showButtonNode = document.createElement('a');
  showButtonNode.classList.add('waves-effect', 'waves-light', 'btn-small');
  showButtonNode.setAttribute('id', 'show-' + walletEntry.hash);
  showButtonNode.appendChild(document.createTextNode('Show'));
  li.appendChild(showButtonNode);

  // jsonViewer defined in index.html/wallet-ui-get.html
  showButtonNode.addEventListener('click', () => {
    jsonViewer.showJSON(walletEntry.verifiableCredential, null, 1);
  });    

  const textNode = document.createElement('p');
  li.appendChild(textNode);
  textNode.appendChild(document.createTextNode(text));

  document.getElementById('walletContents')
    .appendChild(li);

  if(shareButton) {
    document.getElementById(walletEntry.hash).addEventListener('click', async () => {

      const vp = await createVerifiablePresentation( 
        { holder: walletEntry.verifiableCredential.credentialSubject.id,
          verifiableCredential: walletEntry.verifiableCredential.proof.jwt });

      console.log('wrapping and returning vc:', vp);

      shareButton.sourceEvent
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

function loadCurrentVeramoAgent() {
  return Cookies.get('veramoAgent') || '';
}

function saveCurrentVeramoAgent(url) {
  console.log('Setting veramoAgent cookie.');
  Cookies.set('veramoAgent', url, {path: '', secure: true, sameSite: 'None'});
}

function resetCurrentVeramoAgent() {
  console.log('Clearing veramoAgent cookie.');
  Cookies.remove('veramoAgent', {path: ''});
}