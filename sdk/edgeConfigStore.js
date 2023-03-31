const CachingStoreWrapper = require('launchdarkly-node-server-sdk/caching_store_wrapper');
const noop = function () {};

const defaultCacheTTLSeconds = 60;

const edgeConfigStore = function VercelFeatureStore(edgeConfig, sdkKey, options, logger) {
  let ttl = options && options.cacheTTL;
  if (ttl === null || ttl === undefined) {
    ttl = defaultCacheTTLSeconds;
  }

  return config =>
    new CachingStoreWrapper(vercelFeatureStoreInternal(edgeConfig, sdkKey, logger || config.logger), ttl, 'Cloudflare');
};

function vercelFeatureStoreInternal(edgeConfig, sdkKey, logger) {
  const key = `LD-Env-${sdkKey}`;
  const store = {};

  store.getInternal = (kind, flagKey, maybeCallback) => {
    console.log(`Requesting key: ${flagKey} from edgeConfig - Requesting config with ${key}`);
    const cb = maybeCallback || noop;
    edgeConfig
      .get(key, { type: 'json' })
      .then(item => {
        console.log("full edge config", item)
        if (!item) {
          logger.error('Feature data not found in edgeConfig.');
        }
        const kindKey = kind.namespace === 'features' ? 'flags' : kind.namespace;
        const foundValue = item[kindKey][flagKey]
        console.log({kindKey, res: foundValue})
        cb(foundValue);
        // return 
      })
      .catch(err => {
        logger.error(err);
      });
  };

  store.getAllInternal = (kind, maybeCallback) => {
    const cb = maybeCallback || noop;
    const kindKey = kind.namespace === 'features' ? 'flags' : kind.namespace;
    console.log(`Requesting all ${kindKey} data from edgeConfig.`);
    edgeConfig
      .get(key, { type: 'json' })
      .then(item => {
        if (item === null) {
          logger.error('Feature data not found in edgeConfig.');
        }
        cb(item[kindKey]);
      })
      .catch(err => {
        logger.error(err);
      });
  };

  store.initInternal = (allData, cb) => {
    cb && cb();
  };

  store.upsertInternal = noop;

  store.initializedInternal = maybeCallback => {
    const cb = maybeCallback || noop;
    edgeConfig.get(key).then(item => cb(Boolean(item === null)));
  };

  // edgeConfig Binding is done outside of the application logic.
  store.close = noop;

  return store;
}

module.exports = {
  VercelFeatureStore: edgeConfigStore,
};
