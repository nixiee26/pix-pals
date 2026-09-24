// PIX PALS Background Service Worker
let activeSession = null;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'activateBlocking') {
    activeSession = message.payload;
    applyBlockingRules(message.payload.blockedDomains, message.payload.allowedDomains);
    sendResponse({ status: 'blocking_activated' });
  } else if (message.action === 'deactivateBlocking') {
    activeSession = null;
    clearBlockingRules();
    sendResponse({ status: 'blocking_deactivated' });
  }
  return true;
});

async function applyBlockingRules(blockedDomains = [], allowedDomains = []) {
  if (!chrome.declarativeNetRequest) return;

  const newRules = [];
  let ruleId = 1;

  for (const domain of blockedDomains) {
    if (!domain) continue;
    newRules.push({
      id: ruleId++,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: { extensionPath: '/blocked.html' }
      },
      condition: {
        urlFilter: `*://${domain}/*`,
        resourceTypes: ['main_frame']
      }
    });
  }

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map(r => r.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: newRules
  });
}

async function clearBlockingRules() {
  if (!chrome.declarativeNetRequest) return;
  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const removeRuleIds = existingRules.map(r => r.id);
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds,
    addRules: []
  });
}
