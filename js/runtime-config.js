/* Generated from config/environments.json. Public values only. */
(function () {
  "use strict";
  var hosts = {
  "filthyfilter.sk": {
    "environment": "production",
    "apiBase": "https://api.whispair.sk",
    "gtmContainerId": "GTM-57M8XLQJ",
    "metaPixelId": ""
  },
  "www.filthyfilter.sk": {
    "environment": "production",
    "apiBase": "https://api.whispair.sk",
    "gtmContainerId": "GTM-57M8XLQJ",
    "metaPixelId": ""
  },
  "dev.filthyfilter.sk": {
    "environment": "development",
    "apiBase": "https://api-dev.whispair.sk",
    "gtmContainerId": "GTM-57M8XLQJ",
    "metaPixelId": ""
  },
  "127.0.0.1": {
    "environment": "local",
    "apiBase": "https://api-dev.whispair.sk",
    "gtmContainerId": "GTM-57M8XLQJ",
    "metaPixelId": ""
  },
  "localhost": {
    "environment": "local",
    "apiBase": "https://api-dev.whispair.sk",
    "gtmContainerId": "GTM-57M8XLQJ",
    "metaPixelId": ""
  }
};
  var selected = hosts[String(location.hostname || "").toLowerCase()] || {
    environment: "unsupported",
    apiBase: "",
    gtmContainerId: "",
    metaPixelId: ""
  };
  window.FILTHYFILTER_CONFIG = Object.freeze(selected);
})();
