/*!
 * Copyright (c) 2019-2022 Digital Bazaar, Inc. All rights reserved.
 */
/* global navigator, window, document */
'use strict';

/**
 * Helper function for registering a wallet with the user's browser.
 *
 * NOTE: Only needed for implementors of custom wallets; client code that just
 * wants to receive and verify credentials does not need to do this.
 *
 * This script is loaded in ./index.html.
 *
 * Globals:
 *   WALLET_LOCATION - from local config.js
 *   MEDIATOR - from local config.js
 *
 *   credentialHandlerPolyfill - from credential-handler-polyfill.min.js script.
 *
 *   WebCredentialHandler - from web-credential-handler.min.js.
 *      Utility/convenience library for the CHAPI polyfill, useful for wallet
 *      implementors.
 */
const workerUrl = WALLET_LOCATION + 'wallet-worker.html';

async function registerWalletWithBrowser() {
  try {
    await credentialHandlerPolyfill.loadOnce(MEDIATOR);
  } catch(e) {
    console.error('Error in loadOnce:', e);
  }

  console.log('Polyfill loaded.');
  console.log('Installing wallet worker handler at:', workerUrl);

  try {
    await WebCredentialHandler.installHandler();
    console.log('Wallet installed.');
  } catch(e) {
    console.error('Wallet installation failed', e);
  }
}
