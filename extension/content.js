// PIX PALS Extension Content Script Bridge
window.addEventListener('message', (event) => {
  if (event.source !== window) return;

  if (event.data?.type === 'PIX_PALS_PING' || event.data?.type === 'FOCUS_BUDDY_PING') {
    window.postMessage({
      type: 'PIX_PALS_PONG',
      extensionId: chrome.runtime.id,
      version: '1.0.0'
    }, '*');
  }

  if (event.data?.type === 'PIX_PALS_ACTIVATE_BLOCKING' || event.data?.type === 'FOCUS_BUDDY_ACTIVATE_BLOCKING') {
    chrome.runtime.sendMessage({
      action: 'activateBlocking',
      payload: event.data.payload
    });
  }

  if (event.data?.type === 'PIX_PALS_DEACTIVATE_BLOCKING' || event.data?.type === 'FOCUS_BUDDY_DEACTIVATE_BLOCKING') {
    chrome.runtime.sendMessage({
      action: 'deactivateBlocking'
    });
  }
});
